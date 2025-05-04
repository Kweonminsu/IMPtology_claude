document.addEventListener('DOMContentLoaded', function() {
  const menuItems = document.querySelectorAll('.nav-item .has-submenu');

  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;

      // 열린 상태 토글
      parent.classList.toggle('open');

      // 현재 클릭된 메뉴 외의 다른 열린 메뉴 닫기
      menuItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.parentElement.classList.remove('open');
        }
      });
    });
  });

  // 현재 활성화된 메뉴 자동으로 열기
  const activeParent = document.querySelector('.nav-item.active');
  if (activeParent) {
    activeParent.classList.add('open');
  }
});