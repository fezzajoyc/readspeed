import { BookProgressEngine } from "../_engines/book-progress";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "reading-progress",
  category: "utility",
  icon: "check",
  engine: { component: BookProgressEngine, props: {} },
  related: ["reading-time-calculator", "typing-speed-test"],
  copy: {
    en: {
      name: "Reading Progress Tracker",
      h1: "Reading Progress Tracker",
      tagline:
        "Track a book page by page: percentage complete, pages and words left, and the reading time remaining at your pace. All arithmetic, in your browser.",
      intro: [
        "Turn 'I am on page 150 of 300' into something you can plan around. Enter the book's total pages, where you are, and the average words per page (300 is a good default for adult trade books) — the tracker shows percent complete, pages and words remaining, and how long the rest will take at your reading speed.",
        "Use it to pace a reading assignment across the week, to check whether finishing before the library due date is realistic, or to compare how long two books in your stack will take. It is arithmetic in your browser — no account, nothing stored, nothing uploaded.",
      ],
      steps: [
        "Enter the book's total pages.",
        "Enter the page you are on.",
        "Adjust words-per-page if the book runs dense or light (default 300).",
        "Set your reading speed for a personal time estimate (238 WPM is the adult average).",
      ],
      faqs: [
        {
          q: "What words-per-page should I use?",
          a: "300 is the standard estimate for an average trade paperback. Dense non-fiction can run 400–500, dialogue-heavy or large-print fiction 200–250. To be exact: count the words on one full page of your book and use that number.",
        },
        {
          q: "Which reading speed does the estimate use?",
          a: "238 words per minute by default — the adult silent-reading average from Brysbaert's 2019 meta-analysis. Replace it with your own tested WPM (for example from the typing speed test on this site, if you read at a similar pace to how you type) for a personal estimate.",
        },
        {
          q: "Can I track several books?",
          a: "Run the tracker once per book — it is instant arithmetic, so you can flip between books and compare remaining times directly. Nothing is stored between visits, so re-entering the numbers is all it costs.",
        },
      ],
    },
    zh: {
      name: "阅读进度追踪",
      h1: "阅读进度追踪",
      tagline:
        "按页追踪一本书:完成百分比、剩余页数与字数、按你的速度算出的剩余阅读时间。纯算术,全在浏览器。",
      intro: [
        "把「我在第 150 页,共 300 页」变成可规划的数字。输入书的总页数、当前页和平均每页词数(成人读物通常 300)——追踪器给出完成百分比、剩余页数与字数,以及按你的阅读速度算出的剩余时间。",
        "用它把阅读作业摊到一周里、判断能否在图书馆到期日前读完、或比较书堆里两本书各要多久。它只是浏览器里的算术——不要账号、不存数据、不上传。",
      ],
      steps: [
        "输入书的总页数。",
        "输入你读到的页数。",
        "书偏密或偏疏时调整每页词数(默认 300)。",
        "填入你的阅读速度,得到个人化时间估算(238 WPM 是成人均值)。",
      ],
      faqs: [
        {
          q: "每页词数该填多少?",
          a: "300 是普通平装书的标准估计。偏密的非虚构可以到 400–500,多对话或大字版小说 200–250。想精确:数一数书中某一整页的词数,直接填那个数。",
        },
        {
          q: "估算用哪个阅读速度?",
          a: "默认 238 词/分钟——Brysbaert 2019 年元分析给出的成人默读均值。换成你自己实测的 WPM(比如用本站打字测试测出的速度,如果你读书和打字的节奏接近)就得到个人化估算。",
        },
        {
          q: "能同时追踪几本书吗?",
          a: "一本书算一次即可——它是即时算术,可以在几本书之间来回切换、直接比较剩余时间。不做任何存储,重新输入数字就是全部成本。",
        },
      ],
    },
    ja: {
      name: "読書プログレス管理",
      h1: "読書プログレス管理",
      tagline:
        "本をページ単位で追跡:達成率、残りページ数と語数、自分の速度で計算した残り読書時間。純粋な計算で、すべてブラウザ内。",
      intro: [
        "「300 ページの 150 ページ目」を計画できる数字に変えます。本の総ページ数、今のページ、平均の 1 ページあたり語数(成人向け書籍なら 300 が目安)を入れると — 達成率、残りページ数・語数、そして自分の読書速度で残りにかかる時間を表示します。",
        "読書課題を一週間に分散させたいとき、図書館の返却期日に間に合うか確かめたいとき、積読の 2 冊のどちらが早く終わるか比べたいときに。ブラウザ内の算術だけ — アカウントも保存もアップロードもありません。",
      ],
      steps: [
        "本の総ページ数を入力します。",
        "今読んでいるページを入力します。",
        "文章が濃い/薄い場合は 1 ページの語数を調整(既定 300)。",
        "自分の読書速度を入れると個人向けの時間估算になります(238 WPM は成人平均)。",
      ],
      faqs: [
        {
          q: "1 ページの語数はいくつにすればいいですか?",
          a: "300 は典型的なペーパーバックの標準的な目安です。密度の高いノンフィクションは 400〜500、会話中心や大活字のフィクションは 200〜250。正確にやるには:本のどこか 1 ページの語数を数えて、その数を使います。",
        },
        {
          q: "估算にはどの読書速度が使われますか?",
          a: "既定は毎分 238 語 — Brysbaert の 2019 年メタ分析による成人の黙読平均です。自分で実測した WPM(たとえば当サイトのタイピングテストの結果。読む速さと打つ速さが近いなら)に置き換えると個人向けの估算になります。",
        },
        {
          q: "複数の本を追跡できますか?",
          a: "1 冊につき 1 回計算すれば十分です — 即時の算術なので、本を行き来して残り時間を直接比較できます。 何も保存しないので、数値を打ち直すのが唯一のコストです。",
        },
      ],
    },
    es: {
      name: "Seguimiento de lectura",
      h1: "Seguimiento de lectura",
      tagline:
        "Sigue un libro página a página: porcentaje completado, páginas y palabras restantes, y el tiempo de lectura que queda a tu ritmo. Pura aritmética, en tu navegador.",
      intro: [
        "Convierte «voy por la página 150 de 300» en algo que puedes planificar. Introduce las páginas totales del libro, por dónde vas y las palabras medias por página (300 es un buen valor por defecto para libros adultos): el seguimiento muestra el porcentaje completado, las páginas y palabras restantes y cuánto tardarás al resto con tu velocidad de lectura.",
        "Úsalo para repartir una lectura obligatoria a lo largo de la semana, comprobar si llegar a la fecha de devolución de la biblioteca es realista o comparar cuánto tardarán dos libros de tu pila. Es aritmética en tu navegador: sin cuenta, sin almacenar nada, sin subir nada.",
      ],
      steps: [
        "Introduce las páginas totales del libro.",
        "Introduce la página por la que vas.",
        "Ajusta las palabras por página si el libro es denso o ligero (por defecto 300).",
        "Pon tu velocidad de lectura para una estimación personal (238 PPM es la media adulta).",
      ],
      faqs: [
        {
          q: "¿Qué palabras por página debo usar?",
          a: "300 es la estimación estándar para un libro en rústica medio. La no ficción densa puede rondar 400–500 y la ficción con mucho diálogo o en letra grande 200–250. Para ser exacto: cuenta las palabras de una página completa de tu libro y usa esa cifra.",
        },
        {
          q: "¿Qué velocidad de lectura usa la estimación?",
          a: "238 palabras por minuto por defecto — la media adulta de lectura silenciosa del metaanálisis de Brysbaert (2019). Sustitúyela por tu PPM medida (por ejemplo con el test de escritura de este sitio, si lees a un ritmo parecido a como tecleas) para una estimación personal.",
        },
        {
          q: "¿Puedo seguir varios libros?",
          a: "Calcula una vez por libro — es aritmética instantánea, así que puedes alternar entre libros y comparar tiempos restantes directamente. No se guarda nada entre visitas: reintroducir los números es todo el coste.",
        },
      ],
    },
    pt: {
      name: "Acompanhamento de leitura",
      h1: "Acompanhamento de leitura",
      tagline:
        "Acompanhe um livro página a página: porcentagem concluída, páginas e palavras restantes, e o tempo de leitura que falta no seu ritmo. Aritmética pura, no navegador.",
      intro: [
        "Transforme \"estou na página 150 de 300\" em algo que dá para planejar. Informe o total de páginas do livro, em que página você está e a média de palavras por página (300 é um bom padrão para livros adultos) — o acompanhamento mostra a porcentagem concluída, páginas e palavras restantes e quanto tempo o resto vai levar na sua velocidade de leitura.",
        "Use para distribuir uma leitura obrigatória pela semana, verificar se terminar antes da devolução na biblioteca é realista ou comparar quanto vão levar dois livros da sua pilha. É aritmética no navegador — sem conta, nada salvo, nada enviado.",
      ],
      steps: [
        "Informe o total de páginas do livro.",
        "Informe a página em que você está.",
        "Ajuste as palavras por página se o livro for denso ou leve (padrão 300).",
        "Defina sua velocidade de leitura para uma estimativa pessoal (238 PPM é a média adulta).",
      ],
      faqs: [
        {
          q: "Quantas palavras por página devo usar?",
          a: "300 é a estimativa padrão para um paperback comum. Não-ficção densa pode chegar a 400–500; ficção cheia de diálogo ou letra grande, 200–250. Para ser exato: conte as palavras de uma página inteira do seu livro e use esse número.",
        },
        {
          q: "Qual velocidade de leitura a estimativa usa?",
          a: "238 palavras por minuto por padrão — a média adulta de leitura silenciosa da metanálise de Brysbaert (2019). Troque pelas suas PPM medidas (por exemplo, no teste de digitação deste site, se você lê num ritmo parecido com o que digita) para uma estimativa pessoal.",
        },
        {
          q: "Posso acompanhar vários livros?",
          a: "Calcule uma vez por livro — é aritmética instantânea, então você pode alternar entre livros e comparar os tempos restantes diretamente. Nada fica salvo entre visitas: redigitar os números é todo o custo.",
        },
      ],
    },
  },
});
