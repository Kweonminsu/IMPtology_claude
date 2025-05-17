from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import (
    create_engine,
    inspect,
    text,
    Table,
    MetaData,
    select,
    and_,
    or_,
    not_,
    column,
)
from sqlalchemy.sql import operators
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import random
import json

# CORS 미들웨어 추가 (최상단에 추가)
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()

# 데이터베이스 연결 설정
# 주석: 실제 환경에서는 아래 코드를 환경에 맞게 수정하세요.
# SQLite 대신 PostgreSQL, MySQL 등을 사용하려면 아래 URL을 변경하면 됩니다.
# PostgreSQL 예: postgresql://username:password@localhost:5432/dbname
# MySQL 예: mysql+pymysql://username:password@localhost:3306/dbname
DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL)
metadata = MetaData()


# 모델 정의
class Column(BaseModel):
    name: str
    type: str
    description: str
    nullable: bool


class Table(BaseModel):
    id: int
    name: str
    displayName: str
    category: str
    description: str
    updateCycle: str
    admin: str
    recordCount: int
    createdDate: str
    lastUpdate: str
    columns: List[Column]


class FilterCondition(BaseModel):
    column: str
    operator: str
    value: Optional[str] = None


class QueryRequest(BaseModel):
    table: str
    columns: List[str]
    filters: List[FilterCondition] = []
    page: int = 1
    pageSize: int = 20


class QueryResponse(BaseModel):
    data: List[Dict[str, Any]]
    total: int
    page: int
    pageSize: int


