from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models import Event, AuditTrail
from ..schemas import EventCreate, EventOut, EventStatus, EventUpdate
from ..services.audit import log_audit

router = APIRouter()

@router.post("/", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(event_in: EventCreate, db: AsyncSession = Depends(get_db)):
    """
    Senior Developer Level: Event Creation with Automatic Audit Logging
    """
    # 1. Calculation Logic (Simulated Total Score based on Risk)
    risk_scores = {"Low": 1, "Medium": 5, "High": 10}
    total_score = risk_scores.get(event_in.risk_level.value, 0)

    # 2. Persist Event
    new_event = Event(
        **event_in.dict(),
        reporter_id=1, # TODO: Use authenticated user ID
        total_score=total_score
    )
    db.add(new_event)
    await db.flush() # Get the ID before commit

    # 3. Log Audit Trail
    await log_audit(
        db, 
        table_name="events", 
        record_id=new_event.id, 
        action="INSERT", 
        new_value=event_in.dict()
    )
    
    await db.commit()
    await db.refresh(new_event)
    return new_event

@router.post("/sync", response_model=List[EventOut])
async def sync_offline_events(events_in: List[EventCreate], db: AsyncSession = Depends(get_db)):
    """
    Offline Sync Logic: Bulk inserts for mobile devices (Senior Requirement)
    Ensures data consistency and provides an audit trail for bulk actions.
    """
    created_events = []
    for event_data in events_in:
        risk_scores = {"Low": 1, "Medium": 5, "High": 10}
        total_score = risk_scores.get(event_data.risk_level.value, 0)
        
        new_event = Event(
            **event_data.dict(),
            reporter_id=1,
            total_score=total_score
        )
        db.add(new_event)
        await db.flush() # Get ID for audit
        
        # Log Audit Trail for each synced event
        await log_audit(
            db,
            table_name="events",
            record_id=new_event.id,
            action="INSERT",
            new_value=event_data.dict(),
            notes="Bulk Sync"
        )
        created_events.append(new_event)
    
    await db.commit()
    for ev in created_events:
        await db.refresh(ev)
    return created_events

@router.patch("/{event_id}/status", response_model=EventOut)
async def update_event_status(
    event_id: int, 
    status_update: EventUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update event status with auditing.
    """
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    old_status = event.status
    if status_update.status:
        event.status = status_update.status
    if status_update.acknowledged_at:
        event.acknowledged_at = status_update.acknowledged_at
        
    await log_audit(
        db,
        table_name="events",
        record_id=event_id,
        action="UPDATE",
        old_value={"status": old_status},
        new_value={"status": event.status}
    )
    
    await db.commit()
    await db.refresh(event)
    return event

@router.get("/", response_model=List[EventOut])
async def list_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).order_by(Event.reported_at.desc()))
    return result.scalars().all()
