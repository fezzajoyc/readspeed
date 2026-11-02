"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { readingTimes, readUnitStats } from "../_lib/readspeed";
import { Field, Note, Stats, fmt, fmtDuration, pick } from "./ui";

/**
 * 阅读时间计算器引擎:粘贴文本 → 四档阅读时间实时估算。
 * 纯逻辑在 _lib/readspeed.ts(readUnitStats / readingTimes),这里只做 UI 编排。
 * 默读档为标题档位(238 wpm,Brysbaert 2019);CJK 文本自动切到"字/分"模式。
 */

const S = {
  silent: { en: "Silent reading", zh: "默读", ja: "黙読", es: "Lectura silenciosa", pt: "Leitura silenciosa" },
  slow: { en: "Slow reading", zh: "精读(慢速)", ja: "ゆっくり読書", es: "Lectura lenta", pt: "Leitura lenta" },
  aloud: { en: "Aloud / presenting", zh: "朗读 / 演讲", ja: "音読・発表", es: "En voz alta / presentando", pt: "Em voz alta / apresentando" },
  speed: { en: "Speed reading", zh: "速读", ja: "速読", es: "Lectura rápida", pt: "Leitura dinâmica" },
  words: { en: "words", zh: "词", ja: "語", es: "palabras", pt: "palavras" },
  chars: { en: "characters", zh: "字", ja: "文字", es: "caracteres", pt: "caracteres" },
  cjkMode: {
    en: "CJK mode — counted per character, not per word",
    zh: "CJK 模式——按字计数,不按词",
    ja: "CJK モード — 単語ではなく文字で数えます",
    es: "Modo CJK: se cuenta por caracteres, no por palabras",
    pt: "Modo CJK: contado por caracteres, não por palavras",
  },
  empty: {
    en: "Paste or type text above — the four estimates update live and nothing leaves your browser.",
    zh: "在上方粘贴或输入文本——四档估算实时更新,内容不会离开你的浏览器。",
    ja: "上にテキストを貼り付けまたは入力すると、4 つの推定がリアルタイムで更新されます。内容はブラウザから出ません。",
    es: "Pega o escribe texto arriba: las cuatro estimaciones se actualizan al instante y nada sale de tu navegador.",
    pt: "Cole ou digite o texto acima — as quatro estimativas atualizam ao vivo e nada sai do seu navegador.",
  },
  source: {
    en: "Silent-reading rate anchored at 238 words per minute — the adult average from Brysbaert's 2019 meta-analysis of 190 studies. All values are estimates: real pace varies with the reader, the text and the language.",
    zh: "默读速率锚定在每分钟 238 词——Brysbaert 2019 年 190 项研究的元分析给出的成人均值。所有数值均为估算:实际速度因读者、文本与语言而异。",
    ja: "黙読速度は毎分 238 語を基準にしています — Brysbaert の 2019 年のメタ分析(190 研究)による成人平均値。数値はすべて推定です。",
    es: "La velocidad de lectura silenciosa se ancla en 238 palabras por minuto, el promedio adulto de la metaanálisis de Brysbaert (2019) sobre 190 estudios. Todos los valores son estimaciones.",
    pt: "A velocidade de leitura silenciosa é ancorada em 238 palavras por minuto — a média adulta da metanálise de Brysbaert (2019) sobre 190 estudos. Todos os valores são estimativas.",
  },
  count: { en: "Count", zh: "计数", ja: "文字数", es: "Recuento", pt: "Contagem" },
};

const SAMPLE_TEXT =
  "Reading is a skill we rarely measure. You accept an invitation to speak and wonder whether your notes will fill ten minutes or twenty; you download a report before a meeting and hope it fits the commute. A reading time estimate turns that guess into arithmetic. At an average adult pace of 238 words per minute, a page of prose takes about ninety seconds, a short essay five minutes, a book chapter twenty. Presenters are coached to plan closer to 140 words per minute, because listening is slower than reading. Paste your own text above and the four estimates update as you type.";

export function ReadingTimeEngine() {
  const { t, locale } = useI18n();
  const [text, setText] = useState("");

  const stats = useMemo(() => readUnitStats(text), [text]);
  const estimates = useMemo(() => readingTimes(text), [text]);
  const bySpeed = new Map(estimates.map((e) => [e.speed, e]));

  const unitLine =
    stats.units === 0
      ? "—"
      : `≈ ${fmt(stats.units, locale, 0)} ${pick(locale, stats.mode === "cjk" ? S.chars : S.words)}`;

  const rows = [
    { id: "silent", label: `${pick(locale, S.silent)} · 238 wpm`, e: bySpeed.get("silent"), tone: "accent" as const },
    { id: "slow", label: `${pick(locale, S.slow)} · 150 wpm`, e: bySpeed.get("slow"), tone: undefined },
    { id: "aloud", label: `${pick(locale, S.aloud)} · 140 wpm`, e: bySpeed.get("aloud"), tone: undefined },
    { id: "speed", label: `${pick(locale, S.speed)} · 400 wpm`, e: bySpeed.get("speed"), tone: undefined },
  ];

  return (
    <ToolPanel>
      <Field label={t.common.input}>
        <textarea
          className="field min-h-[9rem]"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={pick(locale, S.empty)}
          aria-label={t.common.input}
        />
      </Field>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setText(SAMPLE_TEXT)}
          className="rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)]"
        >
          {t.common.sample}
        </button>
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)]"
          >
            {t.common.clear}
          </button>
        )}
      </div>

      <div className="mt-5">
        <Stats
          cols="sm:grid-cols-2"
          items={rows.map(({ id, label, e, tone }) => ({
            label,
            value: e && e.units > 0 ? fmtDuration(e.seconds, locale) : "—",
            tone,
          }))}
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[13px] font-medium text-[var(--color-sub)]">{pick(locale, S.count)}</span>
          <span className="mono text-[14px] font-semibold">{unitLine}</span>
        </div>
        {stats.mode === "cjk" && <Note>{pick(locale, S.cjkMode)}</Note>}
        {stats.units === 0 ? <Note>{pick(locale, S.empty)}</Note> : <Note>{pick(locale, S.source)}</Note>}
      </div>
    </ToolPanel>
  );
}
