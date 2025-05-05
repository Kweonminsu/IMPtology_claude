/**
 * 공지사항 관리를 위한 JavaScript 파일
 * 목록 조회, 작성, 수정, 삭제 기능을 구현함
 * 백엔드 API를 호출하여 데이터 처리
 */
document.addEventListener("DOMContentLoaded", function() {
    // 전역 변수 선언
    let currentPage = 1; // 현재 페이지 번호
    const itemsPerPage = 10; // 페이지당 표시할 항목 수
    let totalItems = 0; // 전체 항목 수
    let totalPages = 0; // 전체 페이지 수
    let currentNoticeId = null; // 현재 선택된 공지사항 ID

    // DOM 요소 선택 (querySelector 사용)
    const noticesTbody = document.querySelector("#notices-tbody");
    const paginationNumbers = document.querySelector("#pagination-numbers");
    const prevPageBtn = document.querySelector("#prev-page");
    const nextPageBtn = document.querySelector("#next-page");
    const noticeModal = document.querySelector("#notice-modal");
    const noticeDetailModal = document.querySelector("#notice-detail-modal");
    const noticeForm = document.querySelector("#notice-form");
    const modalTitle = document.querySelector("#modal-title");
    const noticeTitle = document.querySelector("#notice-title");
    const noticeContent = document.querySelector("#notice-content");
    const createNoticeBtn = document.querySelector("#create-notice-btn");
    const cancelBtn = document.querySelector("#cancel-btn");
    const closeButtons = document.querySelectorAll(".close");
    const noticeSearchInput = document.querySelector("#notice-search-input");
    const noticeSearchBtn = document.querySelector("#notice-search-btn");
    const modalDetailTitle = document.querySelector("#modal-detail-title");
    const modalDetailDate = document.querySelector("#modal-detail-date");
    const modalDetailAuthor = document.querySelector("#modal-detail-author");
    const modalDetailViews = document.querySelector("#modal-detail-views");
    const modalDetailContent = document.querySelector("#modal-detail-content");
    const editNoticeBtn = document.querySelector("#edit-notice-btn");
    const deleteNoticeBtn = document.querySelector("#delete-notice-btn");

    // 서버에서 공지사항 목록을 가져오는 함수
    async function fetchNotices(page = 1, search = "") {
        try {
            const skip = (page - 1) * itemsPerPage;
            const limit = itemsPerPage;

            // 검색어가 있을 경우 검색 매개변수 추가
            let url = `/api/v1/notices?skip=${skip}&limit=${limit}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("서버에서 데이터를 가져오는데 실패했습니다");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("공지사항 목록 가져오기 오류:", error);
            return [];
        }
    }

    // 특정 공지사항 상세 정보를 가져오는 함수
    async function fetchNoticeDetail(noticeId) {
        try {
            const response = await fetch(`/api/v1/notices/${noticeId}`);
            if (!response.ok) {
                throw new Error("공지사항 상세 정보를 가져오는데 실패했습니다");
            }

            return await response.json();
        } catch (error) {
            console.error("공지사항 상세 정보 가져오기 오류:", error);
            return null;
        }
    }

    // 공지사항 생성 함수
    async function createNotice(noticeData) {
        try {
            const response = await fetch("/api/v1/notices/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(noticeData),
            });

            if (!response.ok) {
                throw new Error("공지사항 생성에 실패했습니다");
            }

            return await response.json();
        } catch (error) {
            console.error("공지사항 생성 오류:", error);
            return null;
        }
    }

    // 공지사항 수정 함수
    async function updateNotice(noticeId, noticeData) {
        try {
            const response = await fetch(`/api/v1/notices/${noticeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(noticeData),
            });

            if (!response.ok) {
                throw new Error("공지사항 수정에 실패했습니다");
            }

            return await response.json();
        } catch (error) {
            console.error("공지사항 수정 오류:", error);
            return null;
        }
    }

    // 공지사항 삭제 함수
    async function deleteNotice(noticeId) {
        try {
            const response = await fetch(`/api/v1/notices/${noticeId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("공지사항 삭제에 실패했습니다");
            }

            return true;
        } catch (error) {
            console.error("공지사항 삭제 오류:", error);
            return false;
        }
    }

    /**
     * 공지사항 목록을 화면에 렌더링하는 함수
     */
    async function renderNotices() {
        // 로딩 표시 (옵션)
        noticesTbody.innerHTML = '<tr><td colspan="5" class="text-center">데이터를 불러오는 중...</td></tr>';

        // 서버에서 공지사항 목록 가져오기
        const searchTerm = noticeSearchInput.value.trim();
        const notices = await fetchNotices(currentPage, searchTerm);

        // 테이블 내용 비우기
        noticesTbody.innerHTML = "";

        // 공지사항 데이터가 없는 경우 메시지 표시
        if (notices.length === 0) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = '<td colspan="5" class="text-center">공지사항이 없습니다</td>';
            noticesTbody.appendChild(emptyRow);
            return;
        }

        // 공지사항 목록 표시
        notices.forEach(notice => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${notice.id}</td>
                <td>${notice.title}</td>
                <td>${notice.author}</td>
                <td>${notice.date}</td>
                <td>${notice.views}</td>
            `;

            // 공지사항 클릭 이벤트 (상세 보기)
            row.addEventListener("click", () => {
                openNoticeDetail(notice.id);
            });

            noticesTbody.appendChild(row);
        });

        // 페이지네이션 업데이트
        updatePagination();
    }

    /**
     * 페이지네이션 업데이트 함수
     */
    function updatePagination() {
        // 임시로 페이지 수 계산 (실제로는 서버에서 전체 항목 수를 받아와야 함)
        // 이 부분은 백엔드에서 전체 항목 수를 제공하는 API가 필요함
        totalPages = Math.max(1, totalPages);

        // 페이지네이션 컨트롤 업데이트
        paginationNumbers.innerHTML = "";

        // 페이지 번호 버튼 생성
        for (let i = 1; i <= totalPages; i++) {
            const pageNumber = document.createElement("div");
            pageNumber.classList.add("page-number");
            if (i === currentPage) {
                pageNumber.classList.add("active");
            }
            pageNumber.textContent = i;

            pageNumber.addEventListener("click", () => {
                currentPage = i;
                renderNotices();
            });

            paginationNumbers.appendChild(pageNumber);
        }

        // 이전/다음 버튼 활성화 상태 설정
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    /**
     * 공지사항 상세 보기 함수
     */
    async function openNoticeDetail(noticeId) {
        // 서버에서 공지사항 상세 정보 가져오기
        const notice = await fetchNoticeDetail(noticeId);
        if (!notice) return;

        currentNoticeId = noticeId;

        // 모달에 데이터 채우기
        modalDetailTitle.textContent = notice.title;
        modalDetailDate.textContent = `작성일: ${notice.date}`;
        modalDetailAuthor.textContent = `작성자: ${notice.author}`;
        modalDetailViews.textContent = `조회수: ${notice.views}`;
        modalDetailContent.textContent = notice.content;

        // 모달 표시
        noticeDetailModal.style.display = "block";
    }

    /**
     * 공지사항 작성 모달 열기 함수
     */
    function openCreateNoticeModal() {
        modalTitle.textContent = "공지사항 작성";
        noticeTitle.value = "";
        noticeContent.value = "";
        currentNoticeId = null;
        noticeModal.style.display = "block";
    }

    /**
     * 공지사항 수정 모달 열기 함수
     */
    async function openEditNoticeModal(noticeId) {
        // 서버에서 공지사항 상세 정보 가져오기
        const notice = await fetchNoticeDetail(noticeId);
        if (!notice) return;

        modalTitle.textContent = "공지사항 수정";
        noticeTitle.value = notice.title;
        noticeContent.value = notice.content;
        currentNoticeId = noticeId;

        // 상세 보기 모달 닫기
        noticeDetailModal.style.display = "none";

        // 수정 모달 열기
        noticeModal.style.display = "block";
    }

    /**
     * 공지사항 저장 함수 (생성 또는 수정)
     */
    async function saveNotice(event) {
        event.preventDefault();

        const title = noticeTitle.value.trim();
        const content = noticeContent.value.trim();

        if (!title || !content) {
            alert("제목과 내용을 모두 입력해주세요");
            return;
        }

        const noticeData = { title, content };

        if (currentNoticeId) {
            // 기존 공지사항 수정
            const updatedNotice = await updateNotice(currentNoticeId, noticeData);
            if (!updatedNotice) {
                alert("공지사항 수정에 실패했습니다");
                return;
            }
        } else {
            // 새 공지사항 생성
            const newNotice = await createNotice(noticeData);
            if (!newNotice) {
                alert("공지사항 생성에 실패했습니다");
                return;
            }
        }

        // 모달 닫기
        noticeModal.style.display = "none";

        // 공지사항 목록 새로고침
        renderNotices();
    }

    /**
     * 공지사항 삭제 함수
     */
    async function deleteNoticeById(noticeId) {
        if (confirm("정말 이 공지사항을 삭제하시겠습니까?")) {
            const success = await deleteNotice(noticeId);

            if (success) {
                noticeDetailModal.style.display = "none";
                renderNotices();
            } else {
                alert("공지사항 삭제에 실패했습니다");
            }
        }
    }

    // 이벤트 리스너 등록
    if (createNoticeBtn) {
        createNoticeBtn.addEventListener("click", openCreateNoticeModal);
    }

    if (noticeForm) {
        noticeForm.addEventListener("submit", saveNotice);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            noticeModal.style.display = "none";
        });
    }

    if (editNoticeBtn) {
        editNoticeBtn.addEventListener("click", () => {
            openEditNoticeModal(currentNoticeId);
        });
    }

    if (deleteNoticeBtn) {
        deleteNoticeBtn.addEventListener("click", () => {
            deleteNoticeById(currentNoticeId);
        });
    }

    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderNotices();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderNotices();
        }
    });

    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            button.closest(".modal").style.display = "none";
        });
    });

    noticeSearchBtn.addEventListener("click", () => {
        currentPage = 1; // 검색 시 첫 페이지로 이동
        renderNotices();
    });

    noticeSearchInput.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            currentPage = 1;
            renderNotices();
        }
    });

    // 페이지 로드 시 공지사항 목록 초기화
    renderNotices();
});
