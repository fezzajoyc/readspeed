import { z } from "zod";
import { bookProgress, netWpm, readUnitStats, readingTimes } from "../tools/_lib/readspeed";

/**
 * Readspeed MCP 工具注册表:把 tools/_lib/readspeed.ts 的纯函数暴露为 AI 可执行工具。
 * 站上的同名工具在浏览器里跑(交互式),这里跑同一份经过测试的实现——
 * 人和 AI 用同一套逻辑,而不是两套各写各的。
 *
 * 非有限值(NaN)经 JSON.stringify 会变 null,客户端 Number.isNaN 判定失效——
 * 凡结果可能非有限的工具(netWpm 的 minutes≤0、bookProgress 的负页数/0 总页数)
 * handler 必须先守卫并返回 isError + 人话说明。
 */

const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

/** 四舍五入到 n 位小数(非有限原样返回,由守卫层处理) */
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export type McpToolDef = {
  name: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  run: (args: any) => { content: { type: "text"; text: string }[]; isError?: boolean };
};

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "reading_times",
    title: "Reading time estimates",
    description:
      "Estimate how long a text takes to read at four speeds: silent (238 wpm — Brysbaert 2019 meta-analysis adult average), slow (150), aloud/presenting (140) and speed reading (400). Space-separated scripts count words; CJK text (Chinese/Japanese/Korean) switches to characters per minute (silent ≈ 500 cpm for Chinese, others scaled proportionally). Estimates, not guarantees — actual pace varies by reader and text.",
    schema: {
      text: z.string().describe("the text to estimate; empty text returns all-zero rows"),
    },
    run: (a) => {
      const stats = readUnitStats(a.text ?? "");
      const estimates = readingTimes(a.text ?? "");
      return json({
        mode: stats.mode,
        units: { total: stats.units, words: stats.latinWords, cjk_chars: stats.cjkChars },
        estimates: estimates.map((e) => ({
          speed: e.speed,
          rate_per_minute: round(e.rate, 1),
          units: e.units,
          minutes: round(e.minutes, 2),
          seconds: e.seconds,
        })),
      });
    },
  },
  {
    name: "net_wpm",
    title: "Net typing speed (WPM)",
    description:
      "Net words-per-minute from a typing session: (characters typed ÷ 5 − uncorrected errors) ÷ minutes. Five characters = one word is the standard typewriter-era convention. Result is floored at 0. Use errors = 0 for gross WPM.",
    schema: {
      chars_typed: z.number().min(0).describe("total characters typed (including spaces)"),
      minutes: z.number().positive().describe("elapsed time in minutes (e.g. 1 for a 60-second test)"),
      errors: z.number().min(0).default(0).describe("uncorrected errors (wrong characters still present)"),
    },
    run: (a) => {
      const wpm = netWpm(a.chars_typed, a.minutes, a.errors ?? 0);
      if (!Number.isFinite(wpm)) {
        return { content: [{ type: "text", text: "invalid input: minutes must be > 0 and chars/errors non-negative" }], isError: true };
      }
      const gross = netWpm(a.chars_typed, a.minutes, 0);
      return text(`${round(wpm)} net WPM (gross ${round(gross)}, ${a.errors ?? 0} uncorrected errors)`);
    },
  },
  {
    name: "book_progress",
    title: "Book reading progress",
    description:
      "Reading progress for a book: percent complete, pages and words remaining, and estimated time to finish. Words-per-page defaults to 300 (typical trade paperback); speed defaults to 238 wpm (Brysbaert 2019 adult silent-reading average). Reading past the last page counts as 100% finished. Estimates only.",
    schema: {
      total_pages: z.number().int().min(0).describe("total page count of the book"),
      read_pages: z.number().min(0).default(0).describe("pages already read"),
      words_per_page: z.number().min(0).default(300).describe("average words per page (300 = typical paperback)"),
      wpm: z.number().positive().default(238).describe("reading speed in words per minute"),
    },
    run: (a) => {
      const r = bookProgress(a.total_pages, a.read_pages ?? 0, a.words_per_page ?? 300, a.wpm ?? 238);
      if (Number.isNaN(r.percent)) {
        return {
          content: [{ type: "text", text: "invalid input: total pages must be at least 1, pages read non-negative, and wpm > 0" }],
          isError: true,
        };
      }
      return json({
        percent: round(r.percent, 1),
        pages_remaining: r.pagesRemaining,
        words_remaining: r.wordsRemaining,
        minutes_remaining: round(r.minutes, 1),
        seconds_remaining: r.seconds,
        finished: r.finished,
      });
    },
  },
];
