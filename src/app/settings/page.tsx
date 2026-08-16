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
      <h1 className="page-title">הגדרות</h1>

      {/* ─── Fetch news ─── */}
      <section className="settings-section">
        <h2>משיכת חדשות</h2>
        <RunIngestionButton />
      </section>

      {/* ─── Sources ─── */}
      <section className="settings-section">
        <h2>מקורות חדשות</h2>

        {sources.map((s) => {
          const telegram = isTelegramSource(s.rss_url);
          return (
            <div key={s.id} className="card-plain settings-card">
              <div className="grid-2">
                <div className="field">
                  <label htmlFor={`source-name-${s.id}`}>שם</label>
                  <input id={`source-name-${s.id}`} className="input" value={s.name} readOnly />
                </div>
                <div className="field">
                  <label htmlFor={`source-website-${s.id}`}>אתר</label>
                  <input id={`source-website-${s.id}`} className="input input-ltr" value={s.website_url} readOnly />
                </div>
                <div className="field full-span">
                  <label htmlFor={`source-rss-${s.id}`}>כתובת RSS</label>
                  <input id={`source-rss-${s.id}`} className="input input-ltr" value={s.rss_url} readOnly />
                </div>
              </div>
              <div className="row-between settings-actions">
                <div className="row-flex">
                  {telegram && <span className="tag tag-topic tag-topic-sm">טלגרם</span>}
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
                  <button type="submit" className="btn-danger-ghost">
                    מחיקה
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        <details className="details-card-violet">
          <summary>הוספה מקטלוג מקורות</summary>
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
          <summary>הוספת ערוץ טלגרם</summary>
          <form action={addTelegramChannelAction} className="stack-form details-form">
            <div className="field">
              <label htmlFor="telegram-handle">שם המשתמש בערוץ</label>
              <input
                id="telegram-handle"
                name="handle"
                required
                className="input"
                placeholder="@amitsegal או t.me/amitsegal"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="field">
              <label htmlFor="telegram-name">שם תצוגה (אופציונלי)</label>
              <input id="telegram-name" name="name" className="input" placeholder="עמית סגל" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-tel">
                הוספת ערוץ
              </button>
            </div>
          </form>
        </details>

        <details className="details-card">
          <summary>הוספת מקור מותאם אישית</summary>
          <form
            action={createSourceAction}
            className="grid-2 details-form"
          >
            <div className="field">
              <label htmlFor="custom-source-name">שם</label>
              <input id="custom-source-name" name="name" required className="input" placeholder="לדוגמה: כלכליסט" />
            </div>
            <div className="field">
              <label htmlFor="custom-source-website">אתר</label>
              <input
                id="custom-source-website"
                type="url"
                name="website_url"
                required
                className="input input-ltr"
                placeholder="https://example.co.il"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="field full-span">
              <label htmlFor="custom-source-rss">כתובת RSS</label>
              <input
                id="custom-source-rss"
                type="url"
                name="rss_url"
                required
                className="input input-ltr"
                placeholder="https://example.co.il/rss"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <input type="hidden" name="enabled" value="on" />
            <div className="full-span form-actions">
              <button type="submit" className="btn btn-secondary">
                הוספה
              </button>
            </div>
          </form>
        </details>
      </section>

      {/* ─── Topics ─── */}
      <section className="settings-section">
        <h2>נושאים</h2>

        {topics.map((t) => (
          <div key={t.id} className="card-plain settings-card">
            <form action={updateTopicAction} className="stack-form">
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="enabled" value={t.enabled ? 'on' : ''} />
              <div className="field">
                <label htmlFor={`topic-name-${t.id}`}>שם</label>
                <input id={`topic-name-${t.id}`} name="name" defaultValue={t.name} required className="input" />
              </div>
              <div className="field">
                <label htmlFor={`topic-description-${t.id}`}>מילות מפתח להתאמה</label>
                <textarea
                  id={`topic-description-${t.id}`}
                  name="description"
                  defaultValue={t.description}
                  rows={2}
                  className="input"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-secondary">
                  שמירה
                </button>
              </div>
            </form>

            <div className="row-between settings-actions">
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

        {availableTopicPresets.length > 0 && (
          <details className="details-card-violet">
            <summary>הוספה מקטלוג נושאים</summary>
            <form
              action={addTopicPresetsAction}
              className="stack-form details-form"
            >
              <div className="choice-grid">
                {availableTopicPresets.map((p) => (
                  <label key={p.name} className="choice-row">
                    <input
                      type="checkbox"
                      name="preset_topic"
                      value={p.name}
                    />
                    <span>
                      <strong style={{ color: 'var(--ink)' }}>{p.name}</strong>{' '}
                      <span style={{ color: 'var(--ink-muted)' }}>— {p.description.slice(0, 80)}…</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  הוספת הנושאים המסומנים
                </button>
              </div>
            </form>
          </details>
        )}

        <details className="details-card">
          <summary>הוספת נושא חדש</summary>
          <form
            action={createTopicAction}
            className="stack-form details-form"
          >
            <div className="field">
              <label htmlFor="new-topic-name">שם</label>
              <input id="new-topic-name" name="name" required className="input" placeholder="לדוגמה: אנרגיה" />
            </div>
            <div className="field">
              <label htmlFor="new-topic-description">מילות מפתח להתאמה</label>
              <textarea
                id="new-topic-description"
                name="description"
                rows={2}
                className="input"
                placeholder="מילים שיסמנו כתבות תואמות"
              />
            </div>
            <input type="hidden" name="enabled" value="on" />
            <div className="form-actions">
              <button type="submit" className="btn btn-secondary">
                הוספה
              </button>
            </div>
          </form>
        </details>
      </section>

      {/* ─── Feed preferences (only age remains — the rest lives in the Feed toolbar) ─── */}
      <section className="settings-section">
        <h2>העדפות פיד</h2>

        <div className="settings-preference">
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
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)' }}>
          חיפוש, מיון והצגת נושאים תואמים זמינים ישירות בסרגל שמעל הפיד.
        </p>
      </section>
    </main>
  );
}