# 샘플 테이블 데이터
sample_tables = [
    {
        "id": 1,
        "name": "production_history",
        "displayName": "생산 이력",
        "category": "production",
        "description": "공장에서 생산된 제품의 이력을 저장하는 테이블입니다. 설비별, 라인별, 제품별 생산량 및 불량률 등의 생산 관련 데이터를 포함합니다.",
        "updateCycle": "실시간",
        "admin": "생산관리팀",
        "recordCount": 1287654,
        "createdDate": "2023-04-15",
        "lastUpdate": "2025-05-03",
        "columns": [
            {
                "name": "production_id",
                "type": "BIGINT",
                "description": "생산 이력 고유 ID",
                "nullable": False,
            },
            {
                "name": "factory_id",
                "type": "INT",
                "description": "제조 공장 ID",
                "nullable": False,
            },
            {
                "name": "line_id",
                "type": "INT",
                "description": "생산 라인 ID",
                "nullable": False,
            },
            {
                "name": "product_id",
                "type": "INT",
                "description": "제품 ID",
                "nullable": False,
            },
            {
                "name": "quantity",
                "type": "INT",
                "description": "생산 수량",
                "nullable": False,
            },
            {
                "name": "defect_rate",
                "type": "DECIMAL(5,2)",
                "description": "불량률 (%)",
                "nullable": True,
            },
            {
                "name": "production_date",
                "type": "DATE",
                "description": "생산일자",
                "nullable": False,
            },
            {
                "name": "operator_id",
                "type": "INT",
                "description": "작업자 ID",
                "nullable": True,
            },
        ],
    },
    {
        "id": 2,
        "name": "quality_inspection",
        "displayName": "품질 검사",
        "category": "quality",
        "description": "제품의 품질 검사 결과를 저장하는 테이블입니다. 각종 품질 지표와 검사 결과 데이터를 포함합니다.",
        "updateCycle": "일 1회",
        "admin": "품질관리팀",
        "recordCount": 354982,
        "createdDate": "2023-05-22",
        "lastUpdate": "2025-05-02",
        "columns": [
            {
                "name": "inspection_id",
                "type": "BIGINT",
                "description": "검사 고유 ID",
                "nullable": False,
            },
            {
                "name": "production_id",
                "type": "BIGINT",
                "description": "생산 이력 ID",
                "nullable": False,
            },
            {
                "name": "inspector_id",
                "type": "INT",
                "description": "검사원 ID",
                "nullable": False,
            },
            {
                "name": "inspection_date",
                "type": "DATETIME",
                "description": "검사 일시",
                "nullable": False,
            },
            {
                "name": "result",
                "type": "VARCHAR(20)",
                "description": "검사 결과 (합격/불합격)",
                "nullable": False,
            },
            {
                "name": "defect_type",
                "type": "VARCHAR(50)",
                "description": "불량 유형",
                "nullable": True,
            },
            {
                "name": "remarks",
                "type": "TEXT",
                "description": "비고",
                "nullable": True,
            },
        ],
    },
    {
        "id": 3,
        "name": "equipment_maintenance",
        "displayName": "설비 유지보수",
        "category": "maintenance",
        "description": "설비 유지보수 기록을 관리하는 테이블입니다. 정기 점검, 수리, 교체 등의 유지보수 활동 데이터를 포함합니다.",
        "updateCycle": "수시",
        "admin": "설비관리팀",
        "recordCount": 78541,
        "createdDate": "2023-06-10",
        "lastUpdate": "2025-05-04",
        "columns": [
            {
                "name": "maintenance_id",
                "type": "BIGINT",
                "description": "유지보수 고유 ID",
                "nullable": False,
            },
            {
                "name": "equipment_id",
                "type": "INT",
                "description": "설비 ID",
                "nullable": False,
            },
            {
                "name": "maintenance_type",
                "type": "VARCHAR(30)",
                "description": "유지보수 유형 (정기점검/고장수리/부품교체)",
                "nullable": False,
            },
            {
                "name": "start_date",
                "type": "DATETIME",
                "description": "시작 일시",
                "nullable": False,
            },
            {
                "name": "end_date",
                "type": "DATETIME",
                "description": "종료 일시",
                "nullable": True,
            },
            {
                "name": "technician_id",
                "type": "INT",
                "description": "작업자 ID",
                "nullable": False,
            },
            {
                "name": "cost",
                "type": "DECIMAL(10,2)",
                "description": "비용",
                "nullable": True,
            },
            {
                "name": "status",
                "type": "VARCHAR(20)",
                "description": "상태 (계획/진행중/완료)",
                "nullable": False,
            },
            {
                "name": "description",
                "type": "TEXT",
                "description": "작업 내용",
                "nullable": True,
            },
        ],
    },
    {
        "id": 4,
        "name": "energy_consumption",
        "displayName": "에너지 사용량",
        "category": "energy",
        "description": "공장과 설비별 에너지 사용량을 기록하는 테이블입니다. 전기, 가스, 물 등의 에너지 소비 데이터를 포함합니다.",
        "updateCycle": "시간별",
        "admin": "시설관리팀",
        "recordCount": 6251478,
        "createdDate": "2023-07-05",
        "lastUpdate": "2025-05-04",
        "columns": [
            {
                "name": "consumption_id",
                "type": "BIGINT",
                "description": "사용량 기록 ID",
                "nullable": False,
            },
            {
                "name": "factory_id",
                "type": "INT",
                "description": "공장 ID",
                "nullable": False,
            },
            {
                "name": "equipment_id",
                "type": "INT",
                "description": "설비 ID",
                "nullable": True,
            },
            {
                "name": "energy_type",
                "type": "VARCHAR(20)",
                "description": "에너지 유형 (전기/가스/수도)",
                "nullable": False,
            },
            {
                "name": "consumption",
                "type": "DECIMAL(10,2)",
                "description": "사용량",
                "nullable": False,
            },
            {
                "name": "unit",
                "type": "VARCHAR(10)",
                "description": "단위 (kWh/m³)",
                "nullable": False,
            },
            {
                "name": "cost",
                "type": "DECIMAL(10,2)",
                "description": "비용",
                "nullable": True,
            },
            {
                "name": "timestamp",
                "type": "DATETIME",
                "description": "측정 시간",
                "nullable": False,
            },
        ],
    },
]


