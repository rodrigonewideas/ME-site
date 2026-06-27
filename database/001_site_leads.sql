-- Banco proprio do site institucional, isolado do core (me_cliente_60).
-- Rodar no PostgreSQL do 192.168.0.82.
--
--   CREATE DATABASE malote_site;
--   \c malote_site
--   \i 001_site_leads.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid

CREATE SCHEMA IF NOT EXISTS site;

CREATE TABLE IF NOT EXISTS site.leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  nome         text NOT NULL,
  email        text NOT NULL,
  empresa      text NOT NULL,
  cargo        text,
  telefone     text,
  segmento     text NOT NULL,
  porte        text NOT NULL,
  mensagem     text NOT NULL,
  consent_lgpd boolean NOT NULL DEFAULT true,
  origem       text DEFAULT 'site',
  ip_hash      text,
  user_agent   text
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON site.leads (created_at DESC);

-- Papel da API com privilegio minimo: apenas INSERT (sem SELECT/UPDATE/DELETE).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'site_writer') THEN
    CREATE ROLE site_writer LOGIN PASSWORD 'TROQUE_ESTA_SENHA';
  END IF;
END$$;

GRANT CONNECT ON DATABASE malote_site TO site_writer;
GRANT USAGE ON SCHEMA site TO site_writer;
GRANT INSERT ON site.leads TO site_writer;

-- Para leitura/relatorio, use OUTRO papel (ex.: comercial_reader) — nunca o site_writer.
