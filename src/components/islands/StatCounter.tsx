import { useEffect, useRef, useState } from 'react';

interface Props { value: number; prefix?: string; suffix?: string; decimals?: number; }

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function StatCounter({ value, prefix = '', suffix = '', decimals = 0 }: Props) {
  const [n, setN] = useState(reduce ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          const dur = 1100;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(value * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setN(value);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}
