/**
 * Readspeed 纯逻辑库:阅读时间估算 + 打字速度计分 + 阅读进度追踪。
 * 全部函数无副作用、Node 可测;非法输入不抛异常,按文档返回 0 / NaN / 空表。
 *
 * 速率来源:
 * - SILENT_WPM = 238:Marc Brysbaert (2019), "How many words do we read per minute?
 *   A review and meta-analysis of reading rate", Journal of Memory and Language 109,
 *   104047——190 项研究的元分析,成人默读非虚构文本均值 ≈ 238 wpm。
 * - SLOW_WPM = 150:精读/理解优先的学习型速度(教学界常用 100–200 wpm 区间的中值)。
 * - ALOUD_WPM = 140:朗读/演讲配速(公开演讲训练普遍建议 130–150 wpm,受限于口齿速率)。
 * - SPEED_WPM = 400:速读上限区间(Brysbaert 指出超过 ~400 wpm 理解率显著下降)。
 * - CJK_CPM = 500:中文默读按"字/分"计(信息速率与英文 238 wpm 大致相当);
 *   日韩文本同用字数模型,量级一致。所有输出都是估算,不是承诺。
 */

/** 成人默读均值(words per minute)— Brysbaert 2019 元分析 */
export const SILENT_WPM = 238;
/** 精读/学习速度(wpm) */
export const SLOW_WPM = 150;
/** 朗读/演讲配速(wpm) */
export const ALOUD_WPM = 140;
/** 速读上限区间(wpm) */
export const SPEED_WPM = 400;
/** CJK 文本默读速率(chars per minute,以中文为准) */
export const CJK_CPM = 500;

/** CJK 码点范围:汉字统一表意 + 假名 + 谚文音节(与 transforms.ts countTextStats 同一模式) */
const CJK_RE = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g;

/** 统计 CJK 字符数(汉字/假名/谚文);非字符串输入按 0 处理 */
export function countCJK(text: string): number {
  if (typeof text !== "string") return 0;
  return (text.match(CJK_RE) ?? []).length;
}

/**
 * 统计拉丁式"词"数:按空白切分的 token,含至少一个非 CJK 的字母/数字才计 1 词。
 * 纯 CJK token 不计(CJK 模式已按字计,避免"1000 字 = 1001 词"的双重计数);
 * 纯标点 token("—"/"…")也不计——阅读时间模型里它们不是词。
 * 混合 token("文本english")计 1 词,其中的汉字另按字计(保守偏高,已文档化)。
 */
export function countLatinWords(text: string): number {
  if (typeof text !== "string") return 0;
  const tokens = text.match(/[^\s]+/g) ?? [];
  let n = 0;
  for (const tok of tokens) {
    if (/[\p{L}\p{N}]/u.test(tok.replace(CJK_RE, ""))) n++;
  }
  return n;
}

export type ReadingMode = "words" | "cjk";
export type ReadingSpeedId = "silent" | "slow" | "aloud" | "speed";

export type UnitStats = {
  /** 估算语言模式:cjk 占优按"字/分",否则按"词/分" */
  mode: ReadingMode;
  latinWords: number;
  cjkChars: number;
  /** 计时用单位数 = latinWords + cjkChars(两种模式同一定义,只有速率不同) */
  units: number;
};

/**
 * 语言模式判定:cjk 字数 > 拉丁词数 → "cjk",否则 "words"。
 * 混合文本(中文里夹几个英文词)自然落入 cjk 模式,反之亦然。
 */
export function readUnitStats(text: string): UnitStats {
  const latinWords = countLatinWords(text);
  const cjkChars = countCJK(text);
  const mode: ReadingMode = cjkChars > latinWords ? "cjk" : "words";
  return { mode, latinWords, cjkChars, units: latinWords + cjkChars };
}

export type ReadingEstimate = {
  /** 速度档位 */
  speed: ReadingSpeedId;
  /** 估算语言模式(words 按词/分,cjk 按字/分) */
  mode: ReadingMode;
  /** 本行使用的速率:wpm(words 模式)或 cpm(cjk 模式) */
  rate: number;
  /** 计时单位数(词或字) */
  units: number;
  /** 精确分钟数 = units / rate(可能带小数) */
  minutes: number;
  /** 四舍五入后的总秒数(展示用) */
  seconds: number;
};

const SPEED_ORDER: [ReadingSpeedId, number][] = [
  ["silent", SILENT_WPM],
  ["slow", SLOW_WPM],
  ["aloud", ALOUD_WPM],
  ["speed", SPEED_WPM],
];

/**
 * 四档阅读时间估算。words 模式直接用各档 wpm;cjk 模式把 CJK_CPM 锚定在
 * silent 档,其余档位按 wpm 比例缩放(500 × rate/238),保持四档结构。
 * 空文本 → units 0 → 全 0 行(不抛异常)。
 */
export function readingTimes(text: string): ReadingEstimate[] {
  const stats = readUnitStats(text);
  return SPEED_ORDER.map(([speed, wpm]) => {
    const rate = stats.mode === "cjk" ? (CJK_CPM * wpm) / SILENT_WPM : wpm;
    const minutes = stats.units / rate;
    return { speed, mode: stats.mode, rate, units: stats.units, minutes, seconds: Math.round(minutes * 60) };
  });
}

/**
 * 净 WPM:标准打字计分公式 (字符数 ÷ 5 − 错误数) ÷ 分钟数。
 * 5 字符 = 1 词是打字机时代的标准约定。结果下限钳到 0(错误多于词数时)。
 * minutes ≤ 0 或任一输入非有限 → NaN(文档化行为);负数输入 → NaN。
 */
