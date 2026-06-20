from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from datetime import datetime, timezone
import models, schemas
from database import get_db
from auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["Admin Dashboard"])

@router.get("/leads", response_model=List[schemas.LeadResponse])
def get_leads(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_user)
):
    query = db.query(models.StudentLead)
    if search:
        query = query.filter(
            or_(
                models.StudentLead.full_name.ilike(f"%{search}%"),
                models.StudentLead.email.ilike(f"%{search}%")
            )
        )
    leads = query.order_by(desc(models.StudentLead.created_at)).offset(skip).limit(limit).all()
    return leads

@router.get("/leads/{lead_id}", response_model=schemas.LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(get_current_user)):
    lead = db.query(models.StudentLead).filter(models.StudentLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.delete("/leads/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db), current_user: models.AdminUser = Depends(get_current_user)):
    lead = db.query(models.StudentLead).filter(models.StudentLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.AdminUser = Depends(get_current_user)):
    total_leads = db.query(models.StudentLead).count()
    
    # Calculate today's leads
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_leads = db.query(models.StudentLead).filter(models.StudentLead.created_at >= today_start).count()
    
    # Calculate this month's leads
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_leads = db.query(models.StudentLead).filter(models.StudentLead.created_at >= month_start).count()
    
    return {
        "total_leads": total_leads,
        "today_leads": today_leads,
        "month_leads": month_leads
    }
