import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL
 
logger = logging.getLogger(__name__)
 
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # drops stale connections before using them
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,        # recycle connections every 30 min
)
 
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
 
Base = declarative_base()
 
 
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
