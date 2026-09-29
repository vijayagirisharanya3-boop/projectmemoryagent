from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectListResponse, ProjectDeleteResponse
from app.services.project_service import create_project, get_projects, get_project_by_id, delete_project

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project"
)
def create_new_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a new project in MySQL.
    Each project receives a unique project ID that acts as the isolation boundary for memories.
    """
    project = create_project(db=db, name=payload.name, description=payload.description)
    return project


@router.get(
    "",
    response_model=ProjectListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all projects"
)
def list_all_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieves all projects stored in the system.
    """
    projects, total = get_projects(db=db, skip=skip, limit=limit)
    return ProjectListResponse(projects=projects, total=total)


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Get project details by ID"
)
def get_project_details(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieves a single project's metadata by its ID.
    """
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )
    return project


@router.delete(
    "/{project_id}",
    response_model=ProjectDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a project record"
)
def delete_existing_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    Deletes the project record and related metadata in MySQL.
    Note: Memories in Hindsight are intentionally preserved for historical audit trail.
    """
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found"
        )

    delete_project(db=db, project=project)
    return ProjectDeleteResponse(
        project_id=project_id,
        message=f"Project {project_id} ('{project.name}') successfully deleted from MySQL."
    )
