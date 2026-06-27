#!/usr/bin/env bash
# Instalacao do site institucional no servidor web 192.168.0.212.
# Frontend estatico em /var/www/malote-site ; API de leads em /opt/malote-site-api.
set -euo pipefail

SITE_DIR=/var/www/malote-site
API_DIR=/opt/malote-site-api
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> 1/5 Build do frontend (Astro)"
cd "$REPO_DIR"
npm ci
npm run build

echo "==> 2/5 Publicando estatico em $SITE_DIR"
sudo mkdir -p "$SITE_DIR"
sudo rsync -a --delete "$REPO_DIR/dist/" "$SITE_DIR/"

echo "==> 3/5 Instalando API de leads em $API_DIR"
sudo mkdir -p "$API_DIR"
sudo rsync -a --delete --exclude '.venv' --exclude '.env' "$REPO_DIR/api/" "$API_DIR/"
sudo python3 -m venv "$API_DIR/.venv"
sudo "$API_DIR/.venv/bin/pip" install --upgrade pip
sudo "$API_DIR/.venv/bin/pip" install -r "$API_DIR/requirements.txt"
if [ ! -f "$API_DIR/.env" ]; then
  echo "!! Crie $API_DIR/.env a partir de api/.env.example (chmod 600) antes de iniciar."
fi

echo "==> 4/5 systemd"
sudo cp "$REPO_DIR/infra/malote-site-api.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now malote-site-api.service

echo "==> 5/5 nginx"
sudo cp "$REPO_DIR/infra/nginx-malote-site.conf" /etc/nginx/sites-available/malote-site.conf
sudo ln -sf /etc/nginx/sites-available/malote-site.conf /etc/nginx/sites-enabled/malote-site.conf
sudo nginx -t && sudo systemctl reload nginx

echo "OK. Em seguida rode o certbot:"
echo "  sudo certbot --nginx -d maloteeletronico.com.br -d www.maloteeletronico.com.br"
