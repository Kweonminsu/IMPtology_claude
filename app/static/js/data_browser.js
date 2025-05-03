document.addEventListener("DOMContentLoaded", () => {
  // 탭 기능 구현
  document.querySelectorAll(".browser-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".browser-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  // 트리 아이템 토글 기능
  document.querySelectorAll(".category-header").forEach((header) => {
    header.addEventListener("click", () => {
      header.querySelector(".toggle-button").classList.toggle("active");
      const items = header.nextElementSibling;
      items.style.display = items.style.display === "none" ? "block" : "none";
    });
  });

  // 컬럼 관리 기능
  document.querySelectorAll(".remove-column").forEach((btn) => {
    btn.addEventListener("click", () => btn.parentElement.remove());
  });
});
