import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { getFictionalDemo, getIceBreakerData, ProfileData } from '../services/api';

const steps = [
  ['01', 'Find common ground', 'Start with a few interests instead of a generic introduction.'],
  ['02', 'Ask better questions', 'Use specific prompts to make your next conversation natural.'],
  ['03', 'Verify the details', 'Research providers can be incomplete or wrong. Confirm facts before sharing.'],
];

export default function Home() {
  const [name, setName] = useState('');
  const [data, setData] = useState<ProfileData | null>(null);
  const [busy, setBusy] = useState<'demo' | 'live' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<ProfileData>, mode: 'demo' | 'live') {
    if (busy) return;
    setData(null);
    setError(null);
    setBusy(mode);
    try {
      setData(await action());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(() => getIceBreakerData(name), 'live');
  }

  const demo = data?.source === 'synthetic_demo';

  return (
    <>
      <Head>
        <title>IceBrAIker — Make better first connections</title>
        <meta name="description" content="Networking prompts with an offline, fictional demo and optional research API." />
      </Head>
      <div className="min-h-screen bg-[#090f1b] text-slate-50">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-48 -top-60 h-[650px] w-[650px] rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -left-48 top-[500px] h-[450px] w-[450px] rounded-full bg-teal-400/10 blur-3xl" />
        </div>
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-300/30 bg-teal-300/10 text-2xl text-teal-200">❄</span>
            IceBrAIker
          </Link>
          <span className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.2em] text-slate-400 sm:block">
            Networking intelligence / MVP
          </span>
        </header>

        <main className="relative mx-auto max-w-6xl px-6 pb-28">
          <div className="grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.1fr_.9fr] lg:pt-20">
            <section>
              <div className="inline-flex items-center gap-3 rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.2em] text-teal-200">
                <span className="h-2 w-2 rounded-full bg-teal-300" /> A little more than small talk
              </div>
              <h1 className="mt-8 text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
                First meetings,<br/>
                <span className="bg-gradient-to-r from-teal-200 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  better connections.
                </span>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
                Turn a short profile into questions you actually want to ask. Explore a fictional example without an account, an API key, or an external data source.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {steps.map(([number, title, desc]) => (
                  <div key={number} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                    <div className="text-sm font-bold text-teal-300">{number}</div>
                    <div className="mt-4 text-sm font-semibold">{title}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-400">{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="studio" className="rounded-3xl border border-white/15 bg-[#131f30]/95 p-6 shadow-2xl shadow-black/30 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-teal-300">Conversation studio</p>
              <h2 id="studio" className="mt-3 text-3xl font-semibold">Who are you meeting?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Use the optional research backend to generate ideas about a named person, or try the reliable fictional demo.
              </p>
              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <label htmlFor="person" className="block text-sm font-semibold">Person&apos;s name</label>
                <input
                  id="person" value={name} onChange={(event) => setName(event.target.value)}
                  type="text" minLength={2} maxLength={100} placeholder="e.g. Jordan Parker"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20"
                />
                <button type="submit" disabled={busy !== null || name.trim().length < 2}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-300 to-sky-300 px-4 py-4 font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                  {busy === 'live' ? 'Researching…' : 'Generate conversation starters'}
                </button>
              </form>
              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[.15em] text-slate-500">
                <div className="h-px flex-1 bg-white/10" />Or explore safely<div className="h-px flex-1 bg-white/10" />
              </div>
              <button type="button" onClick={() => void run(getFictionalDemo, 'demo')}
                disabled={busy !== null}
                className="w-full rounded-xl border border-teal-300/40 bg-teal-300/10 px-4 py-4 font-bold text-teal-100 transition hover:bg-teal-300/20 disabled:opacity-50">
                {busy === 'demo' ? 'Loading example…' : 'Try fictional example'}
              </button>
              <p className="mt-5 text-xs leading-5 text-slate-400">
                Demo mode never looks up a real person. Live profile generation depends on external providers and may be unavailable.
              </p>
              {error && <div role="alert" className="mt-5 rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div>}
            </section>
          </div>

          {data && <section aria-label="Profile results" className="border-t border-white/10 pt-12">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-teal-300">Your conversation brief</p>
                <h2 className="mt-2 text-3xl font-bold">{data.display_name ?? name}</h2>
              </div>
              <span className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200">
                {demo ? 'Fictional sample • Not real profile data' : 'Provider generated • Verify before use'}
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <h3 className="text-xl font-bold">The overview</h3>
                <p className="mt-4 leading-7 text-slate-300">{data.summary_and_facts.summary}</p>
                <h4 className="mt-8 text-sm font-bold uppercase tracking-[.13em] text-teal-300">Noteworthy details</h4>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-slate-300">
                  {data.summary_and_facts.facts.map((fact, index) => <li key={index}>{fact}</li>)}
                </ul>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <h3 className="text-xl font-bold">Start here</h3>
                <ul className="mt-5 space-y-4">
                  {data.ice_breakers.ice_breakers.map((question, index) =>
                    <li key={index} className="rounded-xl border border-teal-300/15 bg-teal-300/5 p-4 leading-6 text-slate-100">
                      <span className="mr-3 text-sm font-bold text-teal-300">{String(index + 1).padStart(2, '0')}</span>{question}
                    </li>
                  )}
                </ul>
                <h4 className="mt-8 text-sm font-bold uppercase tracking-[.13em] text-teal-300">Potential interests</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.interests.topics_of_interest.map(topic =>
                    <span key={topic} className="rounded-full border border-white/15 px-3 py-2 text-xs text-slate-200">{topic}</span>
                  )}
                </div>
              </article>
            </div>
          </section>}
          <footer className="mt-14 border-t border-white/10 pt-6 text-xs leading-6 text-slate-500">
            IceBrAIker is a portfolio prototype. No real-person claims are made by the example dataset. Check provider output independently.
          </footer>
        </main>
      </div>
    </>
  );
}
