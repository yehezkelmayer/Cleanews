'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { repo } from '@/lib/repo';
import { SOURCE_PRESETS, TOPIC_PRESETS } from '@/lib/presets';
import { getSessionId } from '@/lib/session';

/** Step 1: add selected source presets, then advance to step 2. */
export async function submitStep1Action(formData: FormData) {
  const sessionId = await getSessionId();
  const selected = new Set(formData.getAll('preset_rss').map(String));
  for (const preset of SOURCE_PRESETS) {
    if (!selected.has(preset.rss_url)) continue;
    const fs = await repo.feedSourceUpsert({
      rss_url: preset.rss_url,
      website_url: preset.website_url,
      canonical_name: preset.name,
    });
    await repo.userSourceAdd(sessionId, fs.id, { enabled: true });
  }
  redirect('/onboarding?step=2');
}

/** Step 2: add selected topic presets, then advance to step 3. */
export async function submitStep2Action(formData: FormData) {
  const sessionId = await getSessionId();
  const selected = new Set(formData.getAll('preset_topic').map(String));
  for (const preset of TOPIC_PRESETS) {
    if (!selected.has(preset.name)) continue;
    await repo.userTopicCreate(sessionId, {
      name: preset.name,
      description: preset.description,
      enabled: true,
    });
  }
  redirect('/onboarding?step=3');
}

/** Step 3: save prefs, mark onboarded, land on feed. */
export async function submitStep3Action(formData: FormData) {
  const sessionId = await getSessionId();
  const onlyRaw = String(formData.get('only_matching_topics') ?? 'true');
  const sortRaw = String(formData.get('sort_mode') ?? 'newest');
  const ageRaw = parseInt(String(formData.get('max_article_age_hours') ?? '72'), 10);

  await repo.userSettingsUpdate(sessionId, {
    only_matching_topics: onlyRaw === 'true',
    sort_mode: sortRaw === 'relevance' ? 'relevance' : 'newest',
    max_article_age_hours: Number.isFinite(ageRaw) && ageRaw > 0 ? ageRaw : 72,
  });
  await repo.markOnboarded(sessionId);
  revalidatePath('/');
  redirect('/?welcome=1');
}

/** Skip the whole wizard (mark onboarded with no data). */
export async function skipWizardAction() {
  const sessionId = await getSessionId();
  await repo.markOnboarded(sessionId);
  revalidatePath('/');
  redirect('/');
}
