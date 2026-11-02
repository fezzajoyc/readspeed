"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { accuracy, diffTyped, netWpm, wordStream } from "../_lib/readspeed";
import { Note, Stats, fmt, pick } from "./ui";

/**
 * 打字速度测试引擎:60 秒计时,常见英文词语料,首键起表,实时 WPM/准确率,
 * 结束后冻结结果。纯逻辑在 _lib/readspeed.ts(netWpm / accuracy / diffTyped /
 * wordStream),这里只做 UI 编排与计时。
 * 计时锚定 Date.now()(换标签页继续计时,回来即冻结),100ms 间隔刷新。
 */

const TEST_MS = 60_000;
const STREAM_WORDS = 300;

type Phase = "idle" | "running" | "done";

const S = {
  inputAria: { en: "Typing input — type the words shown above", zh: "打字输入框——输入上方显示的词", ja: "タイピング入力 — 上の単語を入力してください", es: "Entrada de escritura: teclea las palabras mostradas arriba", pt: "Campo de digitação — digite as palavras mostradas acima" },
  timeLeft: { en: "Time left", zh: "剩余时间", ja: "残り時間", es: "Tiempo restante", pt: "Tempo restante" },
  netWpm: { en: "Net WPM", zh: "净 WPM", ja: "正味 WPM", es: "PPM netas", pt: "PPM líquidas" },
  accLabel: { en: "Accuracy", zh: "准确率", ja: "正確率", es: "Precisión", pt: "Precisão" },
  raw: { en: "Raw WPM", zh: "毛 WPM", ja: "総 WPM", es: "PPM brutas", pt: "PPM brutas" },
  charsTyped: { en: "Characters typed", zh: "已打字符", ja: "入力文字数", es: "Caracteres tecleados", pt: "Caracteres digitados" },
  correct: { en: "Correct", zh: "正确", ja: "正解", es: "Correctos", pt: "Corretos" },
  errors: { en: "Errors", zh: "错误", ja: "ミス", es: "Errores", pt: "Erros" },
  startHint: {
    en: "Click into the box and start typing — the 60-second timer starts on your first keystroke. Backspace works; paste does not.",
    zh: "点击输入框开始打字——60 秒计时从你的第一下按键开始。可以退格修正;粘贴已禁用。",
    ja: "入力欄をクリックして入力を開始 — 60 秒のタイマーは最初のキー入力で始まります。バックスペースは有効、貼り付けは無効です。",
    es: "Haz clic en el cuadro y empieza a teclear: el temporizador de 60 segundos arranca con la primera tecla. El retroceso funciona; pegar no.",
    pt: "Clique na caixa e comece a digitar — o cronômetro de 60 segundos inicia na primeira tecla. Backspace funciona; colar não.",
  },
  done: { en: "Time is up — your results", zh: "时间到——你的成绩", ja: "時間終了 — 結果", es: "Tiempo terminado: tus resultados", pt: "Tempo esgotado — seus resultados" },
  restart: { en: "New test", zh: "再来一轮", ja: "新しいテスト", es: "Nueva prueba", pt: "Novo teste" },
  corpus: {
    en: "Words come from a fixed list of 200 common English words — the de-facto standard corpus for typing tests. Scoring: 5 characters = 1 word; net WPM = (characters ÷ 5 − errors) ÷ minutes.",
    zh: "词语来自一份固定的 200 常见英文词表——打字测试的事实标准语料。计分:5 字符 = 1 词;净 WPM =(字符 ÷ 5 − 错误)÷ 分钟。",
    ja: "単語は 200 のよく使われる英単語の固定リストから生成されます — タイピングテストの事実上の標準コーパスです。採点:5 文字 = 1 語、正味 WPM =(文字数 ÷ 5 − ミス)÷ 分。",
    es: "Las palabras provienen de una lista fija de 200 palabras inglesas comunes: el corpus estándar de facto de las pruebas de mecanografía. Puntuación: 5 caracteres = 1 palabra; PPM netas = (caracteres ÷ 5 − errores) ÷ minutos.",
    pt: "As palavras vêm de uma lista fixa de 200 palavras inglesas comuns — o corpus padrão de fato dos testes de digitação. Pontuação: 5 caracteres = 1 palavra; PPM líquidas = (caracteres ÷ 5 − erros) ÷ minutos.",
  },
  bands: {
    en: "For reference: the average adult types 35–45 net WPM; 60+ with 95% accuracy is above typical office speed; competitive typists exceed 120.",
    zh: "参考:成人平均净 WPM 约 35–45;60 以上且准确率 95% 已超过一般办公速度;竞赛级选手超过 120。",
    ja: "参考:成人の平均は正味 35–45 WPM。95% 以上の正確率で 60 を超えれば一般的なオフィス業務より速く、競技レベルは 120 を超えます。",
    es: "Como referencia: el adulto medio teclea 35–45 PPM netas; superar 60 con 95 % de precisión está por encima de la velocidad típica de oficina; los mecanógrafos competitivos pasan de 120.",
    pt: "Como referência: o adulto médio digita 35–45 PPM líquidas; 60+ com 95% de precisão está acima da velocidade típica de escritório; digitadores competitivos passam de 120.",
  },
};

