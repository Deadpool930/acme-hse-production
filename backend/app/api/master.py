from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models import Plant, Role
from ..schemas import PlantOut # Assuming RoleOut as well

router = APIRouter()

@router.get("/plants", response_model=List[PlantOut])
async def get_plants(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plant))
    return result.scalars().all()

@router.get("/roles")
async def get_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Role))
    return result.scalars().all()
