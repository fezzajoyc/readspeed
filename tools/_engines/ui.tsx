"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/site";

/**
 * 引擎共享 UI 小件(泛化自参考实现的 calc-ui 模式的共享件(仅代码模式,非内容)):本地化格式化 + 表单/结果原子。
 * 只放"引擎编排"用的展示件;业务逻辑一律在 tools/_lib。
 */

/** Intl locale per site locale, used for all number formatting in engines. */
export const INTL_LOCALES: Record<string, string> = {
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  ru: "ru-RU",
  it: "it-IT",
  tr: "tr-TR",
  ko: "ko-KR",
  ar: "ar-SA",
  hi: "hi-IN",
  id: "id-ID",
  vi: "vi-VN",
};

/** Pick a string from an inline per-locale record (engine-local UI strings). */
export function pick(locale: Locale, rec: Record<string, string>): string {
  return rec[locale] ?? rec.en;
}

/** Locale-aware number formatting; non-finite input renders as an em dash. */
export function fmt(n: number, locale: Locale, maxFrac = 2): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(INTL_LOCALES[locale] ?? INTL_LOCALES.en, {
    maximumFractionDigits: maxFrac,
  }).format(n);
}

/** 秒数 → 人类时长:"45 s" / "2 min 30 s" / "1 h 5 min";非有限 → "—" */
export function fmtDuration(seconds: number, locale: Locale): string {
  if (!Number.isFinite(seconds)) return "—";
  const s = Math.round(seconds);
  if (s < 60) return `${fmt(s, locale, 0)} s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem === 0 ? `${fmt(m, locale, 0)} min` : `${fmt(m, locale, 0)} min ${fmt(rem, locale, 0)} s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm === 0 ? `${fmt(h, locale, 0)} h` : `${fmt(h, locale, 0)} h ${fmt(rm, locale, 0)} min`;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[13px] font-medium text-[var(--color-sub)]">{label}</span>
      {children}
    </div>
  );
}

/**
 * 数字输入:用 text + inputMode=decimal(不用 type=number),配合
 * _lib/numparse 的 parseLocaleNumber 实现 "1,234" / "1.234,56" 千分位容错。
 */
export function NumIn({
  value,
  onChange,
  aria,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  aria: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={`field mono ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={aria}
    />
  );
}

/** Small hint line under inputs/results. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-5 text-[var(--color-sub)]">{children}</p>;
}

/** Large label/value stat cells for result summaries. */
export function Stats({
  items,
  cols = "sm:grid-cols-2",
}: {
  items: { label: string; value: string; tone?: "good" | "bad" | "accent" }[];
  cols?: string;
}) {
  const tone = (t?: string) =>
    t === "good"
      ? "text-[var(--color-good)]"
      : t === "bad"
        ? "text-[var(--color-bad)]"
        : t === "accent"
          ? "text-[var(--color-accent-strong)]"
          : "text-[var(--color-ink)]";
  return (
    <div className={`grid grid-cols-2 gap-3 ${cols}`}>
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border hairline px-3.5 py-3">
          <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{it.label}</div>
          <div className={`mono mt-1 text-[17px] font-semibold leading-6 ${tone(it.tone)}`} aria-live="polite">
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
