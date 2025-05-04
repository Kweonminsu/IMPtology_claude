document.addEventListener('DOMContentLoaded', function() {
    // 샘플 공지사항 데이터
    const sampleNotices = [
        {
            id: 1,
            title: "IMPtology 서비스 오픈 안내",
            content: "안녕하세요, IMPtology 서비스가 정식으로 오픈되었습니다.\n\n앞으로 많은 관심과 이용 부탁드립니다.\n\n감사합니다.",
            author: "관리자",
            date: "2025-05-01",
            views: 234
        },
        {
            id: 2,
            title: "5월 시스템 점검 안내",
            content: "안녕하세요, IMPtology 서비스 이용자 여러분.\n\n다음과 같이 5월 정기 시스템 점검이 진행될 예정입니다.\n\n일시: 2025년 5월 10일 02:00 ~ 06:00\n영향: 서비스 전체 이용 불가\n\n이용에 참고하시기 바랍니다.\n\n감사합니다.",
            author: "시스템 관리자",
            date: "2025-05-03",
            views: 152
        },
        {
            id: 3,
            title: "새로운 데이터셋 추가 안내",
            content: "IMPtology 서비스에 새로운 산업 데이터셋이 추가되었습니다.\n\n- 2024년 국내 자동차 산업 생산량 데이터\n- 2024년 반도체 산업 수출입 현황\n- 2023-2024 신재생에너지 설비 투자 현황\n\n데이터 브라우저에서 확인하실 수 있습니다.",
            author: "데이터 관리자",
            date: "2025-05-02",
            views: 178
        },
        {
            id: 4,
            title: "사용자 가이드 업데이트",
            content: "IMPtology 서비스 사용자 가이드가 업데이트되었습니다.\n\n주요 업데이트 내용:\n1. 데이터 시각화 기능 활용 가이드\n2. 데이터 내보내기 기능 상세 설명\n3. 인사이트 분석 결과 해석 방법\n\n사용자 가이드는 홈페이지 하단의 '도움말' 메뉴에서 확인하실 수 있습니다.",
            author: "IMPtology 팀",
            date: "2025-04-28",
            views: 103
        },
        {
            id: 5,
            title: "API 서비스 베타 오픈",
            content: "IMPtology API 서비스가 베타 버전으로 오픈되었습니다.\n\nAPI를 통해 IMPtology의 데이터를 외부 시스템과 연동하여 활용할 수 있습니다.\n\n베타 기간 동안에는 무료로 이용 가능하며, 정식 버전 출시 후에는 유료 서비스로 전환될 예정입니다.\n\nAPI 문서: https://api.imptology.com/docs",
            author: "개발팀",
            date: "2025-04-25",
            views: 211
        }
    ];

    // 전역 변수
    let currentPage = 1;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(sampleNotices.length / itemsPerPage);
    let currentNoticeId = null;

    // 관리자 여부 확인 (실제로는 서버에서 확인)
    // 임시로 true로 설정
    const isAdmin = true;

    // DOM 요소
    const noticesTbody = document.getElementById('notices-tbody');
    const paginationNumbers = document.getElementById('pagination-numbers');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const noticeModal = document.getElementById('notice-modal');
    const noticeDetailModal = document.getElementById('notice-detail-modal');
    const noticeForm = document.getElementById('notice-form');
    const modalTitle = document.getElementById('modal-title');
    const noticeTitle = document.getElementById('notice-title');
    const noticeContent = document.getElementById('notice-content');
    const createNoticeBtn = document.getElementById('create-notice-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const closeButtons = document.querySelectorAll('.close');
    const noticeSearchInput = document.getElementById('notice-search-input');
    const noticeSearchBtn = document.getElementById('notice-search-btn');

    // 공지사항 목록 렌더링
    function renderNotices() {
        // 공지사항 데이터 슬라이싱 (페이지네이션)
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageNotices = sampleNotices.slice(startIndex, endIndex);

        // 테이블 내용 비우기
        noticesTbody.innerHTML = '';

        // 공지사항 항목 추가
        currentPageNotices.forEach(notice => {
            const row = document.createElement('tr');
            row.dataset.id = notice.id;

            row.innerHTML = `
                <td>${notice.id}</td>
                <td>${notice.title}</td>
                <td>${notice.author}</td>
                <td>${notice.date}</td>
                <td>${notice.views}</td>
            `;

            // 공지사항 클릭 이벤트
            row.addEventListener('click', () => {
                openNoticeDetail(notice.id);
            });

            noticesTbody.appendChild(row);
        });

        // 페이지네이션 업데이트
        renderPagination();
    }

    // 페이지네이션 렌더링
    function renderPagination() {
        paginationNumbers.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageNumber = document.createElement('div');
            pageNumber.classList.add('page-number');
            if (i === currentPage) {
                pageNumber.classList.add('active');
            }
            pageNumber.textContent = i;

            pageNumber.addEventListener('click', () => {
                currentPage = i;
                renderNotices();
            });

            paginationNumbers.appendChild(pageNumber);
        }

        // 이전/다음 버튼 상태 업데이트
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // 공지사항 상세 보기
    function openNoticeDetail(id) {
        const notice = sampleNotices.find(n => n.id === id);
        currentNoticeId = id;

        if (notice) {
            document.getElementById('detail-title').textContent = notice.title;
            document.getElementById('detail-author').textContent = `작성자: ${notice.author}`;
            document.getElementById('detail-date').textContent = `작성일: ${notice.date}`;
            document.getElementById('detail-views').textContent = `조회수: ${notice.views}`;
            document.getElementById('detail-content').textContent = notice.content;

            // 수정/삭제 버튼이 있는 경우에만 처리
            if (isAdmin) {
                const editBtn = document.getElementById('edit-notice-btn');
                const deleteBtn = document.getElementById('delete-notice-btn');

                editBtn.addEventListener('click', () => {
                    closeModal(noticeDetailModal);
                    openEditNoticeModal(id);
                });

                deleteBtn.addEventListener('click', () => {
                    deleteNotice(id);
                });
            }

            // 모달 열기
            noticeDetailModal.style.display = 'block';
        }
    }

    // 공지사항 작성 모달 열기
    function openCreateNoticeModal() {
        modalTitle.textContent = '공지사항 작성';
        noticeTitle.value = '';
        noticeContent.value = '';
        currentNoticeId = null;
        noticeModal.style.display = 'block';
    }

    // 공지사항 수정 모달 열기
    function openEditNoticeModal(id) {
        const notice = sampleNotices.find(n => n.id === id);

        if (notice) {
            modalTitle.textContent = '공지사항 수정';
            noticeTitle.value = notice.title;
            noticeContent.value = notice.content;
            currentNoticeId = id;
            noticeModal.style.display = 'block';
        }
    }

    // 모달 닫기
    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // 공지사항 저장 (신규 작성 또는 수정)
    function saveNotice(event) {
        event.preventDefault();

        const title = noticeTitle.value.trim();
        const content = noticeContent.value.trim();

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        if (currentNoticeId) {
            // 기존 공지사항 수정
            const index = sampleNotices.findIndex(n => n.id === currentNoticeId);

            if (index !== -1) {
                sampleNotices[index].title = title;
                sampleNotices[index].content = content;
                sampleNotices[index].date = new Date().toISOString().split('T')[0];
            }
        } else {
            // 새 공지사항 작성
            const newId = sampleNotices.length > 0 ? Math.max(...sampleNotices.map(n => n.id)) + 1 : 1;

            sampleNotices.unshift({
                id: newId,
                title: title,
                content: content,
                author: '관리자',
                date: new Date().toISOString().split('T')[0],
                views: 0
            });
        }

        // 모달 닫기 및 목록 새로고침
        closeModal(noticeModal);
        renderNotices();
    }

    // 공지사항 삭제
    function deleteNotice(id) {
        if (confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
            const index = sampleNotices.findIndex(n => n.id === id);

            if (index !== -1) {
                sampleNotices.splice(index, 1);
                closeModal(noticeDetailModal);
                renderNotices();
            }
        }
    }

    // 공지사항 검색
    function searchNotices() {
        const keyword = noticeSearchInput.value.trim().toLowerCase();

        if (keyword) {
            const filteredNotices = sampleNotices.filter(notice =>
                notice.title.toLowerCase().includes(keyword) ||
                notice.content.toLowerCase().includes(keyword)
            );

            // 검색 결과 표시 로직
            // (실제 구현에서는 서버에 검색 요청을 보냄)
            console.log('검색 결과:', filteredNotices);
            alert(`'${keyword}' 검색 결과: ${filteredNotices.length}건`);
        }
    }

    // 이벤트 리스너 등록
    if (createNoticeBtn) {
        createNoticeBtn.addEventListener('click', openCreateNoticeModal);
    }

    noticeForm.addEventListener('submit', saveNotice);

    cancelBtn.addEventListener('click', () => {
        closeModal(noticeModal);
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderNotices();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderNotices();
        }
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.closest('.modal'));
        });
    });

    noticeSearchBtn.addEventListener('click', searchNotices);

    noticeSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchNotices();
        }
    });

    // 초기 렌더링
    renderNotices();
});
