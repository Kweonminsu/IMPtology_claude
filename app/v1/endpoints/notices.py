# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.db.session import get_db
# from app.schemas.notice import NoticeCreate, NoticeUpdate, Notice
# from app.services.notice_service import (
#     create_notice, get_notices, get_notice, update_notice, delete_notice
# )
# from app.core.security import get_current_active_user, get_current_superuser
#
# router = APIRouter()
#
# @router.post("/", response_model=Notice)
# def create_new_notice(
#     notice: NoticeCreate,
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_superuser)
# ):
#     return create_notice(db, notice.dict(), current_user.id)
#
# @router.get("/", response_model=list[Notice])
# def read_notices(
#     skip: int = 0,
#     limit: int = 100,
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_active_user)
# ):
#     return get_notices(db, skip=skip, limit=limit)
#
# @router.get("/{notice_id}", response_model=Notice)
# def read_notice(
#     notice_id: int,
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_active_user)
# ):
#     notice = get_notice(db, notice_id)
#     if not notice:
#         raise HTTPException(status_code=404, detail="Notice not found")
#     return notice
#
# @router.put("/{notice_id}", response_model=Notice)
# def update_notice_info(
#     notice_id: int,
#     notice: NoticeUpdate,
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_superuser)
# ):
#     return update_notice(db, notice_id, notice.dict())
#
# @router.delete("/{notice_id}")
# def delete_notice_item(
#     notice_id: int,
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_superuser)
# ):
#     delete_notice(db, notice_id)
#     return {"message": "Notice deleted successfully"}
