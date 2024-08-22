from sqlalchemy import Column, Integer, String, DateTime, and_
from sqlalchemy.orm import Session
from datetime import datetime
from auth.database import Base

class LogModel(Base):
    __tablename__ = 'logging'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, index=True)
    table_name = Column(String(255), index=True)
    old_value = Column(String(255))
    new_value = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)
    changed_by = Column(String(255))

from pydantic import BaseModel
from typing import List, Optional

class LogSchema(BaseModel):
    member_id: int
    table_name: str
    old_value: str
    new_value: str
    timestamp: Optional[datetime] = None
    changed_by: str

    class Config:
        from_attributes = True

class LogSearchSchema(BaseModel):
    member_id: Optional[int] = None
    table_name: Optional[str] = None
    new_value: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    changed_by: Optional[str] = None

def create_log(db: Session, log: LogModel):
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_logs(db: Session, member_id: int) -> List[LogModel]:
    return db.query(LogModel).filter(LogModel.member_id == member_id).all()

from fastapi import APIRouter, Depends, HTTPException
from auth.database import get_db
from auth.dependencies import super_admin_only

router = APIRouter()

@router.post("/logs/", response_model=LogSchema, dependencies=[Depends(super_admin_only)])
def create_log_endpoint(log: LogSchema, db: Session = Depends(get_db)):
    if log.timestamp is None:
        log.timestamp = datetime.utcnow()
    log_model = LogModel(**log.dict())
    return create_log(db, log_model)

@router.get("/logs/", response_model=List[LogSchema])
def get_all_logs(db: Session = Depends(get_db)):
    logs = db.query(LogModel).all()
    
    if not logs:
        raise HTTPException(status_code=404, detail="No logs found")
    
    return logs

@router.get("/logs/{member_id}", response_model=List[LogSchema])
def read_logs(member_id: int, db: Session = Depends(get_db)):
    logs = get_logs(db, member_id)
    if not logs:
        raise HTTPException(status_code=404, detail="Logs not found")
    return logs

@router.post("/logs/search", response_model=List[LogSchema])
def search_logs(log_search: LogSearchSchema, db: Session = Depends(get_db)):
    query = db.query(LogModel)
    
    if log_search.member_id is not None:
        query = query.filter(LogModel.member_id == log_search.member_id)
    
    if log_search.table_name:
        query = query.filter(LogModel.table_name == log_search.table_name)
    
    if log_search.new_value:
        query = query.filter(LogModel.new_value == log_search.new_value)
    
    if log_search.changed_by:
        query = query.filter(LogModel.changed_by == log_search.changed_by)
    
    if log_search.start_time and log_search.end_time:
        query = query.filter(and_(LogModel.timestamp >= log_search.start_time, LogModel.timestamp <= log_search.end_time))
    elif log_search.start_time:
        query = query.filter(LogModel.timestamp >= log_search.start_time)
    elif log_search.end_time:
        query = query.filter(LogModel.timestamp <= log_search.end_time)
    
    logs = query.all()
    
    if not logs:
        raise HTTPException(status_code=404, detail="Logs not found")
    
    return logs