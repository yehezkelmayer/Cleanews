import type { ArticleContent, Topic, TopicMatch } from './types';

export interface TopicMatcher {
  match(article: ArticleContent, topics: Topic[]): Promise<TopicMatch[]>;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'in',
  'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'this', 'that', 'these', 'those', 'it', 'its', 'his', 'her', 'their',
  'they', 'them', 'we', 'our', 'you', 'your', 'i', 'me', 'my',
  'about', 'not', 'no', 'so', 'than', 'also', 'up', 'down', 'out',
]);

function tokenize(input: string): string[] {
  return (input || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function tokenSet(input: string): Set<string> {
  return new Set(tokenize(input));
}

/**
 * Simple keyword/token-overlap matcher.
 *
 * For each topic we build a token set from its name+description. We then look
 * at how many of those tokens appear in the article (title x3, description x2,
 * body x1), normalized by topic token count. Also gives a bonus when the topic
 * name (as a full phrase) appears anywhere in the article.
 */
export class KeywordTopicMatcher implements TopicMatcher {
  async match(article: ArticleContent, topics: Topic[]): Promise<TopicMatch[]> {
    const titleTokens = tokenize(article.title);
    const descTokens = tokenize(article.description ?? '');
    const bodyTokens = tokenize(article.text ?? '');
    const bodyTokenSet = new Set(bodyTokens);
    const descTokenSet = new Set(descTokens);
    const titleTokenSet = new Set(titleTokens);
    const haystack =
      ` ${article.title} ${article.description ?? ''} ${article.text ?? ''} `.toLowerCase();

    const results: TopicMatch[] = [];

    for (const topic of topics) {
      const topicTokens = tokenSet(`${topic.name} ${topic.description}`);
      if (topicTokens.size === 0) continue;

      let weighted = 0;
      let matched = 0;
      let titleHits = 0;
      for (const tok of topicTokens) {
        let hit = 0;
        if (titleTokenSet.has(tok)) {
          hit += 3;
          titleHits += 1;
        } else if (descTokenSet.has(tok)) {
          hit += 2;
        } else if (bodyTokenSet.has(tok)) {
          hit += 1;
        }
        if (hit > 0) matched += 1;
        weighted += hit;
      }

      const coverage = matched / topicTokens.size;
      const strength = matched > 0 ? weighted / (matched * 3) : 0;
      let score = 0.5 * coverage + 0.5 * strength;

      // Title-hit bonus: matches in the headline are a strong editorial signal.
      if (titleHits > 0) score += Math.min(0.25, 0.15 + 0.05 * (titleHits - 1));

      // Phrase bonus: full topic name appears as a phrase in the article.
      const phrase = topic.name.toLowerCase().trim();
      if (phrase.length > 2 && haystack.includes(` ${phrase} `)) {
        score += 0.2;
      }

      score = Math.min(1, Math.max(0, score));
      if (score > 0) {
        results.push({ topicId: topic.id, score: Number(score.toFixed(3)) });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }
}

export const DEFAULT_MATCH_THRESHOLD = Number(process.env.TOPIC_MATCH_THRESHOLD ?? 0.3);
export const defaultMatcher: TopicMatcher = new KeywordTopicMatcher();
