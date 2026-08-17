/**
 * Curated preset catalogs of news sources and topics.
 *
 * These are shown in Settings as one-click "add" checkboxes so the user
 * doesn't have to hunt for RSS URLs.
 *
 * RSS URLs on Israeli publisher sites tend to change over time. If one
 * stops fetching, disable it in Settings; the ingestion pipeline keeps
 * running for the rest.
 */

export type SourcePreset = {
  name: string;
  website_url: string;
  rss_url: string;
  group: 'israel-hebrew' | 'israel-english' | 'telegram' | 'world-news' | 'tech';
};

export type TopicPreset = {
  name: string;
  description: string;
};

export const SOURCE_PRESETS: SourcePreset[] = [
  // ─────────────── Israel · Hebrew ───────────────
  {
    name: 'Ynet',
    website_url: 'https://www.ynet.co.il',
    rss_url: 'https://www.ynet.co.il/Integration/StoryRss2.xml',
    group: 'israel-hebrew',
  },
  {
    name: 'Ynet — חדשות',
    website_url: 'https://www.ynet.co.il/news',
    rss_url: 'https://www.ynet.co.il/Integration/StoryRss1854.xml',
    group: 'israel-hebrew',
  },
  {
    name: 'ישראל היום',
    website_url: 'https://www.israelhayom.co.il',
    rss_url: 'https://www.israelhayom.co.il/rss',
    group: 'israel-hebrew',
  },
  {
    name: 'וואלה חדשות',
    website_url: 'https://news.walla.co.il',
    rss_url: 'https://rss.walla.co.il/feed/1?type=main',
    group: 'israel-hebrew',
  },
  {
    name: 'גלובס',
    website_url: 'https://www.globes.co.il',
    rss_url: 'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585',
    group: 'israel-hebrew',
  },
  {
    name: 'ספורט 5',
    website_url: 'https://www.sport5.co.il',
    rss_url: 'https://www.sport5.co.il/rss.aspx?FolderID=64',
    group: 'israel-hebrew',
  },
  {
    name: 'ONE — ספורט',
    website_url: 'https://www.one.co.il',
    rss_url: 'https://www.one.co.il/cat/rss/rss.aspx',
    group: 'israel-hebrew',
  },
  {
    name: 'כיכר השבת',
    website_url: 'https://www.kikar.co.il',
    rss_url: 'https://www.kikar.co.il/feed',
    group: 'israel-hebrew',
  },
  {
    name: 'בחדרי חרדים',
    website_url: 'https://www.bhol.co.il',
    rss_url: 'https://www.bhol.co.il/rss/newsflash.xml',
    group: 'israel-hebrew',
  },
  {
    name: 'סרוגים',
    website_url: 'https://www.srugim.co.il',
    rss_url: 'https://www.srugim.co.il/feed',
    group: 'israel-hebrew',
  },
  {
    name: 'כיפה',
    website_url: 'https://www.kipa.co.il',
    rss_url: 'https://www.kipa.co.il/feed/',
    group: 'israel-hebrew',
  },
  {
    name: 'הפרגוד',
    website_url: 'https://www.haparegod.co.il',
    rss_url: 'https://www.haparegod.co.il/feed',
    group: 'israel-hebrew',
  },
  {
    name: 'ערוץ 7',
    website_url: 'https://www.inn.co.il',
    rss_url: 'https://www.inn.co.il/Rss.aspx',
    group: 'israel-hebrew',
  },
  {
    name: 'כאן חדשות',
    website_url: 'https://www.kan.org.il',
    rss_url: 'https://www.kan.org.il/podcast/podcast.ashx/rss?podcastId=1090',
    group: 'israel-hebrew',
  },
  {
    name: 'The Marker — הייטק',
    website_url: 'https://www.themarker.com/technation',
    rss_url: 'https://www.themarker.com/cmlink/1.148',
    group: 'israel-hebrew',
  },

  // ─────────────── Israel · English ───────────────
  {
    name: 'The Times of Israel',
    website_url: 'https://www.timesofisrael.com',
    rss_url: 'https://www.timesofisrael.com/feed/',
    group: 'israel-english',
  },
  {
    name: 'The Jerusalem Post',
    website_url: 'https://www.jpost.com',
    rss_url: 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx',
    group: 'israel-english',
  },
  {
    name: 'Israel Hayom (English)',
    website_url: 'https://www.israelhayom.com',
    rss_url: 'https://www.israelhayom.com/feed',
    group: 'israel-english',
  },
  {
    name: 'Globes (English)',
    website_url: 'https://en.globes.co.il',
    rss_url: 'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=1725',
    group: 'israel-english',
  },
  {
    name: 'Ynetnews',
    website_url: 'https://www.ynetnews.com',
    rss_url: 'https://www.ynetnews.com/Integration/StoryRss3082.xml',
    group: 'israel-english',
  },

  // ─────────────── World news ───────────────
  {
    name: 'BBC News',
    website_url: 'https://www.bbc.com/news',
    rss_url: 'https://feeds.bbci.co.uk/news/rss.xml',
    group: 'world-news',
  },
  {
    name: 'BBC World',
    website_url: 'https://www.bbc.com/news/world',
    rss_url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    group: 'world-news',
  },
  {
    name: 'The New York Times — Home',
    website_url: 'https://www.nytimes.com',
    rss_url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    group: 'world-news',
  },
  {
    name: 'The New York Times — World',
    website_url: 'https://www.nytimes.com/section/world',
    rss_url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    group: 'world-news',
  },
  {
    name: 'The Guardian — World',
    website_url: 'https://www.theguardian.com/world',
    rss_url: 'https://www.theguardian.com/world/rss',
    group: 'world-news',
  },
  {
    name: 'Sky News',
    website_url: 'https://news.sky.com',
    rss_url: 'https://feeds.skynews.com/feeds/rss/home.xml',
    group: 'world-news',
  },
  {
    name: 'The Independent — World',
    website_url: 'https://www.independent.co.uk/news/world',
    rss_url: 'https://www.independent.co.uk/news/world/rss',
    group: 'world-news',
  },
  {
    name: 'Al Jazeera',
    website_url: 'https://www.aljazeera.com',
    rss_url: 'https://www.aljazeera.com/xml/rss/all.xml',
    group: 'world-news',
  },
  {
    name: 'Associated Press — Top News',
    website_url: 'https://apnews.com',
    rss_url: 'https://feeds.apnews.com/rss/apf-topnews',
    group: 'world-news',
  },
  {
    name: 'NPR News',
    website_url: 'https://www.npr.org',
    rss_url: 'https://feeds.npr.org/1001/rss.xml',
    group: 'world-news',
  },
  {
    name: 'Euronews',
    website_url: 'https://www.euronews.com',
    rss_url: 'https://www.euronews.com/rss?level=theme&name=news',
    group: 'world-news',
  },
  {
    name: 'Le Monde',
    website_url: 'https://www.lemonde.fr',
    rss_url: 'https://www.lemonde.fr/rss/une.xml',
    group: 'world-news',
  },
  {
    name: 'CBS News',
    website_url: 'https://www.cbsnews.com',
    rss_url: 'https://www.cbsnews.com/latest/rss/main',
    group: 'world-news',
  },
  {
    name: 'NBC News',
    website_url: 'https://www.nbcnews.com',
    rss_url: 'https://feeds.nbcnews.com/nbcnews/public/news',
    group: 'world-news',
  },
  {
    name: 'Fox News — Latest',
    website_url: 'https://www.foxnews.com',
    rss_url: 'https://moxie.foxnews.com/google-publisher/latest.xml',
    group: 'world-news',
  },
  {
    name: 'The Washington Post — World',
    website_url: 'https://www.washingtonpost.com/world',
    rss_url: 'https://feeds.washingtonpost.com/rss/world',
    group: 'world-news',
  },
  {
    name: 'CNN — Top Stories',
    website_url: 'https://edition.cnn.com',
    rss_url: 'http://rss.cnn.com/rss/edition.rss',
    group: 'world-news',
  },
  {
    name: 'Deutsche Welle — Top',
    website_url: 'https://www.dw.com/en',
    rss_url: 'https://rss.dw.com/rdf/rss-en-all',
    group: 'world-news',
  },

  // ─────────────── Tech ───────────────
  {
    name: 'The Verge',
    website_url: 'https://www.theverge.com',
    rss_url: 'https://www.theverge.com/rss/index.xml',
    group: 'tech',
  },
  {
    name: 'Ars Technica',
    website_url: 'https://arstechnica.com',
    rss_url: 'https://feeds.arstechnica.com/arstechnica/index',
    group: 'tech',
  },
  {
    name: 'TechCrunch',
    website_url: 'https://techcrunch.com',
    rss_url: 'https://techcrunch.com/feed/',
    group: 'tech',
  },
  {
    name: 'Wired',
    website_url: 'https://www.wired.com',
    rss_url: 'https://www.wired.com/feed/rss',
    group: 'tech',
  },
  {
    name: 'MIT Technology Review',
    website_url: 'https://www.technologyreview.com',
    rss_url: 'https://www.technologyreview.com/feed',
    group: 'tech',
  },
  {
    name: 'Hacker News — Front page',
    website_url: 'https://news.ycombinator.com',
    rss_url: 'https://hnrss.org/frontpage',
    group: 'tech',
  },
  {
    name: 'Krebs on Security',
    website_url: 'https://krebsonsecurity.com',
    rss_url: 'https://krebsonsecurity.com/feed',
    group: 'tech',
  },
  {
    name: 'The Hacker News',
    website_url: 'https://thehackernews.com',
    rss_url: 'https://feeds.feedburner.com/TheHackersNews',
    group: 'tech',
  },

  // ─────────────── Israel · Telegram ───────────────
  {
    name: 'דניאל עמרם',
    website_url: 'https://t.me/danielamram3',
    rss_url: 'https://t.me/s/danielamram3',
    group: 'telegram',
  },
  {
    name: 'חדשות 100שטח',
    website_url: 'https://t.me/yediotnews25',
    rss_url: 'https://t.me/s/yediotnews25',
    group: 'telegram',
  },
  {
    name: 'אבו עלי אקספרס',
    website_url: 'https://t.me/abualiexpress',
    rss_url: 'https://t.me/s/abualiexpress',
    group: 'telegram',
  },
  {
    name: 'עמית סגל',
    website_url: 'https://t.me/amitsegal',
    rss_url: 'https://t.me/s/amitsegal',
    group: 'telegram',
  },
  {
    name: 'רם דיווחים',
    website_url: 'https://t.me/ramreports',
    rss_url: 'https://t.me/s/ramreports',
    group: 'telegram',
  },
  {
    name: '301 העולם הערבי',
    website_url: 'https://t.me/arabworld301news',
    rss_url: 'https://t.me/s/arabworld301news',
    group: 'telegram',
  },
  {
    name: 'ינון ניוז',
    website_url: 'https://t.me/yinonews',
    rss_url: 'https://t.me/s/yinonews',
    group: 'telegram',
  },
  {
    name: 'Israel News / דיווחים ראשוניים',
    website_url: 'https://t.me/firstreportsnews',
    rss_url: 'https://t.me/s/firstreportsnews',
    group: 'telegram',
  },
  {
    name: 'ישראל היום',
    website_url: 'https://t.me/israelhayomofficial',
    rss_url: 'https://t.me/s/israelhayomofficial',
    group: 'telegram',
  },
  {
    name: "N12 צ'אט הכתבים",
    website_url: 'https://t.me/N12chat',
    rss_url: 'https://t.me/s/N12chat',
    group: 'telegram',
  },
  {
    name: 'Israel Today',
    website_url: 'https://t.me/ILtoday',
    rss_url: 'https://t.me/s/ILtoday',
    group: 'telegram',
  },
  {
    name: 'כלכליסט',
    website_url: 'https://t.me/calcalist',
    rss_url: 'https://t.me/s/calcalist',
    group: 'telegram',
  },
  {
    name: 'המוקד',
    website_url: 'https://t.me/hamoked_il',
    rss_url: 'https://t.me/s/hamoked_il',
    group: 'telegram',
  },
  {
    name: 'אריאל כהנא',
    website_url: 'https://t.me/Ariel_Kahana',
    rss_url: 'https://t.me/s/Ariel_Kahana',
    group: 'telegram',
  },
  {
    name: 'גלובס',
    website_url: 'https://t.me/globesnews',
    rss_url: 'https://t.me/s/globesnews',
    group: 'telegram',
  },
  {
    name: 'חדשות 360',
    website_url: 'https://t.me/newsil360',
    rss_url: 'https://t.me/s/newsil360',
    group: 'telegram',
  },
  {
    name: 'הזירה הפוליטית',
    website_url: 'https://t.me/Political_arena',
    rss_url: 'https://t.me/s/Political_arena',
    group: 'telegram',
  },
  {
    name: 'חדשות 8200',
    website_url: 'https://t.me/New_security8200',
    rss_url: 'https://t.me/s/New_security8200',
    group: 'telegram',
  },
  {
    name: 'צאפ מגזין / חדשות ישראל',
    website_url: 'https://t.me/tzap1',
    rss_url: 'https://t.me/s/tzap1',
    group: 'telegram',
  },
  {
    name: 'זירת המלחמה / War Room',
    website_url: 'https://t.me/ziratwar',
    rss_url: 'https://t.me/s/ziratwar',
    group: 'telegram',
  },
  {
    name: 'חדשות N12',
    website_url: 'https://t.me/N12_News',
    rss_url: 'https://t.me/s/N12_News',
    group: 'telegram',
  },
  {
    name: 'מיכאל שמש',
    website_url: 'https://t.me/MichaelShemesh',
    rss_url: 'https://t.me/s/MichaelShemesh',
    group: 'telegram',
  },
  {
    name: 'סולימאן & בלומנטל — כאן חדשות',
    website_url: 'https://t.me/SuliandItay',
    rss_url: 'https://t.me/s/SuliandItay',
    group: 'telegram',
  },
  {
    name: 'חשופים',
    website_url: 'https://t.me/haskupim',
    rss_url: 'https://t.me/s/haskupim',
    group: 'telegram',
  },
  {
    name: 'עכשיו 14',
    website_url: 'https://t.me/Now14_Israel',
    rss_url: 'https://t.me/s/Now14_Israel',
    group: 'telegram',
  },
];

