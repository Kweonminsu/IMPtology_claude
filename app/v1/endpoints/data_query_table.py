from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional

# 라우터 정의
router = APIRouter()

# 샘플 테이블 데이터 - 나중에 DB 연결 시 이 부분만 변경하면 됨
SAMPLE_TABLES = [
    {
        "id": 1,
        "name": "production_history",
        "displayName": "샘플1",
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
                "type": "VARCHAR(20)",
                "description": "제품 코드",
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
                "name": "start_time",
                "type": "TIMESTAMP",
                "description": "생산 시작 시간",
                "nullable": False,
            },
            {
                "name": "end_time",
                "type": "TIMESTAMP",
                "description": "생산 종료 시간",
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
        "id": 1,
        "name": "production_history",
        "displayName": "샘플2",
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
                "type": "VARCHAR(20)",
                "description": "제품 코드",
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
                "name": "start_time",
                "type": "TIMESTAMP",
                "description": "생산 시작 시간",
                "nullable": False,
            },
            {
                "name": "end_time",
                "type": "TIMESTAMP",
                "description": "생산 종료 시간",
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
    # 나머지 테이블 데이터는 data_browser_tables.js에서 복사해서 추가
]


@router.get("/tables")
async def get_all_tables() -> List[Dict[str, Any]]:
    """
    모든 테이블 목록을 반환합니다.

    Returns:
        List[Dict]: 테이블 정보 목록

    # DB 연결 시 변경할 코드 예시:
    # async def get_all_tables():
    #     async with db_session() as session:
    #         query = select(Table)
    #         result = await session.execute(query)
    #         tables = result.scalars().all()
    #         return [table.to_dict() for table in tables]
    """
    return SAMPLE_TABLES


@router.get("/tables/{table_id}")
async def get_table_by_id(table_id: int) -> Dict[str, Any]:
    """
    특정 ID의 테이블 정보를 반환합니다.

    Args:
        table_id (int): 조회할 테이블의 ID

    Returns:
        Dict: 테이블 정보

    Raises:
        HTTPException: 테이블을 찾을 수 없는 경우

    # DB 연결 시 변경할 코드 예시:
    # async def get_table_by_id(table_id: int):
    #     async with db_session() as session:
    #         query = select(Table).where(Table.id == table_id)
    #         result = await session.execute(query)
    #         table = result.scalar_one_or_none()
    #
    #         if not table:
    #             raise HTTPException(status_code=404, detail=f"테이블 ID {table_id}를 찾을 수 없습니다")
    #
    #         return table.to_dict()
    """
    for table in SAMPLE_TABLES:
        if table["id"] == table_id:
            return table

    raise HTTPException(
        status_code=404, detail=f"테이블 ID {table_id}를 찾을 수 없습니다"
    )


@router.get("/tables/search")
async def search_tables(query: str) -> List[Dict[str, Any]]:
    """
    검색어를 포함하는 테이블 목록을 반환합니다.

    Args:
        query (str): 검색어

    Returns:
        List[Dict]: 검색 결과 테이블 목록

    # DB 연결 시 변경할 코드 예시:
    # async def search_tables(query: str):
    #     query_lower = query.lower()
    #     async with db_session() as session:
    #         search_query = select(Table).where(
    #             or_(
    #                 Table.name.ilike(f"%{query_lower}%"),
    #                 Table.display_name.ilike(f"%{query_lower}%"),
    #                 Table.description.ilike(f"%{query_lower}%")
    #             )
    #         )
    #         result = await session.execute(search_query)
    #         tables = result.scalars().all()
    #         return [table.to_dict() for table in tables]
    """
    query = query.lower()
    return [
        table
        for table in SAMPLE_TABLES
        if (
            query in table["name"].lower()
            or query in table["displayName"].lower()
            or query in table["description"].lower()
        )
    ]
