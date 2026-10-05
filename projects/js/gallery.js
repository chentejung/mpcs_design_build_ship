// Gallery. Three page modes, set by the inline script in <head>:
//   index.html                 landing grid: one live preview card per style
//   index.html?view=sNN        that style's own page, with the gallery bar
//   index.html?view=sNN&thumb  the bare style, loaded into a grid card's iframe
(() => {
  const PLANNED = 25;
  const styles = [...document.querySelectorAll(".style")];
  const num = (s) => s.id.slice(1);
  const pageUrl = (s) => `index.html?view=${s.id}`;

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
})();