# 샘플 데이터 생성 함수
def generate_sample_data(table_name, columns, page, page_size, filters=None):
    """
    지정된 테이블과 컬럼에 대한 샘플 데이터를 생성합니다.
    실제 구현에서는 이 함수 대신 데이터베이스 쿼리를 사용해야 합니다.

    Args:
        table_name: 테이블 이름
        columns: 요청된 컬럼 목록
        page: 페이지 번호
        page_size: 페이지 크기
        filters: 필터 조건 목록

    Returns:
        data: 샘플 데이터 목록
        total: 총 레코드 수
    """
    # 테이블별 데이터 생성 함수 정의
    data_generators = {
        "production_history": generate_production_data,
        "quality_inspection": generate_quality_data,
        "equipment_maintenance": generate_maintenance_data,
        "energy_consumption": generate_energy_data,
    }

    # 지정된 테이블에 대한 생성 함수 사용
    if table_name in data_generators:
        total = random.randint(100, 1000)  # 실제 구현에서는 COUNT 쿼리 결과
        data = data_generators[table_name](columns, page, page_size)
        return data, total
    else:
        return [], 0


def generate_production_data(columns, page, page_size):
    """생산 이력 테이블 샘플 데이터 생성"""
    data = []
    for i in range((page - 1) * page_size, page * page_size):
        row = {}
        for col in columns:
            if col == "production_id":
                row[col] = i + 1
            elif col == "factory_id":
                row[col] = random.randint(1, 5)
            elif col == "line_id":
                row[col] = random.randint(1, 10)
            elif col == "product_id":
                row[col] = random.randint(100, 500)
            elif col == "quantity":
                row[col] = random.randint(1000, 10000)
            elif col == "defect_rate":
                row[col] = round(random.uniform(0.1, 5.0), 2)
            elif col == "production_date":
                row[col] = (
                    f"2025-{random.randint(1, 5):02d}-{random.randint(1, 28):02d}"
                )
            elif col == "operator_id":
                row[col] = random.randint(1, 50)
        data.append(row)
    return data


def generate_quality_data(columns, page, page_size):
    """품질 검사 테이블 샘플 데이터 생성"""
    data = []
    for i in range((page - 1) * page_size, page * page_size):
        row = {}
        for col in columns:
            if col == "inspection_id":
                row[col] = i + 1
            elif col == "production_id":
                row[col] = random.randint(1, 1000)
            elif col == "inspector_id":
                row[col] = random.randint(1, 20)
            elif col == "inspection_date":
                row[col] = (
                    f"2025-{random.randint(1, 5):02d}-{random.randint(1, 28):02d} {random.randint(8, 18):02d}:{random.randint(0, 59):02d}:00"
                )
            elif col == "result":
                row[col] = random.choice(["합격", "불합격", "조건부 합격"])
            elif col == "defect_type":
                if random.random() < 0.3:  # 30% 확률로 불량 발생
                    row[col] = random.choice(
                        [
                            "치수 불량",
                            "표면 결함",
                            "기능 불량",
                            "재질 불량",
                            "조립 불량",
                        ]
                    )
                else:
                    row[col] = None
            elif col == "remarks":
                if random.random() < 0.2:  # 20% 확률로 비고 추가
                    row[col] = "품질 표준 재검토 필요"
                else:
                    row[col] = None
        data.append(row)
    return data


