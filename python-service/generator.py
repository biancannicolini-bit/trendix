import anthropic
import asyncio
import json
import os
import re
import time
from datetime import datetime
from cost_tracker import calculate_cost

DEFAULT_MODEL = "claude-haiku-4-5-20251001"
MODEL = os.getenv("ANTHROPIC_MODEL", DEFAULT_MODEL)

# Búsqueda web del lado de Anthropic: el modelo busca en la web y nos devuelve
# datos reales y actuales con citas. max_uses acota costo y latencia.
WEB_SEARCH_TOOL = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": int(os.getenv("WEB_SEARCH_MAX_USES", "5")),
}
# Búsqueda web se cobra aparte de los tokens: USD 10 cada 1000 búsquedas.
WEB_SEARCH_COST_PER_CALL = 0.01

_SPANISH_MONTHS = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

_client: anthropic.Anthropic | None = None


def _today():
    """Fecha de hoy en formato humano + el año, para que el modelo no use datos viejos."""
    now = datetime.now()
    return f"{now.day} de {_SPANISH_MONTHS[now.month - 1]} de {now.year}", now.year


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
    today_str, current_year = _today()

    return f"""Sos un estratega experto en redes sociales para {niche} en {location}.

FECHA DE HOY: {today_str}. Estamos en el año {current_year}. Todo lo que digas tiene que estar al día a esta fecha.

TENDENCIAS REALES (Google Trends) de esta semana en {niche} / {location}:
{trends_str}

Tenés una herramienta de búsqueda web. USALA para verificar y traer datos reales y actuales ({current_year}) sobre {niche} en {location}: cifras, precios, tasas, programas, leyes, fechas y nombres. Cruzá las tendencias de arriba con lo que encontrás en la web.

REGLAS ESTRICTAS (no negociables):
- No inventes nada. Toda cifra, precio, porcentaje, ley, programa o fecha que menciones tiene que salir de la búsqueda web o de las tendencias reales.
- Nunca uses un año pasado como si fuera el actual. Si algo está vigente, referilo a {current_year}.
- Si no encontrás un dato verificado, NO pongas un número o año específico inventado: hablá en términos generales.

Perfil del creador:
- Nicho: {niche}
- Audiencia: {audience}
- Zona: {location}
- Plataformas: {platforms_str}
- Tono: {tone}
- Idioma: {language}

Generá exactamente {frequency} posts usando estas tendencias reales.
Distribuí estos pilares: Educativo, Debate, Local, Trending, Tip práctico.

El "Desarrollo" es el cuerpo del reel y lo más importante: desarrollá entre 4 y 6 puntos,
cada uno con sustancia real (un dato, un ejemplo concreto, una comparación o una explicación),
no frases sueltas. Tiene que dar para un reel completo de 45 a 60 segundos.

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
      {{"section": "Desarrollo", "timing": "3-52 seg", "direction": "Consejo visual o de producción", "lines": ["punto 1 con dato real y específico", "punto 2 que profundiza con otro dato o ejemplo", "punto 3 con un caso concreto o comparación", "punto 4 que suma contexto o un matiz", "punto 5 que refuerza la idea (opcional)", "punto 6 (opcional)"]}},
      {{"section": "Tip final", "timing": "52-58 seg", "direction": "Tono más relajado", "lines": ["tip accionable"]}},
      {{"section": "CTA", "timing": "58-62 seg", "direction": "Directo a cámara", "lines": ["llamada a la acción que genere comentarios"]}}
    ],
    "caption": "Caption completo con emojis, saltos de línea y pregunta al final para comentarios",
    "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"],
    "format": "Talking head",
    "duration": "60 seg",
    "production_note": "Un tip clave de filmación o producción"
  }}
]

Todo en {language}. Datos reales y verificados de {location}, al día a {current_year}. Guiones listos para grabar."""


def _run_generation(prompt: str) -> dict:
    """Corre la generación con búsqueda web habilitada.

    La búsqueda web del servidor itera internamente; si llega al límite, devuelve
    stop_reason="pause_turn" y hay que re-llamar con el historial para que siga.
    Acumulamos tokens y cantidad de búsquedas a lo largo de todas las vueltas, y
    devolvemos el texto del último turno (el que trae el JSON final).
    """
    client = _get_client()
    messages = [{"role": "user", "content": prompt}]
    tokens_in = 0
    tokens_out = 0
    searches = 0
    text = ""

    try:
        # Tope de continuaciones por si el modelo se queda buscando en loop.
        for _ in range(6):
            response = client.messages.create(
                model=MODEL,
                max_tokens=12000,
                tools=[WEB_SEARCH_TOOL],
                messages=messages,
            )

            tokens_in += response.usage.input_tokens
            tokens_out += response.usage.output_tokens
            server_use = getattr(response.usage, "server_tool_use", None)
            if server_use is not None:
                searches += getattr(server_use, "web_search_requests", 0) or 0

            if response.stop_reason == "pause_turn":
                messages.append({"role": "assistant", "content": response.content})
                continue

            text = "".join(b.text for b in response.content if b.type == "text")
            break
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

    return {
        "text": text,
        "tokens_input": tokens_in,
        "tokens_output": tokens_out,
        "searches": searches,
    }


def _extract_posts(text: str) -> list:
    match = re.search(r"\[[\s\S]*\]", text)
    if not match:
        raise ValueError(f"No se encontró JSON en la respuesta. Texto: {text[:500]}")

    posts = json.loads(match.group(0))
    if not isinstance(posts, list) or len(posts) == 0:
        raise ValueError("La respuesta no contiene posts válidos")
    return posts


