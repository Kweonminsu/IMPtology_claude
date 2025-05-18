from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

# Import database utilities
from db_utils import execute_query, get_db_session

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# Define models for request data
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

# Database configuration - replace with your actual database connection details
DB_CONFIG = {
    "user": "your_username",
    "password": "your_password",
    "host": "localhost",
    "database": "imptology"
}

# Tables metadata - similar to the one defined in your JS
TABLES_METADATA = {
    'A': {
        'name': '생산 데이터',
        'table_name': 'production_data',  # Actual database table name
        'columns': ['id', 'date', 'production_amount', 'operation_time'],
        'column_names': ['ID', '날짜', '생산량', '가동 시간'],
        'joinable_columns': {
            'B': ['id']
        }
    },
    'B': {
        'name': '품질 검사',
        'table_name': 'quality_inspection',
        'columns': ['id', 'line_number', 'pass_status', 'defect_type'],
        'column_names': ['ID', '라인번호', '합격여부', '불량유형'],
        'joinable_columns': {
            'A': ['id'],
            'C': ['line_number']
        }
    },
    'C': {
        'name': '설비 상태',
        'table_name': 'equipment_status',
        'columns': ['line_number', 'temperature', 'humidity', 'vibration'],
        'column_names': ['라인번호', '온도', '습도', '진동'],
        'joinable_columns': {
            'B': ['line_number']
        }
    },
    'D': {
        'name': '원자재 정보',
        'table_name': 'raw_material',
        'columns': ['id', 'material_type', 'origin', 'grade'],
        'column_names': ['ID', '원자재 종류', '원산지', '등급'],
        'joinable_columns': {
            'A': ['id']
        }
    }
}

# Database connection helper is removed as we'll use db_utils instead

