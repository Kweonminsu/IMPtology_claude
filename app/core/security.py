from datetime import datetime, timedelta

# from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.user import TokenData, User, UserInDB

# 비밀번호 해싱
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 설정
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")


def verify_password(plain_password, hashed_password):
    """비밀번호 검증"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """비밀번호 해싱"""
    return pwd_context.hash(password)


# async def get_current_user(
#     token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)
# ):
#     """현재 인증된 사용자 가져오기"""
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="인증 정보가 유효하지 않습니다",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#
#     try:
#         # 토큰 디코딩
#         payload = jwt.decode(
#             token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
#         )
#         username: str = payload.get("sub")
#         if username is None:
#             raise credentials_exception
#         token_data = TokenData(username=username)
#     except JWTError:
#         raise credentials_exception
#
#     # 사용자 조회
#     # from app.services.user_service import get_user_by_username
#     #
#     # user = get_user_by_username(db, token_data.username)
#     # if user is None:
#     #     raise credentials_exception
#     #
#     # return user
#
#
# async def get_current_active_user(
#     current_user: Annotated[User, Depends(get_current_user)]
# ):
#     """현재 활성화된 사용자 확인"""
#     if not current_user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, detail="계정이 비활성화되었습니다"
#         )
#     return current_user
#
#
# async def get_current_superuser(
#     current_user: Annotated[User, Depends(get_current_active_user)]
# ):
#     """현재 사용자가 관리자인지 확인"""
#     if not current_user.is_superuser:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다"
#         )
#     return current_user
