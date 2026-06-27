#!/usr/bin/env bash
# Provisionamento do servidor web EVEO (ub26docker, Ubuntu 26.04) para publicar o
# site institucional Malote Eletronico IA em www.maloteeletronico.com.br.
#
# Instala o ambiente de sistema (Node, nginx, certbot, Python venv, cliente Postgres).
# NAO publica nada sozinho — apos rodar, siga os passos comentados no fim.
#
# Uso:  chmod +x infra/provisionar-eveo.sh && sudo ./infra/provisionar-eveo.sh
set -euo pipefail

echo "==> 1/4 Pacotes de sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
# nginx + TLS, venv/pip do Python, cliente Postgres (a API conecta no banco remoto), utilitarios
apt-get install -y nginx python3-venv python3-pip postgresql-client rsync curl ca-certificates

echo "==> 2/4 Node.js 20 LTS (NodeSource) — necessario para o build do Astro"
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node --version; npm --version

echo "==> 3/4 certbot (Let's Encrypt via plugin nginx)"
# Em Ubuntu recente o pacote do certbot+nginx:
apt-get install -y certbot python3-certbot-nginx || snap install --classic certbot || true

echo "==> 4/4 Usuario de servico da API"
id malote >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin malote

cat <<'NEXT'

==================================================================
Ambiente pronto. Proximos passos para publicar (executar no EVEO):

1) Codigo
   git clone https://github.com/rodrigonewideas/ME-site.git /opt/ME-site
   cd /opt/ME-site

2) Frontend (gera dist/ e publica)
   npm ci && npm run build
   sudo mkdir -p /var/www/malote-site
   sudo rsync -a --delete dist/ /var/www/malote-site/

3) API de leads (porta 8020)
   #  ATENCAO: o Python do sistema (3.14) pode nao ter wheels p/ as versoes
   #  pinadas. Se 'pip install' falhar, use um Python 3.12 dedicado no venv.
   sudo rsync -a --exclude '.venv' --exclude '.env' api/ /opt/malote-site-api/
   sudo python3 -m venv /opt/malote-site-api/.venv
   sudo /opt/malote-site-api/.venv/bin/pip install -r /opt/malote-site-api/requirements.txt
   #  Crie /opt/malote-site-api/.env (chmod 600) a partir de api/.env.example:
   #    DATABASE_URL -> banco malote_site no 10.77.254.4 (backbone replica)
   #    SMTP_* -> comercial@maloteeletronico.com.br (SMTP_VERIFY=false)
   #    ALLOWED_ORIGINS=https://www.maloteeletronico.com.br
   sudo cp infra/malote-site-api.service /etc/systemd/system/
   sudo systemctl daemon-reload && sudo systemctl enable --now malote-site-api

4) nginx + TLS (dominio publico)
   #  Pre-requisito: DNS A de www.maloteeletronico.com.br e maloteeletronico.com.br
   #  apontando para o IP publico do EVEO (177.136.226.132), portas 80/443 abertas.
   sudo cp infra/nginx-malote-site.conf /etc/nginx/sites-available/malote-site.conf
   sudo ln -sf /etc/nginx/sites-available/malote-site.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d maloteeletronico.com.br -d www.maloteeletronico.com.br
   #  Depois regenere o CSP:  node scripts/csp-hashes.mjs  -> cole no vhost.
==================================================================
NEXT
