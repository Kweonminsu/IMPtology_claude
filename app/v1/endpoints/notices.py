# from fastapi import APIRouter, Request, Depends, Form
# from fastapi.responses import RedirectResponse
# from fastapi.templating import Jinja2Templates
# from starlette.status import HTTP_302_FOUND
#
# # 실제 경로에 맞게 수정
# from app.db.session import get_db
# from app.models.user import User
# from app.models.notice import Notice  # notice 모델 필요
# from app.schemas.notice import NoticeCreate  # notice 스키마 필요
# from app.services.notice_service import (
#     get_notice_list, get_notice, create_notice, delete_notice
# )
# from app.api.dependencies import get_current_user, is_admin  # 인증 의존성
#
# router = APIRouter()
#
# templates = Jinja2Templates(directory="app/templates")
#
# @router.get("/notices")
# async def notice_list(request: Request, current_user: User = Depends(get_current_user)):
#     notices = get_notice_list()
#     return templates.TemplateResponse("pages/notices.html", {"request": request, "notices": notices, "current_user": current_user})
#
# @router.get("/notices/write")
# async def notice_write_page(request: Request, current_user: User = Depends(is_admin)):
#     return templates.TemplateResponse("pages/notice_write.html", {"request": request, "current_user": current_user})
#
# @router.post("/notices/write")
# async def notice_write(
#     request: Request,
#     title: str = Form(...),
#     content: str = Form(...),
#     current_user: User = Depends(is_admin)
# ):
#     create_notice(title=title, content=content, author_id=current_user.id)
#     return RedirectResponse("/notices", status_code=HTTP_302_FOUND)
#
# @router.get("/notices/{notice_id}")
# async def notice_detail(request: Request, notice_id: int, current_user: User = Depends(get_current_user)):
#     notice = get_notice(notice_id)
#     return templates.TemplateResponse("pages/notice_detail.html", {"request": request, "notice": notice, "current_user": current_user})
#
# @router.post("/notices/{notice_id}/delete")
# async def notice_delete(notice_id: int, current_user: User = Depends(is_admin)):
#     delete_notice(notice_id)
#     return {"ok": True}
