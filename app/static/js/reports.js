document.addEventListener('DOMContentLoaded', function() {
    // 뷰 전환 기능 (그리드 뷰/리스트 뷰)
    const viewButtons = document.querySelectorAll('.view-button');
    const reportsGrid = document.querySelector('.reports-grid');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 모든 버튼에서 active 클래스 제거
            viewButtons.forEach(btn => btn.classList.remove('active'));

            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');

            // 뷰 타입에 따라 그리드 클래스 변경
            if (this.textContent.trim().includes('리스트 뷰')) {
                reportsGrid.classList.remove('grid-view');
                reportsGrid.classList.add('list-view');
            } else {
                reportsGrid.classList.remove('list-view');
                reportsGrid.classList.add('grid-view');
            }
        });
    });

    // 리포트 필터링 기능
    const filterSelects = document.querySelectorAll('.filter-select');

    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            filterReports();
        });
    });

    // 리포트 검색 기능
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-button');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filterReports(searchTerm);
        });

        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim().toLowerCase();
                filterReports(searchTerm);
            }
        });
    }

    // 새 리포트 생성 버튼
    const createReportButton = document.querySelector('.create-report-button');
    const newReportCard = document.querySelector('.new-report');

    if (createReportButton) {
        createReportButton.addEventListener('click', function() {
            navigateToReportCreator();
        });
    }

    if (newReportCard) {
        newReportCard.addEventListener('click', function() {
            navigateToReportCreator();
        });
    }

    // 리포트 탭 전환
    const reportsTabs = document.querySelectorAll('.reports-tab');

    reportsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 모든 탭에서 active 클래스 제거
            reportsTabs.forEach(t => t.classList.remove('active'));

            // 클릭된 탭에 active 클래스 추가
            this.classList.add('active');

            // 탭에 따른 리포트 필터링
            const tabType = this.textContent.trim();
            filterReportsByTab(tabType);
        });
    });

    // 리포트 카드 액션 버튼
    const viewButtons = document.querySelectorAll('.action-button.view');
    const shareButtons = document.querySelectorAll('.action-button.share');
    const moreButtons = document.querySelectorAll('.action-button.more');

    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const reportCard = this.closest('.report-card');
            const reportTitle = reportCard.querySelector('.report-title').textContent;
            viewReport(reportTitle);
        });
    });

    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const reportCard = this.closest('.report-card');
            const reportTitle = reportCard.querySelector('.report-title').textContent;
            openShareDialog(reportTitle);
        });
    });

    moreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const reportCard = this.closest('.report-card');
            openContextMenu(reportCard, e);
        });
    });

    // 템플릿 사용 버튼
    const templateUseButtons = document.querySelectorAll('.template-use-btn');

    templateUseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateCard = this.closest('.template-card');
            const templateTitle = templateCard.querySelector('.template-title').textContent;
            useTemplate(templateTitle);
        });
    });

    // 예약된 리포트 테이블 액션 버튼
    const editButtons = document.querySelectorAll('.table-action.edit');
    const deleteButtons = document.querySelectorAll('.table-action.delete');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const reportName = row.querySelector('td:first-child').textContent;
            editScheduledReport(reportName);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const reportName = row.querySelector('td:first-child').textContent;
            confirmDeleteScheduledReport(reportName, row);
        });
    });

    // 초기 설정: 모든 리포트 카드에 애니메이션 적용
    animateReportCards();
});

// 리포트 필터링 함수
function filterReports(searchTerm = null) {
    const categoryFilter = document.querySelector('.filter-select:first-of-type').value;
    const sortFilter = document.querySelector('.filter-select:last-of-type').value;
    const reportCards = document.querySelectorAll('.report-card:not(.new-report)');

    reportCards.forEach(card => {
        let show = true;
        const reportTitle = card.querySelector('.report-title').textContent.toLowerCase();
        const reportDescription = card.querySelector('.report-description').textContent.toLowerCase();

        // 검색어 필터링
        if (searchTerm && !reportTitle.includes(searchTerm) && !reportDescription.includes(searchTerm)) {
            show = false;
        }

        // 카테고리 필터링
        if (categoryFilter !== '모든 카테고리') {
            const cardType = card.querySelector('.report-thumb').classList[1]; // production, quality, etc.
            const categoryMap = {
                '생산 보고서': 'production',
                '품질 보고서': 'quality',
                '설비 보고서': 'equipment',
                '공정 보고서': 'process'
            };

            if (categoryMap[categoryFilter] !== cardType) {
                show = false;
            }
        }

        // 카드 표시 여부 설정
        card.style.display = show ? '' : 'none';
    });

    // 정렬 적용
    sortReports(sortFilter);

    // 애니메이션 재적용
    animateReportCards();
}

