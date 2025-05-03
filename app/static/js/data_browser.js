document.addEventListener('DOMContentLoaded', function() {
    // 탭 전환
    const tabs = document.querySelectorAll('.browser-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // 실제 구현시 탭에 따라 컨텐츠를 분기
        });
    });

    // 데이터 소스 트리 카테고리 토글
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const category = this.closest('.tree-category');
            const items = category.querySelector('.category-items');
            if (items) {
                items.style.display = items.style.display === 'none' ? 'block' : 'none';
            }
            this.querySelector('.toggle-button').classList.toggle('expanded');
        });
    });

    // 트리 아이템 클릭 시 활성화
    document.querySelectorAll('.tree-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            // 실제 구현시 해당 데이터셋을 메인에 로드
        });
    });

    // 쿼리 빌더 탭 전환
    document.querySelectorAll('.query-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.query-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // 실제 구현시 쿼리 빌더/SQL 에디터 전환
        });
    });

    // 컬럼 추가/삭제
    document.querySelectorAll('.add-column').forEach(btn => {
        btn.addEventListener('click', function() {
            // 실제 구현시 컬럼 추가 로직
            alert('컬럼 추가 기능은 실제 서비스에서 구현하세요.');
        });
    });
    document.querySelectorAll('.remove-column').forEach(btn => {
        btn.addEventListener('click', function() {
            // 실제 구현시 컬럼 삭제 로직
            this.parentElement.remove();
        });
    });

    // 조건 추가/삭제
    document.querySelectorAll('.add-condition').forEach(btn => {
        btn.addEventListener('click', function() {
            // 실제 구현시 조건 추가 로직
            alert('조건 추가 기능은 실제 서비스에서 구현하세요.');
        });
    });
    document.querySelectorAll('.remove-condition').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });

    // 정렬 조건 삭제
    document.querySelectorAll('.remove-sort').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });

    // 쿼리 실행/저장/초기화 버튼
    document.querySelectorAll('.query-action-button').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('primary')) {
                // 쿼리 실행
                alert('쿼리 실행 기능은 실제 서비스에서 구현하세요.');
            } else if (this.textContent.includes('저장')) {
                alert('쿼리 저장 기능은 실제 서비스에서 구현하세요.');
            } else if (this.textContent.includes('초기화')) {
                alert('쿼리 빌더를 초기화합니다.');
            }
        });
    });

    // 결과 내보내기/차트 생성 버튼
    document.querySelectorAll('.results-action-button').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('CSV')) {
                alert('CSV 내보내기 기능은 실제 서비스에서 구현하세요.');
            } else if (this.textContent.includes('차트')) {
                alert('차트 생성 기능은 실제 서비스에서 구현하세요.');
            }
        });
    });

    // 페이지네이션 버튼
    document.querySelectorAll('.pagination-button').forEach(btn => {
        btn.addEventListener('click', function() {
            // 실제 구현시 페이지 이동 로직
            document.querySelectorAll('.pagination-button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 사이드 패널 검색
    document.querySelectorAll('.search-filter input').forEach(input => {
        input.addEventListener('input', function() {
            const val = this.value.toLowerCase();
            document.querySelectorAll('.tree-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(val) ? '' : 'none';
            });
        });
    });
});
