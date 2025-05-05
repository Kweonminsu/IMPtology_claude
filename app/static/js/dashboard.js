document.addEventListener("DOMContentLoaded", function () {
  // 시간 주기 선택기 이벤트 리스너
  const timeButtons = document.querySelectorAll(".time-button");
  timeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 이전에 활성화된 버튼에서 active 클래스 제거
      timeButtons.forEach((btn) => btn.classList.remove("active"));
      // 클릭된 버튼에 active 클래스 추가
      this.classList.add("active");
      // 여기서 선택된 시간 범위에 따라 데이터를 다시 로드할 수 있습니다
      const timeRange = this.textContent.trim();
      loadDashboardData(timeRange);
    });
  });

  // 새로고침 버튼 이벤트 리스너
  const refreshButton = document.querySelector(".refresh-button");
  if (refreshButton) {
    refreshButton.addEventListener("click", function () {
      // 현재 활성화된 시간 범위 찾기
      const activeTimeButton = document.querySelector(".time-button.active");
      const timeRange = activeTimeButton
        ? activeTimeButton.textContent.trim()
        : "오늘";
      // 데이터 새로고침
      loadDashboardData(timeRange, true);
      // 새로고침 버튼 애니메이션
      this.classList.add("refreshing");
      setTimeout(() => {
        this.classList.remove("refreshing");
      }, 1000);
      // 최종 업데이트 시간 업데이트
      const lastUpdatedElement = document.querySelector(".last-updated");
      if (lastUpdatedElement) {
        lastUpdatedElement.textContent = "최종 업데이트: 방금 전";
      }
    });
  }

  // 분석 항목 클릭 이벤트
  const analysisItems = document.querySelectorAll(".analysis-item");
  analysisItems.forEach((item) => {
    item.addEventListener("click", function () {
      const correlationValue =
        this.querySelector(".correlation-value").textContent;
      const variables = this.querySelector("h4").textContent;
      showDetailedAnalysis(variables, correlationValue);
    });
  });

  // 인사이트 조치 버튼 이벤트 리스너
  const insightActions = document.querySelectorAll(".insight-action");
  insightActions.forEach((action) => {
    action.addEventListener("click", function () {
      const actionType = this.textContent.trim();
      const insightTitle =
        this.closest(".insight-item").querySelector(
          ".insight-title"
        ).textContent;
      // 각 액션 유형에 따른 작업 처리
      switch (actionType) {
        case "조치하기":
          openInsightActionModal(insightTitle);
          break;
        case "분석하기":
          navigateToAnalysis(insightTitle);
          break;
        case "보고서 보기":
          openReportModal(insightTitle);
          break;
      }
    });
  });

  // 초기 데이터 로드
  loadDashboardData("오늘");
});

// 대시보드 데이터 로드 함수
function loadDashboardData(timeRange, isRefresh = false) {
  // 실제 구현시 API 호출로 대체
  console.log(`대시보드 데이터 로드 중: ${timeRange}`);

  if (isRefresh) {
    // 로딩 인디케이터 표시
    showLoadingIndicator();
  }

  // API 호출 시뮬레이션
  setTimeout(() => {
    // 메트릭 카드 데이터 업데이트
    updateMetricCards(timeRange);
    // 차트 데이터 업데이트
    updateCharts(timeRange);
    // 분석 데이터 업데이트
    updateAnalysis(timeRange);
    // 인사이트 데이터 업데이트
    updateInsights(timeRange);
    // 데이터 테이블 업데이트
    updateDataTable(timeRange);

    if (isRefresh) {
      // 로딩 인디케이터 숨기기
      hideLoadingIndicator();
      // 새로고침 알림 표시
      showNotification("대시보드가 새로고침되었습니다.", "success");
    }
  }, 1000);
}

// 상세 분석 표시 함수
function showDetailedAnalysis(variables, correlationValue) {
  console.log(`상세 분석: ${variables}, 상관계수: ${correlationValue}`);
  // 모달 또는 새 페이지로 상세 분석 결과 표시
  alert(
    `${variables}의 상관계수는 ${correlationValue}입니다. 상세 분석 페이지로 이동합니다.`
  );
}

