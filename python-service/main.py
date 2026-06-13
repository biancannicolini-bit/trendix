from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from trends import get_trending_topics
from generator import generate_calendar

load_dotenv()

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
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

    niche = req.custom_niche if req.niche == "otro" else req.niche

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


@app.get("/health")
def health():
    return {"status": "ok"}