// 리포트 정렬 함수
function sortReports(sortType) {
    const reportsGrid = document.querySelector('.reports-grid');
    const reportCards = Array.from(document.querySelectorAll('.report-card:not(.new-report)'));
    const newReportCard = document.querySelector('.new-report');

    // 정렬 기준에 따라 카드 정렬
    reportCards.sort((a, b) => {
        if (sortType === '최신순') {
            const dateA = new Date(a.querySelector('.report-date').textContent.replace('최종 업데이트: ', ''));
            const dateB = new Date(b.querySelector('.report-date').textContent.replace('최종 업데이트: ', ''));
            return dateB - dateA;
        } else if (sortType === '오래된순') {
            const dateA = new Date(a.querySelector('.report-date').textContent.replace('최종 업데이트: ', ''));
            const dateB = new Date(b.querySelector('.report-date').textContent.replace('최종 업데이트: ', ''));
            return dateA - dateB;
        } else if (sortType === '이름순') {
            const nameA = a.querySelector('.report-title').textContent;
            const nameB = b.querySelector('.report-title').textContent;
            return nameA.localeCompare(nameB);
        } else if (sortType === '많이 본 순') {
            const viewsA = parseInt(a.querySelector('.report-views').textContent.replace('회 조회', ''));
            const viewsB = parseInt(b.querySelector('.report-views').textContent.replace('회 조회', ''));
            return viewsB - viewsA;
        }
        return 0;
    });

    // DOM에서 제거했다가 정렬된 순서로 다시 추가
    reportCards.forEach(card => reportsGrid.removeChild(card));
    if (newReportCard) reportsGrid.removeChild(newReportCard);

    reportCards.forEach(card => {
        if (card.style.display !== 'none') {
            reportsGrid.appendChild(card);
        }
    });

    // 새 리포트 카드는 항상 마지막에 추가
    if (newReportCard) reportsGrid.appendChild(newReportCard);
}

// 탭별 리포트 필터링
function filterReportsByTab(tabType) {
    const reportCards = document.querySelectorAll('.report-card:not(.new-report)');

    reportCards.forEach(card => {
        let show = true;

        if (tabType === '내 리포트') {
            // 기본 탭: 모든 리포트 표시
        } else if (tabType === '공유된 리포트') {
            // 공유된 리포트만 표시
            const isShared = card.querySelector('.report-badge.shared') !== null;
            if (!isShared) show = false;
        } else if (tabType === '템플릿') {
            // 템플릿 섹션만 표시하고 리포트 카드 숨김
            show = false;
        } else if (tabType === '아카이브') {
            // 아카이브된 리포트는 현재 없음
            show = false;
        }

        card.style.display = show ? '' : 'none';
    });

    // 템플릿 섹션과 예약 섹션 토글
    const templateSection = document.querySelector('.template-section');
    const scheduleSection = document.querySelector('.schedule-section');

    if (templateSection) {
        templateSection.style.display = tabType === '템플릿' ? 'block' : 'none';
    }

    if (scheduleSection) {
        scheduleSection.style.display = tabType === '내 리포트' ? 'block' : 'none';
    }

    // 애니메이션 재적용
    animateReportCards();
}

