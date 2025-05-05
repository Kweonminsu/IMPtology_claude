# from typing import List, Optional
# from datetime import datetime
#
# from fastapi import APIRouter, Depends, HTTPException, Query, status
# from sqlalchemy.orm import Session
#
# from app.core.security import get_current_active_user
# from app.db.session import get_db
# from app.schemas.report import Report, ReportCreate, ReportUpdate, ScheduledReport
# from app.schemas.user import User
# from app.services.report_service import (
#     create_report,
#     get_reports,
#     get_report_by_id,
#     update_report,
#     delete_report,
#     create_scheduled_report,
#     get_scheduled_reports,
#     delete_scheduled_report,
# )
#
# router = APIRouter()
#
#
# @router.post("/", response_model=Report, status_code=status.HTTP_201_CREATED)
# async def create_new_report(
#     report_data: ReportCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     새 리포트 생성
#     """
#     return create_report(db, report_data, current_user.id)
#
#
# @router.get("/", response_model=List[Report])
# async def read_reports(
#     skip: int = 0,
#     limit: int = 100,
#     category: Optional[str] = None,
#     start_date: Optional[datetime] = None,
#     end_date: Optional[datetime] = None,
#     shared: Optional[bool] = None,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     리포트 목록 조회
#
#     - **category**: 리포트 카테고리로 필터링 (선택 사항)
#     - **start_date**: 시작 날짜로 필터링 (선택 사항)
#     - **end_date**: 종료 날짜로 필터링 (선택 사항)
#     - **shared**: 공유된 리포트만 조회 (선택 사항)
#     """
#     return get_reports(
#         db,
#         skip=skip,
#         limit=limit,
#         category=category,
#         start_date=start_date,
#         end_date=end_date,
#         shared=shared,
#         user_id=current_user.id,
#     )
#
#
# @router.get("/{report_id}", response_model=Report)
# async def read_report(
#     report_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     특정 리포트 조회
#     """
#     report = get_report_by_id(db, report_id)
#     if report is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="리포트를 찾을 수 없습니다"
#         )
#
#     # 비공개 리포트인 경우 소유자만 접근 가능
#     if (
#         not report.is_public
#         and report.owner_id != current_user.id
#         and not current_user.is_superuser
#     ):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="이 리포트에 접근할 권한이 없습니다",
#         )
#
#     return report
#
#
# @router.put("/{report_id}", response_model=Report)
# async def update_report_info(
#     report_id: int,
#     report_data: ReportUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     리포트 정보 업데이트
#     """
#     report = get_report_by_id(db, report_id)
#     if report is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="리포트를 찾을 수 없습니다"
#         )
#
#     # 현재 사용자가 리포트 소유자이거나 관리자인 경우에만 허용
#     if report.owner_id != current_user.id and not current_user.is_superuser:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다"
#         )
#
#     return update_report(db, report_id, report_data)
#
#
# @router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_report_item(
#     report_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     리포트 삭제
#     """
#     report = get_report_by_id(db, report_id)
#     if report is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="리포트를 찾을 수 없습니다"
#         )
#
#     # 현재 사용자가 리포트 소유자이거나 관리자인 경우에만 허용
#     if report.owner_id != current_user.id and not current_user.is_superuser:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다"
#         )
#
#     delete_report(db, report_id)
#     return None
#
#
# @router.post("/schedule", response_model=ScheduledReport)
# async def schedule_report(
#     report_id: int,
#     frequency: str = Query(..., description="반복 주기 (daily, weekly, monthly)"),
#     recipients: List[str] = Query(..., description="수신자 이메일 목록"),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     리포트 예약 생성
#
#     - **report_id**: 예약할 리포트 ID
#     - **frequency**: 반복 주기 (daily, weekly, monthly)
#     - **recipients**: 수신자 이메일 목록
#     """
#     report = get_report_by_id(db, report_id)
#     if report is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="리포트를 찾을 수 없습니다"
#         )
#
#     # 현재 사용자가 리포트 소유자이거나 관리자인 경우에만 허용
#     if report.owner_id != current_user.id and not current_user.is_superuser:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다"
#         )
#
#     return create_scheduled_report(
#         db, report_id, frequency, recipients, current_user.id
#     )
#
#
# @router.get("/schedule/all", response_model=List[ScheduledReport])
# async def get_scheduled_report_list(
#     db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
# ):
#     """
#     예약된 리포트 목록 조회
#     """
#     return get_scheduled_reports(db, current_user.id)
#
#
# @router.delete("/schedule/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_scheduled_report_item(
#     schedule_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_active_user),
# ):
#     """
#     예약된 리포트 삭제
#     """
#     delete_scheduled_report(db, schedule_id, current_user.id)
#     return None
