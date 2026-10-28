from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.employee_service import EmployeeService
from app.schemas.employee import (
    EmployeeResponse,
    EmployeeListResponse,
    EmployeeCreate,
)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get(
    "",
    response_model=EmployeeListResponse,
    status_code=status.HTTP_200_OK,
    summary="Search and list employees",
)
def get_employees(
    search: Optional[str] = Query(
        default=None,
        max_length=100,
        description="Search term matching employee name or department",
    ),
    limit: int = Query(default=50, ge=1, le=100, description="Max records to return"),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db),
) -> EmployeeListResponse:
    # Explicit check for empty search string if query parameter was supplied
    if search is not None and not search.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty or solely whitespace.",
        )

    service = EmployeeService(db)
    try:
        records, total = service.search_employees(
            query=search,
            limit=limit,
            offset=offset,
        )
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable. Please verify connectivity.",
        ) from err

    return EmployeeListResponse(
        items=[EmployeeResponse.model_validate(r) for r in records],
        total=total,
        query=search.strip() if search else None,
    )


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new employee record",
)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
) -> EmployeeResponse:
    service = EmployeeService(db)
    
    if service.get_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An employee with email '{payload.email}' already exists.",
        )
        
    try:
        created = service.create_employee(payload)
        return EmployeeResponse.model_validate(created)
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register employee.",
        ) from err