def _extract_post(text: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError(f"No se encontró JSON en la respuesta. Texto: {text[:500]}")

    post = json.loads(match.group(0))
    if not isinstance(post, dict):
        raise ValueError("La respuesta no contiene un post válido")
    return post


def build_single_prompt(
    niche, audience, location, platforms, tone, language,
    day, platform, pillar, avoid_title, trends
):
    trends_str = (
        "\n".join(f"- {t}" for t in trends)
        if trends
        else f"- {niche} en {location}"
    )

    avoid_line = (
        f'\nEvitá repetir este ángulo ya usado: "{avoid_title}". Buscá un enfoque distinto.'
        if avoid_title
        else ""
    )
    today_str, current_year = _today()

    return f"""Sos un estratega experto en redes sociales para {niche} en {location}.

FECHA DE HOY: {today_str}. Estamos en el año {current_year}. Todo lo que digas tiene que estar al día a esta fecha.

TENDENCIAS REALES (Google Trends) de esta semana en {niche} / {location}:
{trends_str}

Tenés una herramienta de búsqueda web. USALA para verificar y traer datos reales y actuales ({current_year}) sobre {niche} en {location}: cifras, precios, tasas, programas, leyes, fechas y nombres.

REGLAS ESTRICTAS (no negociables):
- No inventes nada. Toda cifra, precio, porcentaje, ley, programa o fecha tiene que salir de la búsqueda web o de las tendencias reales.
- Nunca uses un año pasado como si fuera el actual. Si algo está vigente, referilo a {current_year}.
- Si no encontrás un dato verificado, NO pongas un número o año específico inventado: hablá en términos generales.

Perfil del creador:
- Nicho: {niche}
- Audiencia: {audience}
- Zona: {location}
- Tono: {tone}
- Idioma: {language}

Generá UN (1) post nuevo para este espacio exacto del calendario:
- Día: {day}
- Plataforma: {platform}
- Pilar: {pillar}{avoid_line}

El "Desarrollo" es el cuerpo del reel y lo más importante: desarrollá entre 4 y 6 puntos,
cada uno con sustancia real (un dato, un ejemplo concreto, una comparación o una explicación),
no frases sueltas. Tiene que dar para un reel completo de 45 a 60 segundos.

CRÍTICO: Devolvé ÚNICAMENTE un objeto JSON válido (no un array). Sin markdown, sin explicación. Empezá con {{ directamente.

{{
  "day": "{day}",
  "platform": "{platform}",
  "pillar": "{pillar}",
  "title": "Título específico con dato real",
  "hook": "Línea exacta de apertura de 3 segundos que para el scroll",
  "script": [
    {{"section": "Hook", "timing": "0-3 seg", "direction": "Nota de cámara o visual", "lines": ["línea 1", "línea 2"]}},
    {{"section": "Desarrollo", "timing": "3-52 seg", "direction": "Consejo visual o de producción", "lines": ["punto 1 con dato real y específico", "punto 2 que profundiza con otro dato o ejemplo", "punto 3 con un caso concreto o comparación", "punto 4 que suma contexto o un matiz", "punto 5 que refuerza la idea (opcional)", "punto 6 (opcional)"]}},
    {{"section": "Tip final", "timing": "52-58 seg", "direction": "Tono más relajado", "lines": ["tip accionable"]}},
    {{"section": "CTA", "timing": "58-62 seg", "direction": "Directo a cámara", "lines": ["llamada a la acción que genere comentarios"]}}
  ],
  "caption": "Caption completo con saltos de línea y pregunta al final para comentarios",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"],
  "format": "Talking head",
  "duration": "60 seg",
  "production_note": "Un tip clave de filmación o producción"
}}

Todo en {language}. Datos reales y verificados de {location}, al día a {current_year}. Guion listo para grabar."""


async def regenerate_post(
    niche, audience, location, platforms, tone, language,
    day, platform, pillar, avoid_title, trends
) -> dict:
    prompt = build_single_prompt(
        niche, audience, location, platforms, tone, language,
        day, platform, pillar, avoid_title, trends
    )
    start = time.time()

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _run_generation, prompt)

    duration_ms = int((time.time() - start) * 1000)
    tokens_in = result["tokens_input"]
    tokens_out = result["tokens_output"]
    cost = calculate_cost(MODEL, tokens_in, tokens_out)
    cost += result["searches"] * WEB_SEARCH_COST_PER_CALL

    text = result["text"]
    if not text.strip():
        raise ValueError(
            "Claude no devolvió texto. Revisá el modelo o la API key."
        )

    post = _extract_post(text)

    return {
        "post": post,
        "usage": {
            "model": MODEL,
            "tokens_input": tokens_in,
            "tokens_output": tokens_out,
            "cost_usd": cost,
            "duration_ms": duration_ms,
        },
    }


async def generate_calendar(
    niche, audience, location, platforms, tone, language, frequency, trends
) -> dict:
    prompt = build_prompt(
        niche, audience, location, platforms, tone, language, frequency, trends
    )
    start = time.time()

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _run_generation, prompt)

    duration_ms = int((time.time() - start) * 1000)
    tokens_in = result["tokens_input"]
    tokens_out = result["tokens_output"]
    cost = calculate_cost(MODEL, tokens_in, tokens_out)
    cost += result["searches"] * WEB_SEARCH_COST_PER_CALL

    text = result["text"]
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
