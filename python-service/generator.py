import anthropic
import asyncio
import json
import os
import re
import time
from cost_tracker import calculate_cost

DEFAULT_MODEL = "claude-haiku-4-5-20251001"
MODEL = os.getenv("ANTHROPIC_MODEL", DEFAULT_MODEL)

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY no configurada")
    if _client is None:
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def build_prompt(
    niche, audience, location, platforms, tone, language, frequency, trends
):
    trends_str = (
        "\n".join(f"- {t}" for t in trends)
        if trends
        else f"- {niche} en {location}"
    )
    platforms_str = ", ".join(platforms)

    return f"""Sos un estratega experto en redes sociales para {niche} en {location}.

TENDENCIAS REALES encontradas esta semana en {niche} / {location}:
{trends_str}

Usá estas tendencias y tu conocimiento de {location} para incluir datos y referencias actuales en los guiones.

Perfil del creador:
- Nicho: {niche}
- Audiencia: {audience}
- Zona: {location}
- Plataformas: {platforms_str}
- Tono: {tone}
- Idioma: {language}

Generá exactamente {frequency} posts usando estas tendencias reales.
Distribuí estos pilares: Educativo, Debate, Local, Trending, Tip práctico.

CRÍTICO: Devolvé ÚNICAMENTE un array JSON válido. Sin markdown, sin explicación. Empezá con [ directamente.

[
  {{
    "day": "Lunes",
    "platform": "{platforms[0] if platforms else 'Instagram'}",
    "pillar": "Educativo",
    "title": "Título específico con dato real",
    "hook": "Línea exacta de apertura de 3 segundos que para el scroll",
    "script": [
      {{"section": "Hook", "timing": "0-3 seg", "direction": "Nota de cámara o visual", "lines": ["línea 1", "línea 2"]}},
      {{"section": "Desarrollo", "timing": "3-35 seg", "direction": "Consejo visual o de producción", "lines": ["punto con dato real y específico", "segundo punto", "tercer punto"]}},
      {{"section": "Tip final", "timing": "35-42 seg", "direction": "Tono más relajado", "lines": ["tip accionable"]}},
      {{"section": "CTA", "timing": "42-45 seg", "direction": "Directo a cámara", "lines": ["llamada a la acción que genere comentarios"]}}
    ],
    "caption": "Caption completo con emojis, saltos de línea y pregunta al final para comentarios",
    "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"],
    "format": "Talking head",
    "duration": "45 seg",
    "production_note": "Un tip clave de filmación o producción"
  }}
]

Todo en {language}. Datos reales y actuales de {location}. Guiones listos para grabar."""


def _call_anthropic(prompt: str):
    try:
        return _get_client().messages.create(
            model=MODEL,
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.AuthenticationError:
        raise RuntimeError(
            "API key de Anthropic inválida. Revisá ANTHROPIC_API_KEY en trendix_python."
        ) from None
    except anthropic.NotFoundError:
        raise RuntimeError(
            f"Modelo {MODEL} no disponible. Configurá ANTHROPIC_MODEL con un modelo válido."
        ) from None
    except anthropic.APIError as e:
        msg = (e.message or str(e)).lower()
        if "credit balance" in msg or "insufficient" in msg:
            raise RuntimeError(
                "Sin créditos en Anthropic. Cargá saldo en console.anthropic.com → Plans & Billing."
            ) from None
        raise RuntimeError(f"Error de Anthropic: {e.message}") from e


def _extract_posts(text: str) -> list:
    match = re.search(r"\[[\s\S]*\]", text)
    if not match:
        raise ValueError(f"No se encontró JSON en la respuesta. Texto: {text[:500]}")

    posts = json.loads(match.group(0))
    if not isinstance(posts, list) or len(posts) == 0:
        raise ValueError("La respuesta no contiene posts válidos")
    return posts


async def generate_calendar(
    niche, audience, location, platforms, tone, language, frequency, trends
) -> dict:
    prompt = build_prompt(
        niche, audience, location, platforms, tone, language, frequency, trends
    )
    start = time.time()

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, _call_anthropic, prompt)

    duration_ms = int((time.time() - start) * 1000)
    tokens_in = response.usage.input_tokens
    tokens_out = response.usage.output_tokens
    cost = calculate_cost(MODEL, tokens_in, tokens_out)

    text = "".join(b.text for b in response.content if b.type == "text")
    if not text.strip():
        raise ValueError(
            "Claude no devolvió texto. Revisá el modelo o la API key."
        )

    posts = _extract_posts(text)

    return {
        "posts": posts,
        "usage": {
            "model": MODEL,
            "tokens_input": tokens_in,
            "tokens_output": tokens_out,
            "cost_usd": cost,
            "duration_ms": duration_ms,
        },
    }
