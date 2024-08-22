from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from database import get_db
from models import Theater, Hall, ShowDetail, PriceBySeatClass, Seat, ShowSchedule
from utils.enum import SeatGrade, ShowState, Region, Category

router = APIRouter()

# -------------------
# Schemas
# -------------------

class ShowDetailCreate(BaseModel):
    show_detail_api_id: str
    show_detail_area: Region
    show_detail_cast: str
    show_detail_category: Category
    show_detail_name: str
    show_detail_poster_image_path: str
    show_detail_runtime: str
    show_detail_state: ShowState
    hall_id: int

class PriceBySeatClassCreate(BaseModel):
    show_detail_id: Optional[int] = None
    price_by_seat_class_seat_class: SeatGrade
    price_by_seat_class_price: int

class SeatCreate(BaseModel):
    seat_col: int
    seat_row: int
    seat_class: SeatGrade
    show_detail_id: Optional[int] = None

class ShowScheduleCreate(BaseModel):
    show_schedule_date_time: datetime
    show_detail_id: Optional[int] = None

class ShowRegistrationCreate(BaseModel):
    show_detail: ShowDetailCreate
    prices: List[PriceBySeatClassCreate]
    seats: List[SeatCreate]
    schedules: List[ShowScheduleCreate]

class ShowDetailResponse(BaseModel):
    show_detail_id: int
    show_detail_api_id: str
    show_detail_area: Region
    show_detail_cast: str
    show_detail_category: Category
    show_detail_name: str
    show_detail_poster_image_path: str
    show_detail_runtime: str
    show_detail_state: ShowState
    hall_id: int

    class Config:
        from_attributes = True

class TheaterResponse(BaseModel):
    theater_id: int
    theater_name: str

    class Config:
        from_attributes = True

class HallResponse(BaseModel):
    hall_id: int
    hall_name: str

    class Config:
        from_attributes = True

class PriceBySeatClassResponse(BaseModel):
    price_by_seat_class_seat_class: SeatGrade
    price_by_seat_class_price: int

    class Config:
        from_attributes = True

class SeatResponse(BaseModel):
    seat_id: int  # seat_id를 추가하여 반환
    seat_col: int
    seat_row: int
    seat_class: SeatGrade

    class Config:
        from_attributes = True

class ShowScheduleResponse(BaseModel):
    show_schedule_date_time: datetime

    class Config:
        from_attributes = True

class FullShowDetailResponse(BaseModel):
    show_detail: ShowDetailResponse
    theater: TheaterResponse
    hall: HallResponse
    prices: List[PriceBySeatClassResponse]
    seats: List[SeatResponse]
    schedules: List[ShowScheduleResponse]

    class Config:
        from_attributes = True

# -------------------
# CRUD Operations
# -------------------

def search_theaters_by_name(db: Session, theater_name: str, skip: int = 0, limit: int = 10):
    return db.query(Theater).filter(Theater.theater_name.ilike(f"%{theater_name}%")).offset(skip).limit(limit).all()

def get_halls_by_theater(db: Session, theater_id: int):
    return db.query(Hall).filter(Hall.theater_id == theater_id).all()

def create_show_detail(db: Session, show_detail_data: ShowDetailCreate):
    db_show_detail = ShowDetail(
        show_detail_api_id=show_detail_data.show_detail_api_id,
        show_detail_area=show_detail_data.show_detail_area,
        show_detail_cast=show_detail_data.show_detail_cast,
        show_detail_category=show_detail_data.show_detail_category,
        show_detail_name=show_detail_data.show_detail_name,
        show_detail_poster_image_path=show_detail_data.show_detail_poster_image_path,
        show_detail_runtime=show_detail_data.show_detail_runtime,
        show_detail_state=show_detail_data.show_detail_state,
        hall_id=show_detail_data.hall_id
    )
    db.add(db_show_detail)
    db.flush()  # flush to get show_detail_id
    return db_show_detail

def create_price_by_seat_class(db: Session, price_data: PriceBySeatClassCreate):
    db_price = PriceBySeatClass(
        show_detail_id=price_data.show_detail_id,
        price_by_seat_class_price=price_data.price_by_seat_class_price,
        price_by_seat_class_seat_class=price_data.price_by_seat_class_seat_class
    )
    db.add(db_price)
    db.flush()

