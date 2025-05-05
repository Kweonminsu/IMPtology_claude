/**
 * 공지사항 관리를 위한 JavaScript 파일
 * 목록 조회, 작성, 수정, 삭제 기능을 구현함
 */
document.addEventListener("DOMContentLoaded", function () {
  // 샘플 공지사항 데이터 (실제 구현 시 서버에서 데이터를 가져와야 함)
  const sampleNotices = [
    {
      id: 1,
      title: "IMPtology 서비스 오픈 안내",
      content:
        "안녕하세요, IMPtology 서비스가 정식으로 오픈되었습니다.\n\n앞으로 많은 관심과 이용 부탁드립니다.\n\n감사합니다.",
      author: "관리자",
      date: "2025-05-01",
      views: 234,
    },
    {
      id: 2,
      title: "5월 시스템 정기 점검 안내",
      content:
        "안녕하세요, IMPtology 관리자입니다.\n\n5월 10일 오전 2시부터 4시까지 시스템 정기 점검이 있을 예정입니다.\n\n해당 시간에는 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.",
      author: "관리자",
      date: "2025-05-03",
      views: 156,
    },
    {
      id: 3,
      title: "데이터 연동 API 업데이트 안내",
      content:
        "IMPtology API가 업데이트되었습니다.\n\n주요 변경사항:\n- 응답 속도 개선\n- 신규 데이터 유형 추가\n- 인증 방식 강화\n\n자세한 내용은 개발자 문서를 참고해주세요.",
      author: "개발팀",
      date: "2025-05-02",
      views: 89,
    },
  ];

  // 전역 변수 선언
  let currentPage = 1; // 현재 페이지 번호
  const itemsPerPage = 10; // 페이지당 표시할 항목 수
  const totalPages = Math.ceil(sampleNotices.length / itemsPerPage); // 전체 페이지 수
  let currentNoticeId = null; // 현재 선택된 공지사항 ID (수정할 때 사용)
  let originalNotices = [...sampleNotices]; // 검색 기능을 위한 원본 데이터 보관

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

  /**
   * 공지사항 목록을 화면에 렌더링하는 함수
   * 현재 페이지에 해당하는 공지사항만 표시함
   */
  function renderNotices() {
    // 페이지네이션: 현재 페이지에 해당하는 데이터만 추출
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageNotices = sampleNotices.slice(startIndex, endIndex);

    // 테이블 내용 비우기
    noticesTbody.innerHTML = "";

    // 공지사항 데이터가 없는 경우 메시지 표시
    if (currentPageNotices.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML =
        '<td colspan="5" class="text-center">등록된 공지사항이 없습니다.</td>';
      noticesTbody.appendChild(emptyRow);
      return;
    }

    // 공지사항 항목 생성하여 테이블에 추가
    currentPageNotices.forEach((notice) => {
      const row = document.createElement("tr");
      row.dataset.id = notice.id; // 데이터 속성으로 ID 저장

      // 날짜 형식 변환
      const dateObj = new Date(notice.date);
      const formattedDate = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

      // 행 내용 설정
      row.innerHTML = `
                <td>${notice.id}</td>
                <td class="notice-title">${notice.title}</td>
                <td>${notice.author}</td>
                <td>${formattedDate}</td>
                <td>${notice.views}</td>
            `;

      // 클릭 가능함을 시각적으로 표시
      row.style.cursor = "pointer";

      // 테이블에 행 추가
      noticesTbody.appendChild(row);
    });
  }

  /**
   * 페이지네이션 버튼을 생성하는 함수
   * 현재 페이지에 해당하는 버튼은 활성화 상태로 표시
   */
  function renderPagination() {
    // 페이지 버튼 컨테이너 초기화
    paginationNumbers.innerHTML = "";

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(sampleNotices.length / itemsPerPage);

    // 페이지 버튼 생성
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.classList.add("page-number");
      pageButton.textContent = i;

      // 현재 페이지 버튼 활성화
      if (i === currentPage) {
        pageButton.classList.add("active");
      }

      // 페이지 버튼 클릭 이벤트
      pageButton.addEventListener("click", () => {
        currentPage = i;
        renderNotices();
        renderPagination();
      });

      paginationNumbers.appendChild(pageButton);
    }

    // 이전/다음 버튼 상태 업데이트
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  /**
   * 공지사항 상세 정보를 보여주는 함수
   * @param {number} id - 조회할 공지사항의 ID
   */
  function showNoticeDetail(id) {
    // ID로 공지사항 데이터 찾기
    const notice = sampleNotices.find((notice) => notice.id === id);

    if (!notice) {
      alert("공지사항을 찾을 수 없습니다.");
      return;
    }

    // 조회수 증가
    notice.views++;

    // 모달에 데이터 표시
    modalDetailTitle.textContent = notice.title;
    modalDetailDate.textContent = notice.date;
    modalDetailAuthor.textContent = notice.author;
    modalDetailViews.textContent = notice.views;
    modalDetailContent.textContent = notice.content;

    // 수정/삭제 버튼의 데이터 속성 설정
    if (editNoticeBtn) editNoticeBtn.dataset.id = notice.id;
    if (deleteNoticeBtn) deleteNoticeBtn.dataset.id = notice.id;

    // 모달 표시
    noticeDetailModal.style.display = "block";
  }

  /**
   * 공지사항을 검색하는 함수
   * @param {string} keyword - 검색할 키워드
   */
  function searchNotices(keyword) {
    // 검색어가 없으면 원본 데이터로 복원
    if (!keyword.trim()) {
      sampleNotices.splice(0, sampleNotices.length, ...originalNotices);
    } else {
      // 검색어가 있으면 제목 또는 내용에 키워드가 포함된 항목만 필터링
      const filteredNotices = originalNotices.filter(
        (notice) =>
          notice.title.toLowerCase().includes(keyword.toLowerCase()) ||
          notice.content.toLowerCase().includes(keyword.toLowerCase())
      );

      // 데이터 교체
      sampleNotices.splice(0, sampleNotices.length, ...filteredNotices);
    }

    // 첫 페이지로 이동하고 목록 다시 렌더링
    currentPage = 1;
    renderNotices();
    renderPagination();
  }

  /**
   * 공지사항 작성/수정 모달을 닫는 함수
   */
  function closeModal() {
    noticeModal.style.display = "none";
    noticeDetailModal.style.display = "none";

    // 폼 초기화
    noticeForm.reset();
    currentNoticeId = null;
  }

  /**
   * 공지사항 데이터 유효성을 검사하는 함수
   * @param {string} title - 공지사항 제목
   * @param {string} content - 공지사항 내용
   * @returns {boolean} 유효성 검사 결과
   */
  function validateNoticeData(title, content) {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return false;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return false;
    }

    if (title.length > 100) {
      alert("제목은 100자 이내로 입력해주세요.");
      return false;
    }

    return true;
  }

  /**
   * 공지사항을 저장하는 함수 (생성 또는 수정)
   * @param {Event} event - 폼 제출 이벤트
   */
  function saveNotice(event) {
    // 기본 폼 제출 동작 방지
    event.preventDefault();

    // 폼 데이터 가져오기
    const title = noticeTitle.value.trim();
    const content = noticeContent.value.trim();

    // 데이터 유효성 검사
    if (!validateNoticeData(title, content)) {
      return;
    }

    // 현재 날짜 생성
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

    if (currentNoticeId) {
      // 기존 공지사항 수정
      const noticeIndex = sampleNotices.findIndex(
        (notice) => notice.id === currentNoticeId
      );
      if (noticeIndex !== -1) {
        sampleNotices[noticeIndex].title = title;
        sampleNotices[noticeIndex].content = content;
        sampleNotices[noticeIndex].date = formattedDate; // 수정일 업데이트

        // 원본 데이터도 업데이트
        const originalIndex = originalNotices.findIndex(
          (notice) => notice.id === currentNoticeId
        );
        if (originalIndex !== -1) {
          originalNotices[originalIndex].title = title;
          originalNotices[originalIndex].content = content;
          originalNotices[originalIndex].date = formattedDate;
        }

        alert("공지사항이 수정되었습니다.");
      }
    } else {
      // 새 공지사항 추가
      const newId =
        sampleNotices.length > 0
          ? Math.max(...sampleNotices.map((notice) => notice.id)) + 1
          : 1;

      const newNotice = {
        id: newId,
        title: title,
        content: content,
        author: "관리자", // 실제로는 로그인한 사용자 정보 사용
        date: formattedDate,
        views: 0,
      };

      // 배열 맨 앞에 추가 (최신글이 상단에 표시)
      sampleNotices.unshift(newNotice);
      originalNotices.unshift({ ...newNotice });

      alert("새 공지사항이 등록되었습니다.");
    }

    // 모달 닫기
    closeModal();

    // 목록 다시 렌더링
    currentPage = 1; // 첫 페이지로 이동
    renderNotices();
    renderPagination();
  }

  /**
   * 공지사항 수정을 위해 모달을 여는 함수
   * @param {number} id - 수정할 공지사항 ID
   */
  function openEditModal(id) {
    const notice = sampleNotices.find((notice) => notice.id === id);

    if (!notice) {
      alert("공지사항을 찾을 수 없습니다.");
      return;
    }

    // 모달 타이틀 변경
    modalTitle.textContent = "공지사항 수정";

    // 폼 데이터 설정
    noticeTitle.value = notice.title;
    noticeContent.value = notice.content;

    // 현재 수정 중인 ID 저장
    currentNoticeId = notice.id;

    // 상세 모달 닫기 및 작성 모달 열기
    noticeDetailModal.style.display = "none";
    noticeModal.style.display = "block";
  }

  /**
   * 공지사항을 삭제하는 함수
   * @param {number} id - 삭제할 공지사항 ID
   */
  function deleteNotice(id) {
    if (!confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    // ID로 인덱스 찾기
    const noticeIndex = sampleNotices.findIndex((notice) => notice.id === id);

    if (noticeIndex === -1) {
      alert("공지사항을 찾을 수 없습니다.");
      return;
    }

    // 배열에서 제거
    sampleNotices.splice(noticeIndex, 1);

    // 원본 배열에서도 제거
    const originalIndex = originalNotices.findIndex(
      (notice) => notice.id === id
    );
    if (originalIndex !== -1) {
      originalNotices.splice(originalIndex, 1);
    }

    // 모달 닫기
    closeModal();

    // 목록 다시 렌더링
    // 현재 페이지에 표시할 항목이 없으면 이전 페이지로 이동
    const totalPages = Math.ceil(sampleNotices.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    renderNotices();
    renderPagination();

    alert("공지사항이 삭제되었습니다.");
  }

  // 이벤트 위임을 사용한 테이블 행 클릭 이벤트 처리
  noticesTbody.addEventListener("click", function (e) {
    // 클릭된 요소가 tr이나 그 자식 요소인지 확인
    const row = e.target.closest("tr");
    if (row && row.dataset.id) {
      // dataset.id는 문자열이므로 정수로 변환
      showNoticeDetail(parseInt(row.dataset.id));
    }
  });

  // ===== 이벤트 리스너 설정 =====

  // 페이지네이션: 이전 페이지 버튼
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderNotices();
        renderPagination();
      }
    });
  }

  // 페이지네이션: 다음 페이지 버튼
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", function () {
      const totalPages = Math.ceil(sampleNotices.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderNotices();
        renderPagination();
      }
    });
  }

  // 공지사항 작성 버튼 클릭 이벤트
  if (createNoticeBtn) {
    createNoticeBtn.addEventListener("click", function () {
      // 새 공지사항 작성 모드
      currentNoticeId = null;
      modalTitle.textContent = "공지사항 작성";
      noticeTitle.value = "";
      noticeContent.value = "";
      noticeModal.style.display = "block";
    });
  }

  // 공지사항 폼 제출 이벤트
  if (noticeForm) {
    noticeForm.addEventListener("submit", saveNotice);
  }

  // 모달 닫기 버튼 이벤트
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  // 취소 버튼 이벤트
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal();
    });
  }

  // 수정 버튼 이벤트
  if (editNoticeBtn) {
    editNoticeBtn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      openEditModal(id);
    });
  }

  // 삭제 버튼 이벤트
  if (deleteNoticeBtn) {
    deleteNoticeBtn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      deleteNotice(id);
    });
  }

  // 검색 버튼 이벤트
  if (noticeSearchBtn) {
    noticeSearchBtn.addEventListener("click", function () {
      const keyword = noticeSearchInput.value.trim();
      searchNotices(keyword);
    });
  }

  // 검색 입력 필드 엔터키 이벤트
  if (noticeSearchInput) {
    noticeSearchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const keyword = this.value.trim();
        searchNotices(keyword);
      }
    });
  }

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  // 모달 외부 클릭 시 닫기
  window.addEventListener("click", function (e) {
    if (e.target === noticeModal) {
      closeModal();
    }
    if (e.target === noticeDetailModal) {
      closeModal();
    }
  });

  // 페이지 로드 시 초기 데이터 렌더링
  renderNotices();
  renderPagination();
});
