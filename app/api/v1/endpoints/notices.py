from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.services.notice_service import NoticeService

router = APIRouter()
notice_service = NoticeService()


# 공지사항 스키마
class NoticeBase(BaseModel):
    title: str
    content: str


class NoticeCreate(NoticeBase):
    pass


class NoticeUpdate(NoticeBase):
    pass


class Notice(NoticeBase):
    id: int
    author: str
    date: date
    views: int

    class Config:
        orm_mode = True


# 모든 공지사항 조회
@router.get("/", response_model=List[Notice])
async def get_notices(skip: int = 0, limit: int = 10, search: Optional[str] = None):
    """
    공지사항 목록을 조회합니다.
    - skip: 건너뛸 항목 수
    - limit: 가져올 항목 수
    - search: 검색어 (옵션)
    """
    return notice_service.get_notices(skip=skip, limit=limit, search=search)


# 특정 공지사항 조회
@router.get("/{notice_id}", response_model=Notice)
async def get_notice(notice_id: int):
    """
    특정 ID의 공지사항을 조회합니다.
    공지사항 조회 시 조회수가 증가합니다.
    """
    notice = notice_service.get_notice(notice_id)
    if notice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="공지사항을 찾을 수 없습니다"
        )

    # 조회수 증가
    notice_service.increase_view_count(notice_id)
    return notice


# 공지사항 생성 (관리자 권한 필요)
@router.post("/", response_model=Notice, status_code=status.HTTP_201_CREATED)
async def create_notice(
    notice: NoticeCreate, is_admin: bool = True
):  # 실제로는 인증 미들웨어에서 관리자 확인
    """
    새 공지사항을 생성합니다. (관리자 권한 필요)
    """
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 공지사항을 작성할 수 있습니다",
        )

    return notice_service.create_notice(notice)


# 공지사항 수정 (관리자 권한 필요)
@router.put("/{notice_id}", response_model=Notice)
async def update_notice(
    notice_id: int, notice: NoticeUpdate, is_admin: bool = True
):  # 실제로는 인증 미들웨어에서 관리자 확인
    """
    공지사항을 수정합니다. (관리자 권한 필요)
    """
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 공지사항을 수정할 수 있습니다",
        )

    updated_notice = notice_service.update_notice(notice_id, notice)
    if updated_notice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="공지사항을 찾을 수 없습니다"
        )

    return updated_notice


# 공지사항 삭제 (관리자 권한 필요)
@router.delete("/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notice(
    notice_id: int, is_admin: bool = True
):  # 실제로는 인증 미들웨어에서 관리자 확인
    """
    공지사항을 삭제합니다. (관리자 권한 필요)
    """
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 공지사항을 삭제할 수 있습니다",
        )

    success = notice_service.delete_notice(notice_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="공지사항을 찾을 수 없습니다"
        )
