from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from backend.app.parser import parse_text

router = APIRouter()


class ParseRequest(BaseModel):
    text: str


class ParseResponse(BaseModel):
    title: str | None
    description: str | None
    start_datetime: str | None
    end_datetime: str | None
    category: str
    priority: str
    all_day: bool
    confidence: float
    warnings: list[str]
    recurrenceDetected: bool


@router.post("/parse", response_model=ParseResponse)
def parse_endpoint(payload: ParseRequest):
    parsed = parse_text(payload.text)
    data = parsed.to_dict()
    # Ensure keys match response model
    return {
        'title': data.get('title'),
        'description': data.get('description'),
        'start_datetime': data.get('start_datetime'),
        'end_datetime': data.get('end_datetime'),
        'category': data.get('category', 'other'),
        'priority': data.get('priority', 'normal'),
        'all_day': data.get('all_day', False),
        'confidence': data.get('confidence', 0.0),
        'warnings': data.get('warnings', []),
        'recurrenceDetected': data.get('recurrenceDetected', False),
    }
