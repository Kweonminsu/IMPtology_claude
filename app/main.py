from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

# API 라우터 임포트
from app.v1.endpoints import auth, users, datasets, insights, reports
from app.core.config import settings

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

# API 라우터 포함
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["인증"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["사용자"])
# app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["데이터셋"])
# app.include_router(insights.router, prefix="/api/v1/insights", tags=["인사이트"])
# app.include_router(reports.router, prefix="/api/v1/reports", tags=["리포트"])


# 기본 라우트 - 랜딩 페이지
@app.get("/")
async def landing_page(request: Request):
    """랜딩 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/home.html", {"request": request}
    )


# 대시보드 라우트
@app.get("/dashboard")
async def dashboard(request: Request):
    """대시보드 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/dashboard.html", {"request": request}
    )


# 데이터 브라우저 라우트
@app.get("/data-browser")
async def data_browser(request: Request):
    """데이터 브라우저 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/data_browser.html", {"request": request}
    )


# 분석 라우트
@app.get("/analysis")
async def analysis(request: Request):
    """데이터 분석 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/analysis.html", {"request": request}
    )


# 리포트 라우트
@app.get("/reports")
async def reports_page(request: Request):
    """리포트 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/reports.html", {"request": request}
    )


# 404 에러 처리
@app.exception_handler(404)
async def not_found_exception_handler(request: Request, exc):
    """404 에러 페이지를 처리합니다."""
    return templates.TemplateResponse(
        "pages/404.html", {"request": request}, status_code=404
    )


# 앱 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8080, reload=True)
