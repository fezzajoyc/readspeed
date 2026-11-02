import { describe, expect, it } from "vitest";
import {
  ALOUD_WPM, CJK_CPM, COMMON_WORDS, SILENT_WPM, SPEED_WPM, SLOW_WPM,
  accuracy, bookProgress, countCJK, countLatinWords, diffTyped,
  netWpm, readUnitStats, readingTimes, wordStream,
} from "@/tools/_lib/readspeed";

/* 手算向量说明:所有期望值都是独立复算,不用被测函数推导。
   - 476 词 @238 wpm = 2.0 min(476 = 2 × 238)
   - 1000 CJK 字 @500 cpm = 2.0 min
   - (300 ÷ 5 − 10) ÷ 1 = 50 净 WPM(毛 60)
   - 95/100 = 95% 准确率
   - 300 页书、读 150 页、300 词/页、238 wpm → 50%,剩 150 页 = 45000 词 ≈ 189.08 min */

const text476 = Array.from({ length: 476 }, () => "word").join(" ");

describe("constants (documented sources)", () => {
  it("exposes the Brysbaert-anchored rate set", () => {
    expect(SILENT_WPM).toBe(238);
    expect(SLOW_WPM).toBe(150);
    expect(ALOUD_WPM).toBe(140);
    expect(SPEED_WPM).toBe(400);
    expect(CJK_CPM).toBe(500);
  });
});

describe("countCJK", () => {
  it("counts han, hiragana, katakana and hangul code points", () => {
    expect(countCJK("中文")).toBe(2);
    expect(countCJK("ひらがなカタカナ")).toBe(8);
    expect(countCJK("한국어")).toBe(3);
    expect(countCJK("你好 world 日本語")).toBe(5);
  });

  it("ignores CJK punctuation, latin text, emoji and whitespace", () => {
    expect(countCJK("。、「」")).toBe(0);
    expect(countCJK("hello world")).toBe(0);
    expect(countCJK("🇯🇵 sushi 🍣")).toBe(0);
    expect(countCJK("")).toBe(0);
  });

  it("returns 0 for non-string input without throwing", () => {
    expect(countCJK(undefined as unknown as string)).toBe(0);
    expect(countCJK(null as unknown as string)).toBe(0);
  });
});

describe("countLatinWords", () => {
  it("counts whitespace-separated tokens", () => {
    expect(countLatinWords("The quick brown fox")).toBe(4);
    expect(countLatinWords("  multiple   spaces\t and\nnewlines ")).toBe(4);
    expect(countLatinWords("")).toBe(0);
    expect(countLatinWords("   \n\t ")).toBe(0);
  });

  it("ignores punctuation-only tokens (documented reading-time model)", () => {
    expect(countLatinWords("word — word")).toBe(2);
    expect(countLatinWords("...")).toBe(0);
    expect(countLatinWords("—— ——")).toBe(0);
  });
});

describe("readUnitStats — language mode detection", () => {
  it("picks words mode for latin text", () => {
    const s = readUnitStats("The quick brown fox jumps over the lazy dog");
    expect(s.mode).toBe("words");
    expect(s.latinWords).toBe(9);
    expect(s.cjkChars).toBe(0);
    expect(s.units).toBe(9);
  });

  it("picks cjk mode when CJK chars outnumber latin words", () => {
    const s = readUnitStats("这是一段中文文本,里面有一个 english word。");
    expect(s.mode).toBe("cjk");
    expect(s.cjkChars).toBeGreaterThan(s.latinWords);
  });

  it("keeps words mode for english text quoting a single kanji", () => {
    const s = readUnitStats("The kanji for water is 水 in Japanese");
    expect(s.mode).toBe("words");
  });

  it("units always equal words + cjk chars in both modes", () => {
    const mixed = readUnitStats("Hello 你好世界");
    expect(mixed.units).toBe(mixed.latinWords + mixed.cjkChars);
    expect(mixed.latinWords).toBe(1); // 纯 CJK token 不计词,避免双重计数
    expect(mixed.cjkChars).toBe(4);
    expect(mixed.units).toBe(5);
  });

  it("empty and whitespace-only text → words mode, zero units", () => {
    for (const t of ["", "   \n "]) {
      const s = readUnitStats(t);
      expect(s.mode).toBe("words");
      expect(s.units).toBe(0);
    }
  });
});

