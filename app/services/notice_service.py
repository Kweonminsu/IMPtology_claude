from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class NoticeData(BaseModel):
    """공지사항 데이터 모델"""

    title: str
    content: str


class NoticeService:
    """
    공지사항 서비스 클래스
    샘플 데이터를 제공하고 CRUD 기능을 구현합니다.
    나중에 DB 연결 시 이 클래스의 메소드만 수정하면 됩니다.
    """

    def __init__(self):
        """
        샘플 공지사항 데이터 초기화

        주의: 실제 DB 연결 시 이 부분은 제거하고 DB 연결 코드로 대체해야 합니다.

        DB 연결 예시:
        def __init__(self):
            self.db_engine = create_engine(settings.DATABASE_URL)
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.db_engine)
        """
        # 샘플 데이터 (DB 연결 시 제거)
        self.notices = [
            {
                "id": 3,
                "title": "IMPtology 서비스 오픈 안내",
                "content": "안녕하세요, IMPtology 서비스가 정식으로 오픈되었습니다.\n\n앞으로 많은 관심과 이용 부탁드립니다.\n\n감사합니다.",
                "author": "관리자",
                "date": date(2025, 5, 1),
                "views": 234,
            },
            {
                "id": 5,
                "title": "5월 시스템 정기 점검 안내",
                "content": "안녕하세요, IMPtology 관리자입니다.\n\n5월 10일 오전 2시부터 4시까지 시스템 정기 점검이 있을 예정입니다.\n\n해당 시간에는 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.",
                "author": "관리자",
                "date": date(2025, 5, 3),
                "views": 156,
            },
            {
                "id": 4,
                "title": "데이터 연동 API 업데이트 안내",
                "content": "IMPtology API가 업데이트되었습니다.\n\n주요 변경사항:\n- 응답 속도 개선\n- 신규 데이터 유형 추가\n- 인증 방식 강화\n\n자세한 내용은 개발자 문서를 참고해주세요.",
                "author": "개발팀",
                "date": date(2025, 5, 2),
                "views": 89,
            },
            {
                "id": 2,
                "title": "사용자 가이드 업데이트",
                "content": "IMPtology 서비스 사용자 가이드가 업데이트되었습니다.\n\n주요 업데이트 내용:\n1. 데이터 시각화 기능 활용 가이드\n2. 데이터 내보내기 기능 상세 설명\n3. 인사이트 분석 결과 해석 방법\n\n사용자 가이드는 홈페이지 하단의 '도움말' 메뉴에서 확인하실 수 있습니다.",
                "author": "IMPtology 팀",
                "date": date(2025, 4, 28),
                "views": 103,
            },
            {
                "id": 1,
                "title": "API 서비스 베타 오픈",
                "content": "IMPtology API 서비스가 베타 버전으로 오픈되었습니다.\n\nAPI를 통해 IMPtology의 데이터를 외부 시스템과 연동하여 활용할 수 있습니다.\n\n베타 기간 동안에는 무료로 이용 가능하며, 정식 버전 출시 후에는 유료 서비스로 전환될 예정입니다.\n\nAPI 문서: https://api.imptology.com/docs",
                "author": "개발팀",
                "date": date(2025, 4, 25),
                "views": 211,
            },
        ]

    def get_notices(
        self, skip: int = 0, limit: int = 10, search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        공지사항 목록을 조회합니다.

        Args:
            skip (int): 건너뛸 항목 수
            limit (int): 가져올 항목 수
            search (str, optional): 검색어

        Returns:
            List[Dict]: 공지사항 목록

        DB 연결 시 코드 예시:
        def get_notices(self, skip: int = 0, limit: int = 10, search: Optional[str] = None):
            with self.SessionLocal() as db:
                query = select(Notice)

                if search:
                    query = query.where(
                        or_(
                            Notice.title.ilike(f"%{search}%"),
                            Notice.content.ilike(f"%{search}%")
                        )
                    )

                query = query.order_by(desc(Notice.date))
                query = query.offset(skip).limit(limit)

                result = db.execute(query)
                notices = result.scalars().all()
                return [notice.to_dict() for notice in notices]
        """
        filtered_notices = self.notices.copy()

        # 검색어가 있으면 필터링
        if search:
            search = search.lower()
            filtered_notices = [
                notice
                for notice in filtered_notices
                if search in notice["title"].lower()
                or search in notice["content"].lower()
            ]

        # 날짜 기준 내림차순 정렬 (최신순)
        filtered_notices.sort(key=lambda x: x["date"], reverse=True)

        # 페이지네이션 적용
        return filtered_notices[skip : skip + limit]

    def get_notice(self, notice_id: int) -> Optional[Dict[str, Any]]:
        """
        특정 ID의 공지사항을 조회합니다.

        Args:
            notice_id (int): 조회할 공지사항 ID

        Returns:
            Dict: 공지사항 정보 또는 None

        DB 연결 시 코드 예시:
        def get_notice(self, notice_id: int):
            with self.SessionLocal() as db:
                notice = db.query(Notice).filter(Notice.id == notice_id).first()
                return notice.to_dict() if notice else None
        """
        for notice in self.notices:
            if notice["id"] == notice_id:
                return notice
        return None

    def create_notice(self, notice_data: Any) -> Dict[str, Any]:
        """
        새 공지사항을 생성합니다.

        Args:
            notice_data: 생성할 공지사항 데이터

        Returns:
            Dict: 생성된 공지사항 정보

        DB 연결 시 코드 예시:
        def create_notice(self, notice_data: Any):
            with self.SessionLocal() as db:
                new_notice = Notice(
                    title=notice_data.title,
                    content=notice_data.content,
                    author="관리자",  # 실제로는 인증된 사용자 정보 사용
                    date=date.today(),
                    views=0
                )
                db.add(new_notice)
                db.commit()
                db.refresh(new_notice)
                return new_notice.to_dict()
        """
        # 새 ID 생성 (현재 ID 중 최대값 + 1)
        new_id = max([notice["id"] for notice in self.notices], default=0) + 1

        # 새 공지사항 생성
        new_notice = {
            "id": new_id,
            "title": notice_data.title,
            "content": notice_data.content,
            "author": "관리자",  # 실제로는 인증된 사용자 정보 사용
            "date": date.today(),
            "views": 0,
        }

        # 목록에 추가
        self.notices.append(new_notice)
        return new_notice

    def update_notice(
        self, notice_id: int, notice_data: Any
    ) -> Optional[Dict[str, Any]]:
        """
        공지사항을 수정합니다.

        Args:
            notice_id (int): 수정할 공지사항 ID
            notice_data: 수정할 데이터

        Returns:
            Dict: 수정된 공지사항 정보 또는 None

        DB 연결 시 코드 예시:
        def update_notice(self, notice_id: int, notice_data: Any):
            with self.SessionLocal() as db:
                notice = db.query(Notice).filter(Notice.id == notice_id).first()
                if not notice:
                    return None

                notice.title = notice_data.title
                notice.content = notice_data.content
                # 수정일을 업데이트할 수도 있음
                # notice.updated_at = datetime.now()

                db.commit()
                db.refresh(notice)
                return notice.to_dict()
        """
        for i, notice in enumerate(self.notices):
            if notice["id"] == notice_id:
                # 제목과 내용 업데이트
                self.notices[i]["title"] = notice_data.title
                self.notices[i]["content"] = notice_data.content
                # 필요한 경우 수정일 업데이트
                # self.notices[i]["updated_at"] = date.today()
                return self.notices[i]
        return None

    def delete_notice(self, notice_id: int) -> bool:
        """
        공지사항을 삭제합니다.

        Args:
            notice_id (int): 삭제할 공지사항 ID

        Returns:
            bool: 삭제 성공 여부

        DB 연결 시 코드 예시:
        def delete_notice(self, notice_id: int):
            with self.SessionLocal() as db:
                notice = db.query(Notice).filter(Notice.id == notice_id).first()
                if not notice:
                    return False

                db.delete(notice)
                db.commit()
                return True
        """
        for i, notice in enumerate(self.notices):
            if notice["id"] == notice_id:
                del self.notices[i]
                return True
        return False

    def increase_view_count(self, notice_id: int) -> bool:
        """
        공지사항 조회수를 증가시킵니다.

        Args:
            notice_id (int): 조회수를 증가시킬 공지사항 ID

        Returns:
            bool: 조회수 증가 성공 여부

        DB 연결 시 코드 예시:
        def increase_view_count(self, notice_id: int):
            with self.SessionLocal() as db:
                notice = db.query(Notice).filter(Notice.id == notice_id).first()
                if not notice:
                    return False

                notice.views += 1
                db.commit()
                return True
        """
        for i, notice in enumerate(self.notices):
            if notice["id"] == notice_id:
                self.notices[i]["views"] += 1
                return True
        return False
