// Gallery. Three page modes, set by the inline script in <head>:
//   index.html                 landing grid: one live preview card per style
//   index.html?view=sNN        that style's own page, with the gallery bar
//   index.html?view=sNN&thumb  the bare style, loaded into a grid card's iframe
(() => {
  const PLANNED = 25;
  const styles = [...document.querySelectorAll(".style")];
  const num = (s) => s.id.slice(1);
  const pageUrl = (s) => `index.html?view=${s.id}`;

  const INITS = {s08: initS08, s16: initS16, s20: initS20, s23: initS23, s25: initS25};
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

  function initS08(root) {
    if (!root) return;
    var btn = root.querySelector(".s08-spin");
    var face = root.querySelector(".s08-face");
    var covers = root.querySelectorAll(".s08-vc");
    var result = root.querySelector(".s08-result");
    if (!btn || !face || !covers.length || !result) return;
    var label = result.querySelector(".s08-result-label");
    var img = result.querySelector(".s08-result-img");
    var nameEl = result.querySelector(".s08-result-name");
    var tagEl = result.querySelector(".s08-result-tag");
    var gameEl = result.querySelector(".s08-result-game");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0, turns = 0, timer = null, busy = false;
    btn.hidden = false;

    function show(i) {
      var c = covers[i];
      label.textContent = "Tonight the crew plays";
      img.src = c.getAttribute("data-img");
      nameEl.textContent = c.getAttribute("data-name");
      tagEl.textContent = c.getAttribute("data-tag");
      gameEl.textContent = c.getAttribute("data-name");
      for (var k = 0; k < covers.length; k++) covers[k].classList.toggle("s08-picked", k === i);
      result.classList.remove("s08-flash");
      void result.offsetWidth;
      if (!reduce) result.classList.add("s08-flash");
      root.classList.remove("s08-spinning");
      busy = false;
      btn.removeAttribute("aria-disabled");
      btn.textContent = "Spin again!";
    }

    btn.addEventListener("click", function () {
      if (busy) return;
      var n = covers.length, next;
      do { next = Math.floor(Math.random() * n); } while (next === current && n > 1);
      current = next;
      clearTimeout(timer);
      if (reduce) {
        face.style.transform = "rotate(" + (-next * 36) + "deg)";
        show(next);
        return;
      }
      turns += 3;
      face.style.transform = "rotate(" + (-next * 36 - turns * 360) + "deg)";
      root.classList.add("s08-spinning");
      busy = true;
      btn.setAttribute("aria-disabled", "true");
      timer = setTimeout(function () { show(next); }, 1700);
    });
  }

  function initS16(root) {
    if (!root || !root.querySelector) return;
    var picker = root.querySelector(".s16-picker");
    if (!picker) return;
    var radios = picker.querySelectorAll(".s16-radio");
    var status = picker.querySelector(".s16-status");
    var reset = picker.querySelector(".s16-reset");
    var pins = root.querySelectorAll(".s16-pin");
    var idle = status ? status.textContent : "";
    var leads = {
      strategy: "Lead A: the planners. ",
      family: "Lead B: the whole family. ",
      friends: "Lead C: the party crowd. "
    };
    function apply(v) {
      var names = [];
      pins.forEach(function (p) {
        if ((" " + p.getAttribute("data-vibes") + " ").indexOf(" " + v + " ") > -1) {
          var n = p.querySelector(".s16-pin-name");
          if (n) names.push(n.textContent);
        }
      });
      if (status) status.textContent = (leads[v] || "") + names.length + " of the ten match: " + names.join(", ") + ".";
      if (reset) reset.hidden = false;
    }
    radios.forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) apply(r.value); });
    });
    if (reset) {
      reset.addEventListener("click", function () {
        radios.forEach(function (r) { r.checked = false; });
        if (status) status.textContent = idle;
        reset.hidden = true;
        if (radios[0]) radios[0].focus();
      });
    }
  }

  function initS20(root) {
    if (!root || !root.querySelector) return;
    var picker = root.querySelector(".s20-picker");
    if (!picker) return;
    var radios = picker.querySelectorAll(".s20-radio");
    var status = picker.querySelector(".s20-status");
    var reset = picker.querySelector(".s20-reset");
    var frames = root.querySelectorAll(".s20-frame");
    var idle = status ? status.textContent : "";
    var lines = {
      strategy: "Brainy barn it is! ",
      family: "Whole-family hoedown! ",
      friends: "Rowdy bunch, here we go! "
    };
    function apply(v) {
      var n = 0;
      frames.forEach(function (f) {
        if ((" " + f.getAttribute("data-vibes") + " ").indexOf(" " + v + " ") > -1) n++;
      });
      if (status) status.textContent = (lines[v] || "") + n + " of the ten fit your crew.";
      if (reset) reset.hidden = false;
    }
    radios.forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) apply(r.value); });
    });
    if (reset) {
      reset.addEventListener("click", function () {
        radios.forEach(function (r) { r.checked = false; });
        if (status) status.textContent = idle;
        reset.hidden = true;
        if (radios[0]) radios[0].focus();
      });
    }
  }

  function initS23(root) {
    if (!root || !root.querySelectorAll) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Thumbnails and reduced motion keep the final numbers that are already in the HTML.
    if (reduce || document.documentElement.classList.contains("is-thumb") || !("requestAnimationFrame" in window)) return;
    var items = root.querySelectorAll("[data-count]");
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    function run(el) {
      if (el.getAttribute("data-run")) return;
      el.setAttribute("data-run", "1");
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var out = el.querySelector(".s23-n");
      if (!out || isNaN(target)) return;
      var dur = target > 100000 ? 1900 : 1300, t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        out.textContent = fmt(Math.round(target * e)) + (p < 1 ? "" : suffix);
        if (p < 1) window.requestAnimationFrame(step);
      }
      out.textContent = "0";
      window.requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
        });
      }, { threshold: 0.2 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(run);
    }
  }

  function initS25(root) {
    if (!root || !root.querySelectorAll) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Thumbnails show the final numbers rather than a count-up caught mid-way.
    var thumb = document.documentElement.classList.contains("is-thumb");
    if (reduce || thumb || !("requestAnimationFrame" in window)) return;
    var items = root.querySelectorAll("[data-count]");
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    function run(el) {
      if (el.getAttribute("data-run")) return;
      el.setAttribute("data-run", "1");
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var out = el.querySelector(".s25-n");
      if (!out || isNaN(target)) return;
      var dur = target > 100000 ? 1800 : 1300, t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        out.textContent = fmt(Math.round(target * e)) + (p < 1 ? "" : suffix);
        if (p < 1) window.requestAnimationFrame(step);
      }
      out.textContent = "0";
      window.requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
        });
      }, { threshold: 0.2 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(run);
    }
  }
})();
