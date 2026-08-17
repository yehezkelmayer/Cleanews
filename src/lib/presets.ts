/**
 * Curated preset catalogs of news sources and topics.
 * Last verified: 17-08-2026 (based on the owner's manual audit).
 *
 * If an RSS URL stops fetching, disable it in Settings; the ingestion
 * pipeline auto-disables globally after 10 consecutive failures.
 */

export type SourcePreset = {
  name: string;
  website_url: string;
  rss_url: string;
  group: 'israel-hebrew' | 'israel-english' | 'world-news' | 'tech' | 'telegram';
};

export type TopicPreset = {
  name: string;
  description: string;
};

/** Build a Telegram preset — the ingest pipeline recognises
 *  https://t.me/s/<handle> as a Telegram source and scrapes the
 *  public web preview instead of parsing RSS. */
const tg = (name: string, handle: string): SourcePreset => ({
  name,
  website_url: `https://t.me/${handle}`,
  rss_url: `https://t.me/s/${handle}`,
  group: 'telegram',
});

export const SOURCE_PRESETS: SourcePreset[] = [
  // ─────────────── Israel · Hebrew ───────────────
  {
    name: 'Ynet',
    website_url: 'https://www.ynet.co.il',
    rss_url: 'https://www.ynet.co.il/Integration/StoryRss2.xml',
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
    name: 'ישראל היום',
    website_url: 'https://www.israelhayom.co.il',
    rss_url: 'https://www.israelhayom.co.il/rss',
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

  // ─────────────── World news ───────────────
  {
    name: 'BBC News',
    website_url: 'https://www.bbc.com/news',
    rss_url: 'https://feeds.bbci.co.uk/news/rss.xml',
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
    name: 'Deutsche Welle',
    website_url: 'https://www.dw.com/en',
    rss_url: 'https://rss.dw.com/rdf/rss-en-all',
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
    name: 'NPR News',
    website_url: 'https://www.npr.org',
    rss_url: 'https://feeds.npr.org/1001/rss.xml',
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
    name: 'Al Jazeera',
    website_url: 'https://www.aljazeera.com',
    rss_url: 'https://www.aljazeera.com/xml/rss/all.xml',
    group: 'world-news',
  },

  // ─────────────── Tech ───────────────
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
    name: 'WIRED',
    website_url: 'https://www.wired.com',
    rss_url: 'https://www.wired.com/feed/rss',
    group: 'tech',
  },

  // ─────────────── Telegram ───────────────
  // 25 channels from the 17-08-2026 audit. Only public Telegram
  // channels work; if a channel goes private the scraper returns
  // nothing and it can be disabled in Settings.
  tg('דניאל עמרם', 'danielamram3'),
  tg('חדשות 100שטח', 'yediotnews25'),
  tg('אבו עלי אקספרס', 'abualiexpress'),
  tg('עמית סגל', 'amitsegal'),
  tg('רם דיווחים', 'ramreports'),
  tg('301 העולם הערבי', 'arabworld301news'),
  tg('ינון ניוז', 'yinonews'),
  tg('דיווחים ראשוניים', 'firstreportsnews'),
  tg('ישראל היום · טלגרם', 'israelhayomofficial'),
  tg("N12 — צ'אט הכתבים", 'N12chat'),
  tg('Israel Today', 'ILtoday'),
  tg('כלכליסט · טלגרם', 'calcalist'),
  tg('המוקד', 'hamoked_il'),
  tg('אריאל כהנא', 'Ariel_Kahana'),
  tg('גלובס · טלגרם', 'globesnews'),
  tg('חדשות 360', 'newsil360'),
  tg('הזירה הפוליטית', 'Political_arena'),
  tg('חדשות 8200', 'New_security8200'),
  tg('צאפ מגזין', 'tzap1'),
  tg('זירת המלחמה', 'ziratwar'),
  tg('חדשות N12', 'N12_News'),
  tg('מיכאל שמש', 'MichaelShemesh'),
  tg('סולימאן ובלומנטל — כאן חדשות', 'SuliandItay'),
  tg('חשופים', 'haskupim'),
  tg('עכשיו 14', 'Now14_Israel'),
];

export const SOURCE_GROUP_LABELS: Record<SourcePreset['group'], string> = {
  'israel-hebrew': 'ישראל · עברית',
  'israel-english': 'Israel · English',
  'world-news': 'World news',
  tech: 'Tech',
  telegram: 'טלגרם',
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
