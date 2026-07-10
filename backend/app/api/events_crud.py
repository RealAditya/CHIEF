from __future__ import annotations

from typing import List
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.app.db import get_db
from backend.app.models.event import Event
from backend.app.core.event_bus import bus as event_bus

router = APIRouter()


class EventIn(BaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    start_datetime: datetime
    end_datetime: datetime | None = None
    event_type: str = Field(...)
    category: str = Field("other")
    priority: str = Field("normal")
    completed: bool = False
    location: str | None = None
    notes: str | None = None


class EventOut(EventIn):
    id: UUID
    created_at: datetime
    updated_at: datetime


@router.get("/events", response_model=List[EventOut])
def list_events(db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.start_datetime).all()
    return [EventOut(**e.to_dict()) for e in events]


@router.get("/events/{event_id}", response_model=EventOut)
def get_event(event_id: UUID, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return EventOut(**ev.to_dict())


@router.post("/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventIn, db: Session = Depends(get_db)):
    ev = Event(
        title=payload.title,
        description=payload.description,
        start_datetime=payload.start_datetime,
        end_datetime=payload.end_datetime,
        event_type=payload.event_type,
        category=payload.category,
        priority=payload.priority,
        completed=payload.completed,
        location=payload.location,
        notes=payload.notes,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)

    event_bus.publish("event_created", ev.to_dict())
    return EventOut(**ev.to_dict())


@router.put("/events/{event_id}", response_model=EventOut)
def update_event(event_id: UUID, payload: EventIn, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    ev.title = payload.title
    ev.description = payload.description
    ev.start_datetime = payload.start_datetime
    ev.end_datetime = payload.end_datetime
    ev.event_type = payload.event_type
    ev.category = payload.category
    ev.priority = payload.priority
    ev.completed = payload.completed
    ev.location = payload.location
    ev.notes = payload.notes

    db.add(ev)
    db.commit()
    db.refresh(ev)

    event_bus.publish("event_updated", ev.to_dict())
    return EventOut(**ev.to_dict())


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: UUID, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    db.delete(ev)
    db.commit()

    event_bus.publish("event_deleted", {"id": str(event_id)})
    return None
