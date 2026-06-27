"""Rota POST /lead — recebe o formulario do site."""
import hashlib
import logging
import os

import httpx
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from slowapi import Limiter
from slowapi.util import get_remote_address

import database
import mailer
from schemas import LeadIn

log = logging.getLogger("lead")
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET", "")
IP_SALT = os.getenv("IP_SALT", "malote-site")


def _hash_ip(ip: str) -> str:
    return hashlib.sha256((IP_SALT + ip).encode()).hexdigest()[:32]


def _enviar_emails(data: dict, nome: str, email: str) -> None:
    """Roda em background: nao atrasa a resposta ao usuario nem a derruba se o SMTP falhar."""
    try:
        mailer.notificar_comercial(
            {k: data[k] for k in ("nome", "email", "empresa", "cargo", "telefone", "segmento", "porte", "mensagem")}
        )
        mailer.confirmar_lead(nome, email)
    except Exception:
        log.exception("lead gravado, mas falha no envio de e-mail")


async def _verify_turnstile(token: str, ip: str) -> bool:
    if not TURNSTILE_SECRET:
        return True  # captcha desativado
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            r = await c.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={"secret": TURNSTILE_SECRET, "response": token or "", "remoteip": ip},
            )
            return bool(r.json().get("success"))
    except Exception:
        return False


@router.post("/lead")
@limiter.limit("5/minute")
async def criar_lead(request: Request, payload: LeadIn, background: BackgroundTasks):
    ip = get_remote_address(request)

    # 1) Honeypot: bot preencheu campo oculto -> responde ok e descarta.
    if payload.website:
        return {"ok": True}

    # 2) Consentimento LGPD obrigatorio.
    if not payload.consent:
        raise HTTPException(status_code=422, detail="consentimento obrigatorio")

    # 3) Captcha (se ativado).
    if not await _verify_turnstile(payload.turnstile_token or "", ip):
        raise HTTPException(status_code=400, detail="verificacao falhou")

    data = {
        "nome": payload.nome,
        "email": str(payload.email),
        "empresa": payload.empresa,
        "cargo": payload.cargo,
        "telefone": payload.telefone,
        "segmento": payload.segmento.value,
        "porte": payload.porte.value,
        "mensagem": payload.mensagem,
        "consent_lgpd": True,
        "origem": "site",
        "ip_hash": _hash_ip(ip),
        "user_agent": request.headers.get("user-agent", "")[:300],
    }

    try:
        database.inserir_lead(data)
    except Exception:
        log.exception("falha ao gravar lead")
        raise HTTPException(status_code=500, detail="erro ao processar")

    # E-mails em background: a resposta sai na hora (logo apos gravar o lead).
    background.add_task(_enviar_emails, data, payload.nome, str(payload.email))

    return {"ok": True}
