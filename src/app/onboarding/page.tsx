import Link from 'next/link';
import { redirect } from 'next/navigation';
import { copy } from '@/lib/copy';
import { SOURCE_PRESETS, TOPIC_PRESETS } from '@/lib/presets';
import { getSessionId } from '@/lib/session';
import { repo } from '@/lib/repo';
import { LogoMark } from '@/app/icons';
import { OnboardingCatalogPicker } from './OnboardingCatalogPicker';
import {
  skipWizardAction,
  submitStep1Action,
  submitStep2Action,
  submitStep3Action,
} from './actions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type SP = Record<string, string | string[] | undefined>;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const stepParam = typeof sp.step === 'string' ? sp.step : null;
  const sessionId = await getSessionId();

  // Pre-load whatever the user already has, so preferences step reflects it.
  const settings = await repo.userSettings(sessionId);

  const stepNum = stepParam === '2' || stepParam === '3' ? Number(stepParam) : 0;
  // step=0 → welcome, step=1..3 → the three form steps

  return (
    <main className="wiz-shell">
      <div className="wiz-card">
        <div className="wiz-brand">
          <LogoMark size={28} />
          <span className="wordmark">Cleanews</span>
        </div>

        {stepNum === 0 && <WelcomeStep />}
        {stepNum === 1 && <Step1 />}
        {stepNum === 2 && <Step2 />}
        {stepNum === 3 && (
          <Step3
            initial={{
              only_matching_topics: settings.only_matching_topics,
              sort_mode: settings.sort_mode,
              max_article_age_hours: settings.max_article_age_hours,
            }}
          />
        )}
      </div>
    </main>
  );
}

async function goToStep1() {
  'use server';
  redirect('/onboarding?step=1');
}

/* ────────────────── Welcome ────────────────── */

function WelcomeStep() {
  return (
    <>
      <h1 className="wiz-title" style={{ fontSize: 30 }}>{copy.wizardBrand}</h1>
      <p className="wiz-body">{copy.wizardIntro}</p>
      <div className="wiz-actions">
        <form action={goToStep1}>
          <button type="submit" className="btn btn-primary btn-lg">{copy.wizardStartBtn}</button>
        </form>
        <form action={skipWizardAction}>
          <button type="submit" className="wiz-skip-link">{copy.wizardSkipToFeed}</button>
        </form>
      </div>
    </>
  );
}

/* ────────────────── Step 1 — sources ────────────────── */

function Step1() {
  return (
    <>
      <div className="wiz-kicker">{copy.step1Kicker}</div>
      <h2 className="wiz-title">{copy.step1Title}</h2>
      <p className="wiz-body">{copy.step1Body}</p>

      <form action={submitStep1Action} style={{ display: 'grid', gap: 20 }}>
        <OnboardingCatalogPicker presets={SOURCE_PRESETS} />
        <div className="wiz-nav">
          <button type="submit" className="btn btn-primary">{copy.next}</button>
          <Link href="/onboarding?step=2" className="wiz-skip-link">{copy.skipStep}</Link>
        </div>
      </form>
    </>
  );
}

/* ────────────────── Step 2 — topics ────────────────── */

function Step2() {
  return (
    <>
      <div className="wiz-kicker">{copy.step2Kicker}</div>
      <h2 className="wiz-title">{copy.step2Title}</h2>
      <p className="wiz-body">{copy.step2Body}</p>

      <form action={submitStep2Action} style={{ display: 'grid', gap: 20 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '8px 20px',
            maxHeight: '48vh',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 12,
            background: 'var(--surface-soft)',
          }}
        >
          {TOPIC_PRESETS.map((p) => (
            <label
              key={p.name}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 }}
            >
              <input
                type="checkbox"
                name="preset_topic"
                value={p.name}
                style={{ marginTop: 3, accentColor: 'var(--violet)' }}
              />
              <span>
                <strong style={{ color: 'var(--ink)' }}>{p.name}</strong>
                <span style={{ color: 'var(--ink-muted)' }}> — {p.description.slice(0, 70)}…</span>
              </span>
            </label>
          ))}
        </div>
        <div className="wiz-nav">
          <Link href="/onboarding?step=1" className="wiz-skip-link">{copy.back}</Link>
          <button type="submit" className="btn btn-primary">{copy.next}</button>
          <Link href="/onboarding?step=3" className="wiz-skip-link">{copy.skipStep}</Link>
        </div>
      </form>
    </>
  );
}

/* ────────────────── Step 3 — preferences ────────────────── */

function Step3({
  initial,
}: {
  initial: { only_matching_topics: boolean; sort_mode: 'newest' | 'relevance'; max_article_age_hours: number };
}) {
  return (
    <>
      <div className="wiz-kicker">{copy.step3Kicker}</div>
      <h2 className="wiz-title">{copy.step3Title}</h2>
      <p className="wiz-body">{copy.step3Body}</p>

      <form action={submitStep3Action} style={{ display: 'grid', gap: 22 }}>
        <PillRadio
          name="only_matching_topics"
          label={copy.prefShowLabel}
          value={String(initial.only_matching_topics)}
          options={[
            { value: 'true', label: copy.onlyMatching },
            { value: 'false', label: copy.onlyAll },
          ]}
        />
        <PillRadio
          name="sort_mode"
          label={copy.prefSortLabel}
          value={initial.sort_mode}
          options={[
            { value: 'newest', label: copy.sortNewest },
            { value: 'relevance', label: copy.sortRelevance },
          ]}
        />
        <PillRadio
          name="max_article_age_hours"
          label={copy.prefAgeLabel}
          value={String(initial.max_article_age_hours)}
          options={[
            { value: '24', label: copy.age24 },
            { value: '72', label: copy.age72 },
            { value: '168', label: copy.age168 },
          ]}
        />
        <div className="wiz-nav">
          <Link href="/onboarding?step=2" className="wiz-skip-link">{copy.back}</Link>
          <button type="submit" className="btn btn-primary btn-lg">{copy.wizardFinishBtn}</button>
        </div>
      </form>
    </>
  );
}

/** Native-radios styled as pill-group; degrades if JS is disabled. */
function PillRadio({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="field">
      <label style={{ marginBottom: 8, display: 'block' }}>{label}</label>
      <div className="pill-group" role="radiogroup">
        {options.map((opt) => (
          <label key={opt.value} className="pill-btn" style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              defaultChecked={value === opt.value}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
