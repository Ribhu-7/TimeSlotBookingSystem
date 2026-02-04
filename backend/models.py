# from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
# from database import Base
#
#
# class User(Base):
#     __tablename__ = "users"
#
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)
#     category_pref = Column(String, nullable=False)
#
#
# class Slot(Base):
#     __tablename__ = "slots"
#
#     id = Column(Integer, primary_key=True, index=True)
#     category = Column(String, nullable=False)
#     start_time = Column(DateTime, nullable=False)
#     end_time = Column(DateTime, nullable=False)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=True)


from sqlalchemy import Column, Integer, String, DateTime
from database import Base


class TimeSlot(Base):
    __tablename__ = "timeslots"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    user_id = Column(Integer, nullable=True)  # ← Make sure you have this