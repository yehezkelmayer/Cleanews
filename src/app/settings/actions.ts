'use server';

import { revalidatePath } from 'next/cache';
import { repo } from '@/lib/repo';
import { sourceInput, topicInput, settingsInput } from '@/lib/validation';
import { SOURCE_PRESETS, TOPIC_PRESETS } from '@/lib/presets';
import { runIngestion, type IngestSummary } from '@/lib/ingest';
import { getSessionId } from '@/lib/session';

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
    const sessionId = await getSessionId();
    // Scope this manual pull to the user's own subscriptions so the
    // summary/errors only reflect their sources — global sources they
    // never chose stay in the cron's lane.
    const summary = await runIngestion({ sessionId });
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

// ─────────────────────── Sources (per-user via feed_sources) ───────────────────────

export async function createSourceAction(formData: FormData) {
  const sessionId = await getSessionId();
  const parsed = sourceInput.parse({
    name: formData.get('name'),
    website_url: formData.get('website_url'),
    rss_url: formData.get('rss_url'),
    enabled: formData.get('enabled') === 'on',
  });
  const fs = await repo.feedSourceUpsert({
    rss_url: parsed.rss_url,
    website_url: parsed.website_url,
    canonical_name: parsed.name,
  });
  await repo.userSourceAdd(sessionId, fs.id, { enabled: parsed.enabled });
  revalidatePath('/settings');
}

export async function deleteSourceAction(formData: FormData) {
  const sessionId = await getSessionId();
  const feedSourceId = parseInt10(formData.get('id'));
  await repo.userSourceRemove(sessionId, feedSourceId);
  revalidatePath('/settings');
  revalidatePath('/');
}

export async function setSourceEnabledAction(formData: FormData) {
  const sessionId = await getSessionId();
  const feedSourceId = parseInt10(formData.get('id'));
  const enabled = String(formData.get('enabled')) === 'true';
  await repo.userSourceSetEnabled(sessionId, feedSourceId, enabled);
  revalidatePath('/settings');
  revalidatePath('/');
}

export async function addSourcePresetsAction(formData: FormData) {
  const sessionId = await getSessionId();
  const selected = new Set(formData.getAll('preset_rss').map(String));
  if (selected.size === 0) return;
  for (const preset of SOURCE_PRESETS) {
    if (!selected.has(preset.rss_url)) continue;
    const fs = await repo.feedSourceUpsert({
      rss_url: preset.rss_url,
      website_url: preset.website_url,
      canonical_name: preset.name,
    });
    await repo.userSourceAdd(sessionId, fs.id, { enabled: true });
  }
  revalidatePath('/settings');
}

export async function addTelegramChannelAction(formData: FormData) {
  const sessionId = await getSessionId();
  const raw = String(formData.get('handle') ?? '').trim();
  if (!raw) return;

  const handle = raw
    .replace(/^https?:\/\/(?:t\.me|telegram\.me)\/(?:s\/)?/i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .trim();
  if (!/^[A-Za-z0-9_]{3,64}$/.test(handle)) {
    throw new Error('Invalid Telegram channel handle');
  }

  const displayName = String(formData.get('name') ?? '').trim() || `Telegram · @${handle}`;
  const fs = await repo.feedSourceUpsert({
    rss_url: `https://t.me/s/${handle}`,
    website_url: `https://t.me/${handle}`,
    canonical_name: displayName,
  });
  await repo.userSourceAdd(sessionId, fs.id, { enabled: true, displayName });
  revalidatePath('/settings');
}

// ─────────────────────── Topics (per-user) ───────────────────────

export async function createTopicAction(formData: FormData) {
  const sessionId = await getSessionId();
  const parsed = topicInput.parse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    enabled: formData.get('enabled') === 'on',
  });
  await repo.userTopicCreate(sessionId, parsed);
  revalidatePath('/settings');
  revalidatePath('/');
}

export async function updateTopicAction(formData: FormData) {
  const sessionId = await getSessionId();
  const id = parseInt10(formData.get('id'));
  const parsed = topicInput.parse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    enabled: formData.get('enabled') === 'on',
  });
  await repo.userTopicUpdate(sessionId, id, parsed);
  revalidatePath('/settings');
  revalidatePath('/');
}

export async function deleteTopicAction(formData: FormData) {
  const sessionId = await getSessionId();
  const id = parseInt10(formData.get('id'));
  await repo.userTopicDelete(sessionId, id);
  revalidatePath('/settings');
  revalidatePath('/');
}

export async function setTopicEnabledAction(formData: FormData) {
  const sessionId = await getSessionId();
  const id = parseInt10(formData.get('id'));
  const enabled = String(formData.get('enabled')) === 'true';
  await repo.userTopicSetEnabled(sessionId, id, enabled);
  revalidatePath('/settings');
  revalidatePath('/');
}

export async function addTopicPresetsAction(formData: FormData) {
  const sessionId = await getSessionId();
  const selected = new Set(formData.getAll('preset_topic').map(String));
  if (selected.size === 0) return;
  for (const preset of TOPIC_PRESETS) {
    if (!selected.has(preset.name)) continue;
    await repo.userTopicCreate(sessionId, {
      name: preset.name,
      description: preset.description,
      enabled: true,
    });
  }
  revalidatePath('/settings');
  revalidatePath('/');
}

// ─────────────────────── Feed preferences (per-user) ───────────────────────

export async function setFeedPreferenceAction(formData: FormData) {
  const sessionId = await getSessionId();
  const patch: {
    only_matching_topics?: boolean;
    sort_mode?: 'newest' | 'relevance';
    max_article_age_hours?: number;
  } = {};
  if (formData.has('only_matching_topics')) {
    patch.only_matching_topics = String(formData.get('only_matching_topics')) === 'true';
  }
  if (formData.has('sort_mode')) {
    const v = String(formData.get('sort_mode'));
    if (v === 'newest' || v === 'relevance') patch.sort_mode = v;
  }
  if (formData.has('max_article_age_hours')) {
    const n = parseInt(String(formData.get('max_article_age_hours')), 10);
    if (Number.isFinite(n) && n > 0) patch.max_article_age_hours = n;
  }
  if (Object.keys(patch).length === 0) return;
  await repo.userSettingsUpdate(sessionId, patch);
  revalidatePath('/');
  revalidatePath('/settings');
}

export async function updateSettingsAction(formData: FormData) {
  const sessionId = await getSessionId();
  const parsed = settingsInput.parse({
    only_matching_topics: formData.get('only_matching_topics') === 'on',
    sort_mode: (formData.get('sort_mode') ?? 'newest') as 'newest' | 'relevance',
    max_article_age_hours: parseInt10(formData.get('max_article_age_hours')),
  });
  await repo.userSettingsUpdate(sessionId, parsed);
  revalidatePath('/');
  revalidatePath('/settings');
}

// Legacy compat exports (unused by new UI, kept until refactor sweeps pages)
export async function toggleSourceAction(formData: FormData) {
  return setSourceEnabledAction(formData);
}
export async function toggleTopicAction(formData: FormData) {
  return setTopicEnabledAction(formData);
}

/** Wipe onboarded_at + redirect to the welcome step. */
export async function restartWizardAction() {
  const sessionId = await getSessionId();
  await repo.resetOnboarded(sessionId);
  revalidatePath('/');
  revalidatePath('/settings');
  const { redirect } = await import('next/navigation');
  redirect('/onboarding');
}
