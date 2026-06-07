import './motion.js';

(function(){
  // Language toggle (KOR|ENG)
  // Lang toggle: .lang-toggle/.lang-btn class OR sidebar/footer EN link
var langSels = document.querySelectorAll('.lang-toggle, .lang-btn, [class~="lang-toggle"], .sb-footer-links a:last-child, .ft-policy a:last-child, .af-policy a:last-child, .airc-policy a:last-child, .lf-policy a:last-child');
langSels.forEach(function(el){
    if (el.tagName === 'A' && el.getAttribute('href') === '#') {
      el.addEventListener('click', function(e){
        e.preventDefault();
        alert('English version is in preparation.\n영문 버전은 준비 중입니다.');
      });
    } else if (el.tagName !== 'A') {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(){
        alert('English version is in preparation.\n영문 버전은 준비 중입니다.');
      });
    }
  });
})();

// Simple filter
document.querySelectorAll('.filter-bar button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-bar button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});