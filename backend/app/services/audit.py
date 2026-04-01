from sqlalchemy.ext.asyncio import AsyncSession
from ..models import AuditTrail
from typing import Any, Dict, Optional
import json

async def log_audit(
    db: AsyncSession, 
    table_name: str, 
    record_id: int, 
    action: str, 
    changed_by: Optional[int] = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None
):
    """
    Senior Developer Pattern: Centralized Audit Logging
    Ensures compliance by tracking every state change.
    """
    audit_entry = AuditTrail(
        table_name=table_name,
        record_id=record_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
        changed_by=changed_by
    )
    db.add(audit_entry)
    await db.flush()
