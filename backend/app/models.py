from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, DECIMAL, Text, JSON, Table
from sqlalchemy.orm import relationship
from .database import Base

# Many-to-many relationship table for user-plant assignments
user_plant_assignments = Table(
    'user_plant_assignments',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('plant_id', Integer, ForeignKey('plants.id'), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    role = relationship("Role", back_populates="users")
    plants = relationship("Plant", secondary=user_plant_assignments, back_populates="users")
    reported_events = relationship("Event", back_populates="reporter")
    assigned_action_plans = relationship("ActionPlan", back_populates="assignee")

class Plant(Base):
    __tablename__ = "plants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    location_lat = Column(DECIMAL(10, 8))
    location_lng = Column(DECIMAL(11, 8))
    region = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", secondary=user_plant_assignments, back_populates="plants")
    events = relationship("Event", back_populates="plant")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(Enum('Unsafe Act', 'Unsafe Condition', 'Near Miss', 'First Aid', 'Medical Treatment', 'Fatal', name='event_category'), nullable=False)
    risk_level = Column(Enum('Low', 'Medium', 'High', name='risk_priority'), nullable=False)
    impact_nature = Column(String(100))
    description = Column(Text, nullable=False)
    basic_cause = Column(String(100))
    gps_lat = Column(DECIMAL(10, 8))
    gps_lng = Column(DECIMAL(11, 8))
    reported_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    status = Column(Enum('Open', 'In Progress', 'Closed', 'Escalated', name='tracking_status'), default='Open')
    total_score = Column(Integer, default=0)
    
    plant = relationship("Plant", back_populates="events")
    reporter = relationship("User", back_populates="reported_events")
    action_plans = relationship("ActionPlan", back_populates="event")
    photos = relationship("EventPhoto", back_populates="event", cascade="all, delete-orphan")

class ActionPlan(Base):
    __tablename__ = "action_plans"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    description = Column(Text, nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(Enum('Open', 'Closed', 'Overdue', name='action_status'), default='Open')
    sla_hours = Column(Integer, default=24)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    event = relationship("Event", back_populates="action_plans")
    assignee = relationship("User", back_populates="assigned_action_plans")

class EventPhoto(Base):
    __tablename__ = "event_photos"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    photo_url = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    event = relationship("Event", back_populates="photos")

class AuditTrail(Base):
    __tablename__ = "audit_trail"
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(Enum('INSERT', 'UPDATE', 'DELETE', 'CLOSE', name='audit_action'), nullable=False)
    old_value = Column(JSON)
    new_value = Column(JSON)
    changed_by = Column(Integer, ForeignKey("users.id"))
    changed_at = Column(DateTime, default=datetime.utcnow)