describe("readingTimes — hand-computed vectors", () => {
  const est = (text: string) => Object.fromEntries(readingTimes(text).map((e) => [e.speed, e]));

  it("476 words: silent @238 wpm = exactly 2.0 min (120 s)", () => {
    const rows = est(text476);
    expect(rows.silent.rate).toBe(238);
    expect(rows.silent.minutes).toBe(2);
    expect(rows.silent.seconds).toBe(120);
  });

  it("476 words: slow/aloud/speed rows recomputed independently", () => {
    const rows = est(text476);
    expect(rows.slow.minutes).toBeCloseTo(476 / 150, 6);
    expect(rows.slow.seconds).toBe(190); // 190.4 → round
    expect(rows.aloud.minutes).toBeCloseTo(476 / 140, 6);
    expect(rows.aloud.seconds).toBe(204); // exactly 3.4 min
    expect(rows.speed.minutes).toBeCloseTo(476 / 400, 6);
    expect(rows.speed.seconds).toBe(71); // 71.4 → round
  });

  it("1000 CJK chars: silent @500 cpm = exactly 2.0 min (120 s)", () => {
    const rows = est("字".repeat(1000));
    expect(rows.silent.rate).toBe(500);
    expect(rows.silent.minutes).toBe(2);
    expect(rows.silent.seconds).toBe(120);
  });

  it("CJK other speeds scale proportionally from CJK_CPM × wpm/SILENT_WPM", () => {
    const rows = est("字".repeat(1000));
    expect(rows.speed.rate).toBeCloseTo((500 * 400) / 238, 6);
    expect(rows.speed.minutes).toBeCloseTo(1000 / ((500 * 400) / 238), 6);
    // 比例缩放意味着 CJK 各档与 latin 同文本的相对结构一致
    expect(rows.slow.seconds).toBe(190);
    expect(rows.aloud.seconds).toBe(204);
  });

  it("mixed CJK text counts every unit: 1 latin word + 4 han chars @ 500 cpm", () => {
    const rows = est("你好世界 hello");
    expect(rows.silent.units).toBe(5);
    expect(rows.silent.mode).toBe("cjk");
    expect(rows.silent.seconds).toBe(1); // 5/500 min = 0.6 s → 1
  });

  it("empty text → 0 minutes at every speed (documented matrix)", () => {
    for (const t of ["", "   "]) {
      for (const e of readingTimes(t)) {
        expect(e.units).toBe(0);
        expect(e.minutes).toBe(0);
        expect(e.seconds).toBe(0);
      }
    }
  });

  it("returns exactly the four documented speeds in order", () => {
    expect(readingTimes("x").map((e) => e.speed)).toEqual(["silent", "slow", "aloud", "speed"]);
  });

  it("handles a 10k+ word document without overflow", () => {
    const big = Array.from({ length: 20000 }, () => "word").join(" ");
    const rows = est(big);
    expect(rows.silent.minutes).toBeCloseTo(20000 / 238, 6);
    expect(Number.isFinite(rows.silent.seconds)).toBe(true);
  });
});

describe("netWpm — standard formula", () => {
  it("(300 ÷ 5 − 10) ÷ 1 min = 50 net WPM (gross 60)", () => {
    expect(netWpm(300, 1, 10)).toBe(50);
    expect(netWpm(300, 1, 0)).toBe(60);
  });

  it("238-wpm benchmark: 1190 chars in one minute with no errors", () => {
    expect(netWpm(5 * 238, 1, 0)).toBe(238);
  });

  it("fractional minutes: (300 ÷ 5 − 10) ÷ 2 = 25", () => {
    expect(netWpm(300, 2, 10)).toBe(25);
    expect(netWpm(150, 0.5, 0)).toBe(60); // 30 chars/0.5 min = 60
  });

  it("floors at 0 when errors exceed words (documented clamp)", () => {
    expect(netWpm(100, 1, 50)).toBe(0); // 20 − 50 → 0
    expect(netWpm(0, 1, 0)).toBe(0);
  });

  it("invalid input → NaN, never throws (documented matrix)", () => {
    expect(Number.isNaN(netWpm(300, 0, 0))).toBe(true);
    expect(Number.isNaN(netWpm(300, -1, 0))).toBe(true);
    expect(Number.isNaN(netWpm(-5, 1, 0))).toBe(true);
    expect(Number.isNaN(netWpm(300, 1, -2))).toBe(true);
    expect(Number.isNaN(netWpm(Infinity, 1, 0))).toBe(true);
    expect(Number.isNaN(netWpm(NaN, 1, 0))).toBe(true);
  });
});

describe("accuracy", () => {
  it("95 correct of 100 typed = 95%", () => {
    expect(accuracy(95, 100)).toBe(95);
    expect(accuracy(0, 100)).toBe(0);
    expect(accuracy(100, 100)).toBe(100);
  });

  it("nothing typed → 0 (documented)", () => {
    expect(accuracy(0, 0)).toBe(0);
  });

  it("clamps to 0–100 and returns 0 for invalid input", () => {
    expect(accuracy(120, 100)).toBe(100);
    expect(accuracy(50, -5)).toBe(0);
    expect(accuracy(-1, 100)).toBe(0);
    expect(accuracy(NaN, 100)).toBe(0);
    expect(accuracy(95, Infinity)).toBe(0);
  });
});

