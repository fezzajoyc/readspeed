import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "@/mcp/server";

async function connect() {
  const server = createServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe("readspeed MCP server", () => {
  it("exposes the reading/typing tool set", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.length).toBe(3);
    const names = new Set(tools.map((t) => t.name));
    for (const expected of ["reading_times", "net_wpm", "book_progress"]) {
      expect(names.has(expected), expected).toBe(true);
    }
    await client.close();
  });

  it("estimates reading time for a 476-word text: silent 238 wpm → exactly 2.0 min", async () => {
    const client = await connect();
    const text476 = Array.from({ length: 476 }, () => "word").join(" ");
    const r = await client.callTool({ name: "reading_times", arguments: { text: text476 } });
    const parsed = JSON.parse((r.content as any)[0].text);
    expect(parsed.mode).toBe("words");
    expect(parsed.units.total).toBe(476);
    const silent = parsed.estimates.find((e: any) => e.speed === "silent");
    expect(silent.rate_per_minute).toBe(238);
    expect(silent.minutes).toBe(2);
    expect(silent.seconds).toBe(120);
    // aloud: 476/140 = 3.4 min = 204 s(解析引擎独立复算)
    const aloud = parsed.estimates.find((e: any) => e.speed === "aloud");
    expect(aloud.minutes).toBeCloseTo(476 / 140, 2);
    expect(aloud.seconds).toBe(204);
    await client.close();
  });

  it("switches to CJK chars-per-minute mode: 1000 chars silent ≈ 2.0 min at 500 cpm", async () => {
    const client = await connect();
    const r = await client.callTool({ name: "reading_times", arguments: { text: "字".repeat(1000) } });
    const parsed = JSON.parse((r.content as any)[0].text);
    expect(parsed.mode).toBe("cjk");
    expect(parsed.units.cjk_chars).toBe(1000);
    const silent = parsed.estimates.find((e: any) => e.speed === "silent");
    expect(silent.rate_per_minute).toBe(500);
    expect(silent.minutes).toBe(2);
    expect(silent.seconds).toBe(120);
    await client.close();
  });

  it("computes net WPM with the standard formula: (300/5 − 10)/1 = 50", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "net_wpm",
      arguments: { chars_typed: 300, minutes: 1, errors: 10 },
    });
    expect((r.content as any)[0].text).toContain("50 net WPM");
    expect((r.content as any)[0].text).toContain("gross 60");
    await client.close();
  });

  it("guards invalid inputs at two layers: logic (isError) and schema (-32602)", async () => {
    const client = await connect();
    // 逻辑层:合法 schema 但 total_pages = 0 → NaN percent → isError
    const bad = await client.callTool({
      name: "book_progress",
      arguments: { total_pages: 0, read_pages: 10 },
    });
    expect((bad as any).isError).toBe(true);
    expect((bad.content as any)[0].text).toContain("at least 1");
    // schema 层:负数已读页数被 zod 拒绝 → SDK 捕获后返回 isError 结果(不 throw)
    const schemaBad = await client.callTool({
      name: "book_progress",
      arguments: { total_pages: 300, read_pages: -5 },
    });
    expect((schemaBad as any).isError).toBe(true);
    expect((schemaBad.content as any)[0].text).toContain("-32602");
    // schema 层:minutes ≤ 0 被 zod 拒绝
    const schemaBad2 = await client.callTool({
      name: "net_wpm",
      arguments: { chars_typed: 300, minutes: 0, errors: 0 },
    });
    expect((schemaBad2 as any).isError).toBe(true);
    await client.close();
  });

  it("tracks book progress against the hand-computed vector: 150/300 pages, 300 wpp, 238 wpm → 50%, ≈189 min", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "book_progress",
      arguments: { total_pages: 300, read_pages: 150, words_per_page: 300, wpm: 238 },
    });
    const parsed = JSON.parse((r.content as any)[0].text);
    expect(parsed.percent).toBe(50);
    expect(parsed.pages_remaining).toBe(150);
    expect(parsed.words_remaining).toBe(45000);
    expect(parsed.minutes_remaining).toBeCloseTo(45000 / 238, 1);
    expect(parsed.finished).toBe(false);
    await client.close();
  });

  it("marks a finished book and accepts locale-style defaults", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "book_progress",
      arguments: { total_pages: 300, read_pages: 350 },
    });
    const parsed = JSON.parse((r.content as any)[0].text);
    expect(parsed.percent).toBe(100);
    expect(parsed.pages_remaining).toBe(0);
    expect(parsed.finished).toBe(true);
    // 默认值:300 wpp + 238 wpm
    const d = await client.callTool({ name: "book_progress", arguments: { total_pages: 238, read_pages: 0 } });
    const dp = JSON.parse((d.content as any)[0].text);
    expect(dp.words_remaining).toBe(238 * 300);
    expect(dp.minutes_remaining).toBeCloseTo(300, 1);
    await client.close();
  });
});
