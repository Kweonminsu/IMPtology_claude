from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

# 기존 임포트 아래에 추가

# 라우터 추가
# API 라우터 임포트
from app.v1.endpoints import (
    auth,
    users,
    datasets,
    insights,
    reports,
    notices,
    datasets,
    data_browser_query,
    data_browser_table,
)
from app.core.config import settings

# from app.v1.endpoints import notices

# FastAPI 앱 초기화
app = FastAPI(
    # title=settings.PROJECT_NAME,
    title="IMPtology",
    description="데이터 온톨로지 기반 의사결정 플랫폼",
    version="1.0.0",
)

# 정적 파일 디렉토리 마운트
app.mount(
    "/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static"
)

# 템플릿 초기화
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")
# 기존 라우터 import 아래에 추가


# FastAPI 앱 생성 후 라우터 등록
# API 라우터 포함
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["인증"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["사용자"])
# app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["데이터셋"])
# app.include_router(insights.router, prefix="/api/v1/insights", tags=["인사이트"])
# app.include_router(reports.router, prefix="/api/v1/reports", tags=["리포트"])
# 새로 추가한 테이블 정보 라우터
app.include_router(
    data_browser_table.router, prefix="/api/v1/data-browser", tags=["테이블정보"]
)
app.include_router(notices.router, prefix="/api/v1/notices", tags=["공지사항"])
app.include_router(
    data_browser_query.router, prefix="/api/v1/data-browser", tags=["데이터조회"]
)


@app.get("/")
async def home_page(request: Request):
    """랜딩 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/home.html", {"request": request, "page_title": "홈"}
    )


@app.get("/dashboard")
async def dashboard(request: Request):
    """대시보드 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/dashboard.html", {"request": request, "page_title": "대시보드"}
    )


# @app.get("/data-browser")
# async def data_browser(request: Request):
#     """데이터 브라우저 페이지를 표시합니다."""
#     return templates.TemplateResponse(
#         "pages/data_browser.html", {"request": request, "page_title": "데이터브라우저"}
#     )


@app.get("/data-browser/tables")
async def data_browser_tables(request: Request):
    """테이블 정보 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/data_browser_tables.html",
        {"request": request, "page_title": "테이블 정보"},
    )


@app.get("/analysis")
async def analysis(request: Request):
    """데이터 분석 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/analysis.html", {"request": request, "page_title": "데이터 분석"}
    )


@app.get("/reports")
async def reports_page(request: Request):
    """리포트 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/reports.html", {"request": request, "page_title": "리포트"}
    )


@app.get("/notices", include_in_schema=False)
async def notices_page(request: Request):
    """
    공지사항 페이지를 렌더링합니다.
    """
    # 세션에서 사용자 정보를 가져와 관리자 여부 확인
    # 실제 구현에서는 사용자 인증 및 권한 확인 로직 필요
    # 지금은 임시로 관리자 여부를 설정 (테스트용)
    is_admin = False  # 일반 사용자로 설정 (테스트할 때 True/False 전환)

    return templates.TemplateResponse(
        "pages/notices.html",
        {"request": request, "is_admin": is_admin, "page_title": "공지사항"},
    )


@app.exception_handler(404)
async def not_found_exception_handler(request: Request, exc):
    """404 에러 페이지를 처리합니다."""
    return templates.TemplateResponse(
        "pages/404.html",
        {"request": request, "page_title": "페이지를 찾을 수 없습니다"},
        status_code=404,
    )


from fastapi.responses import HTMLResponse


@app.get("/data-browser/query", response_class=HTMLResponse)
async def data_browser_query(request: Request):
    return templates.TemplateResponse(
        "pages/data_browser_query.html",
        {"request": request, "page_title": "검색 서비스"},
    )


# 앱 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8080, reload=True)
