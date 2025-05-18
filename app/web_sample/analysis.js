// IMPtology 데이터 분석 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // DOM 요소 참조
  const tableCheckboxes = document.querySelectorAll('.table-checkbox-input');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const joinConditionsContainer = document.getElementById('join-conditions');
  const filterConditionsContainer = document.getElementById('filter-conditions');
  const addFilterBtn = document.getElementById('add-filter-btn');
  const groupBySelect = document.getElementById('group-by-select');
  const targetColumnSelect = document.getElementById('target-column-select');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resetBtn = document.getElementById('reset-btn');
  const resultsContainer = document.getElementById('analysis-results');
  const resultsContent = document.querySelector('.results-content');
  const resultsTable = document.getElementById('results-table');
  const resultsChart = document.getElementById('results-chart');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const exportResultsBtn = document.getElementById('export-results');
  const shareResultsBtn = document.getElementById('share-results');
  
  // 모달 관련 요소
  const filterModal = document.getElementById('filter-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  const filterColumnSelect = document.getElementById('filter-column');
  const filterOperatorSelect = document.getElementById('filter-operator');
  const filterValueInput = document.getElementById('filter-value');
  const cancelFilterBtn = document.getElementById('cancel-filter');
  const addFilterModalBtn = document.getElementById('add-filter');

    const panelHeaders = document.querySelectorAll('.panel-header');

    panelHeaders.forEach(header => {
      header.addEventListener('click', function (e) {
        e.stopPropagation();

        const targetId = this.getAttribute('data-target');
        const content = document.getElementById(targetId);
        const toggle = this.querySelector('.panel-toggle');

        // 가장 가까운 부모 중 .analysis-panel 찾기
        const panel = this.closest('.analysis-panel');

        // 각각 토글
        content.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
        panel.classList.toggle('collapsed');
      });
    });



  // API 엔드포인트 기본 URL 설정
  const API_BASE_URL = '/api/analysis';

  // 차트 인스턴스를 저장할 변수
  let chartInstance = null;

  // 테이블 메타데이터 정의 (실제 환경에서는 API로부터 가져올 수 있음)
  const tablesMetadata = {
    'A': {
      name: '생산 데이터',
      columns: ['id', 'date', 'production_amount', 'operation_time'],
      columnNames: ['ID', '날짜', '생산량', '가동 시간'],
      joinableColumns: {
        'B': ['id']
      }
    },
    'B': {
      name: '품질 검사',
      columns: ['id', 'line_number', 'pass_status', 'defect_type'],
      columnNames: ['ID', '라인번호', '합격여부', '불량유형'],
      joinableColumns: {
        'A': ['id'],
        'C': ['line_number']
      }
    },
    'C': {
      name: '설비 상태',
      columns: ['line_number', 'temperature', 'humidity', 'vibration'],
      columnNames: ['라인번호', '온도', '습도', '진동'],
      joinableColumns: {
        'B': ['line_number']
      }
    },
    'D': {
      name: '원자재 정보',
      columns: ['id', 'material_type', 'origin', 'grade'],
      columnNames: ['ID', '원자재 종류', '원산지', '등급'],
      joinableColumns: {
        'A': ['id']
      }
    }
  };

  // 상태 관리 객체
  const state = {
    selectedTables: [],
    activeFilters: [],
    joinConditions: {},
    analysisType: 'summary', // 기본값
    groupByColumn: '',
    targetColumn: '',
    results: null
  };

  // 오늘 날짜와 한달 전 날짜를 계산하여 기본값으로 설정
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  // 날짜 형식 변환 함수 (YYYY-MM-DD)
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 기본 날짜값 설정
  startDateInput.value = formatDate(lastMonth);
  endDateInput.value = formatDate(today);

  // 이벤트 리스너 등록
  tableCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleTableSelection);
  });

  startDateInput.addEventListener('change', validateDates);
  endDateInput.addEventListener('change', validateDates);

  addFilterBtn.addEventListener('click', openFilterModal);
  closeModalBtn.addEventListener('click', closeFilterModal);
  cancelFilterBtn.addEventListener('click', closeFilterModal);
  addFilterModalBtn.addEventListener('click', addFilterFromModal);

  document.querySelectorAll('input[name="analysis-type"]').forEach(radio => {
    radio.addEventListener('change', updateAnalysisOptions);
  });

  groupBySelect.addEventListener('change', updateTargetColumnOptions);

  analyzeBtn.addEventListener('click', performAnalysis);
  resetBtn.addEventListener('click', resetForm);

  exportResultsBtn.addEventListener('click', exportResults);
  shareResultsBtn.addEventListener('click', shareResults);

  // 탭 전환 이벤트
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');

      // 탭 버튼 활성화 상태 변경
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // 탭 컨텐츠 표시 변경
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');

      // 차트 탭인 경우 차트 다시 그리기
      if (tabId === 'chart-view' && state.results) {
        renderChart();
      }
    });
  });

  // 테이블 선택 처리 함수
  function handleTableSelection(event) {
    const tableId = event.target.value;

    if (event.target.checked) {
      // 테이블 추가
      state.selectedTables.push(tableId);
    } else {
      // 테이블 제거
      state.selectedTables = state.selectedTables.filter(id => id !== tableId);
    }

    // 조인 조건 업데이트
    updateJoinConditions();

    // 필터 옵션 업데이트
    updateFilterOptions();

    // 분석 옵션 업데이트
    updateAnalysisOptions();

    // 분석 버튼 상태 업데이트
    updateAnalyzeButtonState();
  }

  // 날짜 유효성 검사
  function validateDates() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (startDate > endDate) {
      alert('시작일이 종료일보다 늦을 수 없습니다.');
      endDateInput.value = startDateInput.value;
    }

    updateAnalyzeButtonState();
  }

  // 조인 조건 업데이트
  function updateJoinConditions() {
    // 조인 조건 초기화
    joinConditionsContainer.innerHTML = '';
    state.joinConditions = {};

    if (state.selectedTables.length <= 1) {
      // 선택된 테이블이 없거나 하나만 있는 경우 플레이스홀더 표시
      joinConditionsContainer.innerHTML = '<div class="join-placeholder">테이블이 두 개 이상 선택되어야 조인 조건을 설정할 수 있습니다.</div>';
      return;
    }

    // 선택된 테이블 간의 모든 가능한 조인 쌍 찾기
    const joinPairs = findJoinPairs(state.selectedTables);

    if (joinPairs.length === 0) {
      joinConditionsContainer.innerHTML = '<div class="join-placeholder">선택된 테이블 간에 조인 가능한 관계가 없습니다.</div>';
      return;
    }

    // 각 조인 쌍에 대한 UI 생성
    joinPairs.forEach(pair => {
      const table1 = pair[0];
      const table2 = pair[1];
      const joinableColumns = tablesMetadata[table1].joinableColumns[table2] ||
                             tablesMetadata[table2].joinableColumns[table1] || [];

      // 조인 쌍 컨테이너 생성
      const pairContainer = document.createElement('div');
      pairContainer.className = 'join-table-pair';

      // 조인 쌍 제목
      const pairTitle = document.createElement('h4');
      pairTitle.textContent = `${tablesMetadata[table1].name} ↔ ${tablesMetadata[table2].name}`;
      pairContainer.appendChild(pairTitle);

      // 조인 필드 컨테이너
      const fieldsContainer = document.createElement('div');
      fieldsContainer.className = 'join-fields';

      // 첫 번째 테이블의 컬럼 선택
      const field1Container = document.createElement('div');
      field1Container.className = 'join-field';

      const field1Label = document.createElement('label');
      field1Label.textContent = `${tablesMetadata[table1].name} 컬럼`;
      field1Container.appendChild(field1Label);

      const field1Select = document.createElement('select');
      field1Select.dataset.table1 = table1;
      field1Select.dataset.table2 = table2;

      // 조인 가능한 컬럼 옵션 추가
      joinableColumns.forEach(column => {
        const option = document.createElement('option');
        option.value = column;
        const columnIndex = tablesMetadata[table1].columns.indexOf(column);
        option.textContent = tablesMetadata[table1].columnNames[columnIndex];
        field1Select.appendChild(option);
      });

      field1Select.addEventListener('change', updateJoinField);
      field1Container.appendChild(field1Select);
      fieldsContainer.appendChild(field1Container);

      // 조인 연산자 (=)
      const joinOperator = document.createElement('div');
      joinOperator.className = 'join-relation';
      joinOperator.textContent = '=';
      fieldsContainer.appendChild(joinOperator);

      // 두 번째 테이블의 컬럼 선택
      const field2Container = document.createElement('div');
      field2Container.className = 'join-field';

      const field2Label = document.createElement('label');
      field2Label.textContent = `${tablesMetadata[table2].name} 컬럼`;
      field2Container.appendChild(field2Label);

      const field2Select = document.createElement('select');
      field2Select.dataset.table1 = table1;
      field2Select.dataset.table2 = table2;

      // 조인 가능한 컬럼 옵션 추가 (주의: 동일한 이름의 컬럼이 있을 수 있음)
      joinableColumns.forEach(column => {
        const option = document.createElement('option');
        option.value = column;
        const columnIndex = tablesMetadata[table2].columns.indexOf(column);
        option.textContent = tablesMetadata[table2].columnNames[columnIndex];
        field2Select.appendChild(option);
      });

      field2Select.addEventListener('change', updateJoinField);
      field2Container.appendChild(field2Select);
      fieldsContainer.appendChild(field2Container);

      pairContainer.appendChild(fieldsContainer);
      joinConditionsContainer.appendChild(pairContainer);

      // 상태에 초기 조인 조건 추가
      const joinKey = `${table1}_${table2}`;
      state.joinConditions[joinKey] = {
        table1,
        table2,
        column1: joinableColumns[0],
        column2: joinableColumns[0]
      };
    });
  }

  // 가능한 조인 쌍 찾기
  function findJoinPairs(selectedTables) {
    const pairs = [];

    // 모든 가능한 테이블 쌍에 대해 조인 가능 여부 확인
    for (let i = 0; i < selectedTables.length; i++) {
      for (let j = i + 1; j < selectedTables.length; j++) {
        const table1 = selectedTables[i];
        const table2 = selectedTables[j];

        // 두 테이블 간에 조인 가능한 컬럼이 존재하는지 확인
        if ((tablesMetadata[table1].joinableColumns[table2] &&
             tablesMetadata[table1].joinableColumns[table2].length > 0) ||
            (tablesMetadata[table2].joinableColumns[table1] &&
             tablesMetadata[table2].joinableColumns[table1].length > 0)) {
          pairs.push([table1, table2]);
        }
      }
    }

    return pairs;
  }

  // 조인 필드 업데이트 처리
  function updateJoinField(event) {
    const select = event.target;
    const table1 = select.dataset.table1;
    const table2 = select.dataset.table2;
    const joinKey = `${table1}_${table2}`;

    // 현재 선택을 기반으로 조인 조건 업데이트
    const parent = select.closest('.join-fields');
    const selects = parent.querySelectorAll('select');

    state.joinConditions[joinKey] = {
      table1,
      table2,
      column1: selects[0].value,
      column2: selects[1].value
    };
  }

  // 필터 옵션 업데이트
  function updateFilterOptions() {
    // 기존 필터 제거
    state.activeFilters = [];
    filterConditionsContainer.innerHTML = '';

    if (state.selectedTables.length === 0) {
      filterConditionsContainer.innerHTML = '<div class="filter-placeholder">테이블을 선택하면 필터 옵션이 표시됩니다.</div>';
      addFilterBtn.disabled = true;
      return;
    }

    // 필터 플레이스홀더 추가
    if (state.activeFilters.length === 0) {
      filterConditionsContainer.innerHTML = '<div class="filter-placeholder">필터가 설정되지 않았습니다. 필터를 추가해보세요.</div>';
    }

    // 필터 추가 버튼 활성화
    addFilterBtn.disabled = false;
  }

  // 필터 모달 열기
  function openFilterModal() {
    // 필터 컬럼 옵션 초기화
    filterColumnSelect.innerHTML = '';

    // 선택된 모든 테이블의 컬럼 추가
    state.selectedTables.forEach(tableId => {
      const table = tablesMetadata[tableId];

      // 테이블 그룹 옵션 생성
      const optGroup = document.createElement('optgroup');
      optGroup.label = table.name;

      // 각 컬럼에 대한 옵션 추가
      table.columns.forEach((column, index) => {
        const option = document.createElement('option');
        option.value = `${tableId}.${column}`;
        option.textContent = table.columnNames[index];
        optGroup.appendChild(option);
      });

      filterColumnSelect.appendChild(optGroup);
    });

    // 모달 표시
    filterModal.classList.add('active');
  }

  // 필터 모달 닫기
  function closeFilterModal() {
    filterModal.classList.remove('active');
    filterValueInput.value = '';
  }

  // 필터 모달에서 필터 추가
  function addFilterFromModal() {
    if (!filterValueInput.value.trim()) {
      alert('필터 값을 입력해주세요.');
      return;
    }

    const columnValue = filterColumnSelect.value;
    const [tableId, column] = columnValue.split('.');
    const operator = filterOperatorSelect.value;
    const value = filterValueInput.value.trim();

    // 필터 정보 저장
    const filterInfo = {
      id: Date.now(), // 고유 ID 생성
      tableId,
      column,
      operator,
      value
    };

    state.activeFilters.push(filterInfo);

    // 필터 UI 업데이트
    updateFilterUI();

    // 모달 닫기
    closeFilterModal();
  }

  // 필터 UI 업데이트
  function updateFilterUI() {
    // 플레이스홀더 제거
    filterConditionsContainer.innerHTML = '';

    if (state.activeFilters.length === 0) {
      filterConditionsContainer.innerHTML = '<div class="filter-placeholder">필터가 설정되지 않았습니다. 필터를 추가해보세요.</div>';
      return;
    }

    // 각 필터에 대한 UI 요소 생성
    state.activeFilters.forEach(filter => {
      const filterItem = document.createElement('div');
      filterItem.className = 'filter-item';
      filterItem.dataset.id = filter.id;

      const filterText = document.createElement('div');
      filterText.className = 'filter-text';

      // 테이블 이름과 컬럼 이름 가져오기
      const table = tablesMetadata[filter.tableId];
      const columnIndex = table.columns.indexOf(filter.column);
      const columnName = table.columnNames[columnIndex];

      // 필터 텍스트 생성
      filterText.textContent = `${table.name} - ${columnName} ${getOperatorText(filter.operator)} ${filter.value}`;
      filterItem.appendChild(filterText);

      // 삭제 버튼 생성
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'filter-delete';
      deleteBtn.textContent = '×';
      deleteBtn.addEventListener('click', () => removeFilter(filter.id));
      filterItem.appendChild(deleteBtn);

      filterConditionsContainer.appendChild(filterItem);
    });
  }

  // 필터 삭제
  function removeFilter(filterId) {
    state.activeFilters = state.activeFilters.filter(filter => filter.id !== filterId);
    updateFilterUI();
  }

  // 연산자 텍스트 변환
  function getOperatorText(operator) {
    const operatorMap = {
      '=': '=',
      '!=': '≠',
      '>': '>',
      '<': '<',
      '>=': '≥',
      '<=': '≤',
      'LIKE': '포함',
      'IN': '목록에 포함'
    };

    return operatorMap[operator] || operator;
  }

  // 분석 옵션 업데이트
  function updateAnalysisOptions() {
    // 현재 선택된 분석 유형 가져오기
    const analysisTypeRadios = document.querySelectorAll('input[name="analysis-type"]');
    let selectedType = 'summary';

    analysisTypeRadios.forEach(radio => {
      if (radio.checked) {
        selectedType = radio.value;
      }
    });

    state.analysisType = selectedType;

    // 그룹화 컬럼 옵션 업데이트
    updateGroupByOptions();

    // 타겟 컬럼 옵션 업데이트
    updateTargetColumnOptions();
  }

  // 그룹화 옵션 업데이트
  function updateGroupByOptions() {
    groupBySelect.innerHTML = '';
    groupBySelect.disabled = state.selectedTables.length === 0;

    if (state.selectedTables.length === 0) {
      return;
    }

    // 그룹화 없음 옵션
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = '그룹화 없음';
    groupBySelect.appendChild(noneOption);

    // 선택된 모든 테이블의 컬럼 추가
    state.selectedTables.forEach(tableId => {
      const table = tablesMetadata[tableId];

      // 테이블 그룹 옵션 생성
      const optGroup = document.createElement('optgroup');
      optGroup.label = table.name;

      // 각 컬럼에 대한 옵션 추가
      table.columns.forEach((column, index) => {
        const option = document.createElement('option');
        option.value = `${tableId}.${column}`;
        option.textContent = table.columnNames[index];
        optGroup.appendChild(option);
      });

      groupBySelect.appendChild(optGroup);
    });
  }

  // 타겟 컬럼 옵션 업데이트
  function updateTargetColumnOptions() {
    targetColumnSelect.innerHTML = '';
    targetColumnSelect.disabled = state.selectedTables.length === 0;

    if (state.selectedTables.length === 0) {
      return;
    }

    // 타겟 컬럼 선택 옵션
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = '컬럼 선택';
    targetColumnSelect.appendChild(noneOption);

    // 선택된 모든 테이블의 컬럼 추가 (날짜 및 숫자 컬럼만 포함)
    state.selectedTables.forEach(tableId => {
      const table = tablesMetadata[tableId];

      // 테이블 그룹 옵션 생성
      const optGroup = document.createElement('optgroup');
      optGroup.label = table.name;

      // 각 컬럼에 대한 옵션 추가 (분석 유형에 따라 필터링)
      table.columns.forEach((column, index) => {
        // 현재 분석 유형에 적합한 컬럼인지 확인
        // 예: 추세 분석은 날짜와 숫자 컬럼만, 상관관계 분석은 숫자 컬럼만
        let isValid = true;

        // 간단한 예시 로직 (실제 환경에서는 컬럼 메타데이터가 필요함)
        if (state.analysisType === 'trend' && !column.includes('date') && !column.includes('amount') && !column.includes('time')) {
          isValid = false;
        }

        if (state.analysisType === 'correlation' && (column.includes('date') || column.includes('type') || column.includes('status'))) {
          isValid = false;
        }

        if (isValid) {
          const option = document.createElement('option');
          option.value = `${tableId}.${column}`;
          option.textContent = table.columnNames[index];
          optGroup.appendChild(option);
        }
      });

      // 옵션이 있는 경우에만 그룹 추가
      if (optGroup.childElementCount > 0) {
        targetColumnSelect.appendChild(optGroup);
      }
    });
  }

  // 분석 버튼 상태 업데이트
  function updateAnalyzeButtonState() {
    analyzeBtn.disabled = state.selectedTables.length === 0 ||
                         !startDateInput.value ||
                         !endDateInput.value;
  }

  // 폼 초기화
  function resetForm() {
    // 테이블 선택 초기화
    tableCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    // 날짜 초기화
    startDateInput.value = formatDate(lastMonth);
    endDateInput.value = formatDate(today);

    // 상태 초기화
    state.selectedTables = [];
    state.activeFilters = [];
    state.joinConditions = {};
    state.analysisType = 'summary';
    state.groupByColumn = '';
    state.targetColumn = '';

    // 분석 결과 초기화
    resultsContent.style.display = 'none';
    document.querySelector('.results-placeholder').style.display = 'block';

    // UI 업데이트
    updateJoinConditions();
    updateFilterOptions();
    updateAnalysisOptions();
    updateAnalyzeButtonState();

    // 차트 인스턴스 정리
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }

  // 분석 실행
  async function performAnalysis() {
    try {
      // 로딩 상태 표시
      analyzeBtn.textContent = '분석 중...';
      analyzeBtn.disabled = true;

      // 분석 요청 데이터 구성
      const requestData = {
        tables: state.selectedTables,
        dateRange: {
          start: startDateInput.value,
          end: endDateInput.value
        },
        joinConditions: state.joinConditions,
        filters: state.activeFilters,
        analysisType: state.analysisType,
        groupBy: groupBySelect.value,
        targetColumn: targetColumnSelect.value
      };

      // API 요청 전송
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      // 응답 데이터 처리
      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.data?.error || '알 수 없는 오류가 발생했습니다.');
      }

      // 결과 저장
      state.results = responseData.data;

      // 결과 표시
      displayResults();

    } catch (error) {
      console.error('분석 중 오류 발생:', error);
      alert(`분석 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      // 버튼 상태 복원
      analyzeBtn.textContent = '분석 시작';
      analyzeBtn.disabled = false;
    }
  }

  // 분석 결과 표시
  function displayResults() {
    document.querySelector('.results-placeholder').style.display = 'none';
    resultsContent.style.display = 'block';

    // 테이블 뷰 초기화
    resultsTable.innerHTML = '';

    // 테이블 헤더 생성
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    state.results.columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    resultsTable.appendChild(thead);

    // 테이블 바디 생성
    const tbody = document.createElement('tbody');
    state.results.rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    resultsTable.appendChild(tbody);

    // 차트 뷰 초기화
    renderChart();
  }

  // 차트 렌더링
  function renderChart() {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = resultsChart.getContext('2d');

    // 차트 유형 결정
    let chartType = 'bar';
    if (state.results.type === 'trend') {
      chartType = 'line';
    } else if (state.results.type === 'correlation') {
      chartType = 'scatter';
    }

    // 데이터 준비
    const chartData = {
      labels: state.results.rows.map(row => row[0]),
      datasets: [{
        label: state.results.columns[1] || '',
        data: state.results.rows.map(row => row[1]),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    // 차트 옵션 설정
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    // 차트 생성
    chartInstance = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: chartOptions
    });
  }

  // 결과 내보내기
  function exportResults() {
    if (!state.results) {
      alert('내보낼 결과가 없습니다.');
      return;
    }

    try {
      // CSV 형식으로 변환
      let csvContent = state.results.columns.join(',') + '\n';

      state.results.rows.forEach(row => {
        csvContent += row.join(',') + '\n';
      });

      // 파일 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `IMPtology_analysis_${Date.now()}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('결과 내보내기 중 오류 발생:', error);
      alert(`결과 내보내기 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  // 결과 공유하기
  function shareResults() {
    if (!state.results) {
      alert('공유할 결과가 없습니다.');
      return;
    }

    try {
      // 현재 분석 상태와 결과를 포함한 공유 데이터 생성
      const shareData = {
        analysisConfig: {
          tables: state.selectedTables,
          dateRange: {
            start: startDateInput.value,
            end: endDateInput.value
          },
          joinConditions: state.joinConditions,
          filters: state.activeFilters,
          analysisType: state.analysisType,
          groupBy: groupBySelect.value,
          targetColumn: targetColumnSelect.value
        },
        results: state.results
      };

      // 공유 데이터를 JSON 문자열로 변환하고 Base64 인코딩
      const encodedData = btoa(JSON.stringify(shareData));

      // 공유 URL 생성
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;

      // 클립보드에 복사
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert('분석 결과 링크가 클립보드에 복사되었습니다.');
        })
        .catch(err => {
          console.error('클립보드 복사 실패:', err);
          // 클립보드 복사 실패 시 URL 표시
          const shareUrlInput = prompt('아래 URL을 복사하여 공유하세요:', shareUrl);
        });

    } catch (error) {
      console.error('결과 공유 중 오류 발생:', error);
      alert(`결과 공유 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  // 초기화: URL에서 공유 파라미터 확인
  function checkSharedAnalysis() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('share');

    if (shareParam) {
      try {
        // 공유 데이터 디코딩 및 파싱
        const shareData = JSON.parse(atob(shareParam));

        // 분석 구성 적용
        const config = shareData.analysisConfig;

        // 테이블 선택 적용
        tableCheckboxes.forEach(checkbox => {
          checkbox.checked = config.tables.includes(checkbox.value);
        });

        // 날짜 범위 적용
        startDateInput.value = config.dateRange.start;
        endDateInput.value = config.dateRange.end;

        // 상태 업데이트
        state.selectedTables = config.tables;
        state.joinConditions = config.joinConditions;
        state.activeFilters = config.filters;
        state.analysisType = config.analysisType;

        // 분석 유형 라디오 버튼 업데이트
        document.querySelector(`input[name="analysis-type"][value="${config.analysisType}"]`).checked = true;

        // UI 업데이트
        updateJoinConditions();
        updateFilterUI();
        updateAnalysisOptions();

        // 그룹화 및 타겟 컬럼 설정
        groupBySelect.value = config.groupBy;
        targetColumnSelect.value = config.targetColumn;

        // 결과 적용
        state.results = shareData.results;

        // 결과 표시
        displayResults();

        // 알림
        setTimeout(() => {
          alert('공유된 분석 결과가 로드되었습니다.');
        }, 500);

      } catch (error) {
        console.error('공유 데이터 파싱 중 오류 발생:', error);
        alert('유효하지 않은 공유 링크입니다.');
      }
    }
  }

  // 페이지 로드 시 공유 분석 확인
  checkSharedAnalysis();
});

