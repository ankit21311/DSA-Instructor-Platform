from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter(prefix="/api/contact", tags=["Contact"])

@router.post("/", response_model=schemas.LeadResponse)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    db_lead = models.StudentLead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead
