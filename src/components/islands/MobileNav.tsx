import { useState } from 'react';

const links = [
  { name: 'O problema', href: '#problema' },
  { name: 'A solução', href: '#listas' },
  { name: 'Especialistas', href: '#especialistas' },
  { name: 'Segurança', href: '#seguranca' },
  { name: 'FAQ', href: '#faq' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        className="p-2 text-white/80 hover:text-white"
      >
        {open ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        )}
      </button>
      {open && (
        <div className="fixed inset-x-0 top-[72px] z-50 border-b border-white/10 bg-[#070D17]/95 backdrop-blur-md shadow-enterprise-lg">
          <nav className="section-container py-4 space-y-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-3 font-medium text-white/80 hover:bg-white/10 hover:text-white">
                {l.name}
              </a>
            ))}
            <a href="#demo" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">Agendar demonstração</a>
          </nav>
        </div>
      )}
    </div>
  );
}
