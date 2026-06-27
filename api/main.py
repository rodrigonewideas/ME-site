"""
API de leads do site institucional Malote Eletronico IA.
Roda no servidor web (192.168.0.212), atras do nginx em /api.
Grava em banco proprio (malote_site) no 192.168.0.82 com papel INSERT-only,
e envia e-mail por SMTP. NAO toca o core do backbone.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from routers import lead

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "https://www.maloteeletronico.com.br").split(",") if o.strip()]

limiter = Limiter(key_func=get_remote_address, default_limits=["60/hour"])

app = FastAPI(title="Malote Site — Lead API", docs_url=None, redoc_url=None, openapi_url=None)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
    max_age=600,
)

app.include_router(lead.router)


@app.get("/health")
def health():
    return {"ok": True}
