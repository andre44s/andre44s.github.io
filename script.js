(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  (function () {
    if (reduceMotion) return;
    var svg = document.querySelector('.banner-net');
    if (!svg) return;

    var W = 1000, H = 380;
    var NODE_COUNT = 32;
    var MAX_LINKS = 18;
    var LINK_DIST = 180;
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c97f4a';
    var DIM = '#3a3a3a';

    var nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 1.2 + Math.random() * 1.6,
        accent: Math.random() < 0.15
      });
    }

    var linkLayer = document.createElementNS(SVG_NS, 'g');
    svg.appendChild(linkLayer);

    var nodeEls = nodes.map(function (n) {
      var c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('r', n.r);
      c.setAttribute('fill', n.accent ? ACCENT : '#888');
      c.setAttribute('opacity', n.accent ? 0.85 : 0.55);
      svg.appendChild(c);
      return c;
    });

    var activeLinks = [];
    var running = true;
    var bannerVisible = true;
    var spawnInterval;

    function dist(a, b) {
      var dx = a.x - b.x, dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function spawnLink() {
      if (activeLinks.length >= MAX_LINKS) return;
      for (var tries = 0; tries < 20; tries++) {
        var ai = Math.floor(Math.random() * NODE_COUNT);
        var bi = Math.floor(Math.random() * NODE_COUNT);
        if (ai === bi) continue;
        var dup = false;
        for (var k = 0; k < activeLinks.length; k++) {
          var l = activeLinks[k];
          if ((l.a === ai && l.b === bi) || (l.a === bi && l.b === ai)) { dup = true; break; }
        }
        if (dup) continue;
        var d = dist(nodes[ai], nodes[bi]);
        if (d > LINK_DIST) continue;
        var line = document.createElementNS(SVG_NS, 'line');
        var useAccent = nodes[ai].accent || nodes[bi].accent;
        line.setAttribute('stroke', useAccent ? ACCENT : DIM);
        line.setAttribute('stroke-width', useAccent ? 0.7 : 0.5);
        line.setAttribute('opacity', 0);
        linkLayer.appendChild(line);
        activeLinks.push({ a: ai, b: bi, el: line, birth: performance.now(), life: 3000 + Math.random() * 4000 });
        return;
      }
    }

    function tick(t) {
      for (var i = 0; i < NODE_COUNT; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        nodeEls[i].setAttribute('cx', n.x);
        nodeEls[i].setAttribute('cy', n.y);
      }

      var alive = [];
      for (var j = 0; j < activeLinks.length; j++) {
        var lk = activeLinks[j];
        var age = t - lk.birth;
        var frac = age / lk.life;
        if (frac >= 1) { lk.el.remove(); continue; }
        var op;
        if (frac < 0.25) op = frac / 0.25;
        else if (frac < 0.7) op = 1;
        else op = (1 - frac) / 0.3;
        var a = nodes[lk.a], b = nodes[lk.b];
        lk.el.setAttribute('x1', a.x); lk.el.setAttribute('y1', a.y);
        lk.el.setAttribute('x2', b.x); lk.el.setAttribute('y2', b.y);
        lk.el.setAttribute('opacity', op * 0.35);
        alive.push(lk);
      }
      activeLinks = alive;

      if (running) requestAnimationFrame(tick);
    }

    function updateRunningState() {
      var shouldRun = !document.hidden && bannerVisible;
      if (shouldRun && !running) {
        running = true;
        spawnInterval = setInterval(spawnLink, 350);
        requestAnimationFrame(tick);
      } else if (!shouldRun && running) {
        running = false;
        clearInterval(spawnInterval);
      }
    }

    spawnInterval = setInterval(spawnLink, 350);
    for (var s = 0; s < 8; s++) spawnLink();
    requestAnimationFrame(tick);

    var banner = document.querySelector('.banner');

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        bannerVisible = entries[0].isIntersecting;
        updateRunningState();
      }, { threshold: 0 });
      io.observe(banner);
    }

    document.addEventListener('visibilitychange', updateRunningState);

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < banner.offsetHeight) {
          svg.style.transform = 'translateY(' + (y * 0.4) + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  })();

  (function () {
    var el = document.querySelector('.role-text');
    if (!el) return;
    var titles = (el.dataset.titles || '').split('|').filter(Boolean);
    if (titles.length < 2 || reduceMotion) return;

    var TYPE = 90, ERASE = 45, HOLD = 3500, PAUSE = 600;
    var idx = 0;
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    async function erase(t) {
      for (var i = t.length; i > 0; i--) { el.textContent = t.slice(0, i - 1); await sleep(ERASE); }
    }
    async function type(t) {
      for (var i = 1; i <= t.length; i++) { el.textContent = t.slice(0, i); await sleep(TYPE); }
    }
    (async function loop() {
      while (true) {
        await sleep(HOLD);
        await erase(titles[idx]);
        await sleep(PAUSE);
        idx = (idx + 1) % titles.length;
        await type(titles[idx]);
      }
    })();
  })();

})();
