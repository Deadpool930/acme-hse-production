from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Shared Enums
class EventType(str, Enum):
    unsafe_act = "Unsafe Act"
    unsafe_condition = "Unsafe Condition"
    near_miss = "Near Miss"
    first_aid = "First Aid"
    medical_treatment = "Medical Treatment"
    fatal = "Fatal"

class RiskLevel(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

class EventStatus(str, Enum):
    open = "Open"
    in_progress = "In Progress"
    closed = "Closed"
    escalated = "Escalated"

# User Schemas
class UserBase(BaseModel):
    fullname: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id: int

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(UserBase):
    id: int
    role_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Plant Schemas
class PlantBase(BaseModel):
    name: str
    code: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    region: Optional[str] = None

class PlantOut(PlantBase):
    id: int
    class Config:
        orm_mode = True

# Event Schemas
class EventBase(BaseModel):
    plant_id: int
    event_type: EventType
    risk_level: RiskLevel
    impact_nature: Optional[str] = None
    description: str
    basic_cause: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    status: Optional[EventStatus] = None
    acknowledged_at: Optional[datetime] = None

class EventOut(EventBase):
    id: int
    reporter_id: int
    reported_at: datetime
    status: EventStatus
    total_score: int
    class Config:
        orm_mode = True

# Validation: Root validator for "Senior Developer" consistency checks
# In a real app, this would be more complex, but here we'll simulate the "Total Events" check
# e.g., if it's Fatal, the score must be high.
class EventDetailedCreate(EventCreate):
    @validator('risk_level')
    def validate_fatal_risk(cls, v, values):
        if 'event_type' in values and values['event_type'] == EventType.fatal and v != RiskLevel.high:
            raise ValueError("Fatal events must be marked as High Risk")
        return v