export function netWpm(charsTyped: number, minutes: number, errors: number): number {
  if (
    !Number.isFinite(charsTyped) || !Number.isFinite(minutes) || !Number.isFinite(errors) ||
    charsTyped < 0 || errors < 0 || minutes <= 0
  ) {
    return NaN;
  }
  const gross = charsTyped / 5;
  const wpm = (gross - errors) / minutes;
  return Math.max(0, wpm);
}

/**
 * 打字准确率(%):正确字符 ÷ 已打字符 × 100。
 * total ≤ 0(什么都没打)或任一输入非有限 → 0;结果钳到 0–100。
 */
export function accuracy(correct: number, total: number): number {
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0 || correct < 0) return 0;
  return Math.min(100, Math.max(0, (correct / total) * 100));
}

export type BookProgress = {
  /** 完成百分比(已读超出总页数时钳到 100) */
  percent: number;
  /** 剩余页数(钳到 ≥ 0) */
  pagesRemaining: number;
  /** 剩余字数 = 剩余页数 × wordsPerPage */
  wordsRemaining: number;
  /** 剩余阅读分钟数 = wordsRemaining / wpm */
  minutes: number;
  /** 四舍五入后的总秒数 */
  seconds: number;
  /** 已读页数 ≥ 总页数 */
  finished: boolean;
};

const INVALID_PROGRESS: BookProgress = {
  percent: NaN, pagesRemaining: NaN, wordsRemaining: NaN, minutes: NaN, seconds: NaN, finished: false,
};

/**
 * 阅读进度追踪:总页数、已读页数、每页词数(默认 300,平装书常用均值)、
 * 阅读速度(默认 SILENT_WPM)→ 完成度 + 剩余时间。
 * 非法输入(任一非有限、负数,totalPages ≤ 0,wpm ≤ 0)→ 各数值字段 NaN(文档化,
 * 调用方 UI 显示 "—",MCP 层必须守卫转 isError——JSON.stringify(NaN) 会变 null)。
 * 已读超过总页数:percent 钳 100、剩余钳 0、finished = true(诚实呈现"读完了")。
 */
export function bookProgress(
  totalPages: number,
  readPages: number,
  wordsPerPage = 300,
  wpm: number = SILENT_WPM,
): BookProgress {
  if (
    !Number.isFinite(totalPages) || !Number.isFinite(readPages) ||
    !Number.isFinite(wordsPerPage) || !Number.isFinite(wpm) ||
    totalPages <= 0 || readPages < 0 || wordsPerPage < 0 || wpm <= 0
  ) {
    return INVALID_PROGRESS;
  }
  const pagesRemaining = Math.max(0, totalPages - readPages);
  const wordsRemaining = pagesRemaining * wordsPerPage;
  const minutes = wordsRemaining / wpm;
  return {
    percent: Math.min(100, (readPages / totalPages) * 100),
    pagesRemaining,
    wordsRemaining,
    minutes,
    seconds: Math.round(minutes * 60),
    finished: pagesRemaining === 0,
  };
}

/**
 * 打字测试语料:200 个常见英文词(主流打字测试的事实标准语料风格——
 * 保留英文词表是跨站可比的通行做法)。全小写、无标点、无重复。
 */
export const COMMON_WORDS: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "was", "are", "been", "has", "had", "were", "did", "does", "said",
  "may", "should", "each", "such", "where", "much", "before", "right", "too", "means",
  "old", "same", "tell", "set", "three", "must", "state", "never", "become", "between",
  "high", "really", "something", "name", "world", "school", "family", "student", "group", "country",
  "problem", "hand", "part", "place", "case", "week", "company", "system", "program", "question",
  "house", "water", "money", "book", "word", "life", "night", "thing", "head", "home",
  "read", "write", "learn", "speak", "hear", "walk", "eat", "open", "close", "start",
  "stop", "help", "play", "run", "move", "live", "believe", "hold", "bring", "happen",
  "small", "large", "great", "long", "little", "own", "different", "last", "early", "young",
  "important", "few", "public", "bad", "best", "better", "easy", "free", "whole", "next",
];

/** mulberry32 确定性 PRNG(小而快,流可复现 → 测试可断言) */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 从 COMMON_WORDS 生成 n 个词的打字流。同一种子 → 同一流(确定性);
 * count ≤ 0 或非有限 → [];count 非整数向下取整;非法种子按 0 处理。
 */
export function wordStream(count: number, seed: number): string[] {
  if (!Number.isFinite(count) || count <= 0) return [];
  const rand = mulberry32(Number.isFinite(seed) ? Math.floor(seed) : 0);
  const n = Math.floor(count);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(COMMON_WORDS[Math.floor(rand() * COMMON_WORDS.length)]);
  }
  return out;
}

export type TypedDiff = {
  /** 与目标逐码点比对一致的字符数 */
  correct: number;
  /** 不一致字符数(含超出目标长度的多打部分) */
  incorrect: number;
  /** 已打字符总数 = correct + incorrect */
  total: number;
};

/**
 * 把已打文本与目标文本逐码点比对(按 [...spread],emoji 安全)。
 * 多打的字符一律记错;这是"未更正错误"口径——退格修正自然反映在最终比对里。
 */
export function diffTyped(target: string, typed: string): TypedDiff {
  const t = typeof typed === "string" ? [...typed] : [];
  const g = typeof target === "string" ? [...target] : [];
  let correct = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === g[i]) correct++;
  }
  return { correct, incorrect: t.length - correct, total: t.length };
}
