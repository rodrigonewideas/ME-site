"""Envio de e-mail por SMTP (servidor de mail do dominio). Escapa todo input."""
import os
import smtplib
import ssl
from email.message import EmailMessage
from html import escape

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "comercial@maloteeletronico.com.br")
COMERCIAL = os.getenv("LEAD_RECIPIENT", "comercial@maloteeletronico.com.br")


def _send(to: str, subject: str, html: str, reply_to: str | None = None) -> None:
    msg = EmailMessage()
    msg["From"] = SMTP_FROM
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content("Seu cliente de e-mail nao suporta HTML.")
    msg.add_alternative(html, subtype="html")

    ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=20) as s:
            if SMTP_USER:
                s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
            s.starttls(context=ctx)
            if SMTP_USER:
                s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)


def notificar_comercial(d: dict) -> None:
    linhas = "".join(
        f"<tr><td style='padding:4px 12px 4px 0;color:#64748b'>{escape(k)}</td>"
        f"<td style='padding:4px 0'>{escape(str(v))}</td></tr>"
        for k, v in d.items()
    )
    html = (
        "<div style='font-family:sans-serif'>"
        "<h2 style='color:#143a66'>Novo lead pelo site</h2>"
        f"<table style='font-size:14px'>{linhas}</table>"
        "</div>"
    )
    _send(COMERCIAL, "Novo lead — site Malote Eletronico IA", html, reply_to=d.get("email"))


def confirmar_lead(nome: str, email: str) -> None:
    html = (
        "<div style='font-family:sans-serif;font-size:14px;color:#1f2937'>"
        f"<p>Ola, {escape(nome)}.</p>"
        "<p>Recebemos seu contato no site do Malote Eletronico IA. "
        "Em breve um responsavel retorna pessoalmente para combinar a demonstracao.</p>"
        "<p>Obrigado!</p>"
        "</div>"
    )
    _send(email, "Recebemos seu contato — Malote Eletronico IA", html)