export function TypingTestEngine() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [seed, setSeed] = useState(1);
  const [typed, setTyped] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const startAtRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 挂载时随机语料种子(SSR 首帧用确定种子,避免 hydration 不匹配) */
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 2 ** 31));
  }, []);

  const target = useMemo(() => wordStream(STREAM_WORDS, seed).join(" "), [seed]);
  const chars = useMemo(() => [...target], [target]);

  /* 计时循环:运行中每 100ms 现算一次;到点即冻结(phase done) */
  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      const ms = Date.now() - startAtRef.current;
      if (ms >= TEST_MS) {
        setElapsed(TEST_MS);
        setPhase("done");
      } else {
        setElapsed(ms);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const diff = useMemo(() => diffTyped(target, typed), [target, typed]);
  const minutes = Math.min(elapsed, TEST_MS) / 60_000;
  const wpm = phase === "idle" ? 0 : netWpm(diff.total, minutes, diff.incorrect);
  const raw = phase === "idle" ? 0 : netWpm(diff.total, minutes, 0);
  const acc = phase === "idle" ? 0 : accuracy(diff.correct, diff.total);
  const secondsLeft = Math.ceil((TEST_MS - Math.min(elapsed, TEST_MS)) / 1000);

  /* 光标跟随:当前字符滚入可视区 */
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest" });
  }, [typed.length, seed]);

  const onChange = (value: string) => {
    if (phase === "done") return;
    if (phase === "idle" && value.length > 0) {
      startAtRef.current = Date.now();
      setPhase("running");
    }
    setTyped(value);
  };

  const restart = () => {
    setTyped("");
    setElapsed(0);
    setSeed(Math.floor(Math.random() * 2 ** 31));
    setPhase("idle");
    inputRef.current?.focus();
  };

  /* 逐字符上色:已打=墨色/红色,当前=反色光标,未打=次级色;空白字符用 pre 保留 */
  const charClass = (i: number) => {
    if (i < typed.length) return typed[i] === target[i] ? "text-[var(--color-ink)]" : "text-[var(--color-bad)] underline decoration-2";
    if (i === typed.length) return "rounded-[2px] bg-[var(--color-accent)] text-white";
    return "text-[var(--color-sub)]";
  };

  const doneResults = [
    { label: pick(locale, S.netWpm), value: fmt(Math.round(wpm), locale, 0), tone: "accent" as const },
    { label: pick(locale, S.accLabel), value: `${fmt(Math.round(acc * 10) / 10, locale, 1)}%` },
    { label: pick(locale, S.raw), value: fmt(Math.round(raw), locale, 0) },
    { label: pick(locale, S.charsTyped), value: fmt(diff.total, locale, 0) },
    { label: pick(locale, S.correct), value: fmt(diff.correct, locale, 0), tone: "good" as const },
    { label: pick(locale, S.errors), value: fmt(diff.incorrect, locale, 0), tone: diff.incorrect > 0 ? ("bad" as const) : undefined },
  ];

  return (
    <ToolPanel>
      <div className="grid grid-cols-3 gap-3" aria-live="polite">
        <div className="rounded-xl border hairline px-3.5 py-3 text-center">
          <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, S.timeLeft)}</div>
          <div className="mono mt-1 text-2xl font-semibold tabular-nums">{fmt(secondsLeft, locale, 0)} s</div>
        </div>
        <div className="rounded-xl border hairline px-3.5 py-3 text-center">
          <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, S.netWpm)}</div>
          <div className="mono mt-1 text-2xl font-semibold tabular-nums text-[var(--color-accent-strong)]">
            {fmt(Math.round(wpm), locale, 0)}
          </div>
        </div>
        <div className="rounded-xl border hairline px-3.5 py-3 text-center">
          <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{pick(locale, S.accLabel)}</div>
          <div className="mono mt-1 text-2xl font-semibold tabular-nums">
            {phase === "idle" ? "—" : `${fmt(Math.round(acc * 10) / 10, locale, 1)}%`}
          </div>
        </div>
      </div>

      <div className="mt-4 max-h-36 overflow-y-auto rounded-xl border hairline bg-[var(--color-surface)] px-4 py-3">
        <p className="whitespace-pre-wrap break-words text-[17px] leading-8 tracking-wide">
          {chars.map((ch, i) => (
            <span key={i} ref={i === typed.length ? cursorRef : undefined} className={charClass(i)}>
              {ch}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-4">
        <input
          ref={inputRef}
          type="text"
          className="field mono"
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          readOnly={phase === "done"}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
          aria-label={pick(locale, S.inputAria)}
        />
      </div>

      {phase !== "done" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={restart}
            className="rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)]"
          >
            {pick(locale, S.restart)}
          </button>
          <Note>{pick(locale, S.startHint)}</Note>
        </div>
      )}

      {phase === "done" && (
        <div className="mt-5">
          <h3 className="text-[15px] font-semibold">{pick(locale, S.done)}</h3>
          <div className="mt-3">
            <Stats cols="sm:grid-cols-3" items={doneResults} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {pick(locale, S.restart)}
            </button>
          </div>
          <div className="mt-4 space-y-2">
            <Note>{pick(locale, S.bands)}</Note>
            <Note>{pick(locale, S.corpus)}</Note>
          </div>
        </div>
      )}

      {phase !== "done" && <div className="mt-3"><Note>{pick(locale, S.corpus)}</Note></div>}
    </ToolPanel>
  );
}
