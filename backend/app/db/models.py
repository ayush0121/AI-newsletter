import uuid
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ARRAY, Text, func, ForeignKey
from sqlalchemy.orm import relationship, backref
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
    
    # Global Reaction Counters (Simple MVP)
    reactions_fire = Column(Integer, default=0, server_default='0')
    reactions_mindblown = Column(Integer, default=0, server_default='0')
    reactions_skeptical = Column(Integer, default=0, server_default='0')

class IngestionLog(Base):
    __tablename__ = "ingestion_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, nullable=False) # 'SUCCESS', 'FAILURE', 'PARTIAL'
    articles_added = Column(Integer, default=0)
    errors = Column(Text)

    job_metadata = Column("metadata", JSONB)

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(String, nullable=False)
    author = Column(String, nullable=False)
    role = Column(String, nullable=True) # e.g. "CEO, OpenAI"
    avatar_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True) # Link to interview
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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

class Subscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    source = Column(String, default="website")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"), primary_key=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())



class Poll(Base):
    __tablename__ = "polls"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question = Column(String, nullable=False)
    # options format: [{"id": "opt_1", "text": "Yes", "votes": 0}, {"id": "opt_2", "text": "No", "votes": 0}]
    options = Column(JSONB, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Comment(Base):
    __tablename__ = "poll_comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("polls.id"), nullable=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"), nullable=False)
    content = Column(Text, nullable=False)
    vote_option = Column(String) # e.g. "Yes", "No", "AI will win"
    parent_id = Column(UUID(as_uuid=True), ForeignKey("poll_comments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    replies = relationship("Comment", backref=backref("parent", remote_side=[id]))

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"), nullable=False, index=True) # Recipient
    actor_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"), nullable=True) # Who triggered it
    
    type = Column(String, nullable=False) # 'reply', 'system'
    resource_type = Column(String, nullable=False) # 'poll', 'article'
    resource_id = Column(UUID(as_uuid=True), nullable=False)
    
    content = Column(String, nullable=True) # Preview text
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    actor = relationship("User", foreign_keys=[actor_id])
