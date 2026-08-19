import { repo } from '@/lib/repo';
import { getSessionId } from '@/lib/session';
import { SOURCE_PRESETS, TOPIC_PRESETS } from '@/lib/presets';
import { copy } from '@/lib/copy';
import { isTelegramSource } from '@/app/icons';
import { RunIngestionButton } from './RunIngestionButton';
import { CatalogPicker } from './CatalogPicker';
import { SegControl } from './SegControl';
import {
  addTelegramChannelAction,
  addTopicPresetsAction,
  createSourceAction,
  createTopicAction,
  deleteSourceAction,
  deleteTopicAction,
  restartWizardAction,
  setFeedPreferenceAction,
  setSourceEnabledAction,
  setTopicEnabledAction,
} from './actions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ENABLE_OPTS = [
  { value: 'true', label: copy.enableOn },
  { value: 'false', label: copy.enableOff },
];

export default async function SettingsPage() {
  const sessionId = await getSessionId();
  const [sources, topics, settings] = await Promise.all([
    repo.userSources(sessionId),
    repo.userTopics(sessionId),
    repo.userSettings(sessionId),
  ]);

  const existingRssUrls = new Set(sources.map((s) => s.rss_url));
  const existingTopicNames = new Set(topics.map((t) => t.name.toLowerCase()));
  const catalogAvailable = SOURCE_PRESETS.filter((p) => !existingRssUrls.has(p.rss_url));
  const availableTopicPresets = TOPIC_PRESETS.filter(
    (p) => !existingTopicNames.has(p.name.toLowerCase()),
  );

  return (
    <main className="shell-settings">
      <div>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>{copy.settingsTitle}</h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 14 }}>
          {copy.settingsSubtitle}
        </p>
      </div>

      {/* ─── Fetch news ─── */}
      <section className="settings-section">
        <h2>{copy.fetchSectionTitle}</h2>
        <p style={{ margin: '-4px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>
          {copy.fetchSectionBody}
        </p>
        <RunIngestionButton />
      </section>

      {/* ─── Sources ─── */}
      <section className="settings-section">
        <h2>{copy.sourcesSectionTitle}</h2>
        <p style={{ margin: '-4px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>
          {copy.sourcesSectionBody}
        </p>

        {sources.length > 0 && (
          <div className="list-scroll">
            {sources.map((s) => {
              const telegram = isTelegramSource(s.rss_url);
              let host = s.website_url;
              try { host = new URL(s.website_url).hostname; } catch { /* keep raw */ }
              const name = s.display_name ?? s.canonical_name;
              return (
                <div key={s.feed_source_id} className="list-row">
                  <div className="list-row-main">
                    <span className="list-row-name">
                      {name}
                      {telegram && (
                        <span className="tag tag-topic tag-topic-sm" style={{ marginInlineStart: 8 }}>
                          טלגרם
                        </span>
                      )}
                    </span>
                    <span className="list-row-sub">{host}</span>
                  </div>
                  <div className="list-row-actions">
                    <SegControl
                      name="enabled"
                      value={s.enabled ? 'true' : 'false'}
                      options={ENABLE_OPTS}
                      action={setSourceEnabledAction}
                      extra={{ id: String(s.feed_source_id) }}
                    />
                    <form action={deleteSourceAction}>
                      <input type="hidden" name="id" value={s.feed_source_id} />
                      <button type="submit" className="btn-danger-ghost">
                        מחיקה
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
            <div className="list-summary">
              <span>סה"כ {sources.length} מקורות</span>
              <span>{sources.filter((s) => s.enabled).length} מופעלים</span>
            </div>
          </div>
        )}

        <details className="details-card-violet">
          <summary>{copy.addFromCatalog}</summary>
          <div style={{ marginTop: 16 }}>
            {catalogAvailable.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)' }}>
                כל המקורות בקטלוג כבר נוספו.
              </p>
            ) : (
              <CatalogPicker presets={catalogAvailable} />
            )}
          </div>
        </details>

        <details className="details-card">
          <summary>{copy.addTelegramChannel}</summary>
          <form action={addTelegramChannelAction} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            <div className="field">
              <label>שם המשתמש בערוץ</label>
              <input name="handle" required className="input" placeholder="@amitsegal או t.me/amitsegal" />
            </div>
            <div className="field">
              <label>שם תצוגה (אופציונלי)</label>
              <input name="name" className="input" placeholder="עמית סגל" />
            </div>
            <div>
              <button type="submit" className="btn btn-tel">הוספת ערוץ</button>
            </div>
          </form>
        </details>

        <details className="details-card">
          <summary>{copy.addManualRss}</summary>
          <form action={createSourceAction} className="grid-2" style={{ marginTop: 16 }}>
            <div className="field">
              <label>שם</label>
              <input name="name" required className="input" placeholder="לדוגמה: כלכליסט" />
            </div>
            <div className="field">
              <label>אתר</label>
              <input name="website_url" required className="input" placeholder="https://example.co.il" />
            </div>
            <div className="field full-span">
              <label>כתובת RSS</label>
              <input name="rss_url" required className="input" placeholder="https://example.co.il/rss" />
            </div>
            <input type="hidden" name="enabled" value="on" />
            <div className="full-span">
              <button type="submit" className="btn btn-secondary">הוספה</button>
            </div>
          </form>
        </details>
      </section>

      {/* ─── Topics ─── */}
      <section className="settings-section">
        <h2>{copy.topicsSectionTitle}</h2>
        <p style={{ margin: '-4px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>
          {copy.topicsSectionBody}
        </p>

        {topics.length > 0 && (
          <div className="list-scroll">
            {topics.map((t) => (
              <div key={t.id} className="list-row">
                <div className="list-row-main">
                  <span className="list-row-name">{t.name}</span>
                  {t.description && (
                    <span className="list-row-sub" style={{ direction: 'rtl', textAlign: 'right' }}>
                      {t.description.length > 90 ? `${t.description.slice(0, 90)}…` : t.description}
                    </span>
                  )}
                </div>
                <div className="list-row-actions">
                  <SegControl
                    name="enabled"
                    value={t.enabled ? 'true' : 'false'}
                    options={ENABLE_OPTS}
                    action={setTopicEnabledAction}
                    extra={{ id: String(t.id) }}
                  />
                  <form action={deleteTopicAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="btn-danger-ghost">
                      מחיקה
                    </button>
                  </form>
                </div>
              </div>
            ))}
            <div className="list-summary">
              <span>סה"כ {topics.length} נושאים</span>
              <span>{topics.filter((t) => t.enabled).length} מופעלים</span>
            </div>
          </div>
        )}

        {availableTopicPresets.length > 0 && (
          <details className="details-card-violet">
            <summary>{copy.addTopicsFromCatalog}</summary>
            <form action={addTopicPresetsAction} style={{ marginTop: 16, display: 'grid', gap: 14 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '6px 20px',
                }}
              >
                {availableTopicPresets.map((p) => (
                  <label
                    key={p.name}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--ink-body-soft)' }}
                  >
                    <input
                      type="checkbox"
                      name="preset_topic"
                      value={p.name}
                      style={{ marginTop: 3, accentColor: 'var(--violet)' }}
                    />
                    <span>
                      <strong style={{ color: 'var(--ink)' }}>{p.name}</strong>{' '}
                      <span style={{ color: 'var(--ink-muted)' }}>— {p.description.slice(0, 80)}…</span>
                    </span>
                  </label>
                ))}
              </div>
              <div>
                <button type="submit" className="btn btn-primary">הוספת הנושאים המסומנים</button>
              </div>
            </form>
          </details>
        )}

        <details className="details-card">
          <summary>{copy.addCustomTopic}</summary>
          <form action={createTopicAction} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            <div className="field">
              <label>שם</label>
              <input name="name" required className="input" placeholder="לדוגמה: אנרגיה" />
            </div>
            <div className="field">
              <label>מילות מפתח להתאמה</label>
              <textarea name="description" rows={2} className="input" placeholder="מילים שיסמנו כתבות תואמות" />
            </div>
            <input type="hidden" name="enabled" value="on" />
            <div>
              <button type="submit" className="btn btn-secondary">הוספה</button>
            </div>
          </form>
        </details>
      </section>

      {/* ─── Feed preferences ─── */}
      <section className="settings-section">
        <h2>{copy.prefsSectionTitle}</h2>
        <p style={{ margin: '-4px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>
          {copy.prefsSectionBody}
        </p>

        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-placeholder)', marginBottom: 8 }}>
            גיל כתבה מרבי (ברירת מחדל)
          </div>
          <SegControl
            name="max_article_age_hours"
            value={String(settings.max_article_age_hours)}
            options={[
              { value: '24', label: '24 שעות' },
              { value: '72', label: '3 ימים' },
              { value: '168', label: '7 ימים' },
            ]}
            action={setFeedPreferenceAction}
          />
        </div>
      </section>

      {/* ─── Restart wizard ─── */}
      <section className="settings-section" style={{ opacity: 0.85 }}>
        <form action={restartWizardAction}>
          <button type="submit" className="btn btn-secondary">
            {copy.restartWizard}
          </button>
        </form>
      </section>
    </main>
  );
}
