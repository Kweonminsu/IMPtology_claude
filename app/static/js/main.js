document.addEventListener('DOMContentLoaded', function() {
  // 사이드바 토글 기능
  const toggleSidebarBtn = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  const menuToggleBtn = document.getElementById('menu-toggle');

  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
    });
  }

  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });
  }

  // 다크/라이트 모드 토글
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      document.body.classList.toggle('light-theme');
      themeToggleBtn.classList.toggle('light-mode');

      // 사용자 테마 선호도 로컬 스토리지에 저장
      const isLightTheme = document.body.classList.contains('light-theme');
      localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    });

    // 사용자의 이전 테마 선호도 로드
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      themeToggleBtn.classList.add('light-mode');
    }
  }

  // 활성 메뉴 아이템에 스타일링 적용
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && link.getAttribute('href') === currentPath) {
      item.classList.add('active');
    }
  });

  // 애니메이션 메트릭 카드
  const metricCards = document.querySelectorAll('.metric-card');
  metricCards.forEach((card, index) => {
    card.style.setProperty('--index', index);
  });

  // 차트 애니메이션 초기화
  initChartAnimations();
});

// 차트 애니메이션 초기화 함수
function initChartAnimations() {
  // 이 함수에서 다양한 차트 애니메이션을 초기화할 수 있습니다.
  // 대시보드의 특정 JavaScript에서 구현될 것입니다.
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // 알림 애니메이션
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // 3초 후 알림 제거
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// 모달 창 관련 함수
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// API 데이터 가져오기 함수
async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    showNotification('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    return null;
  }
}
