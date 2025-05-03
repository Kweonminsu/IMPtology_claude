from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
# 기존 임포트 아래에 추가

# 라우터 추가
# API 라우터 임포트
from app.v1.endpoints import auth, users, datasets, insights, reports
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

# API 라우터 포함
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["인증"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["사용자"])
# app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["데이터셋"])
# app.include_router(insights.router, prefix="/api/v1/insights", tags=["인사이트"])
# app.include_router(reports.router, prefix="/api/v1/reports", tags=["리포트"])
# app.include_router(notices.router, prefix="/api/v1/notices", tags=["공지사항"])


@app.get("/")
async def landing_page(request: Request):
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

@app.get("/data-browser")
async def data_browser(request: Request):
    """데이터 브라우저 페이지를 표시합니다."""
    return templates.TemplateResponse(
        "pages/data_browser.html", {"request": request, "page_title": "데이터브라우저"}
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

@app.get("/home")
async def home_page(request: Request):
    return templates.TemplateResponse(
        "pages/home.html", {"request": request, "page_title": "홈"}
    )

@app.exception_handler(404)
async def not_found_exception_handler(request: Request, exc):
    """404 에러 페이지를 처리합니다."""
    return templates.TemplateResponse(
        "pages/404.html", {"request": request, "page_title": "페이지를 찾을 수 없습니다"}, status_code=404
    )




# 홈 페이지 라우트 추가
@app.get("/home")
async def home_page(request: Request):
    return templates.TemplateResponse("pages/home.html", {"request": request})


# 앱 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8080, reload=True)