def generate_maintenance_data(columns, page, page_size):
    """설비 유지보수 테이블 샘플 데이터 생성"""
    data = []
    maintenance_types = ["정기점검", "고장수리", "부품교체"]
    status_types = ["계획", "진행중", "완료"]

    for i in range((page - 1) * page_size, page * page_size):
        row = {}
        maintenance_type = random.choice(maintenance_types)
        for col in columns:
            if col == "maintenance_id":
                row[col] = i + 1
            elif col == "equipment_id":
                row[col] = random.randint(1, 100)
            elif col == "maintenance_type":
                row[col] = maintenance_type
            elif col == "start_date":
                row[col] = (
                    f"2025-{random.randint(1, 5):02d}-{random.randint(1, 28):02d} {random.randint(8, 18):02d}:{random.randint(0, 59):02d}:00"
                )
            elif col == "end_date":
                if random.random() < 0.8:  # 80% 확률로 종료일 존재
                    row[col] = (
                        f"2025-{random.randint(1, 5):02d}-{random.randint(1, 28):02d} {random.randint(8, 18):02d}:{random.randint(0, 59):02d}:00"
                    )
                else:
                    row[col] = None
            elif col == "technician_id":
                row[col] = random.randint(1, 30)
            elif col == "cost":
                if maintenance_type == "정기점검":
                    row[col] = round(random.uniform(100000, 500000), 2)
                elif maintenance_type == "고장수리":
                    row[col] = round(random.uniform(500000, 2000000), 2)
                else:  # 부품교체
                    row[col] = round(random.uniform(300000, 1500000), 2)
            elif col == "status":
                row[col] = random.choice(status_types)
            elif col == "description":
                descriptions = {
                    "정기점검": "월간 정기 점검 및 청소 작업",
                    "고장수리": "모터 과열로 인한 긴급 수리",
                    "부품교체": "베어링 마모로 인한 교체 작업",
                }
                row[col] = descriptions.get(maintenance_type, "유지보수 작업")
        data.append(row)
    return data


def generate_energy_data(columns, page, page_size):
    """에너지 사용량 테이블 샘플 데이터 생성"""
    data = []
    energy_types = ["전기", "가스", "수도"]
    units = {"전기": "kWh", "가스": "m³", "수도": "m³"}

    for i in range((page - 1) * page_size, page * page_size):
        row = {}
        energy_type = random.choice(energy_types)
        for col in columns:
            if col == "consumption_id":
                row[col] = i + 1
            elif col == "factory_id":
                row[col] = random.randint(1, 5)
            elif col == "equipment_id":
                if random.random() < 0.7:  # 70% 확률로 설비 ID 존재
                    row[col] = random.randint(1, 100)
                else:
                    row[col] = None  # 전체 공장 사용량
            elif col == "energy_type":
                row[col] = energy_type
            elif col == "consumption":
                if energy_type == "전기":
                    row[col] = round(random.uniform(1000, 50000), 2)
                elif energy_type == "가스":
                    row[col] = round(random.uniform(100, 5000), 2)
                else:  # 수도
                    row[col] = round(random.uniform(50, 2000), 2)
            elif col == "unit":
                row[col] = units[energy_type]
            elif col == "cost":
                consumption = row.get("consumption", 0)
                if energy_type == "전기":
                    row[col] = round(consumption * random.uniform(100, 120), 2)
                elif energy_type == "가스":
                    row[col] = round(consumption * random.uniform(800, 1000), 2)
                else:  # 수도
                    row[col] = round(consumption * random.uniform(600, 800), 2)
            elif col == "timestamp":
                row[col] = (
                    f"2025-{random.randint(1, 5):02d}-{random.randint(1, 28):02d} {random.randint(0, 23):02d}:00:00"
                )
        data.append(row)
    return data


# 테이블 목록 조회 엔드포인트
@router.get("/tables", response_model=List[Table])
async def get_tables():
    """
    데이터베이스의 모든 테이블 정보를 반환합니다.
    실제 구현에서는 데이터베이스에서 테이블 정보를 가져와야 합니다.
    """
    # 샘플 데이터 사용
    return sample_tables