describe("diffTyped", () => {
  it("marks one wrong character: hello worXd → 10 correct, 1 incorrect", () => {
    const d = diffTyped("hello world", "hello worXd");
    expect(d).toEqual({ correct: 10, incorrect: 1, total: 11 });
  });

  it("extra typed characters beyond the target count as incorrect", () => {
    const d = diffTyped("hi", "hi!!!");
    expect(d).toEqual({ correct: 2, incorrect: 3, total: 5 });
  });

  it("handles emoji and CJK per code point", () => {
    expect(diffTyped("你好", "你好")).toEqual({ correct: 2, incorrect: 0, total: 2 });
    expect(diffTyped("a👍b", "a😂b")).toEqual({ correct: 2, incorrect: 1, total: 3 });
  });

  it("empty typed → all zeros", () => {
    expect(diffTyped("target", "")).toEqual({ correct: 0, incorrect: 0, total: 0 });
  });
});

describe("bookProgress — hand-computed vector", () => {
  it("300 pages, 150 read, 300 wpp, 238 wpm → 50%, 150 pages ≈ 45000 words ≈ 189.08 min", () => {
    const r = bookProgress(300, 150, 300, 238);
    expect(r.percent).toBe(50);
    expect(r.pagesRemaining).toBe(150);
    expect(r.wordsRemaining).toBe(45000);
    expect(r.minutes).toBeCloseTo(45000 / 238, 6);
    expect(r.minutes).toBeCloseTo(189.0756, 3);
    expect(r.seconds).toBe(11345); // round(189.0756… × 60) = round(11344.53) = 11345
    expect(r.finished).toBe(false);
  });

  it("0 pages read → 0% and the whole book remaining", () => {
    const r = bookProgress(300, 0, 300, 238);
    expect(r.percent).toBe(0);
    expect(r.wordsRemaining).toBe(90000);
  });

  it("reading the last page → 100%, 0 remaining, finished", () => {
    const r = bookProgress(300, 300, 300, 238);
    expect(r.percent).toBe(100);
    expect(r.pagesRemaining).toBe(0);
    expect(r.wordsRemaining).toBe(0);
    expect(r.minutes).toBe(0);
    expect(r.finished).toBe(true);
  });

  it("overshooting the page count clamps to 100% finished (documented)", () => {
    const r = bookProgress(300, 350, 300, 238);
    expect(r.percent).toBe(100);
    expect(r.pagesRemaining).toBe(0);
    expect(r.finished).toBe(true);
  });

  it("invalid input → NaN fields, never throws (documented matrix)", () => {
    for (const [total, read] of [[-1, 0], [0, 0], [300, -5], [0, 150]] as const) {
      const r = bookProgress(total, read, 300, 238);
      expect(Number.isNaN(r.percent), `total=${total} read=${read}`).toBe(true);
      expect(Number.isNaN(r.minutes)).toBe(true);
      expect(r.finished).toBe(false);
    }
    expect(Number.isNaN(bookProgress(300, 150, -1, 238).percent)).toBe(true);
    expect(Number.isNaN(bookProgress(300, 150, 300, 0).percent)).toBe(true);
    expect(Number.isNaN(bookProgress(300, 150, 300, -10).percent)).toBe(true);
    expect(Number.isNaN(bookProgress(NaN, 0, 300, 238).percent)).toBe(true);
    expect(Number.isNaN(bookProgress(Infinity, 0, 300, 238).percent)).toBe(true);
  });
});

describe("typing corpus", () => {
  it("has exactly 200 unique common words, letters only", () => {
    expect(COMMON_WORDS.length).toBe(200);
    expect(new Set(COMMON_WORDS).size).toBe(200);
    for (const w of COMMON_WORDS) {
      expect(w).toMatch(/^[a-zA-Z]+$/);
    }
  });

  it("wordStream honors count and draws only corpus words", () => {
    const s = wordStream(50, 42);
    expect(s.length).toBe(50);
    for (const w of s) expect(COMMON_WORDS).toContain(w);
    expect(wordStream(0, 42)).toEqual([]);
    expect(wordStream(-3, 42)).toEqual([]);
    expect(wordStream(7.9, 42).length).toBe(7); // floor
  });

  it("is deterministic per seed and differs across seeds", () => {
    expect(wordStream(30, 7)).toEqual(wordStream(30, 7));
    expect(wordStream(30, 7)).not.toEqual(wordStream(30, 8));
    expect(wordStream(30, 0)).toEqual(wordStream(30, NaN)); // 非法种子按 0
  });

  it("generates enough words to cover fast typists (300 words ≥ ~280 wpm per minute)", () => {
    const target = wordStream(300, 1).join(" ");
    expect([...target].length).toBeGreaterThanOrEqual(280 * 5);
  });
});
