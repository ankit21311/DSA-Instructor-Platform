from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime, timezone
from database import Base

class StudentLead(Base):
    __tablename__ = "student_leads"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    college_name = Column(String)
    current_year = Column(String)
    target_company = Column(String)
    message = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
