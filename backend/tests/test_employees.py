import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import unittest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.database.session import Base
from app.database.models import Employee
from app.routers.employees import get_employees, create_employee
from app.schemas.employee import EmployeeCreate
from app.services.employee_service import EmployeeService

TEST_DB_URL = "sqlite:///:memory:"


class TestEmployeeServiceAndRouter(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        Base.metadata.create_all(bind=cls.engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=cls.engine)

    def setUp(self):
        self.db = self.SessionLocal()
        self.db.query(Employee).delete()
        self.db.commit()

        fixtures = [
            Employee(
                name="Rahul Sharma",
                email="rahul.sharma@example.com",
                department="Engineering",
                designation="Staff Software Engineer",
                date_of_joining=date(2021, 3, 15),
            ),
            Employee(
                name="Priya Patel",
                email="priya.patel@example.com",
                department="Engineering",
                designation="Senior Frontend Developer",
                date_of_joining=date(2022, 6, 1),
            ),
            Employee(
                name="Ananya Roy",
                email="ananya.roy@example.com",
                department="Product Management",
                designation="Lead Product Manager",
                date_of_joining=date(2020, 11, 20),
            ),
        ]
        self.db.add_all(fixtures)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_search_by_name(self):
        response = get_employees(search="rahul", limit=50, offset=0, db=self.db)
        self.assertEqual(response.total, 1)
        self.assertEqual(response.items[0].name, "Rahul Sharma")
        self.assertEqual(response.query, "rahul")

    def test_search_by_department(self):
        response = get_employees(search="Product", limit=50, offset=0, db=self.db)
        self.assertEqual(response.total, 1)
        self.assertEqual(response.items[0].department, "Product Management")

    def test_search_case_insensitive_multiple_matches(self):
        response = get_employees(search="engineering", limit=50, offset=0, db=self.db)
        self.assertEqual(response.total, 2)
        departments = {e.department for e in response.items}
        self.assertEqual(departments, {"Engineering"})

    def test_empty_search_query_raises_400(self):
        with self.assertRaises(HTTPException) as ctx:
            get_employees(search="   ", limit=50, offset=0, db=self.db)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("cannot be empty", ctx.exception.detail)

    def test_list_all_without_search_term(self):
        response = get_employees(search=None, limit=50, offset=0, db=self.db)
        self.assertEqual(response.total, 3)
        self.assertIsNone(response.query)

    def test_escaped_wildcard_character(self):
        response = get_employees(search="%", limit=50, offset=0, db=self.db)
        self.assertEqual(response.total, 0)

    def test_pagination_bounds(self):
        response = get_employees(search=None, limit=1, offset=0, db=self.db)
        self.assertEqual(len(response.items), 1)
        self.assertEqual(response.total, 3)

    def test_create_employee_success_and_conflict(self):
        new_emp = EmployeeCreate(
            name="Vikram Singh",
            email="vikram.singh@example.com",
            department="DevOps",
            designation="Infrastructure Architect",
            date_of_joining=date(2023, 1, 1),
        )
        created = create_employee(payload=new_emp, db=self.db)
        self.assertEqual(created.name, "Vikram Singh")
        self.assertIsNotNone(created.id)

        # Attempting duplicate email must raise 409 Conflict
        with self.assertRaises(HTTPException) as ctx:
            create_employee(payload=new_emp, db=self.db)
        self.assertEqual(ctx.exception.status_code, 409)


if __name__ == "__main__":
    unittest.main()
