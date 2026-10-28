import sys
from datetime import date
from pathlib import Path

# Add backend directory to path when executed directly
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.database.session import SessionLocal, engine, Base
from app.database.models import Employee

SAMPLE_EMPLOYEES = [
    {
        "name": "Rahul Sharma",
        "email": "rahul.sharma@company.com",
        "department": "Engineering",
        "designation": "Staff Software Engineer",
        "date_of_joining": date(2021, 3, 15),
    },
    {
        "name": "Priya Patel",
        "email": "priya.patel@company.com",
        "department": "Engineering",
        "designation": "Senior Frontend Developer",
        "date_of_joining": date(2022, 6, 1),
    },
    {
        "name": "Ananya Roy",
        "email": "ananya.roy@company.com",
        "department": "Product Management",
        "designation": "Lead Product Manager",
        "date_of_joining": date(2020, 11, 20),
    },
    {
        "name": "Arjun Mehta",
        "email": "arjun.mehta@company.com",
        "department": "Design",
        "designation": "Principal Product Designer",
        "date_of_joining": date(2021, 9, 10),
    },
    {
        "name": "Sneha Iyer",
        "email": "sneha.iyer@company.com",
        "department": "Human Resources",
        "designation": "People Operations Lead",
        "date_of_joining": date(2019, 4, 8),
    },
    {
        "name": "Vikram Singh",
        "email": "vikram.singh@company.com",
        "department": "Engineering",
        "designation": "DevOps Architect",
        "date_of_joining": date(2022, 1, 17),
    },
    {
        "name": "Neha Kulkarni",
        "email": "neha.kulkarni@company.com",
        "department": "Finance",
        "designation": "Financial Analyst",
        "date_of_joining": date(2023, 2, 14),
    },
    {
        "name": "Rohan Das",
        "email": "rohan.das@company.com",
        "department": "Marketing",
        "designation": "Growth Marketing Manager",
        "date_of_joining": date(2021, 8, 25),
    },
    {
        "name": "Kavita Rao",
        "email": "kavita.rao@company.com",
        "department": "Engineering",
        "designation": "Backend Software Engineer",
        "date_of_joining": date(2023, 7, 3),
    },
    {
        "name": "Aditya Verma",
        "email": "aditya.verma@company.com",
        "department": "Sales",
        "designation": "Enterprise Account Executive",
        "date_of_joining": date(2022, 10, 5),
    },
    {
        "name": "Tanvi Gupta",
        "email": "tanvi.gupta@company.com",
        "department": "Design",
        "designation": "UI/UX Designer",
        "date_of_joining": date(2023, 3, 22),
    },
    {
        "name": "Karan Malhotra",
        "email": "karan.malhotra@company.com",
        "department": "Product Management",
        "designation": "Associate Product Manager",
        "date_of_joining": date(2024, 1, 10),
    },
]


def seed_database():
    print("Verifying database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        inserted = 0
        for data in SAMPLE_EMPLOYEES:
            existing = db.query(Employee).filter(Employee.email == data["email"]).first()
            if not existing:
                emp = Employee(**data)
                db.add(emp)
                inserted += 1
        db.commit()
        print(f"Seed complete. {inserted} new employee records inserted ({len(SAMPLE_EMPLOYEES) - inserted} skipped as duplicate).")
    except Exception as exc:
        db.rollback()
        print(f"Seeding failed: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
