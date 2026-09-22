/* Data Resources MM — interactions (no build step, no dependencies) */
(function () {
  "use strict";

  const FIELDS = window.FIELDS;
  const OVERLAPS = window.OVERLAPS || {};
  const RESOURCES = window.RESOURCES || {};
  // A file that failed to load (or has the wrong content) shows up in the browser console by name.
  [["FIELDS", "data.js"], ["RESOURCES", "resources.js"], ["I18N", "i18n.js"], ["QUOTES", "quotes.js"], ["SCHOOLS", "schools.js"], ["SITE", "config.js"]]
    .forEach(([v, f]) => { if (!window[v]) console.error(`Data Resources MM: ${f} did not load or has the wrong content (window.${v} is missing).`); });
  const BY_ID = {};
  FIELDS.forEach((f, i) => { f.index = i; BY_ID[f.id] = f; });
  // Tracks (e.g. AI Engineering → Models / Deployment): one circle, several sub-roles.
  const TRACKS = {};      // track id -> parent field
  const trackSel = {};    // field id -> selected track id
  FIELDS.forEach((f) => {
    if (!f.tracks) return;
    f.tracks.forEach((t) => { TRACKS[t.id] = f; BY_ID[t.id] = t; t.parentId = f.id; });
    if (!f.tools) f.tools = Array.from(new Set(f.tracks.flatMap((t) => t.tools)));
    trackSel[f.id] = f.tracks[0].id;
  });
  const currentTrack = (f) => (f.tracks ? f.tracks.find((t) => t.id === trackSel[f.id]) || f.tracks[0] : null);
  // a field id with tracks stands for all of its tracks when it comes to resources
  const resourceIds = (id) => (BY_ID[id] && BY_ID[id].tracks ? BY_ID[id].tracks.map((t) => t.id) : [id]);

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cssColor = (key) => `var(--${key})`;
  const NS = "http://www.w3.org/2000/svg";
  const PHONE = window.matchMedia("(max-width: 900px)");
  const isPhone = () => PHONE.matches;

  /* ---------------- Language ---------------- */
  const I18N = window.I18N || { languages: [{ code: "en", label: "English" }], ui: { en: {} }, content: {} };
  let LANG = (() => {
    try { const s = localStorage.getItem("drm-lang"); if (s && I18N.ui[s]) return s; } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("my") && I18N.ui.my ? "my" : "en";
  })();
  // T("key", {n: 3}) → interface text in the current language (falls back to English)
  const T = (k, vars = {}) => {
    let s = (I18N.ui[LANG] || {})[k];
    if (s == null) s = (I18N.ui.en || {})[k];
    if (s == null) return k;
    for (const v in vars) s = s.split(`{${v}}`).join(vars[v]);
    return s;
  };
  const C = () => (I18N.content || {})[LANG] || {};
  const fx = (f, prop) => { const tr = (C().fields || {})[f.id]; return tr && tr[prop] != null ? tr[prop] : f[prop]; };
  const ovx = (id, prop) => { const tr = (C().overlaps || {})[id]; return tr && tr[prop] != null ? tr[prop] : (OVERLAPS[id] || {})[prop]; };
  const gx = (name) => (C().groups || {})[name] || (name === "Other" ? T("group.Other") : name);
  const rdesc = (id) => (C().resources || {})[id] || (RESOURCES[id] || {}).description || "";
  const catName = (c) => (I18N.ui[LANG] || {})["cat." + c] || c;

  /* =====================================================================
     1. TOOLS → OVERLAPS
     ===================================================================== */
  const N = FIELDS.length;
  const toolSets = FIELDS.map((f) => new Set(f.tools));
  const allTools = Array.from(new Set(FIELDS.flatMap((f) => f.tools)));
  const toolFields = {}; // tool -> [field index]
  allTools.forEach((t) => (toolFields[t] = FIELDS.map((f, i) => (toolSets[i].has(t) ? i : -1)).filter((i) => i >= 0)));
  const COMMON = new Set(window.COMMON_TOOLS || []);
  const FOUNDATION = allTools.filter((t) => COMMON.has(t) || toolFields[t].length === N);
  const isFoundation = (t) => COMMON.has(t) || toolFields[t].length === N;
  // sets used for geometry: without the foundation tools
  const geoSets = toolSets.map((s) => new Set([...s].filter((t) => !isFoundation(t))));

  // tool groups (visualization, modelling, operations …)
  const GROUPS = (window.TOOL_GROUPS || []).map((g) => ({ name: g.name, tools: g.tools }));
  const groupOf = {};
  GROUPS.forEach((g, gi) => g.tools.forEach((t) => (groupOf[t] = gi)));
  allTools.forEach((t) => { if (groupOf[t] === undefined) { if (!GROUPS.other) { GROUPS.other = GROUPS.length; GROUPS.push({ name: "Other", tools: [] }); } groupOf[t] = GROUPS.other; } });
  const grouped = (list) => { // -> [[groupName, [tools in data order]], …] in group order
    const out = GROUPS.map((g) => [g.name, []]);
    list.forEach((t) => out[groupOf[t]][1].push(t));
    return out.filter((g) => g[1].length);
  };

  const shared = (idx) => { // tools shared by ALL fields in idx (excluding foundation)
    return [...geoSets[idx[0]]].filter((t) => idx.every((i) => geoSets[i].has(t)));
  };

  /* =====================================================================
     2. AREA-PROPORTIONAL LAYOUT
        circle area ∝ #tools, pairwise overlap area ∝ #shared tools
     ===================================================================== */
  function overlapArea(r1, r2, d) {
    if (d >= r1 + r2) return 0;
    if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
    const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
    const b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
    const c = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
    return a + b - c;
  }
  function distanceFor(r1, r2, area) {
    let lo = Math.abs(r1 - r2), hi = r1 + r2;
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2;
      if (overlapArea(r1, r2, mid) > area) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function rng(seed) { // mulberry32 — deterministic, so the layout never changes between visits
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function computeLayout() {
    const r = geoSets.map((s) => Math.sqrt(Math.max(s.size, 1) / Math.PI));
    const avgR = r.reduce((a, b) => a + b, 0) / N;
    const pairs = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const o = shared([i, j]).length;
      const disjoint = o === 0;
      const d = disjoint ? r[i] + r[j] + avgR * 0.12 : distanceFor(r[i], r[j], o);
      pairs.push({ i, j, d, disjoint, w: disjoint ? 2 : 1 });
    }
    const loss = (P) => {
      let L = 0;
      for (const p of pairs) {
        const dist = Math.hypot(P[p.i][0] - P[p.j][0], P[p.i][1] - P[p.j][1]);
        if (p.disjoint && dist >= p.d) continue;
        L += p.w * (dist - p.d) ** 2;
      }
      return L;
    };
    const rand = rng(20260923);
    const starts = [];
    for (let run = 0; run < 60; run++) {
      const P = FIELDS.map(() => [(rand() - 0.5) * avgR * 6, (rand() - 0.5) * avgR * 6]);
      let lr = 0.08;
      for (let it = 0; it < 1400; it++) {
        const G = FIELDS.map(() => [0, 0]);
        for (const p of pairs) {
          const dx = P[p.i][0] - P[p.j][0], dy = P[p.i][1] - P[p.j][1];
          const dist = Math.hypot(dx, dy) || 1e-6;
          if (p.disjoint && dist >= p.d) continue;
          const g = (2 * p.w * (dist - p.d)) / dist;
          G[p.i][0] += g * dx; G[p.i][1] += g * dy;
          G[p.j][0] -= g * dx; G[p.j][1] -= g * dy;
        }
        for (let k = 0; k < N; k++) { P[k][0] -= lr * G[k][0]; P[k][1] -= lr * G[k][1]; }
        if (it % 200 === 199) lr *= 0.7;
      }
      starts.push({ P: P.map((p) => p.slice()), L: loss(P) });
    }

    /* Refine: make every REGION (not just every pair) match its tool count.
       Target for a region = number of tools used by exactly that combination of fields. */
    const targets = {};
    allTools.filter((t) => !isFoundation(t)).forEach((t) => {
      const m = toolFields[t].reduce((a, i) => a | (1 << i), 0);
      targets[m] = (targets[m] || 0) + 1;
    });
    const G = 64;
    const regionLoss = (P) => {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      P.forEach(([x, y], i) => { x0 = Math.min(x0, x - r[i]); x1 = Math.max(x1, x + r[i]); y0 = Math.min(y0, y - r[i]); y1 = Math.max(y1, y + r[i]); });
      const dx = (x1 - x0) / G, dy = (y1 - y0) / G, cell = dx * dy, counts = {};
      for (let a = 0; a < G; a++) {
        const y = y0 + (a + 0.5) * dy;
        for (let b = 0; b < G; b++) {
          const x = x0 + (b + 0.5) * dx;
          let m = 0;
          for (let i = 0; i < N; i++) { const ex = x - P[i][0], ey = y - P[i][1]; if (ex * ex + ey * ey <= r[i] * r[i]) m |= 1 << i; }
          if (m) counts[m] = (counts[m] || 0) + 1;
        }
      }
      let Ls = 0;
      const keys = new Set([...Object.keys(counts), ...Object.keys(targets)]);
      keys.forEach((k) => {
        const got = (counts[k] || 0) * cell, want = targets[k] || 0;
        // regions that shouldn't exist at all are punished harder
        Ls += (want ? 1 : 6) * (got - want) ** 2;
      });
      return Ls;
    };
    const refine = (P0) => {
      const P = P0.map((p) => p.slice());
      let cur = regionLoss(P), step = avgR * 0.4, evals = 0;
      while (step > avgR * 0.01 && evals < 2600) {
        let improved = false;
        for (let k = 0; k < N; k++) for (let c = 0; c < 2; c++) for (const sgn of [1, -1]) {
          P[k][c] += sgn * step; evals++;
          const l = regionLoss(P);
          if (l < cur) { cur = l; improved = true; } else P[k][c] -= sgn * step;
        }
        if (!improved) step *= 0.5;
      }
      return { P, L: cur };
    };
    starts.sort((a, b) => a.L - b.L);
    let best = null, bestL = Infinity;
    starts.slice(0, 6).forEach((s0) => {
      const res = refine(s0.P);
      if (res.L < bestL) { bestL = res.L; best = res.P; }
    });

    // orient: first field on the left, second field towards the top
    const cx = best.reduce((a, p) => a + p[0], 0) / N, cy = best.reduce((a, p) => a + p[1], 0) / N;
    let P = best.map(([x, y]) => [x - cx, y - cy]);
    const ang = Math.PI - Math.atan2(P[0][1], P[0][0]);
    P = P.map(([x, y]) => [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)]);
    if (N > 1 && P[1][1] > 0) P = P.map(([x, y]) => [x, -y]);

    // fit into a 500-wide viewBox
    const pad = 0.12 * avgR;
    const minX = Math.min(...P.map((p, i) => p[0] - r[i])) - pad, maxX = Math.max(...P.map((p, i) => p[0] + r[i])) + pad;
    const minY = Math.min(...P.map((p, i) => p[1] - r[i])) - pad, maxY = Math.max(...P.map((p, i) => p[1] + r[i])) + pad;
    const W = 500, s = W / (maxX - minX), H = Math.round((maxY - minY) * s);
    return {
      W, H,
      circles: P.map(([x, y], i) => ({ x: (x - minX) * s, y: (y - minY) * s, r: r[i] * s })),
    };
  }

  /* =====================================================================
     3. REGIONS  (sample the plane → every area that actually exists)
     ===================================================================== */
  function computeRegions(L) {
    const step = 3, regions = {};
    for (let y = step / 2; y < L.H; y += step) {
      for (let x = step / 2; x < L.W; x += step) {
        let mask = 0, margin = Infinity;
        L.circles.forEach((c, i) => {
          const d = Math.hypot(x - c.x, y - c.y);
          if (d <= c.r) mask |= 1 << i;
          margin = Math.min(margin, Math.abs(d - c.r));
        });
        if (!mask) continue;
        const R = regions[mask] || (regions[mask] = { mask, n: 0, best: -1, x: 0, y: 0 });
        R.n++;
        if (margin > R.best) { R.best = margin; R.x = x; R.y = y; }
      }
    }
    Object.values(regions).forEach((R) => {
      R.idx = FIELDS.map((f, i) => i).filter((i) => R.mask & (1 << i));
      R.id = R.idx.map((i) => FIELDS[i].id).join("+");
      R.shared = R.idx.length > 1 ? shared(R.idx) : null;
    });
    return regions;
  }

  /* =====================================================================
     4. DRAW THE DIAGRAM
     ===================================================================== */
  const venn = $("#venn");
  // The layout only changes when the tool lists change, so cache it per browser.
  function cachedLayout() {
    const key = "drm-venn-" + JSON.stringify(FIELDS.map((f) => f.tools)).split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
    try { const hit = JSON.parse(localStorage.getItem(key)); if (hit && hit.circles) return hit; } catch (e) {}
    const res = computeLayout();
    try { localStorage.setItem(key, JSON.stringify(res)); } catch (e) {}
    return res;
  }
  const L = cachedLayout();
  const REG = computeRegions(L);
  const REG_BY_ID = {};
  Object.values(REG).forEach((R) => (REG_BY_ID[R.id] = R));

  function el(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function drawVenn() {
    venn.setAttribute("viewBox", `0 0 ${L.W} ${L.H}`);
    const defs = el("defs", {}, venn);
    L.circles.forEach((c, i) => {
      const cp = el("clipPath", { id: `clip${i}` }, defs);
      el("circle", { cx: c.x, cy: c.y, r: c.r }, cp);
    });
    const discs = el("g", { class: "discs" }, venn);
    L.circles.forEach((c, i) => el("circle", { class: "disc", "data-i": i, cx: c.x, cy: c.y, r: c.r, style: `--c:${cssColor(FIELDS[i].color)}` }, discs));
    el("g", { id: "hl", class: "hl" }, venn);
    const rings = el("g", { class: "rings" }, venn);
    L.circles.forEach((c, i) => el("circle", { class: "ring", "data-i": i, cx: c.x, cy: c.y, r: c.r, style: `--c:${cssColor(FIELDS[i].color)}` }, rings));

    const labels = el("g", { class: "labels" }, venn);
    // field labels, placed in the biggest free spot of each circle
    FIELDS.forEach((f, i) => {
      const own = REG[1 << i];
      const pt = own && own.best > 10 ? own : { x: L.circles[i].x, y: L.circles[i].y };
      const g = el("g", { class: "lbl field", "data-id": f.id, tabindex: 0, role: "button", "aria-label": f.name, style: `--c:${cssColor(f.color)}` }, labels);
      const t = el("text", { x: pt.x, y: pt.y - 6 }, g);
      f.label.forEach((line, k) => { const ts = el("tspan", { x: pt.x, dy: k ? "1.1em" : 0 }, t); ts.textContent = line; });
      el("circle", { class: "anchor", cx: pt.x, cy: pt.y + 27, r: 3.5 }, g);
      f.anchor = { x: pt.x, y: pt.y + 27 };
    });
    el("circle", { id: "activeDot", class: "active-dot", r: 5, cx: 0, cy: 0, visibility: "hidden" }, venn);
  }

  // highlight exactly one region: inside all its circles, outside all others
  const maskCache = {};
  function highlight(R, cls) {
    const hl = $("#hl", venn);
    $$(`.${cls}`, hl).forEach((n) => n.remove());
    if (!R) return;
    const defs = $("defs", venn);
    if (!maskCache[R.mask]) {
      const m = el("mask", { id: `m${R.mask}` }, defs);
      el("rect", { width: L.W, height: L.H, fill: "#fff" }, m);
      L.circles.forEach((c, i) => { if (!(R.mask & (1 << i))) el("circle", { cx: c.x, cy: c.y, r: c.r, fill: "#000" }, m); });
      maskCache[R.mask] = true;
    }
    let parent = el("g", { class: cls }, hl);
    R.idx.forEach((i) => (parent = el("g", { "clip-path": `url(#clip${i})` }, parent)));
    const color = R.idx.length === 1 ? cssColor(FIELDS[R.idx[0]].color) : "var(--ink)";
    el("rect", { width: L.W, height: L.H, mask: `url(#m${R.mask})`, style: `fill:${color}` }, parent);
  }

  drawVenn();

  /* =====================================================================
     5. INTERACTION
     ===================================================================== */
  const stage = $("#map");
  const wire = $("#wire");
  const wireDot = $("#wireDot");
  const tree = $("#tree");
  const empty = $("#emptyState");
  
  let activeId = null;

  function toSvg(clientX, clientY) {
    const m = venn.getScreenCTM();
    return m ? new DOMPoint(clientX, clientY).matrixTransform(m.inverse()) : null;
  }
  function regionAt(clientX, clientY) {
    const p = toSvg(clientX, clientY);
    if (!p) return null;
    let mask = 0;
    L.circles.forEach((c, i) => { if (Math.hypot(p.x - c.x, p.y - c.y) <= c.r) mask |= 1 << i; });
    return REG[mask] || null;
  }

  venn.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const R = regionAt(e.clientX, e.clientY);
    venn.style.cursor = R ? "pointer" : "default";
    highlight(R && R.id !== activeId ? R : null, "hover");
    // hovering only highlights the area; the tree opens on click
  });
  venn.addEventListener("pointerleave", () => highlight(null, "hover"));
  venn.addEventListener("click", (e) => {
    const R = regionAt(e.clientX, e.clientY);
    if (R) activate(R.id, { user: true });
  });
  $$(".lbl", venn).forEach((g) => {
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); activate(g.dataset.id, { user: true });
        const b = $(".learn-btn", tree); if (b) b.focus();
      }
    });
  });

  function regionName(R) {
    if (R.idx.length === 1) return FIELDS[R.idx[0]].name;
    return (OVERLAPS[R.id] && OVERLAPS[R.id].name) || R.idx.map((i) => FIELDS[i].name).join(" + ");
  }

  /* ---------------- Tree ---------------- */
  const svgIcon = (d, extra = "") => `<svg viewBox="0 0 24 24" aria-hidden="true">${extra}<path d="${d}"/></svg>`;
  const ICON = {
    clipboard: svgIcon("M9 4h6v3H9zM7 5H5v16h14V5h-2M8 12h8M8 16h5"),
    gauge: svgIcon("M4 17a8 8 0 1 1 16 0M12 17l4-5M4 21h16"),
    chart: svgIcon("M5 20V11M12 20V4M19 20v-7"),
    db: svgIcon("M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"),
    sigma: svgIcon("M18 5H6l6 7-6 7h12"),
    ml: svgIcon("M4 19l5-6 4 3 7-9M15 7h5v5"),
    chip: svgIcon("M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"),
    rocket: svgIcon("M5 15c-1 1-1.5 4-1.5 4.5S6.5 19 9 18M9 15l-3-3c1.5-4 5-8 13-9-1 8-5 11.5-9 13zM14 10a1.5 1.5 0 1 0 0-.01"),
    overlap: svgIcon("", '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>'),
    overview: svgIcon("M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z", '<circle cx="12" cy="12" r="3"/>'),
    doing: svgIcon("M10 6h10M10 12h10M10 18h10M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17"),
    skills: svgIcon("M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"),
    tools: svgIcon("M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"),
    roles: svgIcon("M3 8h18v12H3zM8 8V5h8v3M3 13h18"),
    split: svgIcon("M6 3v6a6 6 0 0 0 6 6h0a6 6 0 0 1 6 6M18 3v6"),
    book: svgIcon("M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h14"),
    arrow: '<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    ext: '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>',
    Courses: svgIcon("M2 9l10-5 10 5-10 5L2 9zM6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5"),
    Documentation: svgIcon("M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"),
    YouTube: svgIcon("M3 6h18v12H3zM10 9.5l4.5 2.5-4.5 2.5z"),
    Practice: svgIcon("M4 5h16v14H4zM8 10l3 2-3 2M13 15h4"),
    Books: svgIcon("M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5"),
    "Training schools": svgIcon("M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"),
  };

  const dots = (idxs, skip) => idxs.filter((i) => i !== skip).map((i) => `<i class="dot sm" style="background:${cssColor(FIELDS[i].color)}" title="${esc(FIELDS[i].name)}"></i>`).join("");
  const tags = (list, cls = "") => `<div class="tags">${list.map((t) => `<span class="tag ${cls}">${esc(t)}</span>`).join("")}</div>`;
  const toolTag = (t, self) => {
    const others = toolFields[t].filter((i) => i !== self);
    return `<span class="tag${others.length ? " shared" : ""}">${esc(t)}${others.length ? `<span class="tdots">${dots(others)}</span>` : ""}</span>`;
  };
  // tools shown in their groups: one labelled row per group
  const groupedTags = (list, render) => `<div class="tgroups">${grouped(list).map(([name, ts]) =>
    `<div class="tgroup"><p class="tg-name">${esc(gx(name))}</p><div class="tags">${ts.map(render).join("")}</div></div>`).join("")}</div>`;
  const toolTags = (list, self) => groupedTags(list, (t) => toolTag(t, self));

  // Cards after the first can fold on phones (tap the header); on desktop they are always open.
  const CHEV = '<svg class="fold-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  function card(i, icon, title, body, extraHead = "", cls = "") {
    const fold = i > 0;
    return `<li class="branch" style="--i:${i}"><div class="card ${cls}${fold ? " foldable" : ""}">
      <div class="card-h"${fold ? ' data-fold tabindex="0" aria-expanded="false"' : ""}><h3>${ICON[icon]}${title}</h3>${extraHead}${fold ? CHEV : ""}</div>
      <div class="card-b">${body}</div></div></li>`;
  }
  const learnBtn = (id, name, track = "") => `<button type="button" class="learn-btn" data-learn="${esc(id)}"${track ? ` data-track-pick="${esc(track)}"` : ""} aria-label="${esc(T("btn.learnAria", { name }))}">${ICON.book}${esc(T("btn.learn"))}${ICON.arrow}</button>`;

  function pairShares(R) {
    const rows = [];
    for (let a = 0; a < R.idx.length; a++) for (let b = a + 1; b < R.idx.length; b++) {
      const sh = shared([R.idx[a], R.idx[b]]);
      if (sh.length) rows.push(`<p class="sub"><i class="dot sm" style="background:${cssColor(FIELDS[R.idx[a]].color)}"></i><i class="dot sm" style="background:${cssColor(FIELDS[R.idx[b]].color)}"></i>${esc(FIELDS[R.idx[a]].name)} + ${esc(FIELDS[R.idx[b]].name)}</p>${tags(sh)}`);
    }
    return rows.join("") || `<p class="muted small">${esc(T("tree.none"))}</p>`;
  }

  function markCards() {
    const list = $("#emptyList");
    $$("button", list).forEach((b) => b.classList.toggle("on", b.dataset.go === activeId));
    const on = $("button.on", list);
    if (on && isPhone() && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: on.offsetLeft - (list.clientWidth - on.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
    }
  }

  function renderTree(R) {
    let html;
    if (R.idx.length === 1) {
      const i = R.idx[0], f = FIELDS[i];
      const src = currentTrack(f) || f;   // with tracks, the cards follow the chosen track
      tree.style.setProperty("--c", cssColor(f.color));
      const own = src.tools.filter((t) => !isFoundation(t));
      const trackSwitch = f.tracks ? `
        <p class="muted small track-intro">${esc(fx(f, "overview"))}</p>
        <div class="seg track-seg" role="tablist" aria-label="${esc(T("tree.track"))}">
          ${f.tracks.map((t) => `<button type="button" role="tab" data-track="${t.id}" data-parent="${f.id}" aria-selected="${t.id === src.id}" style="--c:${cssColor(t.color)}"><i class="dot sm"></i>${esc(fx(t, "short") || t.name)}</button>`).join("")}
        </div>` : "";
      html = `
        <div class="tree-root"><span class="swatch">${ICON[f.icon] || ICON.overlap}</span>
          <div><small>${esc(T("tree.field"))}</small><h2>${esc(f.name)}</h2></div></div>
        <ul class="branches">
          ${card(0, "overview", T("tree.overview"),
            `${trackSwitch}<p class="ov-lead"><span class="ov-step">${esc(fx(src, "step"))}</span>${esc(fx(src, "tagline"))}</p>
             <p>${esc(fx(src, "overview"))}</p>
             ${rdesc(src.id) ? `<p class="ov-learn"><b>${esc(T("tree.learnFocus"))}:</b> ${esc(rdesc(src.id))}</p>` : ""}`,
            learnBtn(f.id, f.name, f.tracks ? src.id : ""), "overview")}
          ${card(1, "doing", T("tree.doing"), `<ul class="bul">${fx(src, "doing").map((d) => `<li>${esc(d)}</li>`).join("")}</ul>`)}
          ${card(2, "tools", T("tree.tools"), `${toolTags(own, i)}<p class="note">${esc(T("tree.dotsNote"))}</p>`)}
          ${card(3, "skills", T("tree.skills"), tags(src.skills))}
          ${card(4, "roles", T("tree.roles"), tags(src.roles, "role"))}
        </ul>`;
    } else {
      const named = OVERLAPS[R.id];
      tree.style.setProperty("--c", "var(--ink)");
      const names = R.idx.map((i) => `<span class="pill" style="--c:${cssColor(FIELDS[i].color)}"><i class="dot sm"></i>${esc(FIELDS[i].name)}</span>`).join("");
      const overview = named ? ovx(R.id, "overview")
        : R.shared.length
          ? T("tree.meet", { names: R.idx.map((i) => FIELDS[i].name).join(T("tree.and")) })
          : T("tree.noCommon", { n: R.idx.length });
      const diff = R.idx.map((i) => {
        const only = FIELDS[i].tools.filter((t) => !isFoundation(t) && !R.shared.includes(t)).slice(0, 5);
        return `<p class="sub"><i class="dot sm" style="background:${cssColor(FIELDS[i].color)}"></i>${esc(T("tree.adds", { name: FIELDS[i].name }))}</p>${tags(only)}`;
      }).join("");
      html = `
        <div class="tree-root"><span class="swatch">${ICON.overlap}</span>
          <div><small>${esc(T("tree.overlap", { n: R.shared.length }))}</small><h2>${esc(regionName(R))}</h2></div></div>
        <ul class="branches">
          ${card(0, "overview", T("tree.overview"), `<div class="pills">${names}</div><p>${esc(overview)}</p>`, learnBtn(R.id, regionName(R)), "overview")}
          ${card(1, "tools", T("tree.shared"), R.shared.length ? groupedTags(R.shared, (t) => `<span class="tag strong">${esc(t)}</span>`) : pairShares(R))}
          ${R.shared.length ? card(2, "split", T("tree.differ"), diff) : ""}
          ${named && named.roles ? card(3, "roles", T("tree.roles"), tags(named.roles, "role")) : ""}
        </ul>`;
    }
    tree.innerHTML = html + `<button type="button" class="back-to-map" data-back-map>↑ ${esc(T("tree.backToMap"))}</button>`;
  }

  function regionFor(id) {
    if (REG_BY_ID[id]) return REG_BY_ID[id];
    const idx = id.split("+").map((x) => BY_ID[x] && BY_ID[x].index).filter((x) => x != null).sort((a, b) => a - b);
    if (idx.length < 2) return null;
    const cs = idx.map((k) => L.circles[k]);
    const v = { id, idx, mask: idx.reduce((a, k) => a | (1 << k), 0), shared: shared(idx), virtual: true,
      x: cs.reduce((a, c) => a + c.x, 0) / cs.length, y: cs.reduce((a, c) => a + c.y, 0) / cs.length };
    REG_BY_ID[id] = v;
    return v;
  }

  function activate(id, opts = {}) {
    const R = regionFor(id);
    if (!R) return;
    if (id === activeId && !opts.force) return;
    activeId = id;
    highlight(R, "active");
    highlight(null, "hover");
    $$(".lbl", venn).forEach((g) => g.classList.toggle("is-active", g.dataset.id === id));
    const color = R.idx.length === 1 ? cssColor(FIELDS[R.idx[0]].color) : "var(--ink)";
    stage.style.setProperty("--wire", color);
    
    stage.classList.add("has-tree");
    // once a tree is showing, the field cards move under the diagram
    if (!empty.classList.contains("docked")) { $(".venn-wrap").appendChild(empty); empty.classList.add("docked"); }
    markCards();
    tree.hidden = false;
    renderTree(R);
    tree.classList.remove("grow"); void tree.offsetWidth; tree.classList.add("grow");
    drawWire(true);
    // phones: the tree sits below the diagram, so bring it into view after a tap
    if (opts.user && window.matchMedia("(max-width: 900px)").matches) {
      setTimeout(() => tree.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }), 60);
    }
  }

  /* ---------------- Connector wire ---------------- */
  function anchorOf(R) {
    if (R.idx.length === 1) return FIELDS[R.idx[0]].anchor;
    return { x: R.x, y: R.y };
  }
  function drawWire(animate) {
    if (!activeId) return;
    const R = REG_BY_ID[activeId];
    const root = $(".tree-root", tree);
    const m = venn.getScreenCTM();
    if (!root || !m) return;
    const A = anchorOf(R);
    const dot = $("#activeDot", venn);
    dot.setAttribute("cx", A.x); dot.setAttribute("cy", A.y); dot.setAttribute("visibility", "visible");
    const pt = new DOMPoint(A.x, A.y).matrixTransform(m);
    const s = stage.getBoundingClientRect();
    const t = root.getBoundingClientRect();
    const sx = pt.x - s.left, sy = pt.y - s.top;
    let d, ex, ey;
    if (t.left > pt.x + 24) {
      ex = t.left - s.left - 2; ey = t.top + t.height / 2 - s.top;
      const mx = sx + (ex - sx) * 0.55;
      d = `M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`;
    } else {
      // stacked (phone) layout: the tree sits below the cards, so no connector line
      wire.setAttribute("d", ""); wireDot.classList.remove("on");
      return;
    }
    wire.setAttribute("d", d);
    wireDot.setAttribute("cx", sx); wireDot.setAttribute("cy", sy);
    wireDot.classList.add("on");
    const len = wire.getTotalLength();
    wire.style.strokeDasharray = len;
    wire.classList.remove("draw");
    if (animate && !reduced) {
      wire.style.strokeDashoffset = len;
      void wire.getBoundingClientRect();
      wire.classList.add("draw");
    } else wire.style.strokeDashoffset = 0;
  }
  let rz;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => drawWire(false), 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => drawWire(false));
  function toggleFold(h) {
    if (!isPhone()) return;
    const c = h.closest(".card");
    c.classList.toggle("open");
    h.setAttribute("aria-expanded", String(c.classList.contains("open")));
  }
  tree.addEventListener("click", (e) => { const h = e.target.closest("[data-fold]"); if (h) toggleFold(h); });
  tree.addEventListener("keydown", (e) => {
    const h = e.target.closest("[data-fold]");
    if (h && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleFold(h); }
  });
  tree.addEventListener("animationend", (e) => { if (e.target.classList && e.target.classList.contains("tree-root")) drawWire(false); });

  /* =====================================================================
     6. OTHER SECTIONS (generated from data)
     ===================================================================== */
  function renderSections() {
  $("#emptyList").innerHTML = FIELDS.map((f) =>
      `<button type="button" data-go="${f.id}"><i class="dot" style="background:${cssColor(f.color)}"></i><span><b>${esc(f.name)}</b>${esc(fx(f, "tagline"))}</span></button>`).join("");
    markCards();
    // what each role brings to a business
    const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
    $("#valueGrid").innerHTML = FIELDS.map((f) => {
      const v = fx(f, "value");
      if (!v) return "";
      return `<article class="value-card" style="--c:${cssColor(f.color)}">
        <p class="vc-role"><i class="dot sm"></i>${esc(f.name)}</p>
        <h3>${esc(v.headline)}</h3>
        <ul class="vc-out">${v.outcomes.map((o) => `<li>${check}<span>${esc(o)}</span></li>`).join("")}</ul>
        <div class="vc-more">
          <div class="vc-hire"><b>${esc(T("value.hire"))}</b><p>${esc(v.hireWhen)}</p></div>
          <blockquote class="vc-q"><b>${esc(T("value.asks"))}</b>“${esc(v.example)}”</blockquote>
        </div>
        <button type="button" class="vc-more-btn" aria-expanded="false">${esc(T("value.more"))}</button>
        <button type="button" class="btn ghost vc-see" data-explore="${f.id}">${esc(T("value.see"))}</button>
      </article>`;
    }).join("");
    $("#valueDots").innerHTML = FIELDS.map((f, k) =>
      `<button type="button" data-vdot="${k}" aria-label="${esc(f.name)}" style="--c:${cssColor(f.color)}"></button>`).join("");
    watchValueCards();
  }

  // phone carousel: which card is in view → active dot
  let vObserver = null;
  function watchValueCards() {
    const grid = $("#valueGrid");
    if (vObserver) vObserver.disconnect();
    if (!("IntersectionObserver" in window)) return;
    vObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const k = [...grid.children].indexOf(en.target);
        $$("#valueDots button").forEach((d, i) => d.setAttribute("aria-current", String(i === k)));
      });
    }, { root: grid, threshold: 0.6 });
    [...grid.children].forEach((c) => vObserver.observe(c));
  }
  $("#valueDots").addEventListener("click", (e) => {
    const d = e.target.closest("[data-vdot]"); if (!d) return;
    const grid = $("#valueGrid"), c = grid.children[+d.dataset.vdot];
    grid.scrollTo({ left: c.offsetLeft - grid.offsetLeft - 16, behavior: reduced ? "auto" : "smooth" });
  });
  $("#valueGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".vc-more-btn"); if (!b) return;
    const card = b.closest(".value-card");
    const open = card.classList.toggle("open");
    b.setAttribute("aria-expanded", String(open));
    b.textContent = T(open ? "value.less" : "value.more");
  });
  renderSections();


  /* =====================================================================
     7. LEARN DRAWER
     ===================================================================== */
  const drawer = $("#drawer"), scrim = $("#scrim"), drawerBody = $("#drawerBody");
  const fieldTabs = $("#fieldTabs"), levelTabs = $("#levelTabs");
  const dState = { region: null, field: null, level: "beginner" };
  let lastFocus = null;
  const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; } };

  function renderDrawerBody() {
    const data = RESOURCES[dState.field] || {};
    const lvl = data[dState.level];
    drawer.style.setProperty("--c", cssColor(BY_ID[dState.field].color));
    drawerBody.innerHTML = !lvl ? `<p class="muted" style="padding-top:18px">${esc(T("drawer.empty"))}</p>`
      : Object.keys(lvl).map((cat, i) => `
        <section class="cat" style="--i:${i}">
          <h3>${ICON[cat] || ICON.book}${esc(catName(cat))}<span class="count">${lvl[cat].length}</span></h3>
          <ul class="res-list">${lvl[cat].map(([name, url]) => {
            const host = hostOf(url);
            return `<li><a class="res" href="${esc(url)}" target="_blank" rel="noopener">
              <span class="res-fav">${esc(host.charAt(0))}<img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64" alt="" loading="lazy" onerror="this.remove()"></span>
              <span class="res-txt"><span class="res-title">${esc(name)}</span><span class="res-host">${esc(host)}</span></span>${ICON.ext}</a></li>`;
          }).join("")}</ul>
        </section>`).join("");
    const parentId = (BY_ID[dState.field] || {}).parentId;
    const schools = (window.SCHOOLS || []).filter((s) => (s.fields || []).some((x) => x === dState.field || x === parentId));
    if (schools.length) {
      drawerBody.insertAdjacentHTML("beforeend", `
        <section class="cat" style="--i:9">
          <h3>${ICON["Training schools"]}${esc(catName("Training schools"))}<span class="count">${schools.length}</span></h3>
          <ul class="res-list">${schools.map((s) => {
            const host = hostOf(s.link);
            const meta = [s.location, s.language, s.cost, s.levels].filter(Boolean).join(" · ");
            return `<li><a class="res" href="${esc(s.link)}" target="_blank" rel="noopener">
              <span class="res-fav">${esc(host.charAt(0))}</span>
              <span class="res-txt"><span class="res-title">${esc(s.name)}</span><span class="res-host">${esc(meta || host)}</span></span>${ICON.ext}</a></li>`;
          }).join("")}</ul>
        </section>`);
    }
    drawerBody.scrollTop = 0;
    $$("button", levelTabs).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.level === dState.level)));
    $$("button", fieldTabs).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.field === dState.field)));
  }

  function openDrawer(regionId, level, field) {
    const parts = regionId.split("+").filter((x) => BY_ID[x]);
    const ids = parts.flatMap(resourceIds);
    if (!ids.length) return;
    dState.region = regionId;
    dState.level = level === "intermediate" ? "intermediate" : "beginner";
    dState.field = ids.includes(field) ? field : ids[0];
    const R = REG_BY_ID[regionId];
    $("#drawerTitle").textContent = R ? regionName(R) : BY_ID[ids[0]].name;
    $("#drawerDesc").textContent = parts.length > 1
      ? T("drawer.overlapDesc", { n: parts.length })
      : ids.length > 1 ? T("drawer.trackDesc") : rdesc(ids[0]);
    fieldTabs.innerHTML = ids.length > 1
      ? ids.map((f) => `<button type="button" role="tab" data-field="${f}"><i class="dot sm" style="background:${cssColor(BY_ID[f].color)}"></i>${esc(BY_ID[f].name)}</button>`).join("")
      : "";
    const wasOpen = drawer.classList.contains("open");
    renderDrawerBody();
    if (!wasOpen) {
      if (suggest.classList.contains("open")) { closeSuggest(true); replacePanel("drawer"); } else pushPanel("drawer");
      lastFocus = document.activeElement;
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add("on"));
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("locked");
      setTimeout(() => $("#drawerClose").focus({ preventScroll: true }), 60);
    }
    setHash(`learn/${regionId}/${dState.level}`);
  }

  function closeDrawer(fromHistory) {
    if (!drawer.classList.contains("open")) return;
    if (!fromHistory && history.state && history.state.panel === "drawer") { history.back(); return; }
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.classList.remove("on");
    document.body.classList.remove("locked");
    setTimeout(() => { scrim.hidden = true; }, 300);
    if (!fromHistory) setHash(activeId ? `explore/${activeId}` : "");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  $("#drawerClose").addEventListener("click", () => closeDrawer());

  /* Phone back button: opening a panel adds a history step, so "back" closes the panel
     instead of leaving the site. */
  let skipHash = false;
  function pushPanel(name) { try { history.pushState({ panel: name }, "", location.href); } catch (e) {} }
  function replacePanel(name) { try { history.replaceState({ panel: name }, "", location.href); } catch (e) {} }
  window.addEventListener("popstate", (e) => {
    const want = e.state && e.state.panel;
    if (want !== "drawer" && drawer.classList.contains("open")) { skipHash = true; closeDrawer(true); }
    if (want !== "suggest" && suggest.classList.contains("open")) { skipHash = true; closeSuggest(true); }
    setTimeout(() => { skipHash = false; }, 0);
  });
  scrim.addEventListener("click", () => { closeDrawer(); closeSuggest(); });
  levelTabs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-level]"); if (!b) return;
    dState.level = b.dataset.level; renderDrawerBody(); setHash(`learn/${dState.region}/${dState.level}`);
  });
  fieldTabs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-field]"); if (!b) return;
    dState.field = b.dataset.field; renderDrawerBody();
  });
  document.addEventListener("keydown", (e) => {
    const panel = $(".drawer.open");
    if (!panel) return;
    if (e.key === "Escape") { closeDrawer(); closeSuggest(); return; }
    if (e.key === "Tab") {
      const f = $$('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel).filter((x) => x.offsetParent !== null && !x.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-back-map]")) { stage.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); return; }
    const sg = e.target.closest("[data-suggest]");
    if (sg) { e.preventDefault(); openSuggest(); return; }
    const learn = e.target.closest("[data-learn]");
    if (learn) { openDrawer(learn.dataset.learn, undefined, learn.dataset.trackPick); return; }
    const tr = e.target.closest("[data-track]");
    if (tr) {  // switch track inside the tree
      trackSel[tr.dataset.parent] = tr.dataset.track;
      renderTree(REG_BY_ID[activeId]);
      drawWire(false);
      return;
    }
    const go = e.target.closest("[data-go]");
    if (go) { activate(go.dataset.go, { user: true }); return; }
    const ex = e.target.closest("[data-explore]");
    if (ex) {
      stage.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      setTimeout(() => activate(ex.dataset.explore, { force: true }), reduced ? 0 : 450);
    }
  });

  /* ---------------- Suggest panel ----------------
     A static site can't store submissions, so each form opens a GitHub issue
     with the suggestion already filled in. The maintainers review it there. */
  const REPO_ISSUE = "https://github.com/data-resources-mm/data-resources-mm.github.io/issues/new";
  const suggest = $("#suggest");
  let sgLastFocus = null;

  function fillFieldSelects() {
    $$(".sg-fields", suggest).forEach((sel) => {
      const keep = sel.options[0];
      sel.innerHTML = "";
      sel.appendChild(keep);
      FIELDS.flatMap((f) => f.tracks || [f]).forEach((f) => { const o = document.createElement("option"); o.value = f.name; o.textContent = f.name; sel.appendChild(o); });
    });
  }
  fillFieldSelects();

  function openSuggest() {
    if (drawer.classList.contains("open")) { closeDrawer(true); replacePanel("suggest"); } else pushPanel("suggest");
    sgLastFocus = document.activeElement;
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add("on"));
    suggest.classList.add("open");
    suggest.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    setTimeout(() => $("#suggestClose").focus({ preventScroll: true }), 60);
  }
  function closeSuggest(fromHistory) {
    if (!suggest.classList.contains("open")) return;
    if (!fromHistory && history.state && history.state.panel === "suggest") { history.back(); return; }
    suggest.classList.remove("open");
    suggest.setAttribute("aria-hidden", "true");
    scrim.classList.remove("on");
    document.body.classList.remove("locked");
    setTimeout(() => { scrim.hidden = true; }, 300);
    if (sgLastFocus && sgLastFocus.focus) sgLastFocus.focus({ preventScroll: true });
  }
  $("#suggestClose").addEventListener("click", () => closeSuggest());

  // the two cards open like an accordion
  $$(".sg-head", suggest).forEach((head) => head.addEventListener("click", () => {
    const card = head.closest(".sg-card");
    const open = head.getAttribute("aria-expanded") !== "true";
    $$(".sg-card", suggest).forEach((c) => {
      const on = c === card && open;
      $(".sg-head", c).setAttribute("aria-expanded", String(on));
      $(".sg-form", c).hidden = !on;       // opening a card always starts a fresh form
      $(".sg-done", c).hidden = true;
      c.classList.toggle("is-open", on);
    });
    if (open) setTimeout(() => { const first = $(".sg-form input, .sg-form select, .sg-form textarea", card); if (first) first.focus(); }, 50);
  }));

  // resource vs. training school
  const resForm = $("#sgResForm");
  let resType = "resource";
  $$(".sg-type button", resForm).forEach((b) => b.addEventListener("click", () => {
    resType = b.dataset.type;
    $$(".sg-type button", resForm).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    $$(".only-resource", resForm).forEach((x) => (x.hidden = resType !== "resource"));
    $$(".only-school", resForm).forEach((x) => (x.hidden = resType !== "school"));
  }));

  const ENDPOINT = ((window.SITE || {}).suggestEndpoint || "").trim();
  const openIssue = (title, body) =>
    window.open(`${REPO_ISSUE}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`, "_blank", "noopener");
  const pageLang = () => (I18N.languages.find((l) => l.code === LANG) || {}).label || LANG;
  const newId = () => "S-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase();
  const openedAt = {};
  $$(".sg-head", suggest).forEach((hd) => hd.addEventListener("click", () => { openedAt[hd.closest(".sg-card").dataset.sg] = Date.now(); }));

  // Wording depends on where submissions go (Google Sheet, or GitHub as a fallback).
  function applySuggestMode() {
    $("#sgLede").textContent = T(ENDPOINT ? "sg.lede" : "sg.ledeGh");
    $("#sgNote").textContent = T(ENDPOINT ? "sg.note" : "sg.noteGh");
    $$(".sg-submit", suggest).forEach((b) => (b.textContent = T(ENDPOINT ? "sg.submit" : "sg.submitGh")));
    $$('.sg-form [name="contact"]', suggest).forEach((i) => (i.closest("label").hidden = !ENDPOINT));
    $$(".sg-done[data-ref]", suggest).forEach((d) => ($(".sg-done-body", d).textContent = T("sg.sent.body", { id: d.dataset.ref })));
  }

  /* Sends one suggestion.
     With an endpoint: POST to the Apps Script (text/plain avoids a CORS preflight;
     the response is opaque, so a network error is the only failure we can see).
     Without one: open a pre-filled GitHub issue. */
  async function submitSuggestion(form, type, data, ghTitle, ghBody) {
    if (form.elements.website && form.elements.website.value) { showDone(form, newId()); return; } // bot trap
    if (!ENDPOINT) { openIssue(ghTitle, ghBody); return; }
    const id = newId();
    const payload = {
      v: 1, id, type, data,
      contact: (form.elements.contact && form.elements.contact.value.trim()) || "",
      page_lang: LANG, submitted_at: new Date().toISOString(),
      elapsed_ms: Date.now() - (openedAt[form.closest(".sg-card").dataset.sg] || Date.now()),
    };
    const btn = $(".sg-submit", form), err = $(".sg-send-err", form);
    btn.disabled = true; btn.textContent = T("sg.sending"); err.hidden = true;
    try {
      await fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      showDone(form, id);
    } catch (e2) {
      err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = T("sg.submit");
    }
  }
  function showDone(form, id) {
    const card = form.closest(".sg-card");
    form.hidden = true;
    const done = $(".sg-done", card);
    done.dataset.ref = id;
    $(".sg-done-body", done).textContent = T("sg.sent.body", { id });
    done.hidden = false;
    form.reset();
    if (form === resForm) $('.sg-type [data-type="resource"]', form).click();
  }
  $$(".sg-again", suggest).forEach((b) => b.addEventListener("click", () => {
    const card = b.closest(".sg-card");
    $(".sg-done", card).hidden = true;
    $(".sg-form", card).hidden = false;
    openedAt[card.dataset.sg] = Date.now();
  }));

  $("#sgChangeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const details = (fd.get("details") || "").trim();
    $(".sg-err", e.target).hidden = details.length >= 3;
    if (details.length < 3) return;
    const data = { kind: fd.get("kind"), part: fd.get("field") || "The whole page", details };
    submitSuggestion(e.target, "change", data,
      `[Page] ${data.kind}${fd.get("field") ? " — " + fd.get("field") : ""}`,
      `### Suggested change\n\n**Kind:** ${data.kind}\n**Part of the page:** ${data.part}\n**Page language:** ${pageLang()}\n\n${details}\n`);
  });

  resForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(resForm);
    const name = (fd.get("name") || "").trim(), link = (fd.get("link") || "").trim();
    const ok = name && /^https?:\/\/\S+\.\S+/.test(link);
    $(".sg-err", resForm).hidden = !!ok;
    if (!ok) return;
    const school = resType === "school";
    const data = {
      name, link, field: fd.get("field"), level: fd.get("level"), cost: fd.get("cost"),
      notes: (fd.get("notes") || "").trim(), owner: !!fd.get("owner"),
      ...(school ? { location: (fd.get("location") || "").trim(), language: fd.get("language") } : { category: fd.get("category") }),
    };
    const rows = [
      ["Name", name], ["Link", link], ["Field", data.field], ["Level", data.level],
      school ? ["Location", data.location || "—"] : ["Type", data.category],
      school ? ["Teaching language", data.language] : null,
      ["Cost", data.cost], ["Submitted by the owner", data.owner ? "Yes" : "No"],
    ].filter(Boolean);
    const table = "| | |\n|---|---|\n" + rows.map(([k, v]) => `| **${k}** | ${String(v).replace(/\|/g, "\\|")} |`).join("\n");
    submitSuggestion(resForm, school ? "school" : "resource", data,
      `[${school ? "Training school" : "Resource"}] ${name}`,
      `### New ${school ? "training school" : "learning resource"}\n\n${table}\n\n${data.notes ? "**Why it’s good:**\n" + data.notes + "\n" : ""}`);
  });

  /* ---------------- Language toggle ---------------- */
  function applyStatic() {
    document.documentElement.lang = LANG;
    // Only replace text when a translation exists, so the English written in index.html stays
    // on screen (instead of raw keys like "hero.title") if i18n.js is missing or broken.
    const has = (k) => T(k) !== k;
    if (has("meta.title")) document.title = T("meta.title");
    $$("[data-i18n]").forEach((el) => { if (has(el.dataset.i18n)) el.textContent = T(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach((el) => { if (has(el.dataset.i18nHtml)) el.innerHTML = T(el.dataset.i18nHtml); });
    $$("[data-i18n-aria]").forEach((el) => { if (has(el.dataset.i18nAria)) el.setAttribute("aria-label", T(el.dataset.i18nAria)); });
    $$("[data-i18n-ph]").forEach((el) => { if (has(el.dataset.i18nPh)) el.setAttribute("placeholder", T(el.dataset.i18nPh)); });
    applySuggestMode();
    renderQuote();
    // the button shows the language you'd switch TO
    const next = I18N.languages.find((l) => l.code !== LANG) || I18N.languages[0];
    $("#langLabel").textContent = next.short || next.label;
    $("#langToggle").setAttribute("lang", next.code);
  }
  /* ---------------- Quote of the day ---------------- */
  const QUOTES = window.QUOTES || [];
  const today = new Date();
  let qIndex = QUOTES.length ? Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 864e5) % QUOTES.length : -1;
  function renderQuote() {
    const box = $("#qotd");
    if (!box) return;
    if (qIndex < 0) { box.hidden = true; return; }
    const q = QUOTES[qIndex];
    $("#qotdText").textContent = (LANG !== "en" && q[LANG]) || q.en;
    $("#qotdBy").textContent = q.by;
    $("#qotdRole").textContent = q.role || "";
    $("#qotdText").setAttribute("lang", LANG !== "en" && q[LANG] ? LANG : "en");
  }
  $("#qotdNext").addEventListener("click", () => {
    qIndex = (qIndex + 1) % QUOTES.length;
    const t = $("#qotdText");
    t.classList.remove("swap"); void t.offsetWidth; t.classList.add("swap");
    renderQuote();
  });

  function setLang(code) {
    LANG = code;
    try { localStorage.setItem("drm-lang", code); } catch (e) {}
    applyStatic();
    renderSections();
    if (activeId) { renderTree(REG_BY_ID[activeId]); drawWire(false); }
    if (drawer.classList.contains("open")) openDrawer(dState.region, dState.level, dState.field);
  }
  $("#langToggle").addEventListener("click", () => {
    const codes = I18N.languages.map((l) => l.code);
    setLang(codes[(codes.indexOf(LANG) + 1) % codes.length]);
  });
  applyStatic();

  /* ---------------- Phone layout helpers ---------------- */
  // quote of the day: next to the title on desktop, below the map on phones
  const qotd = $("#qotd"), heroSec = $(".hero"), qSlot = $("#qotdSlot");
  function placeQuote() {
    if (!qotd || !qSlot) return;
    if (isPhone()) { if (qotd.parentNode !== qSlot) qSlot.appendChild(qotd); }
    else if (qotd.parentNode !== heroSec) heroSec.appendChild(qotd);
  }
  placeQuote();
  PHONE.addEventListener ? PHONE.addEventListener("change", placeQuote) : PHONE.addListener(placeQuote);

  // sticky mini bar while reading a tree on a phone: field name + previous / next + back to map
  const mini = $("#minibar"), topbar = $(".topbar");
  function updateMini() {
    if (!mini) return;
    document.documentElement.style.setProperty("--tb", topbar.offsetHeight + "px");
    let show = false;
    if (isPhone() && activeId && !tree.hidden) {
      const r = tree.getBoundingClientRect();
      show = r.top < topbar.offsetHeight - 10 && r.bottom > topbar.offsetHeight + 120;
    }
    if (show) {
      const Rg = REG_BY_ID[activeId];
      $("#mbName").textContent = regionName(Rg);
      mini.style.setProperty("--c", Rg.idx.length === 1 ? cssColor(FIELDS[Rg.idx[0]].color) : "var(--ink)");
    }
    mini.classList.toggle("show", show);
    mini.setAttribute("aria-hidden", String(!show));
  }
  let mbRaf = 0;
  window.addEventListener("scroll", () => { cancelAnimationFrame(mbRaf); mbRaf = requestAnimationFrame(updateMini); }, { passive: true });
  window.addEventListener("resize", updateMini);
  if (mini) mini.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mini]"); if (!b) return;
    if (b.dataset.mini === "map") { stage.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); return; }
    const cur = REG_BY_ID[activeId] ? REG_BY_ID[activeId].idx[0] : 0;
    const k = (cur + (b.dataset.mini === "next" ? 1 : N - 1)) % N;
    activate(FIELDS[k].id, { user: true });
  });

  /* ---------------- Theme toggle ---------------- */
  $("#themeToggle").addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("drm-theme", root.dataset.theme); } catch (err) {}
  });

  /* ---------------- Deep links ----------------
     #learn/<id>/<level>, #explore/<id>   (<id> = field id, or ids joined by "+")
     Old links still work: #data-analysis, #data-analysis-beginner, #data-science-ai-ml …  */
  const ALIAS = { "data-science-ai-ml": "data-science", "business-intelligence": "data-analysis" };
  function setHash(h) {  // keeps history.state (panels use it for the back button)
    try { history.replaceState(history.state, "", h ? `#${h}` : location.pathname + location.search); } catch (e) {}
  }
  function routeFromHash() {
    let h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    Object.keys(ALIAS).forEach((k) => { h = h.replace(k, ALIAS[k]); });
    let pick;   // a track named in the link (e.g. #learn/ai-models)
    h = h.replace(/[\w-]+/g, (x) => { if (TRACKS[x]) { pick = x; trackSel[TRACKS[x].id] = x; return TRACKS[x].id; } return x; });
    const openDrawer_ = openDrawer;
    const openDrawer2 = (id, lvl) => openDrawer_(id, lvl, pick);
    let m;
    if ((m = h.match(/^learn\/([\w+-]+?)(?:\/(beginner|intermediate))?$/))) { activate(m[1]); openDrawer2(m[1], m[2]); return; }
    if ((m = h.match(/^explore\/([\w+-]+)$/)) && REG_BY_ID[m[1]]) { activate(m[1]); stage.scrollIntoView({ block: "start" }); return; }
    if ((m = h.match(/^([\w-]+?)-(beginner|intermediate)$/)) && BY_ID[m[1]]) { activate(m[1]); openDrawer2(m[1], m[2]); return; }
    if (BY_ID[h]) { activate(h); stage.scrollIntoView({ block: "start" }); }
  }
  routeFromHash();
  window.addEventListener("hashchange", () => { if (!skipHash) routeFromHash(); });

  // exposed for debugging in the console
  window.__venn = { layout: L, regions: REG, foundation: FOUNDATION };
})();