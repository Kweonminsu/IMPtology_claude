from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import pandas as pd
import logging
import os
from typing import Dict, Any, Optional, List
from contextlib import contextmanager

# Setup logging
logger = logging.getLogger(__name__)

# Database configuration (ideally loaded from environment variables)
DB_CONFIG = {
    "user": os.getenv("DB_USER", "your_username"),
    "password": os.getenv("DB_PASSWORD", "your_password"),
    "host": os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "imptology"),
    "port": os.getenv("DB_PORT", "5432"),
}

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


@contextmanager
def get_db_session():
    """
    Context manager for database sessions.
    Creates a new session and closes it after use.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {str(e)}")
        raise
    finally:
        session.close()


def execute_query(query: str, params: Optional[Dict[str, Any]] = None) -> pd.DataFrame:
    """
    Execute a SQL query and return the results as a pandas DataFrame.

    Args:
        query: SQL query string
        params: Optional parameters for the query

    Returns:
        DataFrame containing query results
    """
    try:
        if params:
            return pd.read_sql_query(query, engine, params=params)
        else:
            return pd.read_sql_query(query, engine)
    except SQLAlchemyError as e:
        logger.error(f"Query execution error: {str(e)}")
        logger.error(f"Query: {query}")
        raise


def get_table_metadata(table_name: str) -> Dict[str, Any]:
    """
    Get metadata for a specific table.

    Args:
        table_name: Name of the table

    Returns:
        Dictionary with table metadata
    """
    try:
        inspector = inspect(engine)

        # Get columns
        columns = inspector.get_columns(table_name)

        # Get primary key
        pk = inspector.get_pk_constraint(table_name)
        primary_keys = pk["constrained_columns"] if pk else []

        # Get foreign keys
        foreign_keys = inspector.get_foreign_keys(table_name)

        # Get indexes
        indexes = inspector.get_indexes(table_name)

        return {
            "table_name": table_name,
            "columns": columns,
            "primary_keys": primary_keys,
            "foreign_keys": foreign_keys,
            "indexes": indexes,
        }
    except SQLAlchemyError as e:
        logger.error(f"Error getting metadata for table {table_name}: {str(e)}")
        raise


def get_all_tables() -> List[str]:
    """
    Get list of all tables in the database.

    Returns:
        List of table names
    """
    try:
        inspector = inspect(engine)
        return inspector.get_table_names()
    except SQLAlchemyError as e:
        logger.error(f"Error getting table list: {str(e)}")
        raise


def check_database_connection() -> bool:
    """
    Check if database connection is working.

    Returns:
        True if connection is successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return True
    except SQLAlchemyError as e:
        logger.error(f"Database connection error: {str(e)}")
        return False
