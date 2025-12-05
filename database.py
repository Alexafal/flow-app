"""
Database module for Flow App
Handles PostgreSQL connection and operations
Falls back to JSON if no database configured
"""

import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

# Database setup
DATABASE_URL = os.getenv('DATABASE_URL')

# Fix for Render's postgres:// URL (needs to be postgresql://)
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# SQLAlchemy setup
Base = declarative_base()
engine = None
SessionLocal = None

if DATABASE_URL:
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        print("✅ Database connected!")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("📝 Falling back to JSON storage")


# Database Models
class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    due_date = Column(String(50))
    due_time = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(String(50))
    priority = Column(String(20), default='normal')
    tags = Column(JSON)
    description = Column(Text)
    repeat_frequency = Column(String(50))
    status = Column(String(50), default='active')
    time_estimate = Column(Integer)
    actual_time_spent = Column(Integer)


class Habit(Base):
    __tablename__ = 'habits'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    icon = Column(String(10), default='✨')
    streak = Column(Integer, default=0)
    completions = Column(JSON, default={})
    frequency = Column(String(50), default='daily')
    frequency_count = Column(Integer, default=1)
    category = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    archived = Column(Boolean, default=False)


class FocusItem(Base):
    __tablename__ = 'focus_items'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Settings(Base):
    __tablename__ = 'settings'
    
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(JSON)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Initialize database tables
def init_db():
    """Create all tables if they don't exist"""
    if engine:
        Base.metadata.create_all(engine)
        print("✅ Database tables created/verified")


# Database session context manager
@contextmanager
def get_db():
    """Get database session"""
    if SessionLocal is None:
        yield None
        return
    
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


# Helper functions to convert models to dicts
def task_to_dict(task):
    """Convert Task model to dictionary"""
    return {
        'id': task.id,
        'title': task.title,
        'completed': task.completed,
        'due_date': task.due_date,
        'due_time': task.due_time,
        'created_at': task.created_at.isoformat() if task.created_at else None,
        'completed_at': task.completed_at,
        'priority': task.priority,
        'tags': task.tags or [],
        'description': task.description,
        'repeat_frequency': task.repeat_frequency,
        'status': task.status,
        'time_estimate': task.time_estimate,
        'actual_time_spent': task.actual_time_spent
    }


def habit_to_dict(habit):
    """Convert Habit model to dictionary"""
    return {
        'id': habit.id,
        'name': habit.name,
        'icon': habit.icon,
        'streak': habit.streak,
        'completions': habit.completions or {},
        'frequency': habit.frequency,
        'frequency_count': habit.frequency_count,
        'category': habit.category,
        'created_at': habit.created_at.isoformat() if habit.created_at else None,
        'archived': habit.archived
    }


def focus_to_dict(focus):
    """Convert FocusItem model to dictionary"""
    return {
        'id': focus.id,
        'content': focus.content,
        'completed': focus.completed,
        'created_at': focus.created_at.isoformat() if focus.created_at else None
    }


# Check if database is available
def is_database_available():
    """Check if database connection is available"""
    return engine is not None and SessionLocal is not None


# Initialize on import
if DATABASE_URL:
    init_db()