export const SOURCE_GROUP_LABELS: Record<SourcePreset['group'], string> = {
  'israel-hebrew': 'ישראל · עברית',
  'israel-english': 'Israel · English',
  telegram: 'Telegram · ישראל',
  'world-news': 'World news',
  tech: 'Tech',
};

/**
 * Topic descriptions include bilingual keywords so the keyword matcher can
 * identify Hebrew AND English articles about the same subject.
 */
export const TOPIC_PRESETS: TopicPreset[] = [
  {
    name: 'AI',
    description:
      'AI, artificial intelligence, LLM, ChatGPT, Claude, Gemini, agents, machine learning, neural, OpenAI, Anthropic, DeepMind, בינה מלאכותית, מודל שפה',
  },
  {
    name: 'Software Development',
    description:
      'programming, developer, software, framework, JavaScript, TypeScript, Python, code, GitHub, open source, פיתוח, תוכנה, מתכנת, קוד',
  },
  {
    name: 'Cybersecurity',
    description:
      'security, cyber, vulnerability, breach, hack, ransomware, phishing, malware, CVE, exploit, סייבר, האקר, פריצה, אבטחת מידע',
  },
  {
    name: 'Israel',
    description:
      'Israel, IDF, Knesset, Jerusalem, Tel Aviv, Netanyahu, ישראל, ירושלים, תל אביב, צה"ל, כנסת, ממשלה, נתניהו',
  },
  {
    name: 'Middle East',
    description:
      'Middle East, Iran, Gaza, Hamas, Hezbollah, Lebanon, Syria, Palestinian, איראן, עזה, חמאס, חזבאללה, לבנון, סוריה, פלסטין',
  },
  {
    name: 'Politics',
    description:
      'politics, government, election, coalition, opposition, minister, פוליטיקה, ממשלה, בחירות, קואליציה, אופוזיציה, שר, ראש הממשלה',
  },
  {
    name: 'Economy & Finance',
    description:
      'economy, market, stocks, inflation, interest rates, GDP, banks, finance, כלכלה, בורסה, מניות, אינפלציה, ריבית, בנק, פיננסים',
  },
  {
    name: 'Sports',
    description:
      'sports, football, soccer, basketball, NBA, NFL, Premier League, Champions League, ספורט, כדורגל, כדורסל, מכבי, הפועל, ליגה',
  },
  {
    name: 'Health & Medicine',
    description:
      'health, medicine, hospital, doctor, disease, vaccine, drug, בריאות, רפואה, בית חולים, רופא, מחלה, חיסון, תרופה',
  },
  {
    name: 'Science',
    description:
      'science, research, study, physics, biology, chemistry, space, astronomy, מדע, מחקר, פיזיקה, ביולוגיה, כימיה, חלל',
  },
  {
    name: 'Climate & Environment',
    description:
      'climate, environment, global warming, emissions, renewable, sustainability, אקלים, סביבה, התחממות, פליטות, מתחדשת, קיימות',
  },
  {
    name: 'Startups & Venture',
    description:
      'startup, funding, venture capital, IPO, unicorn, raise, סטארטאפ, גיוס, הון סיכון, הנפקה, יזמות',
  },
  {
    name: 'Ultra-Orthodox / Jewish',
    description:
      'Haredi, ultra-orthodox, yeshiva, rabbi, Torah, Talmud, Jewish community, חרדים, ישיבה, רב, תורה, גמרא, שבת, בית כנסת, חסידות',
  },
  {
    name: 'Culture & Entertainment',
    description:
      'culture, music, movie, film, TV, art, book, celebrity, תרבות, מוזיקה, סרט, טלוויזיה, אמנות, ספר, אירוויזיון',
  },
  {
    name: 'Education',
    description:
      'education, university, school, students, academic, חינוך, אוניברסיטה, בית ספר, תלמידים, סטודנטים, פרופסור, מרצה',
  },
];
