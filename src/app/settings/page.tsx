import { repo } from '@/lib/repo';
import { SOURCE_PRESETS, SOURCE_GROUP_LABELS, TOPIC_PRESETS } from '@/lib/presets';
import {
  addSourcePresetsAction,
  addTopicPresetsAction,
  createSourceAction,
  createTopicAction,
  deleteSourceAction,
  deleteTopicAction,
  toggleSourceAction,
  toggleTopicAction,
  updateSettingsAction,
  updateSourceAction,
  updateTopicAction,
} from './actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [sources, topics, settings] = await Promise.all([
    repo.listSources(),
    repo.listTopics(),
    repo.getSettings(),
  ]);

  const sourceTopicMap = new Map<number, number[]>();
  for (const s of sources) {
    sourceTopicMap.set(s.id, await repo.getSourceTopicIds(s.id));
  }

  const existingRssUrls = new Set(sources.map((s) => s.rss_url));
  const existingTopicNames = new Set(topics.map((t) => t.name.toLowerCase()));

  const groupedSourcePresets = (['israel-hebrew', 'israel-english', 'world-news', 'tech'] as const).map(
    (group) => ({
      group,
      label: SOURCE_GROUP_LABELS[group],
      items: SOURCE_PRESETS.filter((p) => p.group === group && !existingRssUrls.has(p.rss_url)),
    }),
  );
  const availableTopicPresets = TOPIC_PRESETS.filter(
    (p) => !existingTopicNames.has(p.name.toLowerCase()),
  );

  return (
    <div className="font-sans space-y-12">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* ─────────── News Sources ─────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-app pb-1">News Sources</h2>

        {groupedSourcePresets.some((g) => g.items.length > 0) && (
          <details className="border border-app rounded p-3" open>
            <summary className="cursor-pointer text-sm font-semibold">
              Quick add from catalog ({groupedSourcePresets.reduce((n, g) => n + g.items.length, 0)} available)
            </summary>
            <form action={addSourcePresetsAction} className="mt-3 space-y-4 text-sm">
              {groupedSourcePresets.map(
                (g) =>
                  g.items.length > 0 && (
                    <fieldset key={g.group} className="border border-app rounded p-2">
                      <legend className="px-1 muted text-xs">{g.label}</legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        {g.items.map((preset) => (
                          <label key={preset.rss_url} className="flex items-start gap-2 text-xs">
                            <input
                              type="checkbox"
                              name="preset_rss"
                              value={preset.rss_url}
                              className="mt-1"
                            />
                            <span>
                              <span className="font-semibold">{preset.name}</span>
                              <span className="muted"> — {new URL(preset.website_url).hostname}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ),
              )}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-3 py-1 border border-app rounded hover:underline"
                >
                  Add selected sources
                </button>
                <span className="muted text-xs">
                  Added sources are enabled by default. If an RSS URL fetch fails, disable or edit it below.
                </span>
              </div>
            </form>
          </details>
        )}

        <ul className="space-y-3">
          {sources.length === 0 && <li className="muted text-sm">No sources yet.</li>}
          {sources.map((s) => (
            <li key={s.id} className="border border-app rounded p-3 space-y-2">
              <form action={updateSourceAction} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <input type="hidden" name="id" value={s.id} />
                <label className="flex flex-col">
                  Name
                  <input
                    name="name"
                    defaultValue={s.name}
                    required
                    className="border border-app rounded px-2 py-1 bg-transparent"
                  />
                </label>
                <label className="flex flex-col">
                  Website URL
                  <input
                    name="website_url"
                    defaultValue={s.website_url}
                    required
                    className="border border-app rounded px-2 py-1 bg-transparent"
                  />
                </label>
                <label className="flex flex-col md:col-span-2">
                  RSS URL
                  <input
                    name="rss_url"
                    defaultValue={s.rss_url}
                    required
                    className="border border-app rounded px-2 py-1 bg-transparent"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="enabled" defaultChecked={s.enabled} />
                  Enabled
                </label>

                <fieldset className="md:col-span-2 border border-app rounded p-2">
                  <legend className="px-1 muted text-xs">Topics for this source (optional)</legend>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {topics.length === 0 && (
                      <span className="muted text-xs">Create topics first to link them here.</span>
                    )}
                    {topics.map((t) => {
                      const selected = (sourceTopicMap.get(s.id) ?? []).includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            name="topic_ids"
                            value={t.id}
                            defaultChecked={selected}
                          />
                          {t.name}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="md:col-span-2 flex gap-2">
                  <button className="px-3 py-1 border border-app rounded hover:underline" type="submit">
                    Save
                  </button>
                </div>
              </form>

              <div className="flex gap-2">
                <form action={toggleSourceAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="enabled" value={String(s.enabled)} />
                  <button className="text-xs muted hover:underline" type="submit">
                    {s.enabled ? 'Disable' : 'Enable'}
                  </button>
                </form>
                <form action={deleteSourceAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-xs muted hover:underline" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <details className="border border-app rounded p-3">
          <summary className="cursor-pointer text-sm font-semibold">Add Source</summary>
          <form action={createSourceAction} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-3">
            <label className="flex flex-col">
              Name
              <input name="name" required className="border border-app rounded px-2 py-1 bg-transparent" />
            </label>
            <label className="flex flex-col">
              Website URL
              <input name="website_url" required placeholder="https://example.com"
                className="border border-app rounded px-2 py-1 bg-transparent" />
            </label>
            <label className="flex flex-col md:col-span-2">
              RSS URL
              <input name="rss_url" required placeholder="https://example.com/rss"
                className="border border-app rounded px-2 py-1 bg-transparent" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="enabled" defaultChecked />
              Enabled
            </label>
            <div className="md:col-span-2">
              <button className="px-3 py-1 border border-app rounded hover:underline" type="submit">
                Add
              </button>
            </div>
          </form>
        </details>
      </section>

      {/* ─────────── Topics ─────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-app pb-1">Topics</h2>

        {availableTopicPresets.length > 0 && (
          <details className="border border-app rounded p-3" open>
            <summary className="cursor-pointer text-sm font-semibold">
              Quick add from catalog ({availableTopicPresets.length} available)
            </summary>
            <form action={addTopicPresetsAction} className="mt-3 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {availableTopicPresets.map((preset) => (
                  <label key={preset.name} className="flex items-start gap-2 text-xs">
                    <input type="checkbox" name="preset_topic" value={preset.name} className="mt-1" />
                    <span>
                      <span className="font-semibold">{preset.name}</span>
                      <span className="muted"> — {preset.description.slice(0, 90)}…</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="px-3 py-1 border border-app rounded hover:underline">
                  Add selected topics
                </button>
                <span className="muted text-xs">
                  Descriptions include Hebrew + English keywords used by the matcher.
                </span>
              </div>
            </form>
          </details>
        )}

        <ul className="space-y-3">
          {topics.length === 0 && <li className="muted text-sm">No topics yet.</li>}
          {topics.map((t) => (
            <li key={t.id} className="border border-app rounded p-3 space-y-2">
              <form action={updateTopicAction} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <input type="hidden" name="id" value={t.id} />
                <label className="flex flex-col">
                  Name
                  <input name="name" defaultValue={t.name} required
                    className="border border-app rounded px-2 py-1 bg-transparent" />
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="enabled" defaultChecked={t.enabled} />
                  Enabled
                </label>
                <label className="flex flex-col md:col-span-2">
                  Description (keywords used for matching)
                  <textarea name="description" defaultValue={t.description} rows={2}
                    className="border border-app rounded px-2 py-1 bg-transparent" />
                </label>
                <div className="md:col-span-2 flex gap-2">
                  <button className="px-3 py-1 border border-app rounded hover:underline" type="submit">
                    Save
                  </button>
                </div>
              </form>

              <div className="flex gap-2">
                <form action={toggleTopicAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="enabled" value={String(t.enabled)} />
                  <button className="text-xs muted hover:underline" type="submit">
                    {t.enabled ? 'Disable' : 'Enable'}
                  </button>
                </form>
                <form action={deleteTopicAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="text-xs muted hover:underline" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <details className="border border-app rounded p-3">
          <summary className="cursor-pointer text-sm font-semibold">Add Topic</summary>
          <form action={createTopicAction} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-3">
            <label className="flex flex-col">
              Name
              <input name="name" required className="border border-app rounded px-2 py-1 bg-transparent" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="enabled" defaultChecked />
              Enabled
            </label>
            <label className="flex flex-col md:col-span-2">
              Description
              <textarea name="description" rows={2}
                className="border border-app rounded px-2 py-1 bg-transparent" />
            </label>
            <div className="md:col-span-2">
              <button className="px-3 py-1 border border-app rounded hover:underline" type="submit">
                Add
              </button>
            </div>
          </form>
        </details>
      </section>

      {/* ─────────── Feed Preferences ─────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-app pb-1">Feed Preferences</h2>
        <form action={updateSettingsAction} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="only_matching_topics"
              defaultChecked={settings.only_matching_topics}
            />
            Only show matching topics
          </label>
          <label className="flex flex-col">
            Sort
            <select
              name="sort_mode"
              defaultValue={settings.sort_mode}
              className="border border-app rounded px-2 py-1 bg-transparent"
            >
              <option value="newest">Newest</option>
              <option value="relevance">Relevance</option>
            </select>
          </label>
          <label className="flex flex-col">
            Maximum article age
            <select
              name="max_article_age_hours"
              defaultValue={settings.max_article_age_hours}
              className="border border-app rounded px-2 py-1 bg-transparent"
            >
              <option value={24}>24 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <button className="px-3 py-1 border border-app rounded hover:underline" type="submit">
              Save preferences
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
