import { TypingTestEngine } from "../_engines/typing-test";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "typing-speed-test",
  category: "utility",
  icon: "text",
  engine: { component: TypingTestEngine, props: {} },
  related: ["reading-time-calculator", "reading-progress"],
  copy: {
    en: {
      name: "Typing Speed Test",
      h1: "Typing Speed Test — 60 seconds, live WPM",
      tagline:
        "A 60-second typing test with live WPM and accuracy. Common English words, standard 5-chars-per-word scoring, net WPM — results stay on your device.",
      intro: [
        "One minute, common English words, the scoring everyone compares with: five characters count as one word, accuracy is the share of characters typed correctly, and net WPM subtracts your mistakes from the gross speed. The timer starts on your first keystroke and the numbers update live, so you can watch the test settle as you find a rhythm.",
        "The word stream is generated in your browser from a fixed list of 200 common English words — the corpus style used by mainstream typing tests, which keeps your score comparable across sites. Nothing is uploaded, no account is needed, and you can retake the test as often as you like.",
      ],
      steps: [
        "Click into the typing box — the timer starts on your first keystroke.",
        "Type the highlighted words; backspace fixes mistakes before they cost you.",
        "Watch live net WPM, accuracy and time left while you type.",
        "At 60 seconds the results panel freezes your net WPM, accuracy and error count.",
      ],
      faqs: [
        {
          q: "How is WPM calculated?",
          a: "Gross WPM is typed characters ÷ 5 per minute — five characters stand for one word, a convention inherited from typewriter-era training. Net WPM subtracts uncorrected errors: (characters ÷ 5 − errors) ÷ minutes. Fixing a mistake with backspace protects your score because the comparison is live against the target text.",
        },
        {
          q: "What is a good typing speed?",
          a: "The average adult types 35–45 net WPM. Professional typists reach 65–75, competitive typists pass 120. Above 60 net WPM with 95%+ accuracy you are faster than most office workers — which is the threshold worth training for.",
        },
        {
          q: "Why English words when my interface is another language?",
          a: "Common-word English streams are the de-facto standard corpus for typing tests, so scores stay comparable across sites and languages. Your keyboard layout, accuracy and rhythm matter far more than the words themselves.",
        },
      ],
    },
    zh: {
      name: "打字速度测试",
      h1: "打字速度测试 — 60 秒,实时 WPM",
      tagline:
        "60 秒打字测试,实时显示净 WPM 与准确率。常见英文词语料,标准「5 字符 = 1 词」计分,成绩只在本地。",
      intro: [
        "一分钟、常见英文词、大家都拿来比较的标准计分:五个字符算一个词,准确率是打对的字符占比,净 WPM 再从毛速度里扣掉错误。计时从你的第一下按键开始,数字实时更新——找到节奏的过程看得见。",
        "词流由浏览器从一份固定的 200 常见英文词表生成——主流打字测试的通用语料风格,成绩可以跨站点比较。不上传、不要账号,想测多少轮就测多少轮。",
      ],
      steps: [
        "点击输入框——计时从第一下按键开始。",
        "输入高亮的词;退格可以在丢分前修正错误。",
        "边打边看实时净 WPM、准确率与剩余时间。",
        "60 秒到,结果面板冻结净 WPM、准确率与错误数。",
      ],
      faqs: [
        {
          q: "WPM 怎么算?",
          a: "毛 WPM = 打字字符数 ÷ 5 ÷ 分钟——五个字符折一个词,是打字机时代传下来的约定。净 WPM 再减去未更正错误:(字符 ÷ 5 − 错误)÷ 分钟。因为是与目标文本实时比对,用退格改错可以保住分数。",
        },
        {
          q: "多快算打字快?",
          a: "成人平均净 WPM 约 35–45;职业录入员 65–75;竞赛级选手超过 120。净 WPM 60 以上且准确率 95% 以上,你已经比大多数办公室人员快——这也值得作为训练目标。",
        },
        {
          q: "界面是中文,为什么用英文词?",
          a: "常见英文词表是打字测试的事实标准语料,这样成绩才能跨站点、跨语言比较。键盘布局、准确率和节奏远比用什么词重要。",
        },
      ],
    },
    ja: {
      name: "タイピング速度テスト",
      h1: "タイピング速度テスト — 60 秒・リアルタイム WPM",
      tagline:
        "60 秒のタイピングテスト。リアルタイムの正味 WPM と正確率を表示。よく使う英単語コーパス、標準的な「5 文字 = 1 語」採点。結果は端末内だけ。",
      intro: [
        "1 分、よく使う英単語、誰もが比較する標準採点:5 文字で 1 語、正確率は打てた文字のうち正解の割合、正味 WPM はそこからミスを差し引きます。タイマーは最初のキー入力で開始し、数値はリアルタイム更新 — リズムが乗るのが目で見えます。",
        "単語ストリームはブラウザ内で 200 語の固定英単語リストから生成します — 主流のタイピングテストと同じコーパス形式なので、スコアを他サイトと比較できます。アップロードもアカウントも不要。何度でも受け直せます。",
      ],
      steps: [
        "入力欄をクリック — タイマーは最初のキー入力で始まります。",
        "ハイライトされた単語を入力。バックスペースならミスを取り返せます。",
        "入力しながら正味 WPM・正確率・残り時間をチェック。",
        "60 秒で結果パネルが正味 WPM・正確率・ミス数を確定します。",
      ],
      faqs: [
        {
          q: "WPM はどう計算しますか?",
          a: "総 WPM = 入力文字数 ÷ 5 ÷ 分 — 5 文字を 1 語とみなすのはタイプライター時代以来の約束です。正味 WPM は未修正のミスを差し引きます:(文字数 ÷ 5 − ミス)÷ 分。目標テキストと常時比較しているので、バックスペースでの修正はスコアを守ります。",
        },
        {
          q: "どのくらい速ければ速いといえますか?",
          a: "成人の平均は正味 35〜45 WPM。プロのタイピストで 65〜75、競技レベルは 120 超です。正味 60 以上で正確率 95% 以上なら、ほとんどのオフィスワーカーより速い — ここを練習目標にする価値があります。",
        },
        {
          q: "表示言語が違っても英単語なのはなぜですか?",
          a: "よく使う英単語ストリームはタイピングテストの事実上の標準コーパスで、これによりスコアがサイトや言語をまたいで比較可能になります。キー配列・正確率・リズムのほうが、単語の中身よりずっと重要です。",
        },
      ],
    },
    es: {
      name: "Test de velocidad de escritura",
      h1: "Test de velocidad de escritura — 60 segundos, PPM en vivo",
      tagline:
        "Un test de mecanografía de 60 segundos con PPM y precisión en vivo. Palabras inglesas comunes, la puntuación estándar de 5 caracteres por palabra, PPM netas — todo en tu dispositivo.",
      intro: [
        "Un minuto, palabras inglesas comunes y la puntuación con la que todo el mundo compara: cinco caracteres cuentan como una palabra, la precisión es la proporción de caracteres correctos y las PPM netas restan tus errores de la velocidad bruta. El temporizador arranca con la primera tecla y las cifras se actualizan en vivo, así que ves asentarse la prueba mientras encuentras el ritmo.",
        "El flujo de palabras se genera en tu navegador a partir de una lista fija de 200 palabras inglesas comunes — el estilo de corpus que usan los tests convencionales, lo que mantiene tu puntuación comparable entre sitios. Nada se sube, no hace falta cuenta y puedes repetir el test cuantas veces quieras.",
      ],
      steps: [
        "Haz clic en el cuadro de escritura: el temporizador arranca con la primera tecla.",
        "Teclea las palabras resaltadas; el retroceso corrige errores antes de que te cuesten.",
        "Vigila las PPM netas, la precisión y el tiempo restante mientras escribes.",
        "A los 60 segundos el panel de resultados congela tus PPM netas, precisión y errores.",
      ],
      faqs: [
        {
          q: "¿Cómo se calculan las PPM?",
          a: "Las PPM brutas son caracteres tecleados ÷ 5 por minuto — cinco caracteres equivalen a una palabra, una convención heredada del adiestramiento en máquinas de escribir. Las PPM netas restan los errores no corregidos: (caracteres ÷ 5 − errores) ÷ minutos. Como la comparación con el texto objetivo es en vivo, corregir con retroceso protege tu puntuación.",
        },
        {
          q: "¿Qué velocidad se considera buena?",
          a: "El adulto medio teclea 35–45 PPM netas. Los mecanógrafos profesionales llegan a 65–75 y los competitivos pasan de 120. Por encima de 60 netas con 95 % o más de precisión eres más rápido que la mayoría de la gente de oficina — ese es el umbral que merece entrenarse.",
        },
        {
          q: "¿Por qué palabras en inglés si mi interfaz está en otro idioma?",
          a: "Los flujos de palabras inglesas comunes son el corpus estándar de facto de los tests de mecanografía, y así las puntuaciones siguen siendo comparables entre sitios e idiomas. Tu teclado, tu precisión y tu ritmo importan mucho más que las palabras en sí.",
        },
      ],
    },
    pt: {
      name: "Teste de velocidade de digitação",
      h1: "Teste de velocidade de digitação — 60 segundos, PPM ao vivo",
      tagline:
        "Um teste de digitação de 60 segundos com PPM e precisão ao vivo. Palavras inglesas comuns, pontuação padrão de 5 caracteres por palavra, PPM líquidas — tudo no seu dispositivo.",
      intro: [
        "Um minuto, palavras inglesas comuns e a pontuação com que todo mundo compara: cinco caracteres contam como uma palavra, a precisão é a proporção de caracteres corretos e as PPM líquidas descontam seus erros da velocidade bruta. O cronômetro inicia na primeira tecla e os números atualizam ao vivo — dá para ver o teste se estabilizar conforme você acha o ritmo.",
        "O fluxo de palavras é gerado no seu navegador a partir de uma lista fixa de 200 palavras inglesas comuns — o estilo de corpus dos testes convencionais, o que mantém sua pontuação comparável entre sites. Nada é enviado, não precisa de conta e você pode refazer o teste quantas vezes quiser.",
      ],
      steps: [
        "Clique na caixa de digitação — o cronômetro inicia na primeira tecla.",
        "Digite as palavras destacadas; o backspace corrige erros antes que eles custem caro.",
        "Acompanhe PPM líquidas, precisão e tempo restante enquanto digita.",
        "Aos 60 segundos o painel de resultados congela suas PPM líquidas, precisão e erros.",
      ],
      faqs: [
        {
          q: "Como as PPM são calculadas?",
          a: "As PPM brutas são caracteres digitados ÷ 5 por minuto — cinco caracteres valem uma palavra, uma convenção herdada do treinamento em máquinas de escrever. As PPM líquidas descontam erros não corrigidos: (caracteres ÷ 5 − erros) ÷ minutos. Como a comparação com o texto alvo é ao vivo, corrigir com backspace protege sua pontuação.",
        },
        {
          q: "Qual velocidade é considerada boa?",
          a: "O adulto médio digita 35–45 PPM líquidas. Digitadores profissionais chegam a 65–75 e os competitivos passam de 120. Acima de 60 líquidas com 95%+ de precisão você é mais rápido que a maioria dos profissionais de escritório — esse é o patamar que vale treinar.",
        },
        {
          q: "Por que palavras em inglês se minha interface está em outro idioma?",
          a: "Fluxos de palavras inglesas comuns são o corpus padrão de facto dos testes de digitação, e assim as pontuações continuam comparáveis entre sites e idiomas. Seu teclado, sua precisão e seu ritmo importam muito mais do que as palavras em si.",
        },
      ],
    },
  },
});
