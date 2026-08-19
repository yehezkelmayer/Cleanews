export type FeedSource = {
  id: number;
  rss_url: string;
  website_url: string;
  canonical_name: string;
  last_fetched_at: string | null;
  fetch_failure_count: number;
  last_error: string | null;
  enabled_globally: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSource = {
  session_id: string;
  feed_source_id: number;
  enabled: boolean;
  display_name: string | null;
  created_at: string;
};

/** Row returned when we join user_sources ↔ feed_sources for a page render. */
export type UserSourceRow = {
  feed_source_id: number;
  session_id: string;
  enabled: boolean;
  display_name: string | null;
  rss_url: string;
  website_url: string;
  canonical_name: string;
};

export type UserTopic = {
  id: number;
  session_id: string;
  name: string;
  description: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: number;
  feed_source_id: number;
  title: string;
  url: string;
  canonical_url: string | null;
  published_at: string | null;
  description: string | null;
  clean_text: string | null;
  clean_html: string | null;
  content_hash: string | null;
  created_at: string;
};

export type UserSettings = {
  session_id: string;
  only_matching_topics: boolean;
  sort_mode: 'newest' | 'relevance';
  max_article_age_hours: number;
  onboarded_at: string | null;
  updated_at: string;
};

export type ArticleContent = {
  title: string;
  description?: string;
  text: string;
};

export type TopicMatch = {
  topicId: number;
  score: number;
};

export type FeedItem = Article & {
  source_name: string;
  website_url: string;
  topics: { id: number; name: string; score: number }[];
  best_score: number;
};
