from sqlalchemy.orm import Session
from app.db.models.notice import Notice

def create_notice(db: Session, notice: dict, user_id: int):
    db_notice = Notice(**notice, author_id=user_id)
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    return db_notice

def get_notices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Notice).offset(skip).limit(limit).all()

def get_notice(db: Session, notice_id: int):
    return db.query(Notice).filter(Notice.id == notice_id).first()

def update_notice(db: Session, notice_id: int, notice_data: dict):
    db.query(Notice).filter(Notice.id == notice_id).update(notice_data)
    db.commit()
    return get_notice(db, notice_id)

def delete_notice(db: Session, notice_id: int):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    db.delete(notice)
    db.commit()
