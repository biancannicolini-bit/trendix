from pytrends.request import TrendReq
import asyncio
import time

NICHE_KEYWORDS = {
    "inmobiliario": ["crédito hipotecario", "comprar departamento", "alquiler", "precio m2"],
    "fitness": ["gym", "rutina ejercicio", "perder peso", "proteína"],
    "finanzas": ["inversión", "dólar", "plazo fijo", "ahorro"],
    "gastronomia": ["receta", "restaurante", "cocina casera", "delivery"],
    "moda": ["ropa", "tendencias moda", "outfit", "zapatillas"],
    "tecnologia": ["inteligencia artificial", "celulares", "apps", "programación"],
    "viajes": ["destinos", "vuelos baratos", "turismo", "hotel"],
    "salud": ["salud mental", "nutrición", "médico", "bienestar"],
}

LOCATION_GEO = {
    "argentina": "AR",
    "buenos aires": "AR-C",
    "mar del plata": "AR-B",
    "córdoba": "AR-X",
    "rosario": "AR-S",
    "mendoza": "AR-M",
    "tucumán": "AR-T",
    "colombia": "CO",
    "mexico": "MX",
    "chile": "CL",
    "españa": "ES",
}


async def get_trending_topics(niche: str, location: str) -> list:
    geo = _resolve_geo(location)
    keywords = NICHE_KEYWORDS.get(niche.lower(), [niche])
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch, keywords, geo)


def _fetch(keywords: list, geo: str) -> list:
    results = []
    try:
        pt = TrendReq(hl="es-AR", tz=180, retries=3, backoff_factor=1.0)
        pt.build_payload(kw_list=keywords[:5], timeframe="now 7-d", geo=geo)

        related = pt.related_queries()
        for kw in keywords[:5]:
            if kw in related and related[kw].get("rising") is not None:
                df = related[kw]["rising"]
                if not df.empty:
                    results.extend(df.head(3)["query"].tolist())

        time.sleep(1.5)

        try:
            daily = pt.trending_searches(pn=_pn_from_geo(geo))
            relevant = [
                t
                for t in daily[0].tolist()[:30]
                if any(k.lower() in t.lower() for k in keywords)
            ]
            results.extend(relevant[:3])
        except Exception:
            pass

    except Exception as e:
        print(f"pytrends error: {e}")
        results = keywords

    return list(dict.fromkeys(results))[:10]


def _resolve_geo(location: str) -> str:
    loc = location.lower()
    for key, geo in LOCATION_GEO.items():
        if key in loc:
            return geo
    return "AR"


def _pn_from_geo(geo: str) -> str:
    mapping = {
        "AR": "argentina",
        "CO": "colombia",
        "MX": "mexico",
        "CL": "chile",
        "ES": "spain",
    }
    return mapping.get(geo[:2], "argentina")
