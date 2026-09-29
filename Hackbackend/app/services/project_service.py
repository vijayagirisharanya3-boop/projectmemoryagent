from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.document import ProjectInformation


def create_project(db: Session, name: str, description: Optional[str] = None) -> Project:
    """Creates a new project record in MySQL."""
    project = Project(name=name, description=description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_projects(db: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Project], int]:
    """Retrieves all projects with pagination and total count."""
    total = db.query(Project).count()
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects, total


def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
    """Finds a project by its primary key ID."""
    return db.query(Project).filter(Project.id == project_id).first()


def create_information_metadata(
    db: Session,
    project_id: int,
    title: str,
    info_type: str,
    document_id: str
) -> ProjectInformation:
    """
    Stores project document/information metadata in MySQL.
    Note: Actual long-term memories are indexed into Hindsight.
    """
    info = ProjectInformation(
        project_id=project_id,
        title=title,
        info_type=info_type,
        document_id=document_id
    )
    db.add(info)
    db.commit()
    db.refresh(info)
    return info


def get_information_metadata_by_project(db: Session, project_id: int) -> List[ProjectInformation]:
    """Retrieves all information metadata records for a given project from MySQL."""
    return db.query(ProjectInformation).filter(ProjectInformation.project_id == project_id).all()


def delete_project(db: Session, project: Project) -> None:
    """
    Deletes the project record from MySQL.
    Cascades deletion to relational metadata in project_information table.
    Note: Hindsight memories are preserved for audit/history.
    """
    db.delete(project)
    db.commit()
