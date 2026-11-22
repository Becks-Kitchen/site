/* ==========================================================
   Beck's Kitchen — menu du haut et carrousel des plats
   ========================================================== */

/* ── Menu repliable sur téléphone ── */
(function () {
  const bouton = document.getElementById('menu-bouton');
  const menu = document.getElementById('menu');
  if (!bouton || !menu) return;
  function fermer() { menu.classList.remove('ouvert'); bouton.setAttribute('aria-expanded', 'false'); }
  bouton.addEventListener('click', function () {
    const ouvert = menu.classList.toggle('ouvert');
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fermer); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
})();

/* ── Carrousel (translateX en %, aucune mesure en pixels) ──
   La piste a la largeur de la fenêtre : décaler d'une carte = 100 % / nombre de cartes visibles. */
(function () {
  const piste = document.getElementById('carrousel-piste');
  const points = document.getElementById('carrousel-points');
  if (!piste) return;
  const cartes = Array.from(piste.querySelectorAll('.plat'));
  let courant = 0;

  function nbVisibles() {
    if (window.innerWidth <= 500) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }
  function indexMax() { return Math.max(0, cartes.length - nbVisibles()); }

  function construirePoints() {
    points.innerHTML = '';
    const total = indexMax() + 1;
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carrousel-point' + (i === courant ? ' actif' : '');
      b.setAttribute('aria-label', 'Aller au plat ' + (i + 1));
      b.addEventListener('click', function () { allerA(i); });
      points.appendChild(b);
    }
  }

  function allerA(i) {
    courant = Math.max(0, Math.min(i, indexMax()));
    const pct = courant * (100 / nbVisibles());
    piste.style.transform = 'translateX(-' + pct + '%)';
    points.querySelectorAll('.carrousel-point').forEach(function (p, j) {
      p.classList.toggle('actif', j === courant);
    });
  }

  document.getElementById('carr-prec').addEventListener('click', function () { allerA(courant - 1); });
  document.getElementById('carr-suiv').addEventListener('click', function () { allerA(courant + 1); });

  let departX = 0;
  piste.addEventListener('touchstart', function (e) { departX = e.touches[0].clientX; }, { passive: true });
  piste.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].clientX - departX;
    if (Math.abs(dx) > 40) allerA(courant + (dx < 0 ? 1 : -1));
  }, { passive: true });

  construirePoints();
  window.addEventListener('resize', function () { construirePoints(); allerA(Math.min(courant, indexMax())); });
})();

/* ── Menu : le lien de la section affichée passe en rouge ── */
(function () {
  const liens = Array.from(document.querySelectorAll('#menu a[href^="#"]'));
  if (!liens.length || !('IntersectionObserver' in window)) return;
  const parId = {};
  liens.forEach(function (a) { parId[a.getAttribute('href').slice(1)] = a; });
  const obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      liens.forEach(function (a) { a.classList.remove('actif'); a.removeAttribute('aria-current'); });
      const a = parId[e.target.id];
      if (a) { a.classList.add('actif'); a.setAttribute('aria-current', 'true'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(parId).forEach(function (id) { const el = document.getElementById(id); if (el) obs.observe(el); });
})();
