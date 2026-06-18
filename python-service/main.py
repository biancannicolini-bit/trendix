from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import os
import traceback
from dotenv import load_dotenv
from trends import get_trending_topics
from generator import generate_calendar, regenerate_post

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scripvox-python")

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Authorization", "Content-Type"],
)


class GenerateRequest(BaseModel):
    niche: str
    custom_niche: Optional[str] = None
    audience: str
    location: str
    platforms: List[str]
    tone: str
    language: str
    frequency: int


@app.post("/generate")
async def generate(req: GenerateRequest, authorization: Optional[str] = Header(None)):
    if authorization != f"Bearer {INTERNAL_API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY no configurada en el servicio Python",
        )

    niche = req.custom_niche if req.niche == "otro" else req.niche

    try:
        trends = await get_trending_topics(niche, req.location)

        result = await generate_calendar(
            niche=niche,
            audience=req.audience,
            location=req.location,
            platforms=req.platforms,
            tone=req.tone,
            language=req.language,
            frequency=req.frequency,
            trends=trends,
        )

        return {
            "posts": result["posts"],
            "trends_found": trends,
            "usage": result["usage"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Generate failed: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e)) from e


class RegenerateRequest(BaseModel):
    niche: str
    custom_niche: Optional[str] = None
    audience: str
    location: str
    platforms: List[str]
    tone: str
    language: str
    day: str
    platform: str
    pillar: str
    avoid_title: Optional[str] = None


@app.post("/regenerate-post")
async def regenerate(req: RegenerateRequest, authorization: Optional[str] = Header(None)):
    if authorization != f"Bearer {INTERNAL_API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY no configurada en el servicio Python",
        )

    niche = req.custom_niche if req.niche == "otro" else req.niche

    try:
        trends = await get_trending_topics(niche, req.location)

        result = await regenerate_post(
            niche=niche,
            audience=req.audience,
            location=req.location,
            platforms=req.platforms,
            tone=req.tone,
            language=req.language,
            day=req.day,
            platform=req.platform,
            pillar=req.pillar,
            avoid_title=req.avoid_title or "",
            trends=trends,
        )

        return {
            "post": result["post"],
            "trends_found": trends,
            "usage": result["usage"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Regenerate failed: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/health")
def health():
    return {
        "status": "ok",
        "anthropic_configured": bool(ANTHROPIC_API_KEY),
    }
