def get_db():
    pass


from sqlalchemy.orm import declarative_base, sessionmaker

# from sqlalchemy import create_engine

# 데이터베이스 URL 설정 (예시: PostgreSQL)
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

# 엔진 생성
# engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 세션 로컬 생성기
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성
Base = declarative_base()
