# Malote Eletrônico IA — Site institucional (V1.1)

Site institucional estático (Astro + ilhas React + Tailwind) com uma API de leads em FastAPI.
Auto-hospedado: estático servido pelo nginx no **192.168.0.212**; leads gravados em banco
próprio (`malote_site`) no **192.168.0.82**, com papel de privilégio mínimo; e-mail por SMTP
para `comercial@maloteeletronico.com.br`. **Não usa Supabase nem toca o core do backbone.**

## Stack
- Frontend: Astro 4 (output estático) + React (apenas ilhas interativas) + Tailwind.
- Ilhas React: `MobileNav`, `TypingQuery` (demo de busca semântica), `StatCounter`, `LeadForm`.
- API de leads: FastAPI + psycopg (INSERT-only) + SMTP, atrás do nginx em `/api`.
- Infra: nginx (TLS/headers), systemd, `INSTALAR.sh`.

## Desenvolvimento
```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # gera dist/
npm run preview
```
Crie `.env` a partir de `.env.example` (apenas variáveis `PUBLIC_*` — vão para o bundle).

## Estrutura
```
malote-site/
├── src/
│   ├── layouts/Base.astro          # SEO, meta/OG, reveal on-scroll, dark mode
│   ├── pages/index.astro           # compõe as 15 seções
│   ├── components/*.astro          # seções estáticas
│   ├── components/islands/*.tsx    # trechos interativos (React)
│   ├── components/Icon.astro       # ícones SVG inline (sem fonte de ícone)
│   └── styles/global.css           # tokens + utilitários
├── api/                            # FastAPI da API de leads
│   ├── main.py routers/lead.py database.py schemas.py mailer.py
│   └── requirements.txt .env.example
├── database/001_site_leads.sql     # banco malote_site + papel INSERT-only
└── infra/                          # nginx, systemd, INSTALAR.sh
```

## Banco (no 192.168.0.82)
```bash
sudo -u postgres psql -c "CREATE DATABASE malote_site;"
sudo -u postgres psql -d malote_site -f database/001_site_leads.sql
# troque a senha de site_writer no SQL antes de rodar
```
Libere a porta 5432 **somente** para 192.168.0.212 (firewall / pg_hba).

## Deploy (no 192.168.0.212)
```bash
cp api/.env.example /opt/malote-site-api/.env   # preencha SMTP + DATABASE_URL, chmod 600
./infra/INSTALAR.sh
sudo certbot --nginx -d maloteeletronico.com.br -d www.maloteeletronico.com.br
```

## Segurança (resumo — detalhe no brief)
- nginx: TLS + HSTS + CSP + X-Frame-Options + nosniff + Referrer-Policy + Permissions-Policy; `server_tokens off`.
- API: validação Pydantic, honeypot, rate-limit (app + nginx), CORS travado na origem, body-size baixo, captcha opcional (Turnstile), erros genéricos ao cliente, systemd com sandbox, usuário não-root.
- Banco: papel **INSERT-only**; 5432 só de .212; sem PII de IP cru (apenas hash).
- SO: `ufw` (80/443 público, 22 restrito), `fail2ban`, `unattended-upgrades`, SSH por chave.
- Segredos fora do git; `.env` com `chmod 600`.

## Sanitização (regra do conteúdo público)
Nunca expor no HTML/JS entregue ao navegador: IPs/topologia, percentuais de implementação,
financeiro interno, codinome do motor, preços-teto. Esses dados vivem só aqui e nos arquivos de infra.

## Convenções
Commits em português, imperativo. `.env` nunca versionado. `dist/` e `node_modules/` ignorados.

## TODO do cliente
Números reais (ProofBar), logo/favicon/og-image, domínio final, telefone do footer,
credenciais SMTP e do papel `site_writer`, (opcional) chaves do Turnstile, decisão sobre exibir preço.
