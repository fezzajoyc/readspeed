import { ReadingTimeEngine } from "../_engines/reading-time";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "reading-time-calculator",
  category: "utility",
  icon: "clock",
  featured: true,
  engine: { component: ReadingTimeEngine, props: {} },
  related: ["typing-speed-test", "reading-progress"],
  copy: {
    en: {
      name: "Reading Time Calculator",
      h1: "Reading Time Calculator",
      tagline:
        "Paste any text and see how long it takes to read — silently, slowly, aloud or speed-reading. CJK-aware, live counting, nothing uploaded.",
      intro: [
        "Estimate reading time before you commit: a speech that must fit into ten minutes, an article you want to finish on the train, a chapter assigned for class. Paste the text and the calculator shows four estimates at once — silent reading at 238 words per minute (the adult average measured by Marc Brysbaert's 2019 meta-analysis of 190 studies), slow comprehension-focused reading at 150, reading aloud or presenting at 140, and speed reading at 400.",
        "The tool is language-aware: English and other space-separated scripts are measured in words, while Chinese, Japanese and Korean text switches to characters per minute, because counting 'words' in unspaced scripts distorts the estimate. Everything runs in your browser — paste unpublished drafts, client copy or confidential text freely; nothing is sent anywhere.",
      ],
      steps: [
        "Paste or type your text into the box.",
        "Read the four estimates: silent, slow, aloud and speed reading.",
        "Use the live word or character count to brief writers and translators.",
        "Trim or expand your text until the target time fits.",
      ],
      faqs: [
        {
          q: "How accurate is a words-per-minute estimate?",
          a: "238 wpm is the average for adult silent reading reported by Brysbaert's 2019 meta-analysis of 190 studies — individual readers range from roughly 150 to 400 wpm. Treat the silent figure as a solid middle estimate and the other three speeds as brackets around it.",
        },
        {
          q: "How is reading time calculated for Chinese or Japanese text?",
          a: "Unspaced scripts are measured in characters, not words: silent reading uses about 500 characters per minute for Chinese, and the other speeds scale proportionally. Japanese and Korean use the same character-based model, which is an approximation for both.",
        },
        {
          q: "Why does reading aloud take longer than silent reading?",
          a: "Speech is limited by how fast you can articulate. Presenters are typically coached to stay near 140 words per minute so an audience can follow, while silent readers skim, slow down and re-read freely — hence the wide gap between the two estimates.",
        },
      ],
    },
    zh: {
      name: "阅读时间计算器",
      h1: "阅读时间计算器",
      tagline:
        "粘贴任意文本,立即看到默读、精读、朗读、速读四档阅读时间。中英日韩自适应,实时计数,内容不上传。",
      intro: [
        "在开始之前就知道要花多久:一段必须塞进十分钟的发言、通勤路上想读完的文章、老师布置的章节。粘贴文本,计算器同时给出四档估算——默读按每分钟 238 词(Brysbaert 2019 年对 190 项研究的元分析得出的成人均值)、精读 150、朗读/演讲 140、速读 400。",
        "工具会识别语言:英文等以空格分词的文本按词计,中文、日文、韩文自动切到「每分钟字数」模式——因为对无空格文字按「词」统计会失真。全部计算在浏览器本地完成,未发布的草稿和保密内容都可以放心粘贴。",
      ],
      steps: [
        "把文本粘贴或输入到输入框。",
        "查看四档估算:默读、精读、朗读、速读。",
        "用实时词数/字数与写作者、译者沟通篇幅。",
        "增删内容,直到时长达标。",
      ],
      faqs: [
        {
          q: "按词/分钟估算准吗?",
          a: "238 wpm 来自 Brysbaert 2019 年 190 项研究的元分析,是成人默读均值;个体差异约在 150–400 wpm 之间。把默读档当作可靠的中位估计,其余三档作为上下界。",
        },
        {
          q: "中文、日文怎么计算?",
          a: "无空格文字按「字」计:中文默读约每分钟 500 字,其余档位按比例缩放。日文、韩文沿用同一字数模型,对两者都是近似值。",
        },
        {
          q: "为什么朗读比默读慢?",
          a: "说话受口齿速率限制。演讲训练通常建议保持在每分钟 140 词左右,听众才跟得上;而默读可以随时跳读、放慢、回看——所以两档估算差距明显。",
        },
      ],
    },
    ja: {
      name: "読書時間カウンター",
      h1: "読書時間カウンター",
      tagline:
        "テキストを貼り付けて読書時間を即算出 — 黙読・ゆっくり・音読・速読の 4 段階。CJK 対応、リアルタイム集計、アップロードなし。",
      intro: [
        "読む前に時間を読む:10 分に収めなければならないスピーチ、移動中に読み切りたい記事、授業で課された章。テキストを貼り付けると 4 つの推定が一度に出ます — 黙読は毎分 238 語(Brysbaert が 2019 年に 190 研究をメタ分析した成人平均)、ゆっくり読みは 150、音読・発表は 140、速読は 400。",
        "言語を自動判別します:英語など空白で分かつ文字は語数で、中国語・日本語・韓国語は「1 分あたりの文字数」に切り替えます — 分かち書きしない文字を「語」で数えると誤差が出るためです。処理はすべてブラウザ内。未公開の草稿や機密テキストも安心して貼り付けられます。",
      ],
      steps: [
        "テキストを入力欄に貼り付けまたは入力します。",
        "4 つの推定を確認:黙読・ゆっくり読み・音読・速読。",
        "リアルタイムの語数/文字数を執筆者や翻訳者との調整に使います。",
        "目標時間に収まるまで文章を調整します。",
      ],
      faqs: [
        {
          q: "1 分あたりの語数の推定はどのくらい正確ですか?",
          a: "238 wpm は Brysbaert の 2019 年メタ分析(190 研究)による成人の黙読平均です。個人差はおよそ 150〜400 wpm。黙読の数値を中央値と捉え、他の 3 つをレンジとして使ってください。",
        },
        {
          q: "中国語や日本語のテキストはどう計算しますか?",
          a: "分かち書きしない文字は文字数で測ります:黙読は中国語で約 500 字/分、他の速度は比例スケールです。日本語・韓国語も同じ文字数モデルを使います(いずれも近似です)。",
        },
        {
          q: "音読は黙読より時間がかかるのはなぜですか?",
          a: "発話は発音できる速さに制限されるためです。発表の訓練では聞き手がついてこられるよう毎分 140 語前後が推奨されます。一方、黙読は自由に速読・減速・読み返しができます。",
        },
      ],
    },
    es: {
      name: "Calculadora de tiempo de lectura",
      h1: "Calculadora de tiempo de lectura",
      tagline:
        "Pega cualquier texto y mira cuánto tarda en leerse: en silencio, despacio, en voz alta o leyendo rápido. Detecta CJK, cuenta en vivo, no sube nada.",
      intro: [
        "Calcula el tiempo de lectura antes de comprometerte: un discurso que debe caber en diez minutos, un artículo que quieres terminar en el tren, un capítulo pendiente para clase. Pega el texto y la calculadora muestra cuatro estimaciones a la vez — lectura silenciosa a 238 palabras por minuto (el promedio adulto del metaanálisis de 190 estudios de Marc Brysbaert, 2019), lectura lenta a 150, leer en voz alta o presentar a 140 y lectura rápida a 400.",
        "La herramienta distingue el idioma: el inglés y otras escrituras con espacios se miden en palabras, mientras que el chino, japonés y coreano cambian a caracteres por minuto, porque contar «palabras» en escrituras sin espacios falsea la estimación. Todo corre en tu navegador: pega borradores sin publicar o textos confidenciales; nada se envía a ningún sitio.",
      ],
      steps: [
        "Pega o escribe tu texto en el cuadro.",
        "Lee las cuatro estimaciones: silenciosa, lenta, en voz alta y rápida.",
        "Usa el recuento en vivo de palabras o caracteres para coordinar con redactores y traductores.",
        "Ajusta el texto hasta encajar en el tiempo objetivo.",
      ],
      faqs: [
        {
          q: "¿Qué precisión tiene una estimación en palabras por minuto?",
          a: "238 ppm es el promedio de lectura silenciosa adulta del metaanálisis de Brysbaert (2019) sobre 190 estudios; los lectores individuales van de unos 150 a 400 ppm. Toma la cifra silenciosa como estimación central y las otras tres velocidades como horquilla.",
        },
        {
          q: "¿Cómo se calcula el tiempo para texto chino o japonés?",
          a: "Las escrituras sin espacios se miden en caracteres, no en palabras: la lectura silenciosa usa unos 500 caracteres por minuto para el chino y las demás velocidades escalan proporcionalmente. Japonés y coreano usan el mismo modelo por caracteres, que es una aproximación para ambos.",
        },
        {
          q: "¿Por qué leer en voz alta tarda más que leer en silencio?",
          a: "El habla está limitada por lo rápido que articulas. A quien presenta se le suele recomendar mantenerse cerca de 140 palabras por minuto para que el público siga el hilo, mientras que el lector silencioso salta, frena y relee a su antojo.",
        },
      ],
    },
    pt: {
      name: "Calculadora de tempo de leitura",
      h1: "Calculadora de tempo de leitura",
      tagline:
        "Cole qualquer texto e veja quanto tempo leva para ler — em silêncio, devagar, em voz alta ou lendo rápido. Ciente de CJK, contagem ao vivo, nada enviado.",
      intro: [
        "Estime o tempo de leitura antes de se comprometer: um discurso que precisa caber em dez minutos, um artigo para terminar no trem, um capítulo de dever de casa. Cole o texto e a calculadora mostra quatro estimativas de uma vez — leitura silenciosa a 238 palavras por minuto (a média adulta da metanálise de 190 estudos de Marc Brysbaert, 2019), leitura lenta a 150, leitura em voz alta ou apresentação a 140 e leitura dinâmica a 400.",
        "A ferramenta reconhece o idioma: inglês e outras escritas com espaço são medidas em palavras, enquanto chinês, japonês e coreano mudam para caracteres por minuto, porque contar \"palavras\" em escritas sem espaço distorce a estimativa. Tudo roda no seu navegador — cole rascunhos não publicados ou texto confidencial; nada é enviado a lugar algum.",
      ],
      steps: [
        "Cole ou digite seu texto na caixa.",
        "Leia as quatro estimativas: silenciosa, lenta, em voz alta e dinâmica.",
        "Use a contagem ao vivo de palavras ou caracteres para combinar prazos com redatores e tradutores.",
        "Ajuste o texto até caber no tempo alvo.",
      ],
      faqs: [
        {
          q: "Qual é a precisão de uma estimativa em palavras por minuto?",
          a: "238 ppm é a média de leitura silenciosa adulta da metanálise de Brysbaert (2019) sobre 190 estudos — leitores individuais variam de cerca de 150 a 400 ppm. Trate o valor silencioso como estimativa central e as outras três velocidades como a margem.",
        },
        {
          q: "Como o tempo é calculado para texto em chinês ou japonês?",
          a: "Escritas sem espaço são medidas em caracteres, não em palavras: a leitura silenciosa usa cerca de 500 caracteres por minuto para o chinês, e as demais velocidades escalam proporcionalmente. Japonês e coreano usam o mesmo modelo por caracteres, que é uma aproximação para ambos.",
        },
        {
          q: "Por que ler em voz alta demora mais que ler em silêncio?",
          a: "A fala é limitada pela velocidade de articulação. Quem apresenta geralmente é orientado a ficar perto de 140 palavras por minuto para o público acompanhar, enquanto o leitor silencioso salta, desacelera e relê à vontade.",
        },
      ],
    },
  },
});