@router.post("/analyze")
async def analyze_data(request: AnalysisRequest):
    """
    Process data analysis request from frontend
    """
    try:
        logger.info(f"Received analysis request: {request.analysisType}")

        # Validate request
        if not request.tables:
            raise HTTPException(status_code=400, detail="No tables selected")

        # Build SQL query based on request
        query = build_sql_query(request)

        # Execute query and get data
        try:
            df = execute_query(query)
        except SQLAlchemyError as e:
            logger.error(f"SQL execution error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

        # Process data based on analysis type
        result = process_analysis(df, request)

        return {"success": True, "data": result}

    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.exception(f"Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

def build_sql_query(request: AnalysisRequest) -> str:
    """
    Build SQL query based on the request parameters
    """
    selected_tables = request.tables

    # Validate date format
    try:
        datetime.strptime(request.dateRange.start, "%Y-%m-%d")
        datetime.strptime(request.dateRange.end, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Start building the query
    select_clause = []
    from_clause = []
    join_clause = []
    where_clause = [f"date BETWEEN '{request.dateRange.start}' AND '{request.dateRange.end}'"]

    # Add tables to the query
    for i, table_id in enumerate(selected_tables):
        if table_id not in TABLES_METADATA:
            raise HTTPException(status_code=400, detail=f"Invalid table ID: {table_id}")

        table_info = TABLES_METADATA[table_id]
        table_alias = f"t{i}"

        # Add table to FROM clause
        if i == 0:
            from_clause.append(f"{table_info['table_name']} AS {table_alias}")

        # Add columns to SELECT clause
        for col in table_info['columns']:
            select_clause.append(f"{table_alias}.{col} AS {table_id}_{col}")

    # Process join conditions
    if len(selected_tables) > 1:
        if not request.joinConditions:
            raise HTTPException(status_code=400, detail="Join conditions required for multiple tables")

        for join_key, join_info in request.joinConditions.items():
            table1_id = join_info.table1
            table2_id = join_info.table2

            # Find table aliases
            t1_idx = selected_tables.index(table1_id)
            t2_idx = selected_tables.index(table2_id)

            t1_alias = f"t{t1_idx}"
            t2_alias = f"t{t2_idx}"

            # Add join condition
            join_clause.append(
                f"INNER JOIN {TABLES_METADATA[table2_id]['table_name']} AS {t2_alias} "
                f"ON {t1_alias}.{join_info.column1} = {t2_alias}.{join_info.column2}"
            )

    # Process filter conditions
    for filter_info in request.filters:
        table_id = filter_info.tableId
        t_idx = selected_tables.index(table_id)
        t_alias = f"t{t_idx}"

        operator_map = {
            "=": "=",
            "!=": "!=",
            ">": ">",
            "<": "<",
            ">=": ">=",
            "<=": "<=",
            "LIKE": "LIKE",
            "IN": "IN"
        }

        op = operator_map.get(filter_info.operator, "=")

        # Handle different operator types
        if op == "LIKE":
            where_clause.append(f"{t_alias}.{filter_info.column} {op} '%{filter_info.value}%'")
        elif op == "IN":
            values = filter_info.value.split(',')
            formatted_values = ', '.join([f"'{v.strip()}'" for v in values])
            where_clause.append(f"{t_alias}.{filter_info.column} {op} ({formatted_values})")
        else:
            # Try to convert to number if possible
            try:
                value = float(filter_info.value)
                where_clause.append(f"{t_alias}.{filter_info.column} {op} {value}")
            except ValueError:
                where_clause.append(f"{t_alias}.{filter_info.column} {op} '{filter_info.value}'")

    # Compose final query
    query = f"SELECT {', '.join(select_clause)} FROM {' '.join(from_clause)}"

    if join_clause:
        query += f" {' '.join(join_clause)}"

    if where_clause:
        query += f" WHERE {' AND '.join(where_clause)}"

    # Add group by if specified
    if request.groupBy:
        table_id, column = request.groupBy.split('.')
        t_idx = selected_tables.index(table_id)
        t_alias = f"t{t_idx}"
        query += f" GROUP BY {t_alias}.{column}"

    # Add order by for trend analysis
    if request.analysisType == "trend" and request.targetColumn:
        table_id, column = request.targetColumn.split('.')
        if "date" in column.lower():
            t_idx = selected_tables.index(table_id)
            t_alias = f"t{t_idx}"
            query += f" ORDER BY {t_alias}.{column}"

    logger.info(f"Generated SQL query: {query}")
    return query

def process_analysis(df: pd.DataFrame, request: AnalysisRequest) -> Dict[str, Any]:
    """
    Process the data based on the analysis type
    """
    if df.empty:
        return {
            "type": request.analysisType,
            "columns": ["결과"],
            "rows": [["데이터가 없습니다."]]
        }

    if request.analysisType == "summary":
        return process_summary_analysis(df, request)
    elif request.analysisType == "trend":
        return process_trend_analysis(df, request)
    elif request.analysisType == "correlation":
        return process_correlation_analysis(df, request)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported analysis type: {request.analysisType}")

def process_summary_analysis(df: pd.DataFrame, request: AnalysisRequest) -> Dict[str, Any]:
    """
    Process summary analysis
    """
    columns = ["통계항목", "값"]
    rows = []

    # If target column is specified, calculate statistics for that column
    if request.targetColumn:
        table_id, column = request.targetColumn.split('.')
        col_name = f"{table_id}_{column}"

        if col_name in df.columns:
            # Only calculate numeric statistics for numeric columns
            if pd.api.types.is_numeric_dtype(df[col_name]):
                rows = [
                    ["데이터 수", int(df[col_name].count())],
                    ["평균값", float(df[col_name].mean().round(2))],
                    ["최소값", float(df[col_name].min().round(2))],
                    ["최대값", float(df[col_name].max().round(2))],
                    ["합계", float(df[col_name].sum().round(2))],
                    ["표준편차", float(df[col_name].std().round(2))]
                ]
            else:
                # For non-numeric columns, show counts
                rows = [
                    ["데이터 수", int(df[col_name].count())],
                    ["고유값 수", int(df[col_name].nunique())],
                    ["최빈값", str(df[col_name].mode().iloc[0]) if not df[col_name].mode().empty else "N/A"]
                ]

                # Count value frequencies
                value_counts = df[col_name].value_counts().head(5)
                for value, count in value_counts.items():
                    rows.append([f"'{value}' 개수", int(count)])
    else:
        # General dataset statistics
        rows = [
            ["총 레코드 수", len(df)],
            ["선택된 테이블 수", len(request.tables)],
            ["컬럼 수", len(df.columns)]
        ]

    return {
        "type": "summary",
        "columns": columns,
        "rows": rows
    }

def process_trend_analysis(df: pd.DataFrame, request: AnalysisRequest) -> Dict[str, Any]:
    """
    Process trend analysis
    """
    if not request.targetColumn:
        raise HTTPException(status_code=400, detail="Target column required for trend analysis")

    target_table_id, target_column = request.targetColumn.split('.')
    target_col_name = f"{target_table_id}_{target_column}"

    if target_col_name not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column {target_col_name} not found")

    # Find date column
    date_col = None
    for col in df.columns:
        if 'date' in col.lower():
            date_col = col
            break

    if not date_col:
        raise HTTPException(status_code=400, detail="Date column required for trend analysis")

    # Convert to datetime if needed
    if not pd.api.types.is_datetime64_dtype(df[date_col]):
        try:
            df[date_col] = pd.to_datetime(df[date_col])
        except:
            raise HTTPException(status_code=400, detail=f"Unable to convert {date_col} to date format")

    # Group by date if requested
    if request.groupBy:
        group_table_id, group_column = request.groupBy.split('.')
        group_col_name = f"{group_table_id}_{group_column}"

        if group_col_name == date_col:
            # Group by date for trend
            df[date_col] = df[date_col].dt.date
            grouped = df.groupby(date_col)[target_col_name].agg(['mean', 'count'])

            columns = ["날짜", "값", "데이터 수"]
            rows = []

            for date, row in grouped.iterrows():
                rows.append([
                    date.strftime("%Y-%m-%d"),
                    float(row['mean'].round(2)),
                    int(row['count'])
                ])
        else:
            # Group by other column
            df[date_col] = df[date_col].dt.date
            grouped = df.groupby([date_col, group_col_name])[target_col_name].mean().reset_index()

            columns = ["날짜", group_col_name, "값"]
            rows = []

            for _, row in grouped.iterrows():
                rows.append([
                    row[date_col].strftime("%Y-%m-%d"),
                    str(row[group_col_name]),
                    float(row[target_col_name].round(2))
                ])
    else:
        # No grouping, just format dates
        df[date_col] = df[date_col].dt.date

        columns = ["날짜", "값"]
        rows = []

        for _, row in df.iterrows():
            rows.append([
                row[date_col].strftime("%Y-%m-%d"),
                float(row[target_col_name]) if pd.api.types.is_numeric_dtype(df[target_col_name]) else str(row[target_col_name])
            ])

    return {
        "type": "trend",
        "columns": columns,
        "rows": rows
    }

def process_correlation_analysis(df: pd.DataFrame, request: AnalysisRequest) -> Dict[str, Any]:
    """
    Process correlation analysis
    """
    # Get numeric columns only
    numeric_df = df.select_dtypes(include=[np.number])

    if numeric_df.shape[1] < 2:
        raise HTTPException(status_code=400, detail="At least two numeric columns required for correlation analysis")

    # Calculate correlation matrix
    corr_matrix = numeric_df.corr()

    # Prepare response data
    columns = ["변수1", "변수2", "상관계수"]
    rows = []

    # Convert correlation matrix to rows (upper triangle only)
    for i, col1 in enumerate(corr_matrix.columns):
        for j, col2 in enumerate(corr_matrix.columns):
            if i < j:  # Upper triangle only
                corr_value = corr_matrix.iloc[i, j]

                # Get original column names for display
                display_col1 = get_display_column_name(col1)
                display_col2 = get_display_column_name(col2)

                rows.append([
                    display_col1,
                    display_col2,
                    float(corr_value.round(2))
                ])

    # Sort by absolute correlation value (descending)
    rows.sort(key=lambda x: abs(x[2]), reverse=True)

    return {
        "type": "correlation",
        "columns": columns,
        "rows": rows
    }

def get_display_column_name(col_name: str) -> str:
    """
    Convert the technical column name to display name
    Example: A_production_amount -> 생산 데이터 - 생산량
    """
    try:
        parts = col_name.split('_', 1)
        if len(parts) < 2:
            return col_name

        table_id = parts[0]
        column = parts[1]

        if table_id in TABLES_METADATA:
            table_info = TABLES_METADATA[table_id]
            if column in table_info['columns']:
                idx = table_info['columns'].index(column)
                return f"{table_info['name']} - {table_info['column_names'][idx]}"
    except:
        pass

    return col_name