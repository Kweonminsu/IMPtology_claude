from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.schemas.dataset import Dataset, DatasetCreate, DatasetUpdate
from app.schemas.user import User
from app.services.dataset_service import (
    create_dataset,
    get_datasets,
    get_dataset_by_id,
    update_dataset,
    delete_dataset
)

router = APIRouter()


@router.post("/", response_model=Dataset, status_code=status.HTTP_201_CREATED)
async def create_new_dataset(
        dataset_data: DatasetCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    새 데이터셋 생성
    """
    return create_dataset(db, dataset_data, current_user.id)


@router.get("/", response_model=List[Dataset])
async def read_datasets(
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        source: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    데이터셋 목록 조회

    - **category**: 데이터셋 카테고리로 필터링 (선택 사항)
    - **source**: 데이터 소스로 필터링 (선택 사항)
    """
    return get_datasets(db, skip=skip, limit=limit, category=category, source=source)


@router.get("/{dataset_id}", response_model=Dataset)
async def read_dataset(
        dataset_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    특정 데이터셋 조회
    """
    dataset = get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="데이터셋을 찾을 수 없습니다")
    return dataset


@router.put("/{dataset_id}", response_model=Dataset)
async def update_dataset_info(
        dataset_id: int,
        dataset_data: DatasetUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    데이터셋 정보 업데이트
    """
    dataset = get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="데이터셋을 찾을 수 없습니다")

    # 현재 사용자가 데이터셋 소유자이거나 관리자인 경우에만 허용
    if dataset.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    return update_dataset(db, dataset_id, dataset_data)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset_item(
        dataset_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    데이터셋 삭제
    """
    dataset = get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="데이터셋을 찾을 수 없습니다")

    # 현재 사용자가 데이터셋 소유자이거나 관리자인 경우에만 허용
    if dataset.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    delete_dataset(db, dataset_id)
    return None


@router.post("/upload", response_model=Dataset)
async def upload_dataset_file(
        name: str = Query(..., description="데이터셋 이름"),
        description: Optional[str] = Query(None, description="데이터셋 설명"),
        category: str = Query(..., description="데이터셋 카테고리"),
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    데이터셋 파일 업로드
    """
    # 파일 형식 검증
    if not file.filename.endswith(('.csv', '.xlsx', '.json')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원되지 않는 파일 형식입니다. CSV, XLSX, JSON 파일만 지원합니다."
        )

    # 여기서 파일 저장 및 데이터셋 생성 로직 수행
    # 실제 구현에서는 파일을 저장하고 데이터를 처리하는 서비스 함수 호출

    dataset_data = DatasetCreate(
        name=name,
        description=description or "",
        category=category,
        source=file.filename,
        file_path=f"uploads/{file.filename}"  # 실제 파일 저장 경로
    )

    return create_dataset(db, dataset_data, current_user.id)