# 데이터 쿼리 엔드포인트 << 실제 반영 예정.
@router.post("/query", response_model=QueryResponse)
async def query_data(request: QueryRequest):
    """
    테이블 데이터를 쿼리하고 결과를 반환합니다.

    실제 구현 시 주의사항:
    1. 여기서는 샘플 데이터를 사용하지만, 실제로는 DB 쿼리를 실행해야 합니다.
    2. 필터 조건은 SQL WHERE 절에 반영되어야 합니다.
    3. 페이지네이션은 LIMIT/OFFSET으로 구현합니다.
    """
    try:
        # 샘플 데이터 사용
        data, total = generate_sample_data(
            request.table,
            request.columns,
            request.page,
            request.pageSize,
            request.filters,
        )

        # 실제 구현에서는 아래 주석된 코드와 유사하게 구현해야 합니다.
        """
        # 테이블 존재 여부 확인
        inspector = inspect(engine)
        if not inspector.has_table(request.table):
            raise HTTPException(status_code=404, detail=f"테이블 '{request.table}'을 찾을 수 없습니다.")

        # 메타데이터 로드 및 테이블 참조
        metadata = MetaData()
        table = Table(request.table, metadata, autoload_with=engine)

        # 컬럼 유효성 검사
        table_columns = [c.name for c in table.columns]
        for col in request.columns:
            if col not in table_columns:
                raise HTTPException(status_code=400, detail=f"컬럼 '{col}'이 테이블에 존재하지 않습니다.")

        # 쿼리 생성
        query = select([column(c) for c in request.columns])
        query = query.select_from(table)

        # 필터 조건 적용
        filter_conditions = []
        for filter_condition in request.filters:
            col_name = filter_condition.column
            if col_name not in table_columns:
                continue

            col = column(col_name)
            op = filter_condition.operator
            val = filter_condition.value

            # NULL 조건 처리
            if op == 'isnull':
                filter_conditions.append(col.is_(None))
                continue
            elif op == 'isnotnull':
                filter_conditions.append(col.isnot(None))
                continue

            # 값이 필요한 연산자인데 값이 없으면 스킵
            if val is None:
                continue

            # 연산자에 따른 조건 생성
            if op == 'eq':
                filter_conditions.append(col == val)
            elif op == 'neq':
                filter_conditions.append(col != val)
            elif op == 'gt':
                filter_conditions.append(col > val)
            elif op == 'gte':
                filter_conditions.append(col >= val)
            elif op == 'lt':
                filter_conditions.append(col < val)
            elif op == 'lte':
                filter_conditions.append(col <= val)
            elif op == 'contains':
                filter_conditions.append(col.like(f"%{val}%"))
            elif op == 'startswith':
                filter_conditions.append(col.like(f"{val}%"))
            elif op == 'endswith':
                filter_conditions.append(col.like(f"%{val}"))

        # 필터 조건 적용
        if filter_conditions:
            query = query.where(and_(*filter_conditions))

        # 전체 레코드 수 쿼리
        count_query = select([text("COUNT(*)")])
        count_query = count_query.select_from(table)
        if filter_conditions:
            count_query = count_query.where(and_(*filter_conditions))

        with engine.connect() as conn:
            total_count = conn.execute(count_query).scalar()

        # 페이지네이션 적용
        offset_val = (request.page - 1) * request.pageSize
        query = query.offset(offset_val).limit(request.pageSize)

        # 쿼리 실행
        with engine.connect() as conn:
            result = conn.execute(query)
            rows = [dict(row) for row in result]

        data = rows
        total = total_count
        """

        # 결과 반환
        return {
            "data": data,
            "total": total,
            "page": request.page,
            "pageSize": request.pageSize,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 샘플 데이터 엔드포인트 수정
@router.get("/sample/{table_name}")
async def get_sample_data(table_name: str):
    try:
        # 테이블 존재 여부 확인
        table = next((t for t in sample_tables if t["name"] == table_name), None)
        if not table:
            raise HTTPException(
                status_code=404, detail=f"테이블 '{table_name}'을 찾을 수 없습니다."
            )

        # 테이블의 모든 컬럼 가져오기
        columns = [col["name"] for col in table["columns"]]

        # 샘플 데이터 5개 생성
        data = generate_sample_data(table_name, columns, 1, 5)[0]

        return {"table": table["displayName"], "columns": columns, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
