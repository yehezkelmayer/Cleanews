export type Source = {
  id: number;
  name: string;
  website_url: string;
  rss_url: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: number;
  source_id: number;
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

export type Settings = {
  id: number;
  only_matching_topics: boolean;
  sort_mode: 'newest' | 'relevance';
  max_article_age_hours: number;
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
  topics: { id: number; name: string; score: number }[];
  best_score: number;
};
