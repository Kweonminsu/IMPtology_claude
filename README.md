    imptology/
    ├── app/
    │   ├── api/                          # API 엔드포인트 정의
    │   │   ├── __init__.py
    │   │   ├── dependencies.py           # 의존성 함수들 (인증 등)
    │   │   └── v1/
    │   │       ├── __init__.py
    │   │       └── endpoints/
    │   │           ├── __init__.py
    │   │           ├── auth.py           # 인증 관련 API
    │   │           ├── users.py          # 사용자 관련 API
    │   │           ├── datasets.py       # 데이터셋 관련 API
    │   │           ├── insights.py       # 인사이트 관련 API
    │   │           └── reports.py        # 리포트 관련 API
    │   ├── core/                         # 핵심 설정 및 유틸리티
    │   │   ├── __init__.py
    │   │   ├── config.py                 # 애플리케이션 설정
    │   │   ├── security.py               # 보안 관련 기능
    │   │   └── logging.py                # 로깅 설정
    │   ├── db/                           # 데이터베이스 관련 코드
    │   │   ├── __init__.py
    │   │   ├── session.py                # DB 세션 관리
    │   │   └── models/                   # SQLAlchemy 모델
    │   │       ├── __init__.py
    │   │       ├── user.py
    │   │       ├── dataset.py
    │   │       ├── insight.py
    │   │       └── report.py
    │   ├── schemas/                      # Pydantic 스키마
    │   │   ├── __init__.py
    │   │   ├── user.py
    │   │   ├── dataset.py
    │   │   ├── insight.py
    │   │   └── report.py
    │   ├── services/                     # 비즈니스 로직
    │   │   ├── __init__.py
    │   │   ├── auth_service.py
    │   │   ├── dataset_service.py
    │   │   ├── insight_service.py
    │   │   └── report_service.py
    │   ├── static/                       # 정적 파일들
    │   │   ├── css/
    │   │   │   ├── main.css              # 공통 스타일
    │   │   │   ├── dashboard.css         # 대시보드 스타일
    │   │   │   ├── data_browser.css      # 데이터 브라우저 스타일
    │   │   │   └── analysis.css          # 분석 페이지 스타일
    │   │   ├── js/
    │   │   │   ├── main.js               # 공통 스크립트
    │   │   │   ├── dashboard.js          # 대시보드 스크립트
    │   │   │   ├── data_browser.js       # 데이터 브라우저 스크립트
    │   │   │   └── analysis.js           # 분석 페이지 스크립트
    │   │   └── images/
    │   │       └── logo.svg              # 로고 이미지
    │   ├── templates/                    # HTML 템플릿
    │   │   ├── base.html                 # 기본 템플릿
    │   │   ├── components/               # 재사용 가능한 컴포넌트
    │   │   │   ├── header.html           # 헤더 컴포넌트
    │   │   │   ├── sidebar.html          # 사이드바 컴포넌트
    │   │   │   └── footer.html           # 푸터 컴포넌트
    │   │   └── pages/                    # 페이지 템플릿
    │   │       ├── index.html            # 랜딩 페이지
    │   │       ├── dashboard.html        # 대시보드 페이지
    │   │       ├── data_browser.html     # 데이터 브라우저 페이지
    │   │       ├── analysis.html         # 분석 페이지
    │   │       └── reports.html          # 리포트 페이지
    │   ├── utils/                        # 유틸리티 함수
    │   │   ├── __init__.py
    │   │   └── helpers.py                # 헬퍼 함수들
    │   └── main.py                       # FastAPI 앱 진입점
    ├── tests/                            # 테스트 코드
    │   ├── __init__.py
    │   └── api/                          # API 테스트
    ├── .env                              # 환경 변수 설정
    ├── requirements.txt                  # 의존성 패키지 목록
    └── run.py                            # 앱 실행 스크립트