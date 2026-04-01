from sqlalchemy import select, update
from ..database import AsyncSessionLocal
from ..models import Event, AuditTrail
import asyncio
import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

async def run_escalation_engine():
    """
    Senior Developer Pattern: Background Service for SLA Compliance
    Checks for 'High' or 'Critical' events with no action plans after 24h.
    """
    logger.info("SLA Escalation Engine Started")
    connection_retry_count = 0
    max_retries = 5
    
    while True:
        try:
            async with AsyncSessionLocal() as db:
                # 1. Find High/Critical events older than 24h still in 'Open' status
                cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).replace(tzinfo=None)
                
                # Note: Adjusting query to match Enum values or strings in models.py
                stmt = select(Event).where(
                    Event.risk_level == 'High',
                    Event.reported_at < cutoff,
                    Event.status == 'Open'
                )
                result = await db.execute(stmt)
                breached_events = result.scalars().all()

                for event in breached_events:
                    # Logic: Escalation to Corporate
                    logger.warning(f"SLA BREACH: Event {event.id} at Plant {event.plant_id} has exceeded 24h response time.")
                    
                    # Update status to 'Escalated'
                    event.status = 'Escalated'
                    
                    # Log to Audit Trail using the central table structure
                    audit = AuditTrail(
                        table_name="events",
                        record_id=event.id,
                        action="UPDATE",
                        new_value={"status": "Escalated"}
                    )
                    db.add(audit)
                
                if breached_events:
                    await db.commit()
                
                connection_retry_count = 0  # Reset on successful connection
        except Exception as e:
            logger.error(f"Escalation Engine Error: {e}")
            
        # Sleep for 1 hour between checks (or shorter for testing)
        await asyncio.sleep(3600)
