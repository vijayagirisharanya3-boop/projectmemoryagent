"""
Database Initialization Script for Project Memory Agent.
Connects to MySQL, ensures the target database exists, and creates all relational tables.
"""
import sys
import os

# Ensure the root folder is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pymysql
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base
from app.models import User, Project, ProjectInformation


def init_database():
    print(f"Connecting to MySQL server at {settings.MYSQL_HOST}:{settings.MYSQL_PORT} as '{settings.MYSQL_USER}'...")

    # 1. Connect to MySQL server directly to ensure database exists
    conn = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        charset="utf8mb4"
    )

    try:
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DATABASE}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"Database '{settings.MYSQL_DATABASE}' is ready.")
        conn.commit()
    finally:
        conn.close()

    # 2. Use SQLAlchemy engine to create all defined tables
    print("Creating tables (users, projects, project_information)...")
    Base.metadata.create_all(bind=engine)

    # 3. Verify tables created
    with engine.connect() as check_conn:
        res = check_conn.execute(text("SHOW TABLES;"))
        tables = [row[0] for row in res.fetchall()]
        print(f"Active tables in '{settings.MYSQL_DATABASE}': {tables}")

    print("MySQL database initialization completed successfully!")


if __name__ == "__main__":
    init_database()
