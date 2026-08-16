'use server';

import { revalidatePath } from 'next/cache';
import { repo } from '@/lib/repo';
import { sourceInput, topicInput, settingsInput } from '@/lib/validation';
import { SOURCE_PRESETS, TOPIC_PRESETS } from '@/lib/presets';
import { runIngestion, type IngestSummary } from '@/lib/ingest';

export type IngestActionState = {
  status: 'idle' | 'ok' | 'error';
  summary?: IngestSummary;
  message?: string;
  ranAt?: string;
};

export async function runIngestionNowAction(
  _prev: IngestActionState,
  _formData: FormData,
): Promise<IngestActionState> {
  try {
    const summary = await runIngestion();
    revalidatePath('/');
    revalidatePath('/settings');
    return { status: 'ok', summary, ranAt: new Date().toISOString() };
  } catch (err) {
    return {
      status: 'error',
      message: (err as Error).message,
      ranAt: new Date().toISOString(),
    };
  }
}

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

export async function addTelegramChannelAction(formData: FormData) {
  const raw = String(formData.get('handle') ?? '').trim();
  if (!raw) return;

  // Accept "@amitsegal", "amitsegal", "https://t.me/amitsegal", "t.me/amitsegal".
  const handle = raw
    .replace(/^https?:\/\/(?:t\.me|telegram\.me)\/(?:s\/)?/i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .trim();
  if (!/^[A-Za-z0-9_]{3,64}$/.test(handle)) {
    throw new Error('Invalid Telegram channel handle');
  }

  const displayName =
    String(formData.get('name') ?? '').trim() || `Telegram · @${handle}`;

  const rssUrl = `https://rsshub.app/telegram/channel/${handle}`;
  const websiteUrl = `https://t.me/${handle}`;

  const existing = await repo.listSources();
  if (existing.some((s) => s.rss_url === rssUrl)) return;

  await repo.createSource({
    name: displayName,
    website_url: websiteUrl,
    rss_url: rssUrl,
    enabled: true,
  });
  revalidatePath('/settings');
}

export async function addSourcePresetsAction(formData: FormData) {
  const selected = new Set(formData.getAll('preset_rss').map(String));
  if (selected.size === 0) return;
  const existing = await repo.listSources();
  const existingUrls = new Set(existing.map((s) => s.rss_url));
  for (const preset of SOURCE_PRESETS) {
    if (!selected.has(preset.rss_url)) continue;
    if (existingUrls.has(preset.rss_url)) continue;
    await repo.createSource({
      name: preset.name,
      website_url: preset.website_url,
      rss_url: preset.rss_url,
      enabled: true,
    });
  }
  revalidatePath('/settings');
}

export async function addTopicPresetsAction(formData: FormData) {
  const selected = new Set(formData.getAll('preset_topic').map(String));
  if (selected.size === 0) return;
  const existing = await repo.listTopics();
  const existingNames = new Set(existing.map((t) => t.name.toLowerCase()));
  for (const preset of TOPIC_PRESETS) {
    if (!selected.has(preset.name)) continue;
    if (existingNames.has(preset.name.toLowerCase())) continue;
    await repo.createTopic({
      name: preset.name,
      description: preset.description,
      enabled: true,
    });
  }
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
