# from fastapi import FastAPI, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# from fastapi.middleware.cors import CORSMiddleware
#
#
# from database import Base, engine, SessionLocal
# import models, schemas
#
#
# Base.metadata.create_all(bind=engine)
#
# app = FastAPI(title="Slot Booking API")
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],   # or ["http://localhost:4200"]
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
#
# @app.get("/")
# def root():
#     return {"status": "API running 🚀"}
#
#
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
#
#
# # -------- USERS -------- #
#
# @app.post("/users/", response_model=schemas.UserOut)
# def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
#     u = models.User(**user.dict())
#     db.add(u)
#     db.commit()
#     db.refresh(u)
#     return u
#
#
# # -------- SLOTS -------- #
#
# @app.post("/slots/", response_model=schemas.SlotOut)
# def create_slot(slot: schemas.SlotCreate, db: Session = Depends(get_db)):
#     s = models.Slot(**slot.dict())
#     db.add(s)
#     db.commit()
#     db.refresh(s)
#     return s
#
#
# @app.get("/slots/", response_model=list[schemas.SlotOut])
# def get_slots(
#     week_start: datetime = Query(..., description="Start of the week (ISO format)"),
#     category: str | None = None,
#     db: Session = Depends(get_db),
# ):
#     week_end = week_start + timedelta(days=7)
#
#     q = db.query(models.Slot).filter(
#         models.Slot.start_time >= week_start,
#         models.Slot.start_time < week_end,
#     )
#
#     if category:
#         q = q.filter(models.Slot.category == category)
#
#     return q.order_by(models.Slot.start_time).all()
#
#
# # -------- BOOKINGS -------- #
#
# @app.post("/slots/{slot_id}/signup/{user_id}", response_model=schemas.SlotOut)
# def signup(slot_id: int, user_id: int, db: Session = Depends(get_db)):
#     slot = db.get(models.Slot, slot_id)
#     if not slot:
#         raise HTTPException(status_code=404, detail="Slot not found")
#
#     if slot.user_id is not None:
#         raise HTTPException(status_code=400, detail="Slot already booked")
#
#     slot.user_id = user_id
#     db.commit()
#     db.refresh(slot)
#     return slot
#
#
# @app.post("/slots/{slot_id}/unsubscribe", response_model=schemas.SlotOut)
# def unsubscribe(slot_id: int, db: Session = Depends(get_db)):
#     slot = db.get(models.Slot, slot_id)
#     if not slot:
#         raise HTTPException(status_code=404, detail="Slot not found")
#
#     slot.user_id = None
#     db.commit()
#     db.refresh(slot)
#     return slot


from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
import models
import schemas
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Configuration for Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= ENDPOINTS YOU NEED =============

@app.get("/")
def root():
    return {"message": "Time Slot Booking API"}


@app.get("/slots/", response_model=List[schemas.TimeSlot])
def get_slots(
        week_start: Optional[str] = None,
        category: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    Get time slots filtered by week and/or category
    Angular will call this with: /slots/?week_start=2024-01-15&category=Cat 1
    """
    query = db.query(models.TimeSlot)

    # Filter by week if provided
    if week_start:
        try:
            start_date = datetime.fromisoformat(week_start)
            # Get Monday of that week
            days_to_monday = start_date.weekday()
            monday = start_date - timedelta(days=days_to_monday)
            sunday = monday + timedelta(days=6)

            query = query.filter(
                models.TimeSlot.start_time >= monday,
                models.TimeSlot.start_time <= sunday.replace(hour=23, minute=59, second=59)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    # Filter by category if provided
    if category:
        query = query.filter(models.TimeSlot.category == category)

    return query.all()


@app.post("/slots/", response_model=schemas.TimeSlot)
def create_slot(
        slot: schemas.TimeSlotCreate,
        db: Session = Depends(get_db)
):
    """
    Create a new time slot (Admin only)
    Angular will call this with: POST /slots/ with JSON body
    """
    # Validation
    if slot.end_time <= slot.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    # Create new slot
    db_slot = models.TimeSlot(
        category=slot.category,
        start_time=slot.start_time,
        end_time=slot.end_time,
        user_id=None  # New slots are unbooked
    )

    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)

    return db_slot


@app.post("/slots/{slot_id}/signup/{user_id}")
def signup_for_slot(
        slot_id: int,
        user_id: int,
        db: Session = Depends(get_db)
):
    """
    Sign up a user for a time slot
    Angular will call this with: POST /slots/1/signup/1
    """
    # Find the slot
    slot = db.query(models.TimeSlot).filter(models.TimeSlot.id == slot_id).first()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    # Check if already booked
    if slot.user_id is not None:
        raise HTTPException(status_code=400, detail="Slot already booked")

    # Book the slot
    slot.user_id = user_id
    db.commit()

    return {"message": "Successfully signed up", "slot_id": slot_id}


@app.post("/slots/{slot_id}/unsubscribe")
def unsubscribe_from_slot(
        slot_id: int,
        db: Session = Depends(get_db)
):
    """
    Unsubscribe from a time slot
    Angular will call this with: POST /slots/1/unsubscribe
    """
    # Find the slot
    slot = db.query(models.TimeSlot).filter(models.TimeSlot.id == slot_id).first()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if slot.user_id is None:
        raise HTTPException(status_code=400, detail="Slot is not booked")

    # Unbook the slot
    slot.user_id = None
    db.commit()

    return {"message": "Successfully unsubscribed", "slot_id": slot_id}