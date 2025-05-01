from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.schemas.insight import Insight, InsightCreate, InsightUpdate
from app.schemas.user import User
from app.services.insight_service import (
    create_insight,
    get_insights,
    get_insight_by_id,
    update_insight,
    delete_insight,
    generate_auto_insights
)

router = APIRouter()


@router.post("/", response_model=Insight, status_code=status.HTTP_201_CREATED)
async def create_new_insight(
        insight_data: InsightCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    새 인사이트 생성
    """
    return create_insight(db, insight_data, current_user.id)


@router.get("/", response_model=List[Insight])
async def read_insights(
        skip: int = 0,
        limit: int = 100,
        dataset_id: Optional[int] = None,
        category: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    인사이트 목록 조회

    - **dataset_id**: 데이터셋 ID로 필터링 (선택 사항)
    - **category**: 인사이트 카테고리로 필터링 (선택 사항)
    """
    return get_insights(db, skip=skip, limit=limit, dataset_id=dataset_id, category=category)


@router.get("/{insight_id}", response_model=Insight)
async def read_insight(
        insight_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    특정 인사이트 조회
    """
    insight = get_insight_by_id(db, insight_id)
    if insight is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="인사이트를 찾을 수 없습니다")
    return insight


@router.put("/{insight_id}", response_model=Insight)
async def update_insight_info(
        insight_id: int,
        insight_data: InsightUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    인사이트 정보 업데이트
    """
    insight = get_insight_by_id(db, insight_id)
    if insight is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="인사이트를 찾을 수 없습니다")

    # 현재 사용자가 인사이트 소유자이거나 관리자인 경우에만 허용
    if insight.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    return update_insight(db, insight_id, insight_data)


@router.delete("/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insight_item(
        insight_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    인사이트 삭제
    """
    insight = get_insight_by_id(db, insight_id)
    if insight is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="인사이트를 찾을 수 없습니다")

    # 현재 사용자가 인사이트 소유자이거나 관리자인 경우에만 허용
    if insight.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다")

    delete_insight(db, insight_id)
    return None


@router.post("/generate", response_model=List[Insight])
async def generate_insights(
        dataset_id: int,
        analysis_type: str = Query(..., description="분석 유형 (correlation, trend, anomaly, prediction)"),
        params: Optional[dict] = None,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
):
    """
    데이터셋에서 자동으로 인사이트 생성

    - **dataset_id**: 인사이트를 생성할 데이터셋 ID
    - **analysis_type**: 분석 유형 (correlation, trend, anomaly, prediction)
    - **params**: 분석 파라미터 (선택 사항)
    """
    return generate_auto_insights(db, dataset_id, analysis_type, params, current_user.id)
