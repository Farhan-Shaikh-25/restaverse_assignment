from typing import List, Optional, Tuple
from sqlalchemy import or_, select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database.models import Employee
from app.schemas.employee import EmployeeCreate


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _sanitize_like_pattern(term: str) -> str:
        # Escape SQL LIKE wildcard characters to prevent unintended wildcard expansions
        escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        return f"%{escaped}%"

    def search_employees(
        self,
        query: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Employee], int]:
        try:
            stmt = select(Employee)

            if query and query.strip():
                clean_query = query.strip()
                pattern = self._sanitize_like_pattern(clean_query)
                search_filter = or_(
                    Employee.name.ilike(pattern),
                    Employee.department.ilike(pattern),
                )
                stmt = stmt.where(search_filter)

            # Bounded count and retrieval to prevent unbounded table scans
            count_stmt = select(func.count(Employee.id))
            if query and query.strip():
                count_stmt = count_stmt.where(
                    or_(
                        Employee.name.ilike(pattern),
                        Employee.department.ilike(pattern),
                    )
                )

            total = self.db.scalar(count_stmt) or 0
            stmt = stmt.order_by(Employee.name.asc()).offset(offset).limit(limit)
            results = list(self.db.scalars(stmt).all())

            return results, total

        except SQLAlchemyError as exc:
            raise RuntimeError(f"Database query execution failure: {str(exc)}") from exc

    def get_by_id(self, employee_id: int) -> Optional[Employee]:
        try:
            return self.db.get(Employee, employee_id)
        except SQLAlchemyError as exc:
            raise RuntimeError(f"Database lookup error for id {employee_id}: {str(exc)}") from exc

    def get_by_email(self, email: str) -> Optional[Employee]:
        try:
            stmt = select(Employee).where(Employee.email == email)
            return self.db.scalars(stmt).first()
        except SQLAlchemyError as exc:
            raise RuntimeError(f"Database lookup error for email {email}: {str(exc)}") from exc

    def create_employee(self, payload: EmployeeCreate) -> Employee:
        try:
            employee = Employee(
                name=payload.name,
                email=payload.email,
                department=payload.department,
                designation=payload.designation,
                date_of_joining=payload.date_of_joining,
            )
            self.db.add(employee)
            self.db.commit()
            self.db.refresh(employee)
            return employee
        except SQLAlchemyError as exc:
            self.db.rollback()
            raise RuntimeError(f"Failed to persist employee record: {str(exc)}") from exc
