import { useEffect, useState } from 'react';

type Item = { label: string; tag?: string };
type Demo = { q: string; meta: string; items: Item[] };

const DEMOS: Demo[] = [
  {
    q: 'Documentos do João vencendo em março?',
    meta: '2 resultados',
    items: [
      { label: 'ASO periódico — João Silva', tag: 'vence em março' },
      { label: 'NR-35 (altura) — João Silva', tag: 'vence em março' },
    ],
  },
  {
    q: 'Quais colaboradores estão sem ASO?',
    meta: '3 colaboradores',
    items: [
      { label: 'Marina Costa', tag: 'sem ASO' },
      { label: 'Pedro Lima', tag: 'sem ASO' },
      { label: 'Ana Souza', tag: 'sem ASO' },
    ],
  },
  {
    q: 'Falta algum documento na admissão da Marina?',
    meta: 'Faltam 2',
    items: [
      { label: 'Comprovante de residência', tag: 'falta' },
      { label: 'Certificado de reservista', tag: 'falta' },
    ],
  },
];

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function TypingQuery() {
  const [demoIdx, setDemoIdx] = useState(0);
  const [typed, setTyped] = useState(reduce ? DEMOS[0].q : '');
  const [showResults, setShowResults] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    const demo = DEMOS[demoIdx];
    setTyped('');
    setShowResults(false);

    let i = 0;
    const typer = setInterval(() => {
      if (cancelled) return;
      i++;
      setTyped(demo.q.slice(0, i));
      if (i >= demo.q.length) {
        clearInterval(typer);
        const t1 = setTimeout(() => !cancelled && setShowResults(true), 350);
        const t2 = setTimeout(() => !cancelled && setDemoIdx((d) => (d + 1) % DEMOS.length), 3200);
        timeouts.push(t1, t2);
      }
    }, 38);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    return () => {
      cancelled = true;
      clearInterval(typer);
      timeouts.forEach(clearTimeout);
    };
  }, [demoIdx]);

  const demo = DEMOS[demoIdx];

  return (
    <div className="glass-panel relative mx-auto w-full max-w-md p-0 text-left lg:mx-0 lg:max-w-none">
      {/* chrome da janela */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="window-dots">
          <i style={{ background: '#ff5f57' }} /><i style={{ background: '#febc2e' }} /><i style={{ background: '#28c840' }} />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-white/45">busca semântica · linguagem natural</span>
        <span className="dot-live" aria-hidden="true" />
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/12 bg-black/20 px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-300"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <span className="text-sm text-white/90 md:text-base">
            {typed}
            {!reduce && <span className="ml-0.5 inline-block w-px animate-pulse text-emerald-300">|</span>}
          </span>
        </div>

        <div className={`mt-4 transition-opacity duration-500 ${showResults ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">
          <div className="mb-2 px-1 font-mono text-[11px] uppercase tracking-wider text-emerald-300/70">{demo.meta}</div>
          <ul className="space-y-1.5">
            {demo.items.map((it, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2.5"
                style={{ transitionDelay: `${idx * 70}ms` }}
              >
                <span className="truncate text-sm text-white/90">{it.label}</span>
                {it.tag && (
                  <span className="flex-shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                    {it.tag}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