// 데이터베이스 함수 모의 구현 (실제 환경에서는 서버 API 통신으로 대체)
async function fetch_data_from_db(request) {
  // 이 함수는 실제 서버 통신 시 제거되어야 함
  console.log('데이터베이스 요청:', request);

  // 모의 데이터 생성
  const mockData = {
    A: [
      { id: 1, date: '2025-04-01', production_amount: 120, operation_time: 8.5 },
      { id: 2, date: '2025-04-02', production_amount: 115, operation_time: 8.2 },
      { id: 3, date: '2025-04-03', production_amount: 130, operation_time: 8.8 },
      { id: 4, date: '2025-04-04', production_amount: 125, operation_time: 8.5 },
      { id: 5, date: '2025-04-05', production_amount: 110, operation_time: 7.5 },
    ],
    B: [
      { id: 1, line_number: 1, pass_status: true, defect_type: null },
      { id: 2, line_number: 2, pass_status: true, defect_type: null },
      { id: 3, line_number: 1, pass_status: false, defect_type: '치수 불량' },
      { id: 4, line_number: 2, pass_status: true, defect_type: null },
      { id: 5, line_number: 1, pass_status: true, defect_type: null },
    ],
    C: [
      { line_number: 1, temperature: 23.5, humidity: 45, vibration: 0.2 },
      { line_number: 2, temperature: 24.1, humidity: 47, vibration: 0.3 },
      { line_number: 1, temperature: 23.8, humidity: 46, vibration: 0.25 },
      { line_number: 2, temperature: 24.0, humidity: 48, vibration: 0.28 },
      { line_number: 1, temperature: 23.6, humidity: 45, vibration: 0.22 },
    ],
    D: [
      { id: 1, material_type: 'A급', origin: '국내', grade: 'AA' },
      { id: 2, material_type: 'B급', origin: '국내', grade: 'BB' },
      { id: 3, material_type: 'A급', origin: '수입', grade: 'AA' },
      { id: 4, material_type: 'C급', origin: '국내', grade: 'CC' },
      { id: 5, material_type: 'B급', origin: '수입', grade: 'BB' },
    ]
  };

  // 필터링된 데이터 반환
  return request.tables.reduce((result, tableId) => {
    result[tableId] = mockData[tableId];
    return result;
  }, {});
}

