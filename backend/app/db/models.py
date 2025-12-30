import uuid
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ARRAY, Text, func, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.session import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    url = Column(String, unique=True, nullable=False)
    source = Column(String, nullable=False)
    
    summary = Column(Text)
    original_snippet = Column(Text)
    
    category = Column(String, nullable=False) # 'AI', 'CS', 'SE', 'Research'
    tags = Column(ARRAY(String))
    
    viability_score = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    is_processed = Column(Boolean, default=False)

class IngestionLog(Base):
    __tablename__ = "ingestion_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, nullable=False) # 'SUCCESS', 'FAILURE', 'PARTIAL'
    articles_added = Column(Integer, default=0)
    errors = Column(Text)

    job_metadata = Column("metadata", JSONB)

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"} 

    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String, nullable=False)
    full_name = Column(String)
    phone_number = Column(String)
    onboarding_completed_at = Column(DateTime(timezone=True))
    interests = Column(ARRAY(String), default=[])
    role = Column(String, default="user") # 'user', 'admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    email_settings = relationship("EmailSettings", back_populates="user", uselist=False)

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"), nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(UUID(as_uuid=True))
    details = Column(JSONB)
    ip_address = Column(String) # INET maps to string in simple usage usually
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EmailSettings(Base):
    __tablename__ = "email_settings"
    __table_args__ = {"schema": "public"}

    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"), primary_key=True)
    is_subscribed = Column(Boolean, default=False)
    marketing_opt_in = Column(Boolean, default=False)
    
    # Email Sequence Flags
    welcome_email_sent = Column(Boolean, default=False)
    day_1_email_sent = Column(Boolean, default=False)
    day_2_email_sent = Column(Boolean, default=False)
    day_7_email_sent = Column(Boolean, default=False)
    
    last_email_sent_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="email_settings")
