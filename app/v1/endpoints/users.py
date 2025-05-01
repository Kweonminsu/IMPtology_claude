from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user, get_current_superuser
from app.db.session import get_db
from app.schemas.user import User, UserCreate, UserUpdate, UserInDB
from app.services.user_service import create_user, get_users, get_user_by_id, update_user, delete_user

router = APIRouter()


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_new_user(
        user_data: UserCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_superuser)
):
    """
    새 사용자 생성 (관리자 권한 필요)
    """
    return create_user(db, user_data)


@router.get("/", response_model=List[User])
async def read_users(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    사용자 목록 조회
    """
    return get_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=User)
async def read_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    특정 사용자 정보 조회
    """
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다")
    return user


@router.put("/{user_id}", response_model=User)
async def update_user_info(
        user_id: int,
        user_data: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    사용자 정보 업데이트
    """
    # 현재 사용자가 자신의 정보를 수정하거나 관리자인 경우에만 허용
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    return update_user(db, user_id, user_data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_superuser)
):
    """
    사용자 계정 삭제 (관리자 권한 필요)
    """
    delete_user(db, user_id)
    return None
