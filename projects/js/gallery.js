// Gallery. Three page modes, set by the inline script in <head>:
//   index.html                 landing grid: one live preview card per style
//   index.html?view=sNN        that style's own page, with the gallery bar
//   index.html?view=sNN&thumb  the bare style, loaded into a grid card's iframe
(() => {
  const PLANNED = 25;
  const styles = [...document.querySelectorAll(".style")];
  const num = (s) => s.id.slice(1);
  const pageUrl = (s) => `index.html?view=${s.id}`;

  const INITS = {s06: initS06, s08: initS08, s12: initS12, s14: initS14, s21: initS21, s23: initS23, s25: initS25};
  styles.forEach((s) => INITS[s.id]?.(s));

  const params = new URLSearchParams(location.search);
  const current = styles.find((s) => s.id === params.get("view"));

  if (params.has("thumb")) {
    current?.classList.add("is-shown");
  } else if (current) {
    initStylePage(current);
  } else {
    document.documentElement.classList.replace("is-solo", "is-home");
    initHome();
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function initHome() {
    const grid = document.getElementById("gallery-grid");
    document.getElementById("gallery-progress").textContent = `${styles.length} of ${PLANNED} built so far.`;

    // Previews render at desktop width and scale down to fit their card.
    const THUMB_WIDTH = 1440;
    const resize = new ResizeObserver((entries) => {
      entries.forEach((e) => e.target.style.setProperty("--scale", e.contentRect.width / THUMB_WIDTH));
    });

    styles.forEach((s) => {
      const card = el("a", "gallery-card");
      card.href = pageUrl(s);

      const frame = el("div", "gallery-card__frame");
      const iframe = el("iframe");
      iframe.src = `${pageUrl(s)}&thumb`;
      iframe.loading = "lazy";
      iframe.tabIndex = -1;
      iframe.title = `${s.dataset.name} preview`;
      iframe.setAttribute("aria-hidden", "true");
      frame.append(iframe);
      resize.observe(frame);

      const meta = el("div", "gallery-card__meta");
      const title = el("p", "gallery-card__title");
      title.append(el("span", "gallery-card__num", num(s)), ` ${s.dataset.name}`);
      meta.append(title, el("p", "gallery-card__hook", `Hook: ${s.dataset.hook}`));

      card.append(frame, meta);
      const item = el("li");
      item.append(card);
      grid.append(item);
    });
  }

  function initStylePage(style) {
    style.classList.add("is-shown");
    const index = styles.indexOf(style);
    const step = (delta) => styles[(index + delta + styles.length) % styles.length];

    document.title = `${num(style)} ${style.dataset.name} · BGA Restyle Gallery`;
    document.getElementById("gallery-name").textContent = `${num(style)} · ${style.dataset.name}`;
    document.getElementById("gallery-hook").textContent = `Hook: ${style.dataset.hook}`;
    document.getElementById("gallery-count").textContent = `${index + 1} / ${styles.length}`;
    document.getElementById("gallery-prev").href = pageUrl(step(-1));
    document.getElementById("gallery-next").href = pageUrl(step(1));

    const select = document.getElementById("gallery-select");
    styles.forEach((s) => select.add(new Option(`${num(s)} · ${s.dataset.name}`, s.id)));
    select.value = style.id;
    select.addEventListener("change", () => (location.href = pageUrl(styles.find((s) => s.id === select.value))));

    document.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest("input, select, textarea, [contenteditable], [tabindex]")) return;
      if (e.key === "ArrowLeft") location.href = pageUrl(step(-1));
      if (e.key === "ArrowRight") location.href = pageUrl(step(1));
    });
  }

  function initS06(root) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var els = root.querySelectorAll("[data-count]");
    if (reduce || !els.length || !window.requestAnimationFrame) return;
    var fmt = function (n) { return n.toLocaleString("en-US"); };
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1400, start = null;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * e)) + (p < 1 ? "" : suffix);
        if (p < 1) window.requestAnimationFrame(step);
      }
      el.textContent = "0";
      window.requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { io.unobserve(en.target); run(en.target); }
        });
      }, { threshold: 0.3 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(run);
    }
  }

  function initS08(root) {
    var roller = root.querySelector(".s08-roller");
    var die = root.querySelector(".s08-die");
    var tiles = root.querySelectorAll(".s08-tile");
    if (!roller || !die || !tiles.length) return;
    var face = root.querySelector(".s08-die__face");
    var label = root.querySelector(".s08-die__label");
    var staticMsg = root.querySelector(".s08-static");
    var img = root.querySelector(".s08-result__img");
    var text = root.querySelector(".s08-result__text");
    var link = root.querySelector(".s08-result__link");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var busy = false, last = -1, timer = null;

    roller.hidden = false;
    if (staticMsg) staticMsg.hidden = true;

    function show(i) {
      var t = tiles[i];
      var name = t.getAttribute("data-name");
      Array.prototype.forEach.call(tiles, function (x) { x.classList.remove("is-picked"); });
      t.classList.add("is-picked");
      face.textContent = String(i + 1);
      label.textContent = "Roll again";
      img.src = t.querySelector("img").getAttribute("src");
      img.hidden = false;
      text.textContent = "You rolled " + (i + 1) + ": " + name + " (" + t.getAttribute("data-tag") + ")";
      link.textContent = "Play " + name + " free";
      link.hidden = false;
      die.classList.remove("is-rolling");
      busy = false;
    }

    die.addEventListener("click", function () {
      if (busy) return;
      var n = Math.floor(Math.random() * tiles.length);
      if (n === last) n = (n + 1 + Math.floor(Math.random() * (tiles.length - 1))) % tiles.length;
      last = n;
      if (reduce) { show(n); return; }
      busy = true;
      die.classList.add("is-rolling");
      var ticks = 0;
      timer = window.setInterval(function () {
        ticks++;
        face.textContent = String(1 + Math.floor(Math.random() * tiles.length));
        if (ticks >= 9) { window.clearInterval(timer); show(n); }
      }, 90);
    });
  }

  function initS12(root) {
    var els = root.querySelectorAll('.s12-count[data-count]');
    if (!els.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (root.getAttribute('data-s12-ran')) return;
    root.setAttribute('data-s12-ran', '1');
    function run() {
      var start = null, dur = 1600;
      Array.prototype.forEach.call(els, function (el) {
        el.textContent = '0';
      });
      function tick(t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        Array.prototype.forEach.call(els, function (el) {
          var n = parseInt(el.getAttribute('data-count'), 10);
          el.textContent = Math.round(n * e).toLocaleString('en-US');
        });
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (x) { return x.isIntersecting; })) { io.disconnect(); run(); }
      });
      io.observe(els[0]);
    } else {
      run();
    }
  }

  function initS14(root) {
    var radios = root.querySelectorAll('input[name="s14-vibe"]');
    var out = root.querySelector('.s14-result');
    if (!radios.length || !out) return;
    var labels = { strategy: 'Strategy', family: 'Family', friends: 'With friends' };
    root.classList.add('s14-js');
    function update(v) {
      root.setAttribute('data-vibe', v);
      var names = [];
      Array.prototype.forEach.call(root.querySelectorAll('.s14-site'), function (li) {
        var hit = (' ' + li.getAttribute('data-vibes') + ' ').indexOf(' ' + v + ' ') > -1;
        li.classList.toggle('is-match', hit);
        if (hit) names.push(li.getAttribute('data-name'));
      });
      out.textContent = labels[v] + ': ' + names.length + ' of the ten sit on your route. ' + names.join(', ') + '.';
    }
    Array.prototype.forEach.call(radios, function (r) {
      r.addEventListener('change', function () { if (r.checked) update(r.value); });
    });
  }

  function initS21(root) {
    var btn = root.querySelector('.s21-roll__btn');
    var flip = root.querySelector('.s21-flip');
    if (!btn || !flip) return;
    var games = [].map.call(root.querySelectorAll('.s21-game'), function (li) {
      return {
        name: li.querySelector('.s21-game__name').textContent,
        tag: li.querySelector('.s21-game__tag').textContent,
        src: li.querySelector('.s21-game__img').getAttribute('src')
      };
    });
    if (!games.length) return;
    var img = flip.querySelector('.s21-flip__img');
    var name = flip.querySelector('.s21-flip__name');
    var tag = flip.querySelector('.s21-flip__tag');
    var die = flip.querySelector('.s21-die');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0, timer = null, busy = false;

    function show(i) {
      current = i;
      img.setAttribute('src', games[i].src);
      name.textContent = games[i].name;
      tag.textContent = games[i].tag;
    }
    function face(n) { die.className = 's21-die s21-die--' + n; }

    btn.hidden = false;
    btn.addEventListener('click', function () {
      if (busy) return;
      var next = Math.floor(Math.random() * games.length);
      if (next === current) next = (next + 1) % games.length;
      if (reduce) { show(next); return; }
      busy = true;
      flip.classList.remove('is-flipped');
      flip.classList.add('is-rolling');
      var ticks = 0;
      timer = setInterval(function () {
        face(1 + Math.floor(Math.random() * 6));
        if (++ticks > 6) {
          clearInterval(timer);
          flip.classList.remove('is-rolling');
          show(next);
          setTimeout(function () { flip.classList.add('is-flipped'); busy = false; }, 150);
        }
      }, 120);
    });
  }

  function initS23(root) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = root.querySelectorAll('.s23-count[data-count]');
    if (!els.length) return;
    function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
    function run() {
      var start = null, dur = 1600;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        for (var i = 0; i < els.length; i++) {
          els[i].textContent = fmt(+els[i].getAttribute('data-count') * e);
        }
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    run();
  }

  function initS25(root) {
    var chips = root.querySelectorAll('.s25-chip');
    var cards = root.querySelectorAll('.s25-card');
    if (!chips.length) return;
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        cards.forEach(function (card) {
          var match = f === 'All' || card.getAttribute('data-tag') === f;
          card.classList.toggle('is-dim', !match);
        });
      });
    });
  }
})();
