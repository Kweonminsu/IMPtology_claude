document.addEventListener('DOMContentLoaded', function() {
  // DOM 요소
  const API_BASE_URL = '/api/v1/data-browser';
  const tableSelect = document.getElementById('table-select');
  const columnsSection = document.getElementById('columns-section');
  const columnsContainer = document.getElementById('columns-container');
  const filtersSection = document.getElementById('filters-section');
  const filtersContainer = document.getElementById('filters-container');
  const addFilterBtn = document.getElementById('add-filter-btn');
  const searchBtn = document.getElementById('search-btn');
  const resetBtn = document.getElementById('reset-btn');
  const resultsPanel = document.getElementById('results-panel');
  const resultCount = document.getElementById('result-count');
  const resultsTableHead = document.getElementById('results-table-head');
  const resultsTableBody = document.getElementById('results-table-body');
  const paginationContainer = document.getElementById('pagination-container');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const selectAllColumnsBtn = document.getElementById('select-all-columns');
  const deselectAllColumnsBtn = document.getElementById('deselect-all-columns');

  // 상태 변수
  let tables = [];
  let selectedTable = null;
  let selectedColumns = [];
  let currentPage = 1;
  let totalPages = 1;
  let pageSize = 20;
  let currentResults = [];

  // 초기화 함수
  async function init() {
    await loadTables();
    setupEventListeners();
  }

  // 테이블 목록 가져오기
/**
 * 테이블 목록을 서버에서 비동기적으로 가져오는 함수
 * API 호출을 통해 사용 가능한 데이터 테이블 목록을 가져와서 드롭다운에 표시함
 */
/**
 * 테이블 목록을 서버에서 비동기적으로 가져오는 함수
 * API 호출을 통해 사용 가능한 데이터 테이블 목록을 가져와서 드롭다운에 표시함
 */
/**
 * 테이블 목록을 서버에서 비동기적으로 가져오는 함수
 */
async function loadTables() {
  try {
    // API 엔드포인트로 HTTP 요청 전송 (현재 파일 구조에 맞게 수정)
const response = await fetch(`${API_BASE_URL}/tables`);

    if (!response.ok) {
      throw new Error('테이블 목록을 불러오는데 실패했습니다.');
    }

    tables = await response.json();

    // 테이블 선택 옵션 생성
    tableSelect.innerHTML = '<option value="">테이블을 선택하세요</option>';

    tables.forEach(table => {
      const option = document.createElement('option');
      option.value = table.name;
      option.textContent = `${table.displayName} (${table.name})`;
      tableSelect.appendChild(option);
    });
  } catch (error) {
    console.error('테이블 로드 오류:', error);
    alert('테이블 목록을 불러오는데 실패했습니다.');
  }
}


  // 테이블 정보 가져오기
  async function loadTableInfo(tableName) {
    selectedTable = tables.find(t => t.name === tableName);

    if (!selectedTable) {
      return;
    }

    // 컬럼 섹션 표시 및 체크박스 생성
    columnsSection.style.display = 'block';
    columnsContainer.innerHTML = '';

    selectedTable.columns.forEach(column => {
      const columnCheckbox = document.createElement('div');
      columnCheckbox.className = 'column-checkbox';
      columnCheckbox.innerHTML = `
        <input type="checkbox" id="col-${column.name}" name="columns" value="${column.name}">
        <label for="col-${column.name}">
          ${column.name}
          <span class="column-type">${column.type}</span>
        </label>
      `;
      columnsContainer.appendChild(columnCheckbox);

      // 체크박스 이벤트
      const checkbox = columnCheckbox.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', updateSelectedColumns);
    });

    // 필터 섹션 표시
    filtersSection.style.display = 'block';
    filtersContainer.innerHTML = '';

    // 필터 하나 추가
    addFilter();

    // 선택된 컬럼 초기화
    selectedColumns = [];
    updateSearchButtonState();
  }

  // 선택된 컬럼 업데이트
  function updateSelectedColumns() {
    const checkboxes = columnsContainer.querySelectorAll('input[type="checkbox"]:checked');
    selectedColumns = Array.from(checkboxes).map(cb => cb.value);
    updateSearchButtonState();

    // 필터 드롭다운 업데이트
    updateFilterColumnOptions();
  }

  // 필터 추가
  function addFilter() {
    const filterTemplate = document.getElementById('filter-template');
    const filterClone = document.importNode(filterTemplate.content, true);
    filtersContainer.appendChild(filterClone);

    const filterItem = filtersContainer.lastElementChild;
    const removeBtn = filterItem.querySelector('.remove-filter-btn');
    const columnSelect = filterItem.querySelector('.filter-column');
    const operatorSelect = filterItem.querySelector('.filter-operator');
    const valueInput = filterItem.querySelector('.filter-value');

    // 컬럼 옵션 추가
    updateFilterColumnOptions();

    // 이벤트 리스너
    removeBtn.addEventListener('click', () => {
      filterItem.remove();
    });

    // 연산자에 따라 값 입력란 표시/숨김
    operatorSelect.addEventListener('change', () => {
      const operator = operatorSelect.value;
      if (operator === 'isnull' || operator === 'isnotnull') {
        valueInput.style.display = 'none';
        valueInput.required = false;
      } else {
        valueInput.style.display = 'block';
        valueInput.required = true;
      }
    });

    // 컬럼 선택에 따라 적절한 연산자 표시
    columnSelect.addEventListener('change', () => {
      const columnName = columnSelect.value;
      if (columnName) {
        const column = selectedTable.columns.find(col => col.name === columnName);
        updateOperatorsByColumnType(column.type, operatorSelect);
      }
    });
  }

  // 필터 컬럼 옵션 업데이트
  function updateFilterColumnOptions() {
    const columnSelects = document.querySelectorAll('.filter-column');

    columnSelects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">컬럼 선택</option>';

      if (selectedTable) {
        selectedTable.columns.forEach(column => {
          const option = document.createElement('option');
          option.value = column.name;
          option.textContent = `${column.name} (${column.type})`;
          select.appendChild(option);
        });
      }

      // 이전 선택값 복원
      if (currentValue) {
        select.value = currentValue;
      }
    });
  }

  // 컬럼 타입에 따라 적절한 연산자 표시
  function updateOperatorsByColumnType(columnType, operatorSelect) {
    const currentValue = operatorSelect.value;
    operatorSelect.innerHTML = '';

    // 기본 연산자 (모든 타입에 적용)
    const baseOperators = [
      { value: 'eq', text: '같음 (=)' },
      { value: 'neq', text: '같지 않음 (!=)' },
      { value: 'isnull', text: 'NULL' },
      { value: 'isnotnull', text: 'NOT NULL' }
    ];

    // 숫자 타입 연산자
    const numericOperators = [
      { value: 'gt', text: '초과 (>)' },
      { value: 'gte', text: '이상 (>=)' },
      { value: 'lt', text: '미만 (<)' },
      { value: 'lte', text: '이하 (<=)' }
    ];

    // 문자열 타입 연산자
    const stringOperators = [
      { value: 'contains', text: '포함' },
      { value: 'startswith', text: '시작 문자' },
      { value: 'endswith', text: '끝 문자' }
    ];

    let operators = [...baseOperators];

    // 컬럼 타입에 따라 연산자 추가
    if (columnType.includes('INT') || columnType.includes('DECIMAL') || columnType.includes('FLOAT') || columnType.includes('DOUBLE')) {
      operators = [...baseOperators, ...numericOperators];
    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT') || columnType.includes('CHAR')) {
      operators = [...baseOperators, ...stringOperators];
    }

    // 연산자 옵션 추가
    operators.forEach(op => {
      const option = document.createElement('option');
      option.value = op.value;
      option.textContent = op.text;
      operatorSelect.appendChild(option);
    });

    // 이전 선택값 복원 (가능한 경우)
    if (currentValue && operators.some(op => op.value === currentValue)) {
      operatorSelect.value = currentValue;
    }
  }

  // 검색 버튼 상태 업데이트
  function updateSearchButtonState() {
    searchBtn.disabled = selectedColumns.length === 0;
  }

  // 검색 실행
  async function executeSearch() {
    if (selectedColumns.length === 0) {
      alert('하나 이상의 컬럼을 선택해주세요.');
      return;
    }

    // 필터 조건 수집
    const filters = [];
    const filterItems = filtersContainer.querySelectorAll('.filter-item');

    filterItems.forEach(item => {
      const columnSelect = item.querySelector('.filter-column');
      const operatorSelect = item.querySelector('.filter-operator');
      const valueInput = item.querySelector('.filter-value');

      const column = columnSelect.value;
      const operator = operatorSelect.value;
      const value = valueInput.value;

      if (column && operator) {
        // null 관련 연산자는 값이 필요 없음
        if (operator === 'isnull' || operator === 'isnotnull') {
          filters.push({ column, operator });
        } else if (value.trim()) {
          filters.push({ column, operator, value: value.trim() });
        }
      }
    });

    // 검색 요청
    try {
      const response = await fetch('/api/datasets/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: selectedTable.name,
          columns: selectedColumns,
          filters: filters,
          page: currentPage,
          pageSize: pageSize
        })
      });

      if (!response.ok) {
        throw new Error('데이터 검색에 실패했습니다.');
      }

      const result = await response.json();

      // 결과 표시
      displayResults(result);
    } catch (error) {
      console.error('검색 오류:', error);
      alert('데이터 검색 중 오류가 발생했습니다.');
    }
  }

  // 결과 표시
  function displayResults(result) {
    currentResults = result.data;
    totalPages = Math.ceil(result.total / pageSize);

    // 결과 패널 표시
    resultsPanel.style.display = 'flex';

    // 결과 카운트 업데이트
    resultCount.textContent = `총 ${result.total}개의 레코드`;

    // 테이블 헤더 생성
    resultsTableHead.innerHTML = '';
    const headerRow = document.createElement('tr');

    selectedColumns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });

    resultsTableHead.appendChild(headerRow);

    // 테이블 바디 생성
    resultsTableBody.innerHTML = '';

    if (currentResults.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = selectedColumns.length;
      emptyCell.textContent = '검색 결과가 없습니다.';
      emptyCell.style.textAlign = 'center';
      emptyCell.style.padding = '30px';
      emptyRow.appendChild(emptyCell);
      resultsTableBody.appendChild(emptyRow);
    } else {
      currentResults.forEach(row => {
        const tr = document.createElement('tr');

        selectedColumns.forEach(column => {
          const td = document.createElement('td');
          const value = row[column];

          if (value === null) {
            td.innerHTML = '<span class="cell-null">NULL</span>';
          } else {
            td.textContent = value;
          }

          tr.appendChild(td);
        });

        resultsTableBody.appendChild(tr);
      });
    }

    // 페이지네이션 생성
    createPagination();
  }

  // 페이지네이션 생성
  function createPagination() {
    paginationContainer.innerHTML = '';

    // 처음 페이지 버튼
    const firstPageBtn = document.createElement('button');
    firstPageBtn.className = 'pagination-btn';
    firstPageBtn.innerHTML = '<i class="fas fa-angle-double-left"></i>';
    firstPageBtn.disabled = currentPage === 1;
    firstPageBtn.addEventListener('click', () => {
      currentPage = 1;
      executeSearch();
    });
    paginationContainer.appendChild(firstPageBtn);

    // 이전 페이지 버튼
    const prevPageBtn = document.createElement('button');
    prevPageBtn.className = 'pagination-btn';
    prevPageBtn.innerHTML = '<i class="fas fa-angle-left"></i>';
    prevPageBtn.disabled = currentPage === 1;
    prevPageBtn.addEventListener('click', () => {
      currentPage--;
      executeSearch();
    });
    paginationContainer.appendChild(prevPageBtn);

    // 페이지 버튼
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'pagination-btn';
      pageBtn.textContent = i;

      if (i === currentPage) {
        pageBtn.classList.add('active');
      }

      pageBtn.addEventListener('click', () => {
        currentPage = i;
        executeSearch();
      });

      paginationContainer.appendChild(pageBtn);
    }

    // 다음 페이지 버튼
    const nextPageBtn = document.createElement('button');
    nextPageBtn.className = 'pagination-btn';
    nextPageBtn.innerHTML = '<i class="fas fa-angle-right"></i>';
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextPageBtn.addEventListener('click', () => {
      currentPage++;
      executeSearch();
    });
    paginationContainer.appendChild(nextPageBtn);

    // 마지막 페이지 버튼
    const lastPageBtn = document.createElement('button');
    lastPageBtn.className = 'pagination-btn';
    lastPageBtn.innerHTML = '<i class="fas fa-angle-double-right"></i>';
    lastPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    lastPageBtn.addEventListener('click', () => {
      currentPage = totalPages;
      executeSearch();
    });
    paginationContainer.appendChild(lastPageBtn);
  }

  // CSV 파일로 내보내기
  function exportTableToCSV() {
    if (!currentResults || currentResults.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const BOM = "\uFEFF"; // UTF-8 BOM
    let csvContent = BOM;

    // 헤더 추가
    csvContent += selectedColumns.join(',') + '\n';

    // 데이터 행 추가
    currentResults.forEach(row => {
      const rowValues = selectedColumns.map(column => {
        const value = row[column];

        // Null 값 처리
        if (value === null) {
          return '';
        }

        // 문자열인 경우 큰따옴표로 감싸고 내부 큰따옴표는 두 번 사용
        if (typeof value === 'string') {
          return '"' + value.replace(/"/g, '""') + '"';
        }

        return value;
      });

      csvContent += rowValues.join(',') + '\n';
    });

    // 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const tableName = selectedTable.name;
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    const fileName = `${tableName}_export_${timestamp}.csv`;

    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // 리소스 정리
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // 폼 초기화
  function resetForm() {
    tableSelect.value = '';
    columnsSection.style.display = 'none';
    filtersSection.style.display = 'none';
    resultsPanel.style.display = 'none';
    selectedTable = null;
    selectedColumns = [];
    currentPage = 1;
    updateSearchButtonState();
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    // 테이블 선택 변경 시
    tableSelect.addEventListener('change', () => {
      const tableName = tableSelect.value;
      if (tableName) {
        loadTableInfo(tableName);
      } else {
        columnsSection.style.display = 'none';
        filtersSection.style.display = 'none';
        selectedTable = null;
        selectedColumns = [];
        updateSearchButtonState();
      }
    });

    // 필터 추가 버튼
    addFilterBtn.addEventListener('click', addFilter);

    // 검색 버튼
    searchBtn.addEventListener('click', () => {
      currentPage = 1;
      executeSearch();
    });

    // 리셋 버튼
    resetBtn.addEventListener('click', resetForm);

    // CSV 내보내기 버튼
    exportCsvBtn.addEventListener('click', exportTableToCSV);

    // 모두 선택 버튼
    selectAllColumnsBtn.addEventListener('click', () => {
      const checkboxes = columnsContainer.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = true;
      });
      updateSelectedColumns();
    });

    // 모두 해제 버튼
    deselectAllColumnsBtn.addEventListener('click', () => {
      const checkboxes = columnsContainer.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      updateSelectedColumns();
    });
  }

  // 초기화 실행
  init();
});