// 요약 분석 처리
function process_summary_analysis(data, request) {
  console.log('요약 분석 처리:', data, request);

  // 모의 분석 결과
  const result = {
    type: 'summary',
    columns: ['항목', '값'],
    rows: []
  };

  // 그룹화 설정이 있는 경우
  if (request.groupBy) {
    const [tableId, column] = request.groupBy.split('.');
    const groupValues = {};

    // 그룹별 데이터 수집
    data[tableId].forEach(item => {
      const groupValue = item[column];
      if (!groupValues[groupValue]) {
        groupValues[groupValue] = [];
      }
      groupValues[groupValue].push(item);
    });

    // 그룹별 요약 통계 계산
    Object.keys(groupValues).forEach(key => {
      const group = groupValues[key];
      result.rows.push([`${key} (개수)`, group.length]);
    });
  }
  // 그룹화 없는 경우
  else {
    // 각 테이블별 기본 통계
    request.tables.forEach(tableId => {
      result.rows.push([`${tableId} 테이블 행 수`, data[tableId].length]);

      // 타겟 컬럼이 있는 경우 해당 컬럼의 요약 통계
      if (request.targetColumn) {
        const [targetTableId, targetColumn] = request.targetColumn.split('.');

        if (tableId === targetTableId) {
          const values = data[tableId].map(item => item[targetColumn]).filter(val => typeof val === 'number');

          if (values.length > 0) {
            const sum = values.reduce((acc, val) => acc + val, 0);
            const avg = sum / values.length;
            const max = Math.max(...values);
            const min = Math.min(...values);

            result.rows.push([`${targetColumn} 평균`, avg.toFixed(2)]);
            result.rows.push([`${targetColumn} 최대`, max]);
            result.rows.push([`${targetColumn} 최소`, min]);
          }
        }
      }
    });
  }

  return result;
}

