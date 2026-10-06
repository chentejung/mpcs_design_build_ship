// Gallery. Three page modes, set by the inline script in <head>:
//   index.html                 landing grid: one live preview card per style
//   index.html?view=sNN        that style's own page, with the gallery bar
//   index.html?view=sNN&thumb  the bare style, loaded into a grid card's iframe
(() => {
  const PLANNED = 23;
  const styles = [...document.querySelectorAll(".style")];
  const num = (s) => s.id.slice(1);
  const pageUrl = (s) => `index.html?view=${s.id}`;

  const INITS = {s06: initS06, s07: initS07, s03: initS03, s01: initS01, s05: initS05, s11: initS11, s12: initS12, s13: initS13, s14: initS14, s15: initS15, s16: initS16, s17: initS17, s18: initS18, s19: initS19, s20: initS20, s21: initS21, s22: initS22, s23: initS23};
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
    // 06 Hex Island: "Roll for a game". Two six-sided dice; the sum lights the game on
    // that number token (2 to 6, 8 to 12), and a 7 brings the robber instead. The
    // tray stays hidden without JS; the roll lives in memory only and resets on reload.
    // Dice tumble is skipped under reduced motion.
    const tray = root.querySelector(".s06-roll");
    const button = root.querySelector(".s06-roll__btn");
    const status = root.querySelector(".s06-roll__status");
    const dice = [...root.querySelectorAll(".s06-die")];
    const tiles = [...root.querySelectorAll(".s06-tile")];
    if (!tray || !button || !status || dice.length !== 2 || !tiles.length) return;

    const calm = () =>
      document.documentElement.classList.contains("is-thumb") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d6 = () => 1 + Math.floor(Math.random() * 6);
    const show = (a, b) => {
      dice[0].dataset.v = String(a);
      dice[1].dataset.v = String(b);
    };
    let timer = 0;

    const land = (a, b) => {
      timer = 0;
      show(a, b);
      tray.classList.remove("s06-is-rolling");
      const sum = a + b;
      const seven = sum === 7;
      tray.classList.toggle("s06-is-robbed", seven);
      tiles.forEach((tile) => tile.classList.toggle("s06-is-picked", tile.dataset.roll === String(sum)));
      if (seven) {
        status.textContent = `${a} + ${b} = 7. The robber! Roll again.`;
        return;
      }
      const tile = tiles.find((t) => t.dataset.roll === String(sum));
      const name = tile ? tile.querySelector(".s06-tile__name").textContent : "";
      status.textContent = `${a} + ${b} = ${sum}. Tonight: ${name}.`;
    };

    button.addEventListener("click", () => {
      if (timer) return;
      const a = d6();
      const b = d6();
      if (calm()) {
        land(a, b);
        return;
      }
      tray.classList.remove("s06-is-rolling");
      void tray.offsetWidth;
      tray.classList.add("s06-is-rolling");
      let ticks = 0;
      timer = setInterval(() => {
        show(d6(), d6());
        if (++ticks >= 8) {
          clearInterval(timer);
          land(a, b);
        }
      }, 80);
    });

    tray.hidden = false;
  }
  function initS07(root) {
    // 07 Aviary Field Guide: "Pick your vibe" on the player mat. The three habitat rows
    // are a radio group; the highlighting is pure CSS (:has on the checked radio), so
    // this only keeps the spoken status line in step and wires up the reset button.
    // State lives in the radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s07-vibe"]')];
    const status = root.querySelector(".s07-status");
    const reset = root.querySelector(".s07-reset");
    const cards = [...root.querySelectorAll(".s07-card")];
    if (!radios.length || !status || !reset || !cards.length) return;

    const nameOf = (card) => card.querySelector(".s07-card__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = (cleared) => {
      const picked = radios.find((r) => r.checked);
      reset.disabled = !picked;
      if (!picked) {
        status.textContent = cleared
          ? "Habitat cleared. All ten games shown."
          : "Pick a habitat to mark its games.";
        return;
      }
      const names = cards.filter((c) => c.classList.contains(`s07-fit-${picked.value}`)).map(nameOf);
      status.textContent = `${picked.dataset.vibe}: ${listOf(names)}.`;
    };

    radios.forEach((r) => r.addEventListener("change", () => update(false)));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update(true);
      radios[0].focus();
    });
    reset.hidden = false;
    update(false);
  }
  function initS03(root) {
    // 03 Board Path: "Roll for tonight". A ten-sided die marks one of the ten game
    // cards (numbered 1 to 10). The tray stays hidden without JS; the pick lives in
    // memory only and resets on reload. Tumble is skipped under reduced motion.
    const tray = root.querySelector(".s03-roll");
    const button = root.querySelector(".s03-roll__btn");
    const face = root.querySelector(".s03-die__num");
    const status = root.querySelector(".s03-roll__status");
    const cards = [...root.querySelectorAll(".s03-card")];
    if (!tray || !button || !face || !status || !cards.length) return;

    const calm = () =>
      document.documentElement.classList.contains("is-thumb") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = -1;
    let timer = 0;

    const land = (pick) => {
      timer = 0;
      face.textContent = String(pick + 1);
      button.classList.remove("s03-is-rolling");
      cards.forEach((card, i) => card.classList.toggle("s03-is-picked", i === pick));
      const name = cards[pick].querySelector(".s03-card__name").textContent;
      status.textContent = `You rolled ${pick + 1}: ${name}.`;
      cards[pick].scrollIntoView({ block: "nearest", behavior: calm() ? "auto" : "smooth" });
    };

    button.addEventListener("click", () => {
      if (timer) return;
      let pick;
      do pick = Math.floor(Math.random() * cards.length);
      while (pick === last && cards.length > 1);
      last = pick;
      if (calm()) {
        land(pick);
        return;
      }
      button.classList.remove("s03-is-rolling");
      void button.offsetWidth;
      button.classList.add("s03-is-rolling");
      let ticks = 0;
      timer = setInterval(() => {
        face.textContent = String(1 + Math.floor(Math.random() * cards.length));
        if (++ticks >= 9) {
          clearInterval(timer);
          land(pick);
        }
      }, 80);
    });

    tray.hidden = false;
  }
  function initS01(root) {
    // 01 Hall of Banners: "Choose your banner" radio group. The highlighting itself is
    // pure CSS (:has on the checked radio), so this only keeps the spoken status line
    // in step and wires up the reset. State lives in the radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s01-vibe"]')];
    const status = root.querySelector(".s01-status");
    const reset = root.querySelector(".s01-reset");
    const games = [...root.querySelectorAll(".s01-game")];
    if (!radios.length || !status || !reset) return;

    const nameOf = (game) => game.querySelector(".s01-game__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are lit.";
        return;
      }
      const names = games.filter((g) => g.classList.contains(`s01-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s01-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.house} raised: ${names.length} of ${games.length} games lit`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS05(root) {
    // 05 Red Planet Project: the big numbers are global parameter tracks. Each gauge
    // ([data-s05-gauge]) counts up from zero and fills its track when it first comes
    // into view. The HTML already holds the final values and the full tracks, so
    // no JS, reduced motion and thumb mode all show the finished planet.
    const gauges = [...root.querySelectorAll("[data-s05-gauge]")];
    const calm =
      document.documentElement.classList.contains("is-thumb") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!gauges.length || calm || !("IntersectionObserver" in window)) return;

    const DURATION = 1800;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    // Pad with leading zeros to the final string's shape, like an odometer, so the
    // readout never changes width while it counts: 0 becomes "00,000,000".
    const shape = (finalText, value) => {
      const digits = String(value).split("");
      return finalText.split("").reverse()
        .map((ch) => (/\d/.test(ch) ? digits.pop() ?? "0" : ch))
        .reverse().join("");
    };

    const prepare = (gauge) => {
      const counts = [...gauge.querySelectorAll(".s05-count")].map((node) => ({
        node,
        to: Number(node.dataset.s05To),
        text: node.textContent,
      }));
      const marks = [...gauge.querySelectorAll("[data-s05-at]")].map((node) => ({
        node,
        at: Number(node.dataset.s05At),
      }));
      const set = (p) => {
        gauge.style.setProperty("--s05-p", p.toFixed(4));
        counts.forEach((c) => (c.node.textContent = p >= 1 ? c.text : shape(c.text, Math.round(c.to * p))));
        marks.forEach((m) => m.node.classList.toggle("s05-off", p < m.at - 0.0005));
      };
      set(0);
      return set;
    };

    const run = (set) => {
      let start = 0;
      const frame = (now) => {
        if (!start) start = now;
        const t = Math.min(1, (now - start) / DURATION);
        set(ease(t));
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    const setters = new Map(gauges.map((g) => [g, prepare(g)]));
    root.classList.add("s05-is-counting");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          observer.unobserve(e.target);
          run(setters.get(e.target));
        });
      },
      { threshold: 0.35 }
    );
    gauges.forEach((g) => observer.observe(g));
  }
  function initS11(root) {
    // 11 Crossroads: "Which way tonight?" radio group. Lighting the chosen road and
    // its games is pure CSS (:has on the checked radio), so this only keeps the
    // spoken status line in step and wires up the reset. State lives in the radios
    // and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s11-vibe"]')];
    const status = root.querySelector(".s11-status");
    const reset = root.querySelector(".s11-reset");
    const cards = [...root.querySelectorAll(".s11-card")];
    if (!radios.length || !status || !reset || !cards.length) return;

    const nameOf = (card) => card.querySelector(".s11-card__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = cards.filter((c) => c.classList.contains(`s11-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s11-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${cards.length} games lit`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS12(root) {
    // 12 Trail Map: "Plan tonight's route". The three destination tickets are a radio
    // group; repainting the road and lighting the matching landmarks is pure CSS (:has
    // on the checked radio), so this only keeps the spoken status line in step and
    // wires up the reset. State lives in the radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s12-vibe"]')];
    const status = root.querySelector(".s12-status");
    const reset = root.querySelector(".s12-reset");
    const marks = [...root.querySelectorAll(".s12-mark")];
    if (!radios.length || !status || !reset || !marks.length) return;

    const nameOf = (mark) => mark.querySelector(".s12-mark__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten landmarks are on the map.";
        return;
      }
      const names = marks.filter((m) => m.classList.contains(`s12-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s12-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.route} plotted: ${names.length} of ${marks.length} games on the route`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS13(root) {
    // 13 Spinner Route: "Spin for your vibe". The spinner's three segments are a radio
    // group; the needle's angle and the lit games are pure CSS (:has on the checked
    // radio), so the segments work without JS. This adds the Spin button, keeps the
    // status line in step and wires up the reset. State lives in the radios and
    // resets on reload. The needle's extra turns are skipped under reduced motion.
    const radios = [...root.querySelectorAll('input[name="s13-vibe"]')];
    const wheel = root.querySelector(".s13-wheel");
    const spin = root.querySelector(".s13-spin");
    const status = root.querySelector(".s13-status");
    const reset = root.querySelector(".s13-reset");
    const games = [...root.querySelectorAll(".s13-game")];
    if (!radios.length || !wheel || !spin || !status || !reset || !games.length) return;

    const calm = () =>
      document.documentElement.classList.contains("is-thumb") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nameOf = (game) => game.querySelector(".s13-game__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    let turns = 0;
    let timer = 0;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are in play.";
        return;
      }
      const names = games.filter((g) => g.classList.contains(`s13-fit-${picked.value}`)).map(nameOf);
      status.textContent = `${picked.dataset.vibe}: ${listOf(names)}.`;
    };

    const settle = () => {
      timer = 0;
      wheel.classList.remove("s13-is-spinning");
      update();
    };

    radios.forEach((r) => r.addEventListener("change", update));
    spin.addEventListener("click", () => {
      if (timer) return;
      const options = radios.filter((r) => !r.checked);
      const pick = options[Math.floor(Math.random() * options.length)];
      pick.checked = true;
      if (calm()) {
        settle();
        return;
      }
      turns += 2;
      wheel.style.setProperty("--s13-turns", String(turns));
      wheel.classList.add("s13-is-spinning");
      status.textContent = "Spinning…";
      timer = setTimeout(settle, 1300);
    });
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    spin.hidden = false;
    update();
  }
  function initS14(root) {
    // 14 Funnies Road: "Which way tonight?" radio group. Lighting the chosen road
    // and its games is pure CSS (:has on the checked radio), so this only keeps the
    // spoken status line in step and wires up the reset. State lives in the radios
    // and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s14-vibe"]')];
    const status = root.querySelector(".s14-status");
    const reset = root.querySelector(".s14-reset");
    const ads = [...root.querySelectorAll(".s14-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s14-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s14-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s14-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS15(root) {
    // 15 Gazette Crossroads: "Which way tonight?" radio group. Turning the chosen
    // road red and flagging its ads is pure CSS (:has on the checked radio), so
    // this only keeps the spoken status line in step and wires up the reset.
    // State lives in the radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s15-vibe"]')];
    const status = root.querySelector(".s15-status");
    const reset = root.querySelector(".s15-reset");
    const ads = [...root.querySelectorAll(".s15-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s15-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s15-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s15-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games on route`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS16(root) {
    // 16 Ink Road: "Which way tonight?" radio group, as in 14. Lighting the chosen
    // road and its games is pure CSS (:has on the checked radio), so this only
    // keeps the spoken status line in step and wires up the reset. State lives in
    // the radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s16-vibe"]')];
    const status = root.querySelector(".s16-status");
    const reset = root.querySelector(".s16-reset");
    const ads = [...root.querySelectorAll(".s16-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s16-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s16-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s16-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS17(root) {
    // 17 Sunday Gang: "Pick your vibe" as three comic panels. Bringing the chosen
    // vibe's classified ads up into full colour is pure CSS (:has on the checked
    // radio), so this only keeps the spoken status line in step and wires up the
    // reset. State lives in the radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s17-vibe"]')];
    const status = root.querySelector(".s17-status");
    const reset = root.querySelector(".s17-reset");
    const ads = [...root.querySelectorAll(".s17-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s17-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten ads are listed.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s17-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s17-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.vibe}: ${names.length} of ${ads.length} ads in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS18(root) {
    // 18 Extra Edition: "Which way tonight?" radio group, as in 14 and 16.
    // Lighting the chosen road and its classified ads is pure CSS (:has on the
    // checked radio), so this only keeps the spoken status line in step and
    // wires up the reset. State lives in the radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s18-vibe"]')];
    const status = root.querySelector(".s18-status");
    const reset = root.querySelector(".s18-reset");
    const ads = [...root.querySelectorAll(".s18-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s18-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s18-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s18-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS19(root) {
    // 19 Scoreboard Night. Two jobs.
    //
    // The scoreboard: each row ([data-s19-row]) is a figure spelled out in flip
    // tiles, one digit per tile. The true figures are in the markup, so no JS,
    // reduced motion and thumb mode all show the finished board; here each row
    // counts up from zero when it first comes into view. The value is read off
    // the tiles themselves and written back one character per tile, padded with
    // leading zeros like an odometer, so the board never changes width.
    //
    // The vibe picker: lighting the chosen road and its games is pure CSS (:has
    // on the checked radio), so this only keeps the spoken status line in step
    // and wires up the reset. State lives in the radios and resets on reload.
    const calm =
      document.documentElement.classList.contains("is-thumb") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rows = [...root.querySelectorAll("[data-s19-row]")];
    if (rows.length && !calm && "IntersectionObserver" in window) {
      const DURATION = 1900;
      const ease = (t) => 1 - Math.pow(1 - t, 3);

      const prepare = (row) => {
        const tiles = [...row.querySelectorAll(".s19-dig")];
        const final = tiles.map((t) => t.textContent).join("");
        const to = Number(final);
        const set = (p) => {
          const text = p >= 1 ? final : String(Math.round(to * p)).padStart(tiles.length, "0");
          tiles.forEach((tile, i) => (tile.textContent = text[i]));
        };
        set(0);
        return set;
      };

      const run = (set) => {
        let start = 0;
        const frame = (now) => {
          if (!start) start = now;
          const t = Math.min(1, (now - start) / DURATION);
          set(ease(t));
          if (t < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      };

      const setters = new Map(rows.map((r) => [r, prepare(r)]));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            observer.unobserve(e.target);
            run(setters.get(e.target));
          });
        },
        { threshold: 0.35 }
      );
      rows.forEach((r) => observer.observe(r));
    }

    const radios = [...root.querySelectorAll('input[name="s19-vibe"]')];
    const status = root.querySelector(".s19-status");
    const reset = root.querySelector(".s19-reset");
    const ads = [...root.querySelectorAll(".s19-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s19-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s19-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s19-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS20(root) {
    // 20 Clubhouse Sign-Up: "Which way tonight?" radio group. Lighting the chosen
    // road and its ads is pure CSS (:has on the checked radio), so this only keeps
    // the spoken status line in step and wires up the reset. State lives in the
    // radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s20-vibe"]')];
    const status = root.querySelector(".s20-status");
    const reset = root.querySelector(".s20-reset");
    const ads = [...root.querySelectorAll(".s20-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s20-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s20-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s20-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS21(root) {
    // 21 Welcome Sheet: "Which way tonight?" radio group. Lighting the chosen
    // road and its ads is pure CSS (:has on the checked radio), so this only keeps
    // the spoken status line in step and wires up the reset. State lives in the
    // radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s21-vibe"]')];
    const status = root.querySelector(".s21-status");
    const reset = root.querySelector(".s21-reset");
    const ads = [...root.querySelectorAll(".s21-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s21-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s21-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s21-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS22(root) {
    // 22 Welcome Door: "Which way tonight?" radio group. Lighting the chosen
    // road and its ads is pure CSS (:has on the checked radio), so this only keeps
    // the spoken status line in step and wires up the reset. State lives in the
    // radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s22-vibe"]')];
    const status = root.querySelector(".s22-status");
    const reset = root.querySelector(".s22-reset");
    const ads = [...root.querySelectorAll(".s22-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s22-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s22-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s22-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
  function initS23(root) {
    // 23 Welcome Board: "Which way tonight?" radio group. Lighting the chosen
    // road and its ads is pure CSS (:has on the checked radio), so this only keeps
    // the spoken status line in step and wires up the reset. State lives in the
    // radios and resets on reload.
    const radios = [...root.querySelectorAll('input[name="s23-vibe"]')];
    const status = root.querySelector(".s23-status");
    const reset = root.querySelector(".s23-reset");
    const ads = [...root.querySelectorAll(".s23-ad")];
    if (!radios.length || !status || !reset || !ads.length) return;

    const nameOf = (ad) => ad.querySelector(".s23-ad__name").textContent;
    const listOf = (names) =>
      names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

    const update = () => {
      const picked = radios.find((r) => r.checked);
      reset.hidden = !picked;
      if (!picked) {
        status.textContent = "All ten games are on the road.";
        return;
      }
      const names = ads.filter((a) => a.classList.contains(`s23-fit-${picked.value}`)).map(nameOf);
      // Short line on screen; the matching names are for screen readers only.
      const more = document.createElement("span");
      more.className = "s23-sr";
      more.textContent = `: ${listOf(names)}`;
      status.textContent = `${picked.dataset.road} road: ${names.length} of ${ads.length} games in colour`;
      status.append(more, ".");
    };

    radios.forEach((r) => r.addEventListener("change", update));
    reset.addEventListener("click", () => {
      radios.forEach((r) => (r.checked = false));
      update();
      radios[0].focus();
    });
    update();
  }
/*INITFNS*/
})();
