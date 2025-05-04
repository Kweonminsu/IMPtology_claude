document.addEventListener('DOMContentLoaded', function() {
    // 샘플 테이블 데이터
    const tables = [
        {
            id: 1,
            name: "production_history",
            displayName: "생산 이력",
            category: "production",
            description: "공장에서 생산된 제품의 이력을 저장하는 테이블입니다. 설비별, 라인별, 제품별 생산량 및 불량률 등의 생산 관련 데이터를 포함합니다.",
            updateCycle: "실시간",
            admin: "생산관리팀",
            recordCount: 1287654,
            createdDate: "2023-04-15",
            lastUpdate: "2025-05-03",
            columns: [
                { name: "production_id", type: "BIGINT", description: "생산 이력 고유 ID", nullable: false },
                { name: "factory_id", type: "INT", description: "제조 공장 ID", nullable: false },
                { name: "line_id", type: "INT", description: "생산 라인 ID", nullable: false },
                { name: "product_id", type: "VARCHAR(20)", description: "제품 코드", nullable: false },
                { name: "quantity", type: "INT", description: "생산 수량", nullable: false },
                { name: "defect_rate", type: "DECIMAL(5,2)", description: "불량률 (%)", nullable: true },
                { name: "start_time", type: "TIMESTAMP", description: "생산 시작 시간", nullable: false },
                { name: "end_time", type: "TIMESTAMP", description: "생산 종료 시간", nullable: false },
                { name: "operator_id", type: "INT", description: "작업자 ID", nullable: true }
            ]
        },
        {
            id: 2,
            name: "quality_inspection",
            displayName: "품질 검사",
            category: "quality",
            description: "제품의 품질 검사 결과를 저장하는 테이블입니다. 각종 품질 지표와 검사 결과 데이터를 포함합니다.",
            updateCycle: "일 1회",
            admin: "품질관리팀",
            recordCount: 354982,
            createdDate: "2023-05-22",
            lastUpdate: "2025-05-02",
            columns: [
                { name: "inspection_id", type: "BIGINT", description: "검사 고유 ID", nullable: false },
                { name: "production_id", type: "BIGINT", description: "생산 이력 ID", nullable: false },
                { name: "inspector_id", type: "INT", description: "검사원 ID", nullable: false },
                { name: "inspection_date", type: "DATE", description: "검사 일자", nullable: false },
                { name: "pass_fail", type: "BOOLEAN", description: "합격 여부", nullable: false },
                { name: "defect_type", type: "VARCHAR(50)", description: "불량 유형", nullable: true },
                { name: "measurement_1", type: "DECIMAL(8,3)", description: "측정값 1", nullable: true },
                { name: "measurement_2", type: "DECIMAL(8,3)", description: "측정값 2", nullable: true },
                { name: "notes", type: "TEXT", description: "검사 비고", nullable: true }
            ]
        },
        {
            id: 3,
            name: "sales_transactions",
            displayName: "판매 내역",
            category: "sales",
            description: "제품 판매 거래 내역을 저장하는 테이블입니다. 고객, 제품, 판매량, 매출액 등의 판매 관련 데이터를 포함합니다.",
            updateCycle: "시간당",
            admin: "영업팀",
            recordCount: 892561,
            createdDate: "2023-03-10",
            lastUpdate: "2025-05-04",
            columns: [
                { name: "transaction_id", type: "BIGINT", description: "거래 고유 ID", nullable: false },
                { name: "customer_id", type: "INT", description: "고객 ID", nullable: false },
                { name: "product_id", type: "VARCHAR(20)", description: "제품 코드", nullable: false },
                { name: "sales_date", type: "TIMESTAMP", description: "판매 일시", nullable: false },
                { name: "quantity", type: "INT", description: "판매 수량", nullable: false },
                { name: "unit_price", type: "DECIMAL(10,2)", description: "단가", nullable: false },
                { name: "total_amount", type: "DECIMAL(12,2)", description: "총 금액", nullable: false },
                { name: "discount", type: "DECIMAL(10,2)", description: "할인액", nullable: true },
                { name: "sales_rep_id", type: "INT", description: "영업 담당자 ID", nullable: true },
                { name: "region_id", type: "INT", description: "지역 ID", nullable: false }
            ]
        },
        {
            id: 4,
            name: "inventory_status",
            displayName: "재고 현황",
            category: "production",
            description: "제품 및 원자재의 재고 현황을 저장하는 테이블입니다. 현재 재고량, 입고량, 출고량 등의 재고 관련 데이터를 포함합니다.",
            updateCycle: "일 1회",
            admin: "자재관리팀",
            recordCount: 42680,
            createdDate: "2023-04-15",
            lastUpdate: "2025-05-03",
            columns: [
                { name: "inventory_id", type: "BIGINT", description: "재고 고유 ID", nullable: false },
                { name: "item_id", type: "VARCHAR(20)", description: "품목 코드", nullable: false },
                { name: "item_type", type: "VARCHAR(20)", description: "품목 유형 (원자재/제품)", nullable: false },
                { name: "warehouse_id", type: "INT", description: "창고 ID", nullable: false },
                { name: "quantity", type: "INT", description: "현재 재고량", nullable: false },
                { name: "received_qty", type: "INT", description: "입고량", nullable: true },
                { name: "shipped_qty", type: "INT", description: "출고량", nullable: true },
                { name: "min_stock_level", type: "INT", description: "최소 재고량", nullable: true },
                { name: "max_stock_level", type: "INT", description: "최대 재고량", nullable: true },
                { name: "last_updated", type: "TIMESTAMP", description: "최종 업데이트 시간", nullable: false }
            ]
        },
        {
            id: 5,
            name: "employee_records",
            displayName: "직원 정보",
            category: "hr",
            description: "회사 직원들의 기본 정보를 저장하는 테이블입니다. 직원 연락처, 부서, 직급 등의 인사 관련 데이터를 포함합니다.",
            updateCycle: "주 1회",
            admin: "인사팀",
            recordCount: 3256,
            createdDate: "2023-01-05",
            lastUpdate: "2025-05-01",
            columns: [
                { name: "employee_id", type: "INT", description: "직원 고유 ID", nullable: false },
                { name: "first_name", type: "VARCHAR(50)", description: "이름", nullable: false },
                { name: "last_name", type: "VARCHAR(50)", description: "성", nullable: false },
                { name: "email", type: "VARCHAR(100)", description: "이메일", nullable: false },
                { name: "phone_number", type: "VARCHAR(20)", description: "전화번호", nullable: true },
                { name: "hire_date", type: "DATE", description: "입사일", nullable: false },
                { name: "job_id", type: "INT", description: "직무 ID", nullable: false },
                { name: "salary", type: "DECIMAL(10,2)", description: "급여", nullable: false },
                { name: "department_id", type: "INT", description: "부서 ID", nullable: false },
                { name: "manager_id", type: "INT", description: "관리자 ID", nullable: true },
                { name: "status", type: "VARCHAR(20)", description: "재직 상태", nullable: false }
            ]
        },
        {
            id: 6,
            name: "customer_data",
            displayName: "고객 데이터",
            category: "sales",
            description: "고객 정보를 저장하는 테이블입니다. 고객 연락처, 주소, 구매 이력 등의 고객 관련 데이터를 포함합니다.",
            updateCycle: "일 1회",
            admin: "마케팅팀",
            recordCount: 125789,
            createdDate: "2023-02-15",
            lastUpdate: "2025-05-03",
            columns: [
                { name: "customer_id", type: "INT", description: "고객 고유 ID", nullable: false },
                { name: "company_name", type: "VARCHAR(100)", description: "회사명", nullable: false },
                { name: "contact_name", type: "VARCHAR(100)", description: "담당자 이름", nullable: false },
                { name: "contact_title", type: "VARCHAR(50)", description: "담당자 직위", nullable: true },
                { name: "address", type: "VARCHAR(200)", description: "주소", nullable: true },
                { name: "city", type: "VARCHAR(50)", description: "도시", nullable: true },
                { name: "region", type: "VARCHAR(50)", description: "지역", nullable: true },
                { name: "postal_code", type: "VARCHAR(20)", description: "우편번호", nullable: true },
                { name: "country", type: "VARCHAR(50)", description: "국가", nullable: true },
                { name: "phone", type: "VARCHAR(20)", description: "전화번호", nullable: true },
                { name: "email", type: "VARCHAR(100)", description: "이메일", nullable: true },
                { name: "customer_type", type: "VARCHAR(20)", description: "고객 유형", nullable: false },
                { name: "credit_limit", type: "DECIMAL(12,2)", description: "신용 한도", nullable: true }
            ]
        }
    ];

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
    function openTableDetail(tableId) {
        const table = tables.find(t => t.id === parseInt(tableId));
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
    function searchTables() {
        const searchTerm = document.getElementById('table-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;

        const filteredTables = tables.filter(table => {
            const matchesSearch = table.name.toLowerCase().includes(searchTerm) ||
                                table.displayName.toLowerCase().includes(searchTerm) ||
                                table.description.toLowerCase().includes(searchTerm);

            const matchesCategory = categoryFilter === 'all' || table.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });

        renderTables(filteredTables);
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

    // 초기 테이블 목록 렌더링
    renderTables(tables);
});
