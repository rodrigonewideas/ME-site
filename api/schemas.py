"""Validacao server-side do payload de lead (nunca confiar no cliente)."""
from enum import Enum
from pydantic import BaseModel, EmailStr, Field, constr


class Segmento(str, Enum):
    rh = "rh"
    credito = "credito"
    juridico = "juridico"
    compliance = "compliance"
    bpo = "bpo"
    outro = "outro"


class Porte(str, Enum):
    p1 = "1"
    p2 = "2-10"
    p3 = "11-50"
    p4 = "50+"


class LeadIn(BaseModel):
    nome: constr(strip_whitespace=True, min_length=2, max_length=120)
    email: EmailStr
    empresa: constr(strip_whitespace=True, min_length=1, max_length=160)
    cargo: constr(strip_whitespace=True, max_length=120) | None = None
    telefone: constr(strip_whitespace=True, max_length=40) | None = None
    segmento: Segmento
    porte: Porte
    mensagem: constr(strip_whitespace=True, min_length=5, max_length=4000)
    consent: bool = Field(...)
    website: str | None = None  # honeypot
    turnstile_token: str | None = None  # opcional
