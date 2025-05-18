from fastapi import APIRouter, HTTPException, Body, Query
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import random

# from db.database import get_db_connection  # 실제 DB 연결은 주석 처리

# 라우터 초기화
router = APIRouter()


# 요청 모델 정의
class DateRange(BaseModel):
    start: str
    end: str


class JoinCondition(BaseModel):
    table1: str
    table2: str
    column1: str
    column2: str


class FilterCondition(BaseModel):
    id: int
    tableId: str
    column: str
    operator: str
    value: str


class AnalysisRequest(BaseModel):
    tables: List[str]
    dateRange: DateRange
    joinConditions: Dict[str, JoinCondition] = {}
    filters: List[FilterCondition] = []
    analysisType: str
    groupBy: Optional[str] = None
    targetColumn: Optional[str] = None


# 응답 모델 정의
class AnalysisResponse(BaseModel):
    success: bool
    data: Dict[str, Any]


# 테이블 메타데이터 정의 (실제 환경에서는 DB에서 가져올 수 있음)
tables_metadata = {
    "A": {
        "name": "생산 데이터",
        "table_name": "production_data",
        "columns": ["id", "date", "production_amount", "operation_time"],
        "column_names": ["ID", "날짜", "생산량", "가동 시간"],
    },
    "B": {
        "name": "품질 검사",
        "table_name": "quality_check",
        "columns": ["id", "line_number", "pass_status", "defect_type"],
        "column_names": ["ID", "라인번호", "합격여부", "불량유형"],
    },
    "C": {
        "name": "설비 상태",
        "table_name": "equipment_status",
        "columns": ["line_number", "temperature", "humidity", "vibration"],
        "column_names": ["라인번호", "온도", "습도", "진동"],
    },
    "D": {
        "name": "원자재 정보",
        "table_name": "raw_material",
        "columns": ["id", "material_type", "origin", "grade"],
        "column_names": ["ID", "원자재 종류", "원산지", "등급"],
    },
}


@router.post("/", response_model=AnalysisResponse)
async def perform_analysis(request: AnalysisRequest):
    """
    데이터 분석을 수행하는 엔드포인트
    """
    try:
        # 요청 유효성 검증
        if not request.tables:
            raise HTTPException(
                status_code=400, detail="테이블을 하나 이상 선택해야 합니다"
            )

        # 데이터베이스에서 데이터 가져오기
        data = await fetch_data_from_db(request)

        # 분석 유형에 따라 처리
        if request.analysisType == "summary":
            result = process_summary_analysis(data, request)
        elif request.analysisType == "trend":
            result = process_trend_analysis(data, request)
        elif request.analysisType == "correlation":
            result = process_correlation_analysis(data, request)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"지원하지 않는 분석 유형: {request.analysisType}",
            )

        return {"success": True, "data": result}

    except Exception as e:
        return {"success": False, "data": {"error": str(e)}}


