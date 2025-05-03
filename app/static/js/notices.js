// notices.js
document.addEventListener("DOMContentLoaded", function () {
  // 삭제 버튼 클릭 시
  document.querySelectorAll(".notice-delete-btn").forEach((btn) => {
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      const noticeId = this.dataset.id;
      if (confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
        fetch(`/notices/${noticeId}/delete`, {
          method: "POST",
          headers: { "X-Requested-With": "XMLHttpRequest" },
        }).then((res) => {
          if (res.ok) location.reload();
          else alert("삭제에 실패했습니다.");
        });
      }
    });
  });
});
