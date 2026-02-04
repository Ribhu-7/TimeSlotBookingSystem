# from pydantic import BaseModel, field_validator
# from datetime import datetime
#
#
# class UserCreate(BaseModel):
#     name: str
#     category_pref: str
#
#
# class UserOut(BaseModel):
#     id: int
#     name: str
#     category_pref: str
#
#     class Config:
#         from_attributes = True
#
#
# class SlotCreate(BaseModel):
#     category: str
#     start_time: datetime
#     end_time: datetime
#
#     @field_validator("end_time")
#     @classmethod
#     def validate_time(cls, v, info):
#         start = info.data.get("start_time")
#         if start and v and v <= start:
#             raise ValueError("end_time must be after start_time")
#         return v
#
#
# class SlotOut(BaseModel):
#     id: int
#     category: str
#     start_time: datetime
#     end_time: datetime
#     user_id: int | None
#
#     class Config:
#         from_attributes = True


from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TimeSlotBase(BaseModel):
    category: str
    start_time: datetime
    end_time: datetime


class TimeSlotCreate(TimeSlotBase):
    pass


class TimeSlot(TimeSlotBase):
    id: int
    user_id: Optional[int] = None

    class Config:
        from_attributes = True  # For Pydantic v2
        # or orm_mode = True   # For Pydantic v1