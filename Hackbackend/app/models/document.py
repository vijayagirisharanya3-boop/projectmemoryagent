from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ProjectInformation(Base):
    """
    Stores document/information metadata in MySQL.
    NOTE: The actual long-term project memories, facts, and embeddings
    are stored exclusively in Hindsight to prevent unnecessary duplication.
    """
    __tablename__ = "project_information"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    info_type = Column(
        String(50),
        nullable=False,
        comment="Type of information: meeting_note, decision, problem, change, failed_approach, unresolved_issue"
    )
    document_id = Column(
        String(100),
        nullable=False,
        index=True,
        comment="Reference identifier linked to the Hindsight memory document"
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="information_records")