def create_seats_bulk(db: Session, seats: List[SeatCreate]):
    db_seats = [Seat(**seat.dict()) for seat in seats]
    db.add_all(db_seats)
    db.flush()
    return db_seats  # 생성된 좌석의 ID 포함

def create_show_schedule(db: Session, schedules: List[ShowScheduleCreate]):
    for schedule in schedules:
        db_show_schedule = ShowSchedule(
            show_schedule_date_time=schedule.show_schedule_date_time,
            show_detail_id=schedule.show_detail_id
        )
        db.add(db_show_schedule)
    db.flush()

def get_full_show_detail(db: Session, show_detail_id: int):
    show_detail = db.query(ShowDetail).options(
        joinedload(ShowDetail.hall).joinedload(Hall.theater),
        joinedload(ShowDetail.price_by_seat_classes),
        joinedload(ShowDetail.seats),
        joinedload(ShowDetail.schedules)
    ).filter(ShowDetail.show_detail_id == show_detail_id).first()

    if not show_detail:
        raise HTTPException(status_code=404, detail="Show detail not found")

    return show_detail

# -------------------
# Routers
# -------------------

@router.post("/register_show", response_model=ShowDetailResponse)
def register_show(show_registration_data: ShowRegistrationCreate, db: Session = Depends(get_db)):
    try:
        db.begin()  # 기본 트랜잭션 시작

        # Create Show Detail
        new_show = create_show_detail(db, show_registration_data.show_detail)
        db.flush()

        # Create Price by Seat Class
        for price_data in show_registration_data.prices:
            # show_detail_id를 할당합니다.
            price_with_id = PriceBySeatClassCreate(
                price_by_seat_class_seat_class=price_data.price_by_seat_class_seat_class,
                price_by_seat_class_price=price_data.price_by_seat_class_price,
                show_detail_id=new_show.show_detail_id
            )
            create_price_by_seat_class(db, price_with_id)
        db.flush()

        # Create Seats
        for seat_data in show_registration_data.seats:
            seat_data.show_detail_id = new_show.show_detail_id
        create_seats_bulk(db, show_registration_data.seats)
        db.flush()

        # Create Show Schedules
        for schedule_data in show_registration_data.schedules:
            schedule_data.show_detail_id = new_show.show_detail_id
        create_show_schedule(db, show_registration_data.schedules)
        db.flush()

        db.commit()
        return new_show

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error during show registration: {str(e)}")


@router.get("/register/show_detail/{show_detail_id}", response_model=FullShowDetailResponse)
def get_show_detail(show_detail_id: int, db: Session = Depends(get_db)):
    show_detail = get_full_show_detail(db, show_detail_id)
    
    return FullShowDetailResponse(
        show_detail=ShowDetailResponse(
            show_detail_id=show_detail.show_detail_id,
            show_detail_api_id=show_detail.show_detail_api_id,
            show_detail_area=show_detail.show_detail_area,
            show_detail_cast=show_detail.show_detail_cast,
            show_detail_category=show_detail.show_detail_category,
            show_detail_name=show_detail.show_detail_name,
            show_detail_poster_image_path=show_detail.show_detail_poster_image_path,
            show_detail_runtime=show_detail.show_detail_runtime,
            show_detail_state=show_detail.show_detail_state,
            hall_id=show_detail.hall_id  # hall_id 명확히 설정
        ),
        theater=TheaterResponse(
            theater_id=show_detail.hall.theater.theater_id,
            theater_name=show_detail.hall.theater.theater_name
        ),
        hall=HallResponse(
            hall_id=show_detail.hall.hall_id,
            hall_name=show_detail.hall.hall_name
        ),
        prices=[PriceBySeatClassResponse(
            price_by_seat_class_seat_class=price.price_by_seat_class_seat_class,
            price_by_seat_class_price=price.price_by_seat_class_price
        ) for price in show_detail.price_by_seat_classes],
        seats=[SeatResponse(
            seat_id=seat.seat_id,  # seat_id를 명확히 반환
            seat_col=seat.seat_col,
            seat_row=seat.seat_row,
            seat_class=seat.seat_class
        ) for seat in show_detail.seats],
        schedules=[ShowScheduleResponse(
            show_schedule_date_time=schedule.show_schedule_date_time
        ) for schedule in show_detail.schedules]
    )

