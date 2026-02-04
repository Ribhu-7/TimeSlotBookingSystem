📅 Time Slot Booking System

This project is a full-stack event slot booking application built with Python (FastAPI) for the backend and Angular for the frontend.

Users can select their preferred event categories, browse weekly calendar slots, sign up for events, and unsubscribe. Admins can manage event slots and monitor registrations.

🚀 Features
👤 User Features

Select preferred event categories (Cat 1, Cat 2, Cat 3)

Weekly calendar view of available slots

Filter slots by category

Sign up for a time slot

Unsubscribe from a booked slot

View unavailable slots (already booked)

🛠 Admin Features

Add new time slots per category

View all slots

See which user has signed up

Each slot accepts only one user

🧱 Tech Stack
Layer	Tech
Backend	Python, FastAPI
Frontend	Angular
Database	SQLite / SQLAlchemy
API	REST

📂 Project Structure
project-root/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│
└── README.md

⚙️ Prerequisites

Make sure you have installed:

Python >= 3.9

Node.js >= 18

Angular CLI

Check versions:

python --version
node --version
ng version

🐍 Backend Setup (FastAPI)
cd backend
python -m venv venv

Activate venv

Windows

venv\Scripts\activate

Mac/Linux

source venv/bin/activate

Install dependencies
pip install -r requirements.txt

Run backend
uvicorn main:app --reload

Backend runs at:

http://localhost:8000

Swagger docs:

http://localhost:8000/docs

🌐 Frontend Setup (Angular)
cd frontend
npm install

Run UI:

ng serve

Frontend runs at:

http://localhost:4200

🔗 API & UI Flow

User selects preferred categories

Calendar loads weekly slots

User signs up / unsubscribes

Slot becomes unavailable once booked

Admin adds and manages slots

Each time slot allows only one user.

📅 Calendar Rules

Calendar is scoped weekly

Users can change week

Filter by event category

Already booked slots are visible but disabled

🧪 Sample Categories
Cat 1
Cat 2
Cat 3

🛡 Business Rules

One slot → one user only

Booked slot remains visible

No double booking allowed

Admin can see registrations

🧑‍💻 Development Tips

Run backend before frontend

Keep ports consistent

Enable CORS in FastAPI

Use /docs to test APIs

📌 Future Improvements

Authentication

Role based admin access

Notifications

Pagination

Deployment configs

🤝 Contributing

Feel free to fork, clone and submit PRs.

git clone <repo-url>
