from datetime import date
from typing import List, Optional, Dict, Any
import json


class NoticeService:
    def __init__(self):
        # 샘플 데이터 (실제로는 DB 사용)
        self.notices = [
            {
                "id": 1,
                "title": "IMPtology 서비스 오픈 안내",
                "content": "안녕하세요, IMPtology 서비스가 정식으로 오픈되었습니다.\n\n앞으로 많은 관심과 이용 부탁드립니다.\n\n감사합니다.",
                "author": "관리자",
                "date": date(2025, 5, 1),
                "views": 234,
            },
            {
                "id": 2,
                "title": "5월 시스템 점검 안내",
                "content": "안녕하세요, IMPtology 서비스 이용자 여러분.\n\n다음과 같이 5월 정기 시스템 점검이 진행될 예정입니다.\n\n일시: 2025년 5월 10일 02:00 ~ 06:00\n영향: 서비스 전체 이용 불가\n\n이용에 참고하시기 바랍니다.\n\n감사합니다.",
                "author": "시스템 관리자",
                "date": date(2025, 5, 3),
                "views": 152,
            },
            {
                "id": 3,
                "title": "새로운 데이터셋 추가 안내",
                "content": "IMPtology 서비스에 새로운 산업 데이터셋이 추가되었습니다.\n\n- 2024년 국내 자동차 산업 생산량 데이터\n- 2024년 반도체 산업 수출입 현황\n- 2023-2024 신재생에너지 설비 투자 현황\n\n데이터 브라우저에서 확인하실 수 있습니다.",
                "author": "데이터 관리자",
                "date": date(2025, 5, 2),
                "views": 178,
            },
            {
                "id": 4,
                "title": "사용자 가이드 업데이트",
                "content": "IMPtology 서비스 사용자 가이드가 업데이트되었습니다.\n\n주요 업데이트 내용:\n1. 데이터 시각화 기능 활용 가이드\n2. 데이터 내보내기 기능 상세 설명\n3. 인사이트 분석 결과 해석 방법\n\n사용자 가이드는 홈페이지 하단의 '도움말' 메뉴에서 확인하실 수 있습니다.",
                "author": "IMPtology 팀",
                "date": date(2025, 4, 28),
                "views": 103,
            },
            {
                "id": 5,
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
        검색어가 제공된 경우 제목이나 내용에서 검색합니다.
        """
        if search:
            search = search.lower()
            filtered_notices = [
                notice
                for notice in self.notices
                if search in notice["title"].lower()
                or search in notice["content"].lower()
            ]
        else:
            filtered_notices = self.notices.copy()

        # 최신순 정렬
        filtered_notices.sort(key=lambda x: x["date"], reverse=True)

        # 페이지네이션
        return filtered_notices[skip : skip + limit]

    def get_notice(self, notice_id: int) -> Optional[Dict[str, Any]]:
        """
        특정 ID의 공지사항을 조회합니다.
        """
        for notice in self.notices:
            if notice["id"] == notice_id:
                return notice
        return None

    def create_notice(self, notice_data) -> Dict[str, Any]:
        """
        새 공지사항을 생성합니다.
        """
        # 새 ID 생성
        new_id = max([notice["id"] for notice in self.notices], default=0) + 1

        new_notice = {
            "id": new_id,
            "title": notice_data.title,
            "content": notice_data.content,
            "author": "관리자",  # 실제로는 로그인한 관리자 이름
            "date": date.today(),
            "views": 0,
        }

        self.notices.append(new_notice)
        return new_notice

    def update_notice(self, notice_id: int, notice_data) -> Optional[Dict[str, Any]]:
        """
        공지사항을 수정합니다.
        """
        for i, notice in enumerate(self.notices):
            if notice["id"] == notice_id:
                self.notices[i]["title"] = notice_data.title
                self.notices[i]["content"] = notice_data.content
                # 수정일을 현재 날짜로 업데이트할 수도 있음
                return self.notices[i]
        return None

    def delete_notice(self, notice_id: int) -> bool:
        """
        공지사항을 삭제합니다.
        """
        for i, notice in enumerate(self.notices):
            if notice["id"] == notice_id:
                del self.notices[i]
                return True
        return False

    def increase_view_count(self, notice_id: int) -> bool:
        """
        공지사항 조회수를 증가시킵니다.
        """
        for i, notice in enumerate(self.notices):
            if notice["id"] == notice_id:
                self.notices[i]["views"] += 1
                return True
        return False
