'use server';

import { revalidatePath } from 'next/cache';
import { repo } from '@/lib/repo';
import { sourceInput, topicInput, settingsInput } from '@/lib/validation';

function parseInt10(v: FormDataEntryValue | null): number {
  const n = parseInt(String(v ?? ''), 10);
  if (!Number.isFinite(n)) throw new Error('Invalid id');
  return n;
}

export async function createSourceAction(formData: FormData) {
  const parsed = sourceInput.parse({
    name: formData.get('name'),
    website_url: formData.get('website_url'),
    rss_url: formData.get('rss_url'),
    enabled: formData.get('enabled') === 'on',
  });
  await repo.createSource(parsed);
  revalidatePath('/settings');
}

export async function updateSourceAction(formData: FormData) {
  const id = parseInt10(formData.get('id'));
  const parsed = sourceInput.parse({
    name: formData.get('name'),
    website_url: formData.get('website_url'),
    rss_url: formData.get('rss_url'),
    enabled: formData.get('enabled') === 'on',
  });
  await repo.updateSource(id, parsed);

  const topicIdsRaw = formData.getAll('topic_ids').map((v) => parseInt(String(v), 10));
  const topicIds = topicIdsRaw.filter((n) => Number.isFinite(n));
  await repo.setSourceTopics(id, topicIds);

  revalidatePath('/settings');
}

export async function deleteSourceAction(formData: FormData) {
  const id = parseInt10(formData.get('id'));
  await repo.deleteSource(id);
  revalidatePath('/settings');
}

export async function toggleSourceAction(formData: FormData) {
  const id = parseInt10(formData.get('id'));
  const enabled = formData.get('enabled') === 'true';
  await repo.updateSource(id, { enabled: !enabled });
  revalidatePath('/settings');
}

export async function createTopicAction(formData: FormData) {
  const parsed = topicInput.parse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    enabled: formData.get('enabled') === 'on',
  });
  await repo.createTopic(parsed);
  revalidatePath('/settings');
}

export async function updateTopicAction(formData: FormData) {
  const id = parseInt10(formData.get('id'));
  const parsed = topicInput.parse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    enabled: formData.get('enabled') === 'on',
  });
  await repo.updateTopic(id, parsed);
  revalidatePath('/settings');
}

export async function deleteTopicAction(formData: FormData) {
  const id = parseInt10(formData.get('id'));
  await repo.deleteTopic(id);
  revalidatePath('/settings');
}

export async function toggleTopicAction(formData: FormData) {
  const id = parseInt10(formData.get('id'));
  const enabled = formData.get('enabled') === 'true';
  await repo.updateTopic(id, { enabled: !enabled });
  revalidatePath('/settings');
}

export async function updateSettingsAction(formData: FormData) {
  const parsed = settingsInput.parse({
    only_matching_topics: formData.get('only_matching_topics') === 'on',
    sort_mode: (formData.get('sort_mode') ?? 'newest') as 'newest' | 'relevance',
    max_article_age_hours: parseInt10(formData.get('max_article_age_hours')),
  });
  await repo.updateSettings(parsed);
  revalidatePath('/');
  revalidatePath('/settings');
}