// 추세 분석 처리
function process_trend_analysis(data, request) {
  console.log('추세 분석 처리:', data, request);

  // 타겟 컬럼이 없으면 기본 값 사용
  if (!request.targetColumn) {
    // A 테이블의 생산량을 기본 타겟으로 사용
    if (request.tables.includes('A')) {
      request.targetColumn = 'A.production_amount';
    } else {
      // 임의의 숫자 컬럼 사용
      const table = request.tables[0];
      const numericColumn = Object.keys(data[table][0]).find(
        key => typeof data[table][0][key] === 'number'
      );

      if (numericColumn) {
        request.targetColumn = `${table}.${numericColumn}`;
      } else {
        throw new Error('추세 분석에 적합한 숫자 컬럼을 찾을 수 없습니다.');
      }
    }
  }

  // 그룹화 컬럼이 없으면 날짜 컬럼 사용
  if (!request.groupBy) {
    // A 테이블의 날짜를 기본 그룹으로 사용
    if (request.tables.includes('A')) {
      request.groupBy = 'A.date';
    } else {
      // 임의의 날짜 컬럼 검색
      let dateColumn = null;
      for (const table of request.tables) {
        const possibleDateColumn = Object.keys(data[table][0]).find(
          key => key.includes('date') || key.includes('time')
        );

        if (possibleDateColumn) {
          dateColumn = `${table}.${possibleDateColumn}`;
          break;
        }
      }

      if (dateColumn) {
        request.groupBy = dateColumn;
      } else {
        throw new Error('추세 분석에 적합한 날짜 컬럼을 찾을 수 없습니다.');
      }
    }
  }

  // 타겟 컬럼과 그룹 컬럼 파싱
  const [targetTableId, targetColumn] = request.targetColumn.split('.');
  const [groupTableId, groupColumn] = request.groupBy.split('.');

  // 데이터 추출 및 정렬
  const trendData = data[targetTableId]
    .map(item => ({
      group: item[groupColumn],
      value: item[targetColumn]
    }))
    .sort((a, b) => {
      // 날짜 형식인 경우 날짜로 정렬
      if (a.group.match(/^\d{4}-\d{2}-\d{2}/)) {
        return new Date(a.group) - new Date(b.group);
      }
      // 숫자인 경우 숫자로 정렬
      else if (!isNaN(Number(a.group))) {
        return Number(a.group) - Number(b.group);
      }
      // 문자열인 경우 문자열로 정렬
      else {
        return a.group.localeCompare(b.group);
      }
    });

  // 결과 구성
  const result = {
    type: 'trend',
    columns: ['기간', '값'],
    rows: trendData.map(item => [item.group, item.value])
  };

  return result;
}