// 리포트 보기 함수
function viewReport(reportTitle) {
    console.log(`리포트 보기: ${reportTitle}`);

    // 실제 구현시 리포트 상세 페이지로 이동
    showNotification(`"${reportTitle}" 리포트를 불러오는 중...`, 'info');

    // 리포트 페이지로 이동 (실제 구현시 경로 수정 필요)
    // window.location.href = `/report-detail/${encodeURIComponent(reportTitle)}`;

    // 데모 목적으로 알림만 표시
    setTimeout(() => {
        showNotification(`"${reportTitle}" 리포트가 준비되었습니다.`, 'success');
    }, 1500);
}

// 공유 대화상자 열기
function openShareDialog(reportTitle) {
    console.log(`리포트 공유: ${reportTitle}`);

    // 공유 모달 생성 (실제 구현시 HTML 모달 사용)
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>리포트 공유</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>"${reportTitle}" 리포트를 공유합니다.</p>
                <div class="share-options">
                    <div class="share-option email">
                        <input type="text" placeholder="이메일 주소 입력">
                        <button>추가</button>
                    </div>
                    <div class="recipients-list">
                        <div class="recipient">
                            <span>user1@example.com</span>
                            <button class="remove-recipient">&times;</button>
                        </div>
                        <div class="recipient">
                            <span>user2@example.com</span>
                            <button class="remove-recipient">&times;</button>
                        </div>
                    </div>
                </div>
                <div class="permission-options">
                    <label>
                        <input type="radio" name="permission" value="view" checked>
                        <span>보기 권한</span>
                    </label>
                    <label>
                        <input type="radio" name="permission" value="edit">
                        <span>편집 권한</span>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-button">취소</button>
                <button class="share-button">공유하기</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 모달 닫기 이벤트 설정
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('.cancel-button').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 공유 버튼 클릭 이벤트
    modal.querySelector('.share-button').addEventListener('click', () => {
        document.body.removeChild(modal);
        showNotification(`"${reportTitle}" 리포트가 성공적으로 공유되었습니다.`, 'success');
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 컨텍스트 메뉴 열기
function openContextMenu(reportCard, event) {
    const reportTitle = reportCard.querySelector('.report-title').textContent;

    // 기존 컨텍스트 메뉴 제거
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        document.body.removeChild(existingMenu);
    }

    // 새 컨텍스트 메뉴 생성
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <ul>
            <li data-action="edit">편집</li>
            <li data-action="duplicate">복제</li>
            <li data-action="schedule">예약 설정</li>
            <li data-action="export">내보내기</li>
            <li data-action="delete" class="danger">삭제</li>
        </ul>
    `;

    // 컨텍스트 메뉴 위치 설정
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;

    document.body.appendChild(contextMenu);

    // 메뉴 항목 클릭 이벤트 설정
    contextMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleContextMenuAction(action, reportTitle, reportCard);
            document.body.removeChild(contextMenu);
        });
    });

    // 다른 곳 클릭 시 메뉴 닫기
    document.addEventListener('click', function closeMenu(e) {
        if (!contextMenu.contains(e.target)) {
            if (document.body.contains(contextMenu)) {
                document.body.removeChild(contextMenu);
            }
            document.removeEventListener('click', closeMenu);
        }
    });
}

// 컨텍스트 메뉴 액션 처리
function handleContextMenuAction(action, reportTitle, reportCard) {
    switch (action) {
        case 'edit':
            console.log(`리포트 편집: ${reportTitle}`);
            showNotification(`"${reportTitle}" 리포트 편집 모드로 전환합니다.`, 'info');
            break;
        case 'duplicate':
            console.log(`리포트 복제: ${reportTitle}`);
            showNotification(`"${reportTitle}" 리포트가 복제되었습니다.`, 'success');
            break;
        case 'schedule':
            console.log(`리포트 예약 설정: ${reportTitle}`);
            openScheduleDialog(reportTitle);
            break;
        case 'export':
            console.log(`리포트 내보내기: ${reportTitle}`);
            showNotification(`"${reportTitle}" 리포트를 내보내는 중...`, 'info');
            setTimeout(() => {
                showNotification(`"${reportTitle}" 리포트가 내보내기 되었습니다.`, 'success');
            }, 1000);
            break;
        case 'delete':
            console.log(`리포트 삭제: ${reportTitle}`);
            confirmDeleteReport(reportTitle, reportCard);
            break;
    }
}

// 리포트 삭제 확인
function confirmDeleteReport(reportTitle, reportCard) {
    if (confirm(`"${reportTitle}" 리포트를 삭제하시겠습니까?`)) {
        // 실제 구현시 API 호출하여 삭제
        reportCard.style.opacity = '0';
        reportCard.style.transform = 'scale(0.8)';

        setTimeout(() => {
            reportCard.remove();
            showNotification(`"${reportTitle}" 리포트가 삭제되었습니다.`, 'success');
        }, 300);
    }
}

// 예약 설정 대화상자 열기
function openScheduleDialog(reportTitle) {
    // 예약 모달 생성 (실제 구현시 HTML 모달 사용)
    const modal = document.createElement('div');
    modal.className = 'schedule-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>리포트 예약 설정</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>"${reportTitle}" 리포트 예약을 설정합니다.</p>
                <div class="schedule-form">
                    <div class="form-group">
                        <label>반복 주기</label>
                        <select class="frequency-select">
                            <option value="daily">매일</option>
                            <option value="weekly">매주</option>
                            <option value="monthly">매월</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>수신자</label>
                        <input type="text" placeholder="이메일 주소 입력">
                        <button class="add-recipient">추가</button>
                    </div>
                    <div class="recipients-list">
                        <div class="recipient">
                            <span>user1@example.com</span>
                            <button class="remove-recipient">&times;</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-button">취소</button>
                <button class="save-button">저장</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 모달 닫기 이벤트 설정
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('.cancel-button').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 저장 버튼 클릭 이벤트
    modal.querySelector('.save-button').addEventListener('click', () => {
        const frequency = modal.querySelector('.frequency-select').value;
        document.body.removeChild(modal);
        showNotification(`"${reportTitle}" 리포트가 ${frequency === 'daily' ? '매일' : frequency === 'weekly' ? '매주' : '매월'} 예약되었습니다.`, 'success');

        // 실제 구현시 예약된 리포트 테이블 업데이트
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 템플릿 사용 함수
function useTemplate(templateTitle) {
    console.log(`템플릿 사용: ${templateTitle}`);
    showNotification(`"${templateTitle}" 템플릿을 사용하여 새 리포트를 생성합니다.`, 'info');

    // 리포트 생성 페이지로 이동하는 대신 알림만 표시 (데모 목적)
    setTimeout(() => {
        showNotification(`"${templateTitle}" 템플릿이 적용되었습니다.`, 'success');
    }, 1000);
}

// 예약된 리포트 편집 함수
function editScheduledReport(reportName) {
    console.log(`예약된 리포트 편집: ${reportName}`);

    // 예약 설정 대화상자 열기
    openScheduleDialog(reportName);
}

// 예약된 리포트 삭제 확인
function confirmDeleteScheduledReport(reportName, row) {
    if (confirm(`"${reportName}" 예약을 삭제하시겠습니까?`)) {
        console.log(`예약된 리포트 삭제: ${reportName}`);

        // 행 애니메이션 및 제거
        row.style.backgroundColor = 'rgba(255, 94, 148, 0.1)';
        setTimeout(() => {
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                showNotification(`"${reportName}" 예약이 삭제되었습니다.`, 'success');
            }, 300);
        }, 300);
    }
}

// 리포트 생성 페이지로 이동
function navigateToReportCreator() {
    console.log('새 리포트 생성 시작');
    showNotification('새 리포트 생성 페이지로 이동합니다.', 'info');

    // 실제 구현시 페이지 이동
    // window.location.href = '/create-report';

    // 데모 목적으로 알림만 표시
    setTimeout(() => {
        showNotification('리포트 생성 페이지가 준비되었습니다.', 'success');
    }, 1000);
}

// 리포트 카드 애니메이션 적용
function animateReportCards() {
    const reportCards = document.querySelectorAll('.report-card, .template-card');

    reportCards.forEach((card, index) => {
        if (card.style.display !== 'none') {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50); // 순차적 애니메이션 효과
        }
    });
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림이 있으면 제거
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;

    document.body.appendChild(notification);

    // 알림 표시
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // 알림 자동 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
