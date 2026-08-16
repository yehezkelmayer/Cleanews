import { describe, it, expect } from 'vitest';
import { KeywordTopicMatcher } from '../src/lib/matcher';
import type { Topic } from '../src/lib/types';

function topic(id: number, name: string, description: string): Topic {
  return {
    id,
    name,
    description,
    enabled: true,
    created_at: '',
    updated_at: '',
  };
}

describe('KeywordTopicMatcher', () => {
  const matcher = new KeywordTopicMatcher();
  const topics = [
    topic(1, 'Artificial Intelligence', 'AI, LLMs, machine learning, AI agents, neural networks'),
    topic(2, 'Software Development', 'programming, developer tools, frameworks, software engineering'),
    topic(3, 'Cybersecurity', 'security vulnerabilities, cyber attacks, breaches, security research'),
  ];

  it('scores AI + software high for an AI coding tools article', async () => {
    const res = await matcher.match(
      {
        title: 'OpenAI releases new AI agent coding system',
        description: 'A new set of developer tools for building agents',
        text: 'The company launched new programming tools and LLM-based agents for software engineering.',
      },
      topics,
    );
    const byId = Object.fromEntries(res.map((r) => [r.topicId, r.score]));
    expect(byId[1] ?? 0).toBeGreaterThan(0.3);
    expect(byId[2] ?? 0).toBeGreaterThan(0.3);
    expect(byId[3] ?? 0).toBeLessThan(0.3);
  });

  it('returns low or zero score for unrelated topics', async () => {
    const res = await matcher.match(
      {
        title: 'City opens new public park downtown',
        description: 'Residents welcome a green space near the river',
        text: 'The mayor cut the ribbon at a ceremony attended by local families.',
      },
      topics,
    );
    for (const r of res) expect(r.score).toBeLessThan(0.3);
  });
});
