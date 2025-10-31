// 쿠키네 멍키친 슬라이더 (HTML/CSS는 그대로, "스크립트만" 붙여 쓰면 동작)
// 구조 가정: .visual > .slide_box > li* (각 li 안에 img, .text_box1/2/3 등)

(() => {
  const visual = document.querySelector('.visual');
  if (!visual) return;

  const track  = visual.querySelector('.slide_box');
  if (!track || track.children.length <= 1) return; // 슬라이드 1장 이하면 종료

  const slides = track.querySelectorAll('li');

  // ===== 옵션 =====
  const DURATION = 1000;    // 이동 애니메이션(ms)
  const INTERVAL = 3500;   // 자동 롤링 간격(ms)
  const PAUSE_ON_HOVER = true;

  // (권장) CSS에서 .slide_box { width: auto; } 로 두면 슬라이드 개수 변경 시 더 유연합니다.
  // 지금 코드와는 무관하게 동작하지만 향후 확장성 고려 메모.

  let timer = null;
  let busy  = false;

  // 한 장의 실제 렌더 폭(px) — 현재 li의 clientWidth를 참조 (CSS에서 100vw로 되어 있음)
  const slideWidth = () => {
    const first = track.querySelector('li');
    return first ? first.clientWidth : 0;
  };

  // 다음(왼쪽)으로 한 장
  const next = () => {
    if (busy) return;
    busy = true;

    const w = slideWidth();
    track.style.transition = `transform ${DURATION}ms ease`;
    track.style.transform  = `translateX(-${w}px)`;

    const onEnd = () => {
      track.removeEventListener('transitionend', onEnd);
      // 맨 앞 li를 맨 뒤로 이동시켜 무한루프 구성
      track.appendChild(track.firstElementChild);

      // 점프 리셋(애니메이션 없이 0으로 복귀)
      track.style.transition = 'none';
      track.style.transform  = 'translateX(0)';
      // 리플로우 강제(다음 애니메이션을 위해)
      void track.offsetWidth;

      busy = false;
    };
    track.addEventListener('transitionend', onEnd, { once: true });
  };

  // 이전(오른쪽)으로 한 장
  const prev = () => {
    if (busy) return;
    busy = true;

    const w = slideWidth();

    // 먼저 마지막 li를 앞으로 옮기고 -w에서 0으로 애니메이션
    track.style.transition = 'none';
    track.insertBefore(track.lastElementChild, track.firstElementChild);
    track.style.transform  = `translateX(-${w}px)`;
    void track.offsetWidth; // 리플로우

    track.style.transition = `transform ${DURATION}ms ease`;
    track.style.transform  = 'translateX(0)';

    const onEnd = () => {
      track.removeEventListener('transitionend', onEnd);
      busy = false;
    };
    track.addEventListener('transitionend', onEnd, { once: true });
  };

  const start = () => {
    stop();
    // 접근성: 모션 선호 안함이면 자동롤링 비활성
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(next, INTERVAL);
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };


  // 리사이즈 시 현재 위치 0으로 보정(폭 변화 대응)
  window.addEventListener('resize', () => {
    track.style.transition = 'none';
    track.style.transform  = 'translateX(0)';
  });

  // (선택) 키보드로도 조작하고 싶다면 주석 해제
  // window.addEventListener('keydown', e => {
  //   if (e.key === 'ArrowRight') { stop(); next(); start(); }
  //   if (e.key === 'ArrowLeft')  { stop(); prev(); start(); }
  // });

  // (선택) 페이지에 .nav.prev/.nav.next 버튼이 있다면 자동 연결
  const prevBtn = visual.querySelector('.nav.prev');
  const nextBtn = visual.querySelector('.nav.next');
  if (prevBtn) prevBtn.addEventListener('click', () => { stop(); prev(); start(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stop(); next(); start(); });

  // 초기화 & 시작
  track.style.transform = 'translateX(0)';
  start();
})();


document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    // index.html 내 해시 링크만 스무스 스크롤
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      // 모바일에선 메뉴 닫기
      const nav = document.getElementById('primary-navigation');
      const toggle = document.querySelector('.nav-toggle');
      if (nav && toggle && window.matchMedia('(max-width: 1024px)').matches) {
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

// 여기서부터 애니메이션
// 쿠키멍 안내
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // part1 대상만 애니메이션 (등장만, 사라지지 않음)
  const targets = gsap.utils.toArray('#section .part1 h2, #section .part1 .notice li, #section .part1 .part1_icon .icon_item');

  if (reduceMotion) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }

  // 처음엔 숨김
  gsap.set(targets, { opacity: 0, y: 26 });

  const show = () => gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.12
  });

  // 한 번만 등장시키고 유지
  ScrollTrigger.create({
    trigger: '#section',
    start: 'top 80%',
    onEnter: show,
    once: true,
    invalidateOnRefresh: true
    // markers: true,
  });
});

// 주문제작공지사항
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const targets = gsap.utils.toArray('#section5, .part5_icon, #section5 .part5_icon img');

  if (reduceMotion) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }

  // 처음엔 숨김
  gsap.set(targets, { opacity: 0, y: 26 });

  const show = () => gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.12
  });

  // 한 번만 등장시키고 유지 (사라지지 않음)
  ScrollTrigger.create({
    trigger: '#section5',
    start: 'top 80%',
    onEnter: show,
    once: true,
    invalidateOnRefresh: true
    // markers: true,
  });
});

// 모바일 네비 토글
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-navigation');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // 바깥 클릭 시 닫기 (모바일에서만)
  document.addEventListener('click', (e) => {
    if (!window.matchMedia('(max-width: 1024px)').matches) return;
    if (!nav.classList.contains('active')) return;
    const within = nav.contains(e.target) || toggle.contains(e.target);
    if (!within) {
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// section2 상품 카드 스크롤 애니메이션
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = gsap.utils.toArray('#section2 .product-card');
  if (!cards.length) return;

  if (reduceMotion) {
    gsap.set(cards, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(cards, { opacity: 0, y: 24 });

  // 뷰포트에 들어올 때 배치 단위로 순차 등장
  ScrollTrigger.batch(cards, {
    start: 'top 85%',
    onEnter: batch => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.12
    }),
    onLeaveBack: batch => gsap.to(batch, {
      opacity: 0,
      y: 24,
      duration: 0.4,
      ease: 'power2.out',
      stagger: 0.08
    }),
    // 새로 고침/리사이즈 시 트리거 재계산
    invalidateOnRefresh: true
  });
});