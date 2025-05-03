document.addEventListener('DOMContentLoaded', function() {
  // 페이지 로드 시 애니메이션 요소들 정의
  const features = document.querySelectorAll('.feature-card');
  const visionText = document.querySelectorAll('.vision-text p');

  // 스크롤 이벤트에 따른 애니메이션 효과
  function checkScroll() {
    const triggerBottom = window.innerHeight * 0.8;

    features.forEach(feature => {
      const featureTop = feature.getBoundingClientRect().top;
      if (featureTop < triggerBottom) {
        feature.classList.add('fadeInUp');
        feature.style.opacity = '1';
      }
    });

    visionText.forEach((text, index) => {
      const textTop = text.getBoundingClientRect().top;
      if (textTop < triggerBottom) {
        setTimeout(() => {
          text.classList.add('fadeInUp');
          text.style.opacity = '1';
        }, index * 200);
      }
    });
  }

  // 초기 애니메이션 설정
  features.forEach(feature => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateY(30px)';
    feature.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  visionText.forEach(text => {
    text.style.opacity = '0';
    text.style.transform = 'translateY(20px)';
    text.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', checkScroll);

  // 최초 로드 시 한 번 실행
  checkScroll();

  // 파티클 효과 생성
  function createParticles() {
    const container = document.querySelector('.intro-section');
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      // 랜덤 크기 (2-5px)
      const size = Math.random() * 3 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // 랜덤 위치
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;

      // 랜덤 투명도
      particle.style.opacity = Math.random() * 0.5 + 0.1;

      // 애니메이션 지연
      particle.style.animationDelay = `${Math.random() * 5}s`;

      container.appendChild(particle);
    }
  }

  createParticles();

  // CTA 버튼 효과
  const ctaButtons = document.querySelectorAll('.cta-button');
  ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-5px)';
      button.style.boxShadow = '0 10px 25px rgba(0, 240, 255, 0.2)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
      button.style.boxShadow = '';
    });
  });
});
