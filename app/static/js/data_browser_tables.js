document.addEventListener('DOMContentLoaded', function() {
    // API에서 테이블 데이터를 가져오는 함수
    async function fetchTables() {
        try {
            // API 엔드포인트에서 테이블 목록 가져오기
            const response = await fetch('/api/v1/data-browser/tables');
            if (!response.ok) {
                throw new Error('테이블 데이터를 불러오는데 실패했습니다');
            }
            return await response.json();
        } catch (error) {
            console.error('테이블 목록 가져오기 오류:', error);
            return []; // 오류 발생 시 빈 배열 반환
        }
    }

    // 특정 테이블의 상세 정보를 가져오는 함수
    async function fetchTableDetail(tableId) {
        try {
            const response = await fetch(`/api/v1/data-browser/tables/${tableId}`);
            if (!response.ok) {
                throw new Error('테이블 상세 정보를 불러오는데 실패했습니다');
            }
            return await response.json();
        } catch (error) {
            console.error('테이블 상세 정보 가져오기 오류:', error);
            return null;
        }
    }

    // 카테고리별 색상 지정
    function getFolderColor(category) {
        const colors = {
            'production': '#4A90E2', // 파란색
            'quality': '#50E3C2',    // 청록색
            'sales': '#F5A623',      // 노란색/주황색
            'hr': '#E74C3C'          // 빨간색
        };

        return colors[category] || '#00f0ff'; // 기본 색상
    }

    // 카테고리 이름 변환 함수
    function getCategoryName(category) {
        const categories = {
            'production': '생산',
            'quality': '품질',
            'sales': '판매',
            'hr': '인사'
        };

        return categories[category] || category;
    }

    // 테이블 폴더 생성 함수
    function createTableFolder(table) {
        const tableFolder = document.createElement('div');
        tableFolder.className = 'table-folder';
        tableFolder.dataset.tableId = table.id;

        tableFolder.innerHTML = `
            <div class="folder-icon">
                <div class="folder-tab"></div>
                <div class="folder-body">
                    <div class="folder-texture"></div>
                </div>
                <div class="folder-paper"></div>
            </div>
            <div class="table-name">${table.displayName}</div>
            <div class="table-category">${getCategoryName(table.category)}</div>
        `;

        // 테이블 폴더 클릭 이벤트
        tableFolder.addEventListener('click', function() {
            openTableDetail(table.id);
        });

        return tableFolder;
    }

    // 테이블 목록 렌더링 함수
    function renderTables(tables) {
        const tablesGrid = document.getElementById('tables-grid');
        tablesGrid.innerHTML = '';

        tables.forEach(table => {
            const tableFolder = createTableFolder(table);
            tablesGrid.appendChild(tableFolder);
        });
    }

    // 테이블 상세 정보 열기 함수
    async function openTableDetail(tableId) {
        // API에서 테이블 상세 정보 가져오기
        const table = await fetchTableDetail(tableId);
        if (!table) return;

        // 모달 내용 채우기
        document.getElementById('modal-table-name').textContent = table.displayName;
        document.getElementById('table-description').textContent = table.description;
        document.getElementById('update-cycle').textContent = table.updateCycle;
        document.getElementById('table-admin').textContent = table.admin;
        document.getElementById('record-count').textContent = table.recordCount.toLocaleString();
        document.getElementById('created-date').textContent = table.createdDate;
        document.getElementById('last-update').textContent = `마지막 업데이트: ${table.lastUpdate}`;

        // 컬럼 정보 채우기
        const columnsContainer = document.getElementById('columns-container');
        columnsContainer.innerHTML = '';

        table.columns.forEach(column => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${column.name}</td>
                <td>${column.type}</td>
                <td>${column.description}</td>
                <td>${column.nullable ? 'Yes' : 'No'}</td>
            `;
            columnsContainer.appendChild(row);
        });

        // 모달 열기
        const modal = document.getElementById('table-detail-modal');
        modal.style.display = 'block';
    }

    // 모달 닫기 함수
    function closeModal() {
        const modal = document.getElementById('table-detail-modal');
        modal.style.display = 'none';
    }

    // 테이블 검색 함수
    async function searchTables() {
        const searchTerm = document.getElementById('table-search').value.trim();
        const categoryFilter = document.getElementById('category-filter').value;

        try {
            let tables = [];

            // 검색어가 있는 경우 API 검색 엔드포인트 호출
            if (searchTerm) {
                const response = await fetch(`/api/v1/data-browser/tables/search?query=${searchTerm}`);
                if (response.ok) {
                    tables = await response.json();
                }
            } else {
                // 검색어가 없으면 전체 테이블 목록 가져오기
                tables = await fetchTables();
            }

            // 카테고리 필터링 (클라이언트 측에서 추가 필터링)
            if (categoryFilter !== 'all') {
                tables = tables.filter(table => table.category === categoryFilter);
            }

            renderTables(tables);
        } catch (error) {
            console.error('검색 중 오류 발생:', error);
        }
    }

    // 이벤트 리스너 등록
    document.getElementById('table-search').addEventListener('input', searchTables);
    document.getElementById('category-filter').addEventListener('change', searchTables);

    document.querySelector('.close-modal').addEventListener('click', closeModal);

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('table-detail-modal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // 데이터 조회 버튼 클릭 이벤트
    document.querySelector('.view-data-btn').addEventListener('click', function() {
        // 실제 구현에서는 데이터 조회 페이지로 이동
        alert('데이터 조회 페이지로 이동합니다.');
    });

    // 정보 다운로드 버튼 클릭 이벤트
    document.querySelector('.download-info-btn').addEventListener('click', function() {
        // 실제 구현에서는 테이블 정보 다운로드 기능 구현
        alert('테이블 정보를 다운로드합니다.');
    });

    // 페이지 로드 시 초기 테이블 목록 가져오기
    fetchTables().then(tables => {
        renderTables(tables);
    });
});
