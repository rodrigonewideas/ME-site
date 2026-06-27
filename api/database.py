"""Conexao com PostgreSQL (malote_site no 192.168.0.82) via pool psycopg."""
import os
from psycopg_pool import ConnectionPool

# Ex.: postgresql://site_writer:SENHA@192.168.0.82:5432/malote_site?sslmode=prefer
DATABASE_URL = os.environ["DATABASE_URL"]

pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=5, open=True, timeout=10)


def inserir_lead(data: dict) -> None:
    """INSERT parametrizado. O papel de banco tem apenas permissao de INSERT."""
    sql = (
        "INSERT INTO site.leads "
        "(nome, email, empresa, cargo, telefone, segmento, porte, mensagem, consent_lgpd, origem, ip_hash, user_agent) "
        "VALUES (%(nome)s, %(email)s, %(empresa)s, %(cargo)s, %(telefone)s, %(segmento)s, %(porte)s, "
        "%(mensagem)s, %(consent_lgpd)s, %(origem)s, %(ip_hash)s, %(user_agent)s)"
    )
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, data)
        conn.commit()
