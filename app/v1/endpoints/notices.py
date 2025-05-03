# from fastapi import APIRouter, Request, Depends, Form, RedirectResponse
# from fastapi.templating import Jinja2Templates
# from starlette.status import HTTP_302_FOUND
# from app.models import Notice, User  # 예시
# from app.dependencies import get_current_user, is_admin  # 예시
#
# router = APIRouter()
# templates = Jinja2Templates(directory="templates")
#
#
# @router.get("/notices")
# async def notice_list(request: Request, current_user: User = Depends(get_current_user)):
#     notices = ...  # DB에서 공지사항 목록 조회
#     return templates.TemplateResponse(
#         "pages/notices.html",
#         {"request": request, "notices": notices, "current_user": current_user},
#     )
#
#
# @router.get("/notices/write")
# async def notice_write_page(request: Request, current_user: User = Depends(is_admin)):
#     return templates.TemplateResponse(
#         "pages/notice_write.html", {"request": request, "current_user": current_user}
#     )
#
#
# @router.post("/notices/write")
# async def notice_write(
#     request: Request,
#     title: str = Form(...),
#     content: str = Form(...),
#     current_user: User = Depends(is_admin),
# ):
#     # DB에 새 공지 저장
#     ...
#     return RedirectResponse("/notices", status_code=HTTP_302_FOUND)
#
#
# @router.get("/notices/{notice_id}")
# async def notice_detail(
#     request: Request, notice_id: int, current_user: User = Depends(get_current_user)
# ):
#     notice = ...  # DB에서 공지사항 조회
#     return templates.TemplateResponse(
#         "pages/notice_detail.html",
#         {"request": request, "notice": notice, "current_user": current_user},
#     )
#
#
# @router.post("/notices/{notice_id}/delete")
# async def notice_delete(notice_id: int, current_user: User = Depends(is_admin)):
#     # DB에서 공지사항 삭제
#     ...
#     return {"ok": True}
