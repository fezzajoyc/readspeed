"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { parseLocaleNumber } from "../_lib/numparse";
import { SILENT_WPM, bookProgress } from "../_lib/readspeed";
import { Field, Note, NumIn, fmt, fmtDuration, pick } from "./ui";

/**
 * 阅读进度追踪引擎:总页数/已读页数/每页词数/阅读速度 → 完成度 + 剩余时间。
 * 纯逻辑在 _lib/readspeed.ts(bookProgress);数字输入走 parseLocaleNumber
 * 千分位容错("1,200" → 1200)。非法输入显示错误条(.error-bg),数值 "—"。
 */

const S = {
  totalPages: { en: "Total pages", zh: "总页数", ja: "総ページ数", es: "Páginas totales", pt: "Total de páginas" },
  readPages: { en: "Pages read", zh: "已读页数", ja: "読了ページ", es: "Páginas leídas", pt: "Páginas lidas" },
  wpp: { en: "Words per page", zh: "每页词数", ja: "1 ページの語数", es: "Palabras por página", pt: "Palavras por página" },
  wpm: { en: "Reading speed (WPM)", zh: "阅读速度(WPM)", ja: "読書速度(WPM)", es: "Velocidad de lectura (PPM)", pt: "Velocidade de leitura (PPM)" },
  complete: { en: "Complete", zh: "完成度", ja: "達成率", es: "Completado", pt: "Concluído" },
  pagesLeft: { en: "Pages remaining", zh: "剩余页数", ja: "残りページ", es: "Páginas restantes", pt: "Páginas restantes" },
  wordsLeft: { en: "Words remaining", zh: "剩余字数", ja: "残り語数", es: "Palabras restantes", pt: "Palavras restantes" },
  timeLeft: { en: "Estimated reading time left", zh: "预计剩余阅读时间", ja: "残り読書時間の目安", es: "Tiempo de lectura restante", pt: "Tempo de leitura restante" },
  finished: {
    en: "Finished — every page read. Time to pick the next book.",
    zh: "读完了——每一页都已读完。该挑下一本书了。",
    ja: "読了 — 全ページ読み終えました。次の本を選びましょう。",
    es: "Terminado: cada página leída. Toca elegir el próximo libro.",
    pt: "Concluído — todas as páginas lidas. Hora de escolher o próximo livro.",
  },
  invalid: {
    en: "Enter a total of at least 1 page, a non-negative page count read, words per page of 0 or more, and a reading speed above 0.",
    zh: "请输入至少 1 的总页数、非负的已读页数、不小于 0 的每页词数,以及大于 0 的阅读速度。",
    ja: "総ページ数は 1 以上、読了ページは 0 以上、1 ページの語数は 0 以上、読書速度は 0 より大きい値を入力してください。",
    es: "Introduce un total de al menos 1 página, páginas leídas no negativas, palabras por página de 0 o más y una velocidad de lectura mayor que 0.",
    pt: "Insira um total de pelo menos 1 página, páginas lidas não negativas, palavras por página de 0 ou mais e uma velocidade de leitura acima de 0.",
  },
  defaults: {
    en: "Defaults: 300 words per page (a typical trade paperback) and 238 WPM — the adult silent-reading average from Brysbaert's 2019 meta-analysis. Overshooting the total page count just means finished.",
    zh: "默认值:每页 300 词(典型平装书)与 238 WPM——Brysbaert 2019 年元分析给出的成人默读均值。已读超过总页数即视为读完。",
    ja: "デフォルト:1 ページ 300 語(典型的なペーパーバック)、238 WPM — Brysbaert の 2019 年メタ分析による成人の黙読平均値。総ページ数を超えたら読了扱いです。",
    es: "Valores por defecto: 300 palabras por página (un libro en rústica típico) y 238 PPM, el promedio adulto de lectura silenciosa según la metaanálisis de Brysbaert (2019). Pasarse del total cuenta como terminado.",
    pt: "Padrões: 300 palavras por página (um paperback típico) e 238 PPM — a média adulta de leitura silenciosa da metanálise de Brysbaert (2019). Passar do total de páginas significa que você terminou.",
  },
};

export function BookProgressEngine() {
  const { locale } = useI18n();
  const [totalPages, setTotalPages] = useState("");
  const [readPages, setReadPages] = useState("");
  const [wpp, setWpp] = useState("300");
  const [wpm, setWpm] = useState(String(SILENT_WPM));

  const progress = useMemo(() => {
    const total = parseLocaleNumber(totalPages);
    const read = parseLocaleNumber(readPages);
    const perPage = parseLocaleNumber(wpp);
    const speed = parseLocaleNumber(wpm);
    if (!Number.isFinite(total) && totalPages.trim() === "") return null; // 空表单:安静态
    return bookProgress(total, Number.isFinite(read) ? read : 0, perPage, speed);
  }, [totalPages, readPages, wpp, wpm]);

  const invalid = progress !== null && Number.isNaN(progress.percent);
  const pct = progress && Number.isFinite(progress.percent) ? progress.percent : 0;
  const showResults = progress !== null && !invalid;

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={pick(locale, S.totalPages)}>
          <NumIn value={totalPages} onChange={setTotalPages} aria={pick(locale, S.totalPages)} placeholder="300" />
        </Field>
        <Field label={pick(locale, S.readPages)}>
          <NumIn value={readPages} onChange={setReadPages} aria={pick(locale, S.readPages)} placeholder="150" />
        </Field>
        <Field label={pick(locale, S.wpp)}>
          <NumIn value={wpp} onChange={setWpp} aria={pick(locale, S.wpp)} />
        </Field>
        <Field label={pick(locale, S.wpm)}>
          <NumIn value={wpm} onChange={setWpm} aria={pick(locale, S.wpm)} />
        </Field>
      </div>

      {invalid && (
        <p className="error-bg mt-4 rounded-xl px-3.5 py-2.5 text-[13.5px] leading-5">{pick(locale, S.invalid)}</p>
      )}

      {showResults && progress && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-medium text-[var(--color-sub)]">{pick(locale, S.complete)}</span>
            <span className="mono text-[17px] font-semibold">{fmt(Math.round(pct * 10) / 10, locale, 1)}%</span>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-surface)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            aria-label={pick(locale, S.complete)}
          >
            <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border hairline px-3.5 py-3">
              <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, S.pagesLeft)}</div>
              <div className="mono mt-1 text-[17px] font-semibold">{fmt(progress.pagesRemaining, locale, 0)}</div>
            </div>
            <div className="rounded-xl border hairline px-3.5 py-3">
              <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, S.wordsLeft)}</div>
              <div className="mono mt-1 text-[17px] font-semibold">{fmt(progress.wordsRemaining, locale, 0)}</div>
            </div>
            <div className="rounded-xl border hairline px-3.5 py-3">
              <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, S.timeLeft)}</div>
              <div className="mono mt-1 text-[17px] font-semibold text-[var(--color-accent-strong)]">
                {progress.finished ? "0 s" : fmtDuration(progress.seconds, locale)}
              </div>
            </div>
          </div>

          {progress.finished && (
            <p className="mt-4 rounded-xl bg-[rgba(26,127,55,0.1)] px-3.5 py-2.5 text-[13.5px] font-medium text-[var(--color-good)]">
              {pick(locale, S.finished)}
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        <Note>{pick(locale, S.defaults)}</Note>
      </div>
    </ToolPanel>
  );
}