// 상관관계 분석 처리
function process_correlation_analysis(data, request) {
  console.log('상관관계 분석 처리:', data, request);

  // 타겟 컬럼과 그룹 컬럼이 모두 필요
  if (!request.targetColumn || !request.groupBy) {
    throw new Error('상관관계 분석을 위해 두 개의 숫자 컬럼을 선택해야 합니다.');
  }

  // 타겟 컬럼과 그룹 컬럼 파싱
  const [targetTableId, targetColumn] = request.targetColumn.split('.');
  const [groupTableId, groupColumn] = request.groupBy.split('.');

  // 조인이 필요한 경우
  let correlationData = [];

  // 동일한 테이블의 두 컬럼인 경우
  if (targetTableId === groupTableId) {
    correlationData = data[targetTableId].map(item => ({
      x: item[groupColumn],
      y: item[targetColumn]
    }));
  }
  // 서로 다른 테이블의 경우 조인 필요
  else {
    // 조인 조건 찾기
    const joinKey = `${targetTableId}_${groupTableId}` in request.joinConditions ?
      `${targetTableId}_${groupTableId}` : `${groupTableId}_${targetTableId}`;

    if (!request.joinConditions[joinKey]) {
      throw new Error('서로 다른 테이블의 컬럼을 분석하려면 조인 조건이 필요합니다.');
    }

    const joinCondition = request.joinConditions[joinKey];

    // 첫 번째 테이블 데이터를 기준으로 두 번째 테이블 데이터 연결
    const table1Data = data[joinCondition.table1];
    const table2Data = data[joinCondition.table2];

    table1Data.forEach(item1 => {
      const matchingItems = table2Data.filter(
        item2 => item1[joinCondition.column1] === item2[joinCondition.column2]
      );

      matchingItems.forEach(item2 => {
        const xValue = groupTableId === joinCondition.table1 ?
          item1[groupColumn] : item2[groupColumn];

        const yValue = targetTableId === joinCondition.table1 ?
          item1[targetColumn] : item2[targetColumn];

        if (typeof xValue === 'number' && typeof yValue === 'number') {
          correlationData.push({ x: xValue, y: yValue });
        }
      });
    });
  }

  // 상관계수 계산
  let correlation = 0;
  if (correlationData.length > 1) {
    const n = correlationData.length;
    const sumX = correlationData.reduce((sum, item) => sum + item.x, 0);
    const sumY = correlationData.reduce((sum, item) => sum + item.y, 0);
    const sumXY = correlationData.reduce((sum, item) => sum + (item.x * item.y), 0);
    const sumX2 = correlationData.reduce((sum, item) => sum + (item.x * item.x), 0);
    const sumY2 = correlationData.reduce((sum, item) => sum + (item.y * item.y), 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    correlation = denominator === 0 ? 0 : numerator / denominator;
  }

  // 결과 구성
  const result = {
    type: 'correlation',
    columns: [groupColumn, targetColumn],
    rows: correlationData.map(item => [item.x, item.y]),
    metadata: {
      correlation: correlation.toFixed(4)
    }
  };

  return result;
}