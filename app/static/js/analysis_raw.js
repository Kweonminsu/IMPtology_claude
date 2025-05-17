document.addEventListener('DOMContentLoaded', function() {
  // 슬라이더 값 업데이트 기능
  const sliders = document.querySelectorAll('.slider');

  sliders.forEach(slider => {
    const valueDisplay = slider.parentElement.querySelector('.range-value');

    // 초기 값 설정
    updateSliderValue(slider, valueDisplay);

    // 슬라이더 변경 시 값 업데이트
    slider.addEventListener('input', () => {
      updateSliderValue(slider, valueDisplay);
    });
  });

  // 분석 탭 전환 기능
  const analysisTabs = document.querySelectorAll('.analysis-tab');

  analysisTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // 활성 탭 변경
      analysisTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // 실제 구현시 여기서 해당 탭에 맞는 분석 결과를 로드
      const tabName = this.textContent.trim();
      loadAnalysisContent(tabName);
    });
  });

  // 분석 유형 선택 변경 시 핸들러
  const analysisTypeSelect = document.querySelector('.analysis-type-select');

  if (analysisTypeSelect) {
    analysisTypeSelect.addEventListener('change', function() {
      const selectedAnalysisType = this.value;
      updateAnalysisParameters(selectedAnalysisType);
    });
  }

  // 데이터 소스 항목 선택 이벤트
  const dataSourceItems = document.querySelectorAll('.data-source-item');

  dataSourceItems.forEach(item => {
    item.addEventListener('click', function() {
      const checkbox = this.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;

      // 체크박스 상태에 따라 활성화 상태 토글
      if (checkbox.checked) {
        this.classList.add('active');
      } else {
        this.classList.remove('active');
      }

      // 선택된 데이터 소스 업데이트
      updateSelectedDataSources();
    });
  });

  // 파라미터 적용 버튼 이벤트
  const applyButton = document.querySelector('.apply-button');

  if (applyButton) {
    applyButton.addEventListener('click', function() {
      applyAnalysisParameters();
    });
  }

  // 새로고침 버튼 이벤트
  const refreshButton = document.querySelector('.refresh-button');

  if (refreshButton) {
    refreshButton.addEventListener('click', function() {
      refreshAnalysisData();
    });
  }

  // 관계성 탐색기의 축 변경 이벤트
  const axisSelects = document.querySelectorAll('.axis-select, .size-select, .color-select');

  axisSelects.forEach(select => {
    select.addEventListener('change', function() {
      updateExplorerVisualization();
    });
  });

  // 내보내기 버튼 이벤트
  const exportButton = document.querySelector('.export-button');

  if (exportButton) {
    exportButton.addEventListener('click', function() {
      exportAnalysisResults();
    });
  }

  // 저장 버튼 이벤트
  const saveButton = document.querySelector('.save-button');

  if (saveButton) {
    saveButton.addEventListener('click', function() {
      saveAnalysisState();
    });
  }

  // 초기 데이터 로드
  initializeAnalysisPage();
});

// 슬라이더 값 업데이트 함수
function updateSliderValue(slider, valueDisplay) {
  const value = slider.value;

  // 슬라이더 ID에 따라 다른 형식으로 표시
  if (slider.id === 'correlationThreshold') {
    // 상관계수는 0.XX 형식으로 표시
    valueDisplay.textContent = (value / 100).toFixed(2);
  } else if (slider.id === 'confidenceLevel') {
    // 신뢰도는 XX% 형식으로 표시
    valueDisplay.textContent = `${value}%`;
  } else {
    // 그 외 일반 값
    valueDisplay.textContent = value;
  }
}

// 분석 내용 로드 함수
function loadAnalysisContent(tabName) {
  console.log(`${tabName} 컨텐츠 로드 중...`);

  // 로딩 상태 표시
  showLoadingState(true);

  // 실제 구현시 여기서 API 호출을 통해 분석 데이터를 가져옴
  setTimeout(() => {
    // 로딩 상태 숨김
    showLoadingState(false);

    // 탭에 따른 분석 결과 표시
    switch (tabName) {
      case '상관관계 행렬':
        // 상관관계 행렬 데이터 표시
        updateCorrelationMatrix();
        break;
      case '시계열 분석':
        // 시계열 분석 데이터 표시
        updateTimeSeriesAnalysis();
        break;
      case '산점도':
        // 산점도 데이터 표시
        updateScatterPlot();
        break;
      case '분포 분석':
        // 분포 분석 데이터 표시
        updateDistributionAnalysis();
        break;
    }

    // 성공 알림 표시
    showNotification(`${tabName} 데이터가 로드되었습니다.`, 'success');
  }, 1000);
}

// 로딩 상태 표시/숨김 함수
function showLoadingState(isLoading) {
  const loadingElements = document.querySelectorAll('.matrix-loading');

  loadingElements.forEach(element => {
    if (isLoading) {
      element.style.display = 'flex';
    } else {
      element.style.display = 'none';
    }
  });
}

// 분석 유형에 따른 파라미터 업데이트
function updateAnalysisParameters(analysisType) {
  console.log(`분석 유형 변경: ${analysisType}`);

  // 파라미터 패널의 필드들을 분석 유형에 맞게 업데이트
  const paramsPanel = document.querySelector('.analysis-params-panel');

  // 실제 구현시 여기서 분석 유형에 따라 적절한 파라미터 필드를 표시/숨김

  // 예시: 상관관계 분석일 경우 상관계수 임계값 표시, 아닐 경우 숨김
  const correlationThresholdGroup = document.querySelector('.param-group:has(#correlationThreshold)');
  if (correlationThresholdGroup) {
    if (analysisType === 'correlation') {
      correlationThresholdGroup.style.display = 'block';
    } else {
      correlationThresholdGroup.style.display = 'none';
    }
  }
}

// 선택된 데이터 소스 업데이트
function updateSelectedDataSources() {
  const checkedSources = document.querySelectorAll('.data-source-item input[type="checkbox"]:checked');
  const sourceNames = Array.from(checkedSources).map(checkbox => {
    return checkbox.closest('.data-source-item').querySelector('.source-name').textContent;
  });

  console.log('선택된 데이터 소스:', sourceNames);

  // 실제 구현시 여기서 선택된 데이터 소스에 따라 분석 결과 업데이트
}

// 분석 파라미터 적용
function applyAnalysisParameters() {
  // 현재 선택된
