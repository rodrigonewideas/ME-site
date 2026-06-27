import { useState } from 'react';

const ENDPOINT = (import.meta as any).env?.PUBLIC_LEAD_ENDPOINT || '/api/lead';
const COMERCIAL = 'comercial@maloteeletronico.com.br';

type State = 'idle' | 'sending' | 'sent' | 'error';

const segmentos = [
  ['rh', 'RH / Departamento Pessoal'],
  ['credito', 'Crédito / Análise financeira'],
  ['juridico', 'Jurídico'],
  ['compliance', 'Compliance'],
  ['bpo', 'Contabilidade / BPO'],
  ['outro', 'Outro'],
];
const portes = [
  ['1', '1 empresa'],
  ['2-10', '2 a 10'],
  ['11-50', '11 a 50'],
  ['50+', 'Mais de 50'],
];

const inputCls =
  'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';
const labelCls = 'mb-1.5 block text-sm font-semibold text-foreground';

export default function LeadForm() {
  const [state, setState] = useState<State>('idle');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, any> = Object.fromEntries(fd.entries());
    payload.consent = fd.get('consent') === 'on';

    // Validacao no cliente (o servidor revalida).
    const errs: Record<string, string> = {};
    if (!payload.nome || String(payload.nome).trim().length < 2) errs.nome = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email || ''))) errs.email = 'E-mail inválido.';
    if (!payload.empresa) errs.empresa = 'Informe a empresa.';
    if (!payload.segmento) errs.segmento = 'Selecione o segmento.';
    if (!payload.porte) errs.porte = 'Selecione.';
    if (!payload.mensagem || String(payload.mensagem).trim().length < 5) errs.mensagem = 'Conte um pouco do cenário.';
    if (!payload.consent) errs.consent = 'É necessário aceitar para prosseguir.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setEmail(String(payload.email));
    setState('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('falha');
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="card-base mx-auto max-w-2xl p-8 text-center shadow-enterprise md:p-10">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-secondary"><circle cx="12" cy="12" r="10" /><polyline points="9 12 12 15 16 9" /></svg>
        <h3 className="mt-4 text-2xl font-bold text-foreground">Recebemos seu contato</h3>
        <p className="mt-3 text-muted-foreground">
          Enviamos uma confirmação para <strong>{email}</strong>. Em breve um responsável retorna pessoalmente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-base mx-auto max-w-2xl space-y-4 p-6 shadow-enterprise md:p-8">
      {/* honeypot (oculto) */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="nome" className={labelCls}>Nome <span className="text-primary">*</span></label>
          <input id="nome" name="nome" type="text" required className={inputCls} />
          {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>E-mail <span className="text-primary">*</span></label>
          <input id="email" name="email" type="email" required className={inputCls} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="empresa" className={labelCls}>Empresa <span className="text-primary">*</span></label>
          <input id="empresa" name="empresa" type="text" required className={inputCls} />
          {errors.empresa && <p className="mt-1 text-xs text-destructive">{errors.empresa}</p>}
        </div>
        <div>
          <label htmlFor="cargo" className={labelCls}>Cargo</label>
          <input id="cargo" name="cargo" type="text" className={inputCls} />
        </div>
        <div>
          <label htmlFor="telefone" className={labelCls}>Telefone / WhatsApp</label>
          <input id="telefone" name="telefone" type="tel" className={inputCls} />
        </div>
        <div>
          <label htmlFor="segmento" className={labelCls}>Segmento <span className="text-primary">*</span></label>
          <select id="segmento" name="segmento" required className={inputCls} defaultValue="">
            <option value="" disabled>Selecione…</option>
            {segmentos.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {errors.segmento && <p className="mt-1 text-xs text-destructive">{errors.segmento}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="porte" className={labelCls}>Quantas empresas você administra? <span className="text-primary">*</span></label>
        <select id="porte" name="porte" required className={inputCls} defaultValue="">
          <option value="" disabled>Selecione…</option>
          {portes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {errors.porte && <p className="mt-1 text-xs text-destructive">{errors.porte}</p>}
      </div>

      <div>
        <label htmlFor="mensagem" className={labelCls}>O que você quer resolver? <span className="text-primary">*</span></label>
        <textarea id="mensagem" name="mensagem" rows={4} required className={inputCls} />
        {errors.mensagem && <p className="mt-1 text-xs text-destructive">{errors.mensagem}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 rounded border-border" />
        <span>Autorizo o contato e o tratamento dos meus dados conforme a Política de Privacidade (LGPD). <span className="text-primary">*</span></span>
      </label>
      {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}

      {state === 'error' && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Não foi possível enviar agora. Tente novamente ou escreva para{' '}
          <a className="underline" href={`mailto:${COMERCIAL}`}>{COMERCIAL}</a>.
        </p>
      )}

      <button type="submit" disabled={state === 'sending'} className="btn-primary w-full disabled:opacity-60">
        {state === 'sending' ? 'Enviando…' : 'Agendar demonstração'}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        ou escreva direto para <a className="underline" href={`mailto:${COMERCIAL}`}>{COMERCIAL}</a>
      </p>
    </form>
  );
}
