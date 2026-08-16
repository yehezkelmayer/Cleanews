import { repo } from '@/lib/repo';
import { SOURCE_PRESETS, TOPIC_PRESETS } from '@/lib/presets';
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
  setFeedPreferenceAction,
  setSourceEnabledAction,
  setTopicEnabledAction,
  updateTopicAction,
} from './actions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ENABLE_OPTS = [
  { value: 'true', label: 'מופעל' },
  { value: 'false', label: 'מושבת' },
];

export default async function SettingsPage() {
  const [sources, topics, settings] = await Promise.all([
    repo.listSources(),
    repo.listTopics(),
    repo.getSettings(),
  ]);

  const existingRssUrls = new Set(sources.map((s) => s.rss_url));
  const existingTopicNames = new Set(topics.map((t) => t.name.toLowerCase()));

  const catalogAvailable = SOURCE_PRESETS.filter((p) => !existingRssUrls.has(p.rss_url));
  const availableTopicPresets = TOPIC_PRESETS.filter(
    (p) => !existingTopicNames.has(p.name.toLowerCase()),
  );

  return (
    <main className="shell-settings">
      <h1
        className="accent-strip"
        style={{ margin: 0 }}
      >
        הגדרות
      </h1>

      {/* ─── Fetch news ─── */}
      <section className="section">
        <h2>משיכת חדשות</h2>
        <div className="hr" style={{ margin: 0 }} />
        <RunIngestionButton />
      </section>

      {/* ─── Sources ─── */}
      <section className="section">
        <h2>מקורות חדשות</h2>
        <div className="hr" style={{ margin: 0 }} />

        {sources.map((s) => {
          const telegram = isTelegramSource(s.rss_url);
          return (
            <div key={s.id} className="card" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
              <div className="grid-2">
                <div className="field">
                  <label>שם</label>
                  <input className="input" value={s.name} readOnly />
                </div>
                <div className="field">
                  <label>אתר</label>
                  <input className="input" value={s.website_url} readOnly />
                </div>
                <div className="field full-span">
                  <label>כתובת RSS</label>
                  <input className="input" value={s.rss_url} readOnly />
                </div>
              </div>
              <div className="row-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {telegram && <span className="tag tag-outline">טלגרם</span>}
                  <SegControl
                    name="enabled"
                    value={s.enabled ? 'true' : 'false'}
                    options={ENABLE_OPTS}
                    action={setSourceEnabledAction}
                    extra={{ id: String(s.id) }}
                  />
                </div>
                <form action={deleteSourceAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn btn-ghost">
                    מחיקה
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        <details className="card" style={{ padding: 'var(--space-4)' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            הוספה מקטלוג מקורות
          </summary>
          <div style={{ marginTop: 'var(--space-3)' }}>
            {catalogAvailable.length === 0 ? (
              <div className="text-muted" style={{ fontSize: 13 }}>
                כל המקורות בקטלוג כבר נוספו.
              </div>
            ) : (
              <CatalogPicker presets={catalogAvailable} />
            )}
          </div>
        </details>

        <details className="card" style={{ padding: 'var(--space-4)' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            הוספת ערוץ טלגרם
          </summary>
          <form
            action={addTelegramChannelAction}
            style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}
          >
            <div className="field">
              <label>שם המשתמש בערוץ</label>
              <input
                name="handle"
                required
                className="input"
                placeholder="@amitsegal או t.me/amitsegal"
              />
            </div>
            <div className="field">
              <label>שם תצוגה (אופציונלי)</label>
              <input name="name" className="input" placeholder="עמית סגל" />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                הוספת ערוץ
              </button>
            </div>
          </form>
        </details>

        <details className="card" style={{ padding: 'var(--space-4)' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            הוספת מקור מותאם אישית
          </summary>
          <form
            action={createSourceAction}
            className="grid-2"
            style={{ marginTop: 'var(--space-3)' }}
          >
            <div className="field">
              <label>שם</label>
              <input name="name" required className="input" placeholder="לדוגמה: כלכליסט" />
            </div>
            <div className="field">
              <label>אתר</label>
              <input
                name="website_url"
                required
                className="input"
                placeholder="https://example.co.il"
              />
            </div>
            <div className="field full-span">
              <label>כתובת RSS</label>
              <input
                name="rss_url"
                required
                className="input"
                placeholder="https://example.co.il/rss"
              />
            </div>
            <input type="hidden" name="enabled" value="on" />
            <div className="full-span">
              <button type="submit" className="btn btn-primary">
                הוספה
              </button>
            </div>
          </form>
        </details>
      </section>

      {/* ─── Topics ─── */}
      <section className="section">
        <h2>נושאים</h2>
        <div className="hr" style={{ margin: 0 }} />

        {topics.map((t) => (
          <div key={t.id} className="card" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
            <form action={updateTopicAction} className="grid-1">
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="enabled" value={t.enabled ? 'on' : ''} />
              <div className="field">
                <label>שם</label>
                <input name="name" defaultValue={t.name} required className="input" />
              </div>
              <div className="field">
                <label>מילות מפתח להתאמה</label>
                <textarea
                  name="description"
                  defaultValue={t.description}
                  rows={2}
                  className="input"
                />
              </div>
              <div>
                <button type="submit" className="btn btn-secondary">
                  שמירה
                </button>
              </div>
            </form>

            <div className="row-between">
              <SegControl
                name="enabled"
                value={t.enabled ? 'true' : 'false'}
                options={ENABLE_OPTS}
                action={setTopicEnabledAction}
                extra={{ id: String(t.id) }}
              />
              <form action={deleteTopicAction}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="btn btn-ghost">
                  מחיקה
                </button>
              </form>
            </div>
          </div>
        ))}

        {availableTopicPresets.length > 0 && (
          <details className="card" style={{ padding: 'var(--space-4)' }}>
            <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              הוספה מקטלוג נושאים
            </summary>
            <form action={addTopicPresetsAction} style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-3)' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--space-1) var(--space-4)',
                }}
              >
                {availableTopicPresets.map((p) => (
                  <label
                    key={p.name}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-2)',
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="preset_topic"
                      value={p.name}
                      style={{ marginTop: 3 }}
                    />
                    <span>
                      <strong>{p.name}</strong>{' '}
                      <span className="text-muted">— {p.description.slice(0, 80)}…</span>
                    </span>
                  </label>
                ))}
              </div>
              <div>
                <button type="submit" className="btn btn-primary">
                  הוספת הנושאים המסומנים
                </button>
              </div>
            </form>
          </details>
        )}

        <details className="card" style={{ padding: 'var(--space-4)' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            הוספת נושא חדש
          </summary>
          <form
            action={createTopicAction}
            style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}
          >
            <div className="field">
              <label>שם</label>
              <input name="name" required className="input" placeholder="לדוגמה: אנרגיה" />
            </div>
            <div className="field">
              <label>מילות מפתח להתאמה</label>
              <textarea
                name="description"
                rows={2}
                className="input"
                placeholder="מילים שיסמנו כתבות תואמות"
              />
            </div>
            <input type="hidden" name="enabled" value="on" />
            <div>
              <button type="submit" className="btn btn-primary">
                הוספה
              </button>
            </div>
          </form>
        </details>
      </section>

      {/* ─── Feed preferences ─── */}
      <section className="section">
        <h2>העדפות פיד</h2>
        <div className="hr" style={{ margin: 0 }} />

        <div className="field">
          <label>הצגת כתבות</label>
          <SegControl
            name="only_matching_topics"
            value={settings.only_matching_topics ? 'true' : 'false'}
            options={[
              { value: 'true', label: 'רק נושאים תואמים' },
              { value: 'false', label: 'כל הכתבות' },
            ]}
            action={setFeedPreferenceAction}
          />
        </div>

        <div className="field">
          <label>מיון</label>
          <SegControl
            name="sort_mode"
            value={settings.sort_mode}
            options={[
              { value: 'newest', label: 'החדש ביותר' },
              { value: 'relevance', label: 'רלוונטיות' },
            ]}
            action={setFeedPreferenceAction}
          />
        </div>

        <div className="field">
          <label>גיל כתבה מרבי</label>
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
    </main>
  );
}