async def fetch_data_from_db(request: AnalysisRequest) -> pd.DataFrame:
    """
    샘플 데이터 생성 (실제 DB 연결 대신 사용)
    """
    try:
        # 요청된 테이블 검증
        for table_id in request.tables:
            if table_id not in tables_metadata:
                raise HTTPException(
                    status_code=400, detail=f"유효하지 않은 테이블 ID: {table_id}"
                )

        # 샘플 데이터프레임을 저장할 딕셔너리
        dataframes = {}

        # 시작 날짜와 종료 날짜 파싱
        start_date = datetime.strptime(request.dateRange.start, "%Y-%m-%d")
        end_date = datetime.strptime(request.dateRange.end, "%Y-%m-%d")
        date_range = pd.date_range(start=start_date, end=end_date)

        # 각 테이블별 샘플 데이터 생성
        for i, table_id in enumerate(request.tables):
            table_info = tables_metadata[table_id]
            alias_prefix = f"t{i}_"

            # 데이터프레임 생성에 사용할 컬럼과 데이터 준비
            data = {}

            # 각 컬럼별 데이터 생성
            for col in table_info["columns"]:
                col_alias = f"{alias_prefix}{col}"

                # ID 컬럼
                if col == "id":
                    data[col_alias] = list(range(1, len(date_range) + 1))

                # 날짜 컬럼
                elif col == "date":
                    data[col_alias] = date_range

                # 라인 번호
                elif col == "line_number":
                    data[col_alias] = [
                        random.randint(1, 5) for _ in range(len(date_range))
                    ]

                # 생산량
                elif col == "production_amount":
                    data[col_alias] = [
                        random.randint(500, 1500) for _ in range(len(date_range))
                    ]

                # 가동 시간 (시간)
                elif col == "operation_time":
                    data[col_alias] = [
                        round(random.uniform(6, 12), 1) for _ in range(len(date_range))
                    ]

                # 합격 여부
                elif col == "pass_status":
                    data[col_alias] = [
                        random.choice(["합격", "불합격"])
                        for _ in range(len(date_range))
                    ]

                # 불량 유형
                elif col == "defect_type":
                    defect_types = ["없음", "치수불량", "표면불량", "재질불량", "기타"]
                    data[col_alias] = [
                        random.choice(defect_types) for _ in range(len(date_range))
                    ]

                # 온도 (섭씨)
                elif col == "temperature":
                    data[col_alias] = [
                        round(random.uniform(18, 30), 1) for _ in range(len(date_range))
                    ]

                # 습도 (%)
                elif col == "humidity":
                    data[col_alias] = [
                        round(random.uniform(30, 80), 1) for _ in range(len(date_range))
                    ]

                # 진동
                elif col == "vibration":
                    data[col_alias] = [
                        round(random.uniform(0.1, 1.5), 2)
                        for _ in range(len(date_range))
                    ]

                # 원자재 종류
                elif col == "material_type":
                    material_types = ["A형강", "B형강", "C형강", "알루미늄", "스텐레스"]
                    data[col_alias] = [
                        random.choice(material_types) for _ in range(len(date_range))
                    ]

                # 원산지
                elif col == "origin":
                    origins = ["국내", "중국", "일본", "미국", "유럽"]
                    data[col_alias] = [
                        random.choice(origins) for _ in range(len(date_range))
                    ]

                # 등급
                elif col == "grade":
                    grades = ["1등급", "2등급", "3등급", "4등급", "특등급"]
                    data[col_alias] = [
                        random.choice(grades) for _ in range(len(date_range))
                    ]

                # 그 외 컬럼은 랜덤 값
                else:
                    data[col_alias] = [
                        random.randint(1, 100) for _ in range(len(date_range))
                    ]

            # 테이블별 데이터프레임 생성
            dataframes[table_id] = pd.DataFrame(data)

        # 조인 조건에 따라 데이터프레임 병합
        if len(dataframes) == 0:
            return pd.DataFrame()

        # 첫 번째 테이블을 기준으로 시작
        result_df = dataframes[request.tables[0]]

        # 조인 조건에 따라 데이터프레임 병합
        for join_key, join_info in request.joinConditions.items():
            if join_info.table1 in dataframes and join_info.table2 in dataframes:
                df1 = dataframes[join_info.table1]
                df2 = dataframes[join_info.table2]

                # 조인 컬럼 별칭 구성
                t1_idx = request.tables.index(join_info.table1)
                t2_idx = request.tables.index(join_info.table2)
                col1_alias = f"t{t1_idx}_{join_info.column1}"
                col2_alias = f"t{t2_idx}_{join_info.column2}"

                # 두 데이터프레임이 이미 결과에 병합됐는지 확인
                if col1_alias in result_df.columns:
                    # 첫 번째 테이블은 이미 결과에 있고, 두 번째 테이블만 병합
                    if join_info.table2 != request.tables[0]:
                        # 가상의 조인 (샘플 데이터이므로 단순화)
                        result_df = pd.merge(
                            result_df,
                            df2,
                            left_on=col1_alias,
                            right_on=col2_alias,
                            how="inner",
                        )
                elif col2_alias in result_df.columns:
                    # 두 번째 테이블은 이미 결과에 있고, 첫 번째 테이블만 병합
                    if join_info.table1 != request.tables[0]:
                        # 가상의 조인 (샘플 데이터이므로 단순화)
                        result_df = pd.merge(
                            result_df,
                            df1,
                            left_on=col2_alias,
                            right_on=col1_alias,
                            how="inner",
                        )

        # 필터 조건 적용
        for filter_info in request.filters:
            table_idx = request.tables.index(filter_info.tableId)
            col_alias = f"t{table_idx}_{filter_info.column}"

            if col_alias in result_df.columns:
                if filter_info.operator == "=":
                    result_df = result_df[result_df[col_alias] == filter_info.value]
                elif filter_info.operator == "!=":
                    result_df = result_df[result_df[col_alias] != filter_info.value]
                elif filter_info.operator == ">":
                    result_df = result_df[
                        result_df[col_alias] > float(filter_info.value)
                    ]
                elif filter_info.operator == "<":
                    result_df = result_df[
                        result_df[col_alias] < float(filter_info.value)
                    ]
                elif filter_info.operator == ">=":
                    result_df = result_df[
                        result_df[col_alias] >= float(filter_info.value)
                    ]
                elif filter_info.operator == "<=":
                    result_df = result_df[
                        result_df[col_alias] <= float(filter_info.value)
                    ]
                elif filter_info.operator == "LIKE":
                    result_df = result_df[
                        result_df[col_alias].astype(str).str.contains(filter_info.value)
                    ]
                elif filter_info.operator == "IN":
                    values = [v.strip() for v in filter_info.value.split(",")]
                    result_df = result_df[result_df[col_alias].isin(values)]

        return result_df

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 가져오기 오류: {str(e)}")


def process_summary_analysis(data: pd.DataFrame, request: AnalysisRequest) -> dict:
    """요약 통계 분석 처리"""
    result = {"type": "summary", "columns": ["통계항목", "값"], "rows": []}

    if request.targetColumn:
        # 타겟 컬럼이 지정된 경우 해당 컬럼만 분석
        table_id, column = request.targetColumn.split(".")
        table_idx = request.tables.index(table_id)
        column_alias = f"t{table_idx}_{column}"

        if column_alias in data.columns:
            series = data[column_alias].dropna()

            # 데이터 타입에 따라 적절한 통계 계산
            result["rows"] = [
                ["데이터 수", len(series)],
                [
                    "평균값",
                    (
                        round(series.mean(), 2)
                        if pd.api.types.is_numeric_dtype(series)
                        else "N/A"
                    ),
                ],
                [
                    "최소값",
                    (
                        round(series.min(), 2)
                        if pd.api.types.is_numeric_dtype(series)
                        else series.min()
                    ),
                ],
                [
                    "최대값",
                    (
                        round(series.max(), 2)
                        if pd.api.types.is_numeric_dtype(series)
                        else series.max()
                    ),
                ],
                [
                    "합계",
                    (
                        round(series.sum(), 2)
                        if pd.api.types.is_numeric_dtype(series)
                        else "N/A"
                    ),
                ],
                [
                    "표준편차",
                    (
                        round(series.std(), 2)
                        if pd.api.types.is_numeric_dtype(series)
                        else "N/A"
                    ),
                ],
            ]
    else:
        # 전체 데이터 요약
        result["rows"] = [
            ["데이터 수", len(data)],
            ["컬럼 수", len(data.columns)],
            ["테이블 수", len(request.tables)],
            ["기간", f"{request.dateRange.start} ~ {request.dateRange.end}"],
        ]

    return result


def process_trend_analysis(data: pd.DataFrame, request: AnalysisRequest) -> dict:
    """추세 분석 처리"""
    result = {"type": "trend", "columns": ["날짜", "값"], "rows": []}

    if not request.targetColumn:
        raise HTTPException(
            status_code=400, detail="추세 분석에는 타겟 컬럼이 필요합니다"
        )

    table_id, column = request.targetColumn.split(".")
    table_idx = request.tables.index(table_id)
    column_alias = f"t{table_idx}_{column}"

    # 날짜 컬럼 찾기
    date_column = None
    for tid in request.tables:
        if "date" in tables_metadata[tid]["columns"]:
            t_idx = request.tables.index(tid)
            date_col_idx = tables_metadata[tid]["columns"].index("date")
            date_column = f"t{t_idx}_{tables_metadata[tid]['columns'][date_col_idx]}"
            break

    if not date_column or date_column not in data.columns:
        raise HTTPException(status_code=400, detail="날짜 컬럼을 찾을 수 없습니다")

    if column_alias not in data.columns:
        raise HTTPException(
            status_code=400, detail=f"컬럼을 찾을 수 없습니다: {request.targetColumn}"
        )

    # 날짜별 그룹화
    data[date_column] = pd.to_datetime(data[date_column])
    grouped = data.groupby(pd.Grouper(key=date_column, freq="D"))

    # 그룹별 평균 계산
    for date, group in grouped:
        if len(group) > 0:
            avg_value = group[column_alias].mean()
            if pd.notna(avg_value):
                result["rows"].append([date.strftime("%Y-%m-%d"), round(avg_value, 2)])

    # 날짜순 정렬
    result["rows"].sort(key=lambda x: x[0])

    return result


def process_correlation_analysis(data: pd.DataFrame, request: AnalysisRequest) -> dict:
    """상관관계 분석 처리"""
    result = {
        "type": "correlation",
        "columns": ["변수1", "변수2", "상관계수"],
        "rows": [],
    }

    # 숫자형 컬럼만 필터링
    numeric_columns = data.select_dtypes(include=[np.number]).columns.tolist()

    if len(numeric_columns) < 2:
        raise HTTPException(
            status_code=400, detail="상관관계 분석을 위한 숫자형 컬럼이 부족합니다"
        )

    # 상관관계 계산
    corr_matrix = data[numeric_columns].corr()

    # 결과 포맷팅 (대각선 위쪽 값만 사용)
    for i in range(len(numeric_columns)):
        for j in range(i + 1, len(numeric_columns)):
            col1 = numeric_columns[i]
            col2 = numeric_columns[j]
            # 컬럼 표시 이름 찾기
            col1_display = get_column_display_name(col1, request.tables)
            col2_display = get_column_display_name(col2, request.tables)
            corr_value = corr_matrix.iloc[i, j]

            if not pd.isna(corr_value):
                result["rows"].append(
                    [col1_display, col2_display, round(corr_value, 2)]
                )

    # 상관계수 절댓값 기준으로 내림차순 정렬
    result["rows"].sort(key=lambda x: abs(x[2]), reverse=True)

    return result


def get_column_display_name(column_alias: str, table_ids: List[str]) -> str:
    """컬럼 표시 이름을 반환"""
    # 컬럼 별칭 형식: t{table_index}_{column_name}
    parts = column_alias.split("_", 1)
    if len(parts) != 2 or not parts[0].startswith("t"):
        return column_alias

    table_idx = int(parts[0][1:])
    column_name = parts[1]

    if table_idx >= len(table_ids):
        return column_alias

    table_id = table_ids[table_idx]
    table_info = tables_metadata.get(table_id)

    if not table_info or column_name not in table_info["columns"]:
        return column_alias

    col_idx = table_info["columns"].index(column_name)
    return f"{table_info['name']} - {table_info['column_names'][col_idx]}"