// 로딩 인디케이터 표시/숨기기 함수
function showLoadingIndicator() {
  // 로딩 오버레이 생성 및 표시
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";
  overlay.appendChild(spinner);
  document.body.appendChild(overlay);
}

function hideLoadingIndicator() {
  // 로딩 오버레이 제거
  const overlay = document.querySelector(".loading-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// 메트릭 카드 데이터 업데이트 함수
function updateMetricCards(timeRange) {
  // 여기서 API 데이터를 기반으로 메트릭 카드 값을 업데이트합니다
  // 예시 구현:
  const metrics = {
    오늘: { dataSources: 42, dataTables: 156, insights: 827, reports: 63 },
    "이번 주": { dataSources: 45, dataTables: 172, insights: 954, reports: 78 },
    "이번 달": {
      dataSources: 51,
      dataTables: 189,
      insights: 1248,
      reports: 95,
    },
    분기: { dataSources: 62, dataTables: 215, insights: 1672, reports: 112 },
    연간: { dataSources: 78, dataTables: 243, insights: 2134, reports: 156 },
  };

  const data = metrics[timeRange] || metrics["오늘"];

  // 메트릭 값 업데이트
  updateMetricValue("data-sources", data.dataSources);
  updateMetricValue("data-tables", data.dataTables);
  updateMetricValue("insights", data.insights);
  updateMetricValue("reports", data.reports);
}

// 개별 메트릭 값 업데이트 함수
function updateMetricValue(metricClass, value) {
  const metricElement = document.querySelector(`.metric-icon.${metricClass}`);
  if (metricElement) {
    const valueElement = metricElement
      .closest(".metric-card")
      .querySelector(".metric-value");
    if (valueElement) {
      // 숫자 애니메이션 효과로 값 업데이트
      animateNumber(
        valueElement,
        parseInt(valueElement.textContent.replace(/,/g, "")),
        value
      );
    }
  }
}

// 숫자 애니메이션 함수
function animateNumber(element, start, end) {
  const duration = 1000; // 1초
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsedTime = currentTime - startTime;
    if (elapsedTime < duration) {
      const progress = elapsedTime / duration;
      const currentValue = Math.floor(start + (end - start) * progress);
      element.textContent = currentValue.toLocaleString();
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = end.toLocaleString();
    }
  }

  requestAnimationFrame(updateNumber);
}

// 차트 업데이트 함수
function updateCharts(timeRange) {
  // 실제 구현시 차트 라이브러리 (Chart.js, D3.js 등)를 사용하여 차트 업데이트
  console.log(`차트 데이터 업데이트: ${timeRange}`);
}

// 분석 데이터 업데이트 함수
function updateAnalysis(timeRange) {
  console.log(`분석 데이터 업데이트: ${timeRange}`);
  // 실제 구현시 API에서 최신 분석 데이터를 가져와 업데이트
}

// 인사이트 업데이트 함수
function updateInsights(timeRange) {
  // 실제 구현시 API 데이터로 인사이트 목록 업데이트
  console.log(`인사이트 데이터 업데이트: ${timeRange}`);
}

// 데이터 테이블 업데이트 함수
function updateDataTable(timeRange) {
  // 실제 구현시 API 데이터로 테이블 업데이트
  console.log(`데이터 테이블 업데이트: ${timeRange}`);
}

// 인사이트 조치 모달 열기 함수
function openInsightActionModal(insightTitle) {
  // 모달 생성 및 표시
  console.log(`인사이트 조치 모달 열기: ${insightTitle}`);
  showNotification(`"${insightTitle}" 조치를 시작합니다.`, "info");
}

// 분석 페이지로 이동 함수
function navigateToAnalysis(insightTitle) {
  console.log(`분석 페이지로 이동: ${insightTitle}`);
  // 실제 구현시 페이지 이동
  // window.location.href = `/analysis?insight=${encodeURIComponent(insightTitle)}`;
  showNotification(`"${insightTitle}" 분석 페이지로 이동합니다.`, "info");
}

// 보고서 모달 열기 함수
function openReportModal(insightTitle) {
  console.log(`보고서 모달 열기: ${insightTitle}`);
  showNotification(`"${insightTitle}" 보고서를 표시합니다.`, "info");
}

// 알림 표시 함수
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, 10);
}
