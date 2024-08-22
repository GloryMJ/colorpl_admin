from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship, Session
from datetime import datetime, timedelta
from .database import Base

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String(255), index=True)
    category_id = Column(Integer, index=True)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('ix_category_category_id', 'category', 'category_id', unique=True),
    )

from pydantic import BaseModel
from typing import Optional, List

class ReportSchema(BaseModel):
    category: str
    category_id: int
    description: Optional[str] = None

    class Config:
        from_attributes = True

class ReportSearchSchema(BaseModel):
    category: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

    class Config:
        from_attributes = True

from fastapi import FastAPI, Depends, HTTPException, APIRouter
from .database import get_db

router = APIRouter()

@router.post("/reports/")
def create_report(report: ReportSchema, db: Session = Depends(get_db)):
    new_report = Report(
        category = report.category,
        category_id = report.category_id,
        description = report.description
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/reports/", response_model=List[ReportSchema])
def get_all_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    return reports

@router.get("/reports/{report_id}", response_model=ReportSchema)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Not Found")
    return report

@router.post("/reports/search", response_model=List[ReportSchema])
def search_reports(search_params: ReportSearchSchema, db: Session = Depends(get_db)):
    query = db.query(Report)

    if search_params.category:
        query = query.filter(Report.category == search_params.category)
    
    if search_params.category_id:
        query = query.filter(Report.category_id == search_params.category_id)
    
    if search_params.description:
        query = query.filter(Report.description == search_params.description)
    
    if search_params.date_from and search_params.date_to:
        if search_params.date_from == search_params.date_to:
            query = query.filter(Report.created_at.between(search_params.date_from, search_params.date_to + timedelta(days=1)))
        else:
            query = query.filter(Report.created_at >= search_params.date_from)
            query = query.filter(Report.created_at <= search_params.date_to)
    elif search_params.date_from:
        query = query.filter(Report.created_at >= search_params.date_from)
    elif search_params.date_to:
        query = query.filter(Report.created_at <= search_params.date_to)
    
    reports = query.all()

    return reports
