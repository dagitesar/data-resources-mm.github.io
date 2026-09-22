/**
 * Data Resources MM — suggestion inbox (Google Apps Script)
 * ==========================================================
 * Receives Suggest-panel submissions from the static site and stores them as
 * rows in a Google Sheet. The scheduled Kaggle notebook reads the rows marked
 * "new" and writes back what it did.
 *
 *   Site  ──POST {type, data, …}──▶  doPost  ──▶  Sheet row (status = new)
 *   Kaggle ──GET ?key=…&status=new──▶ doGet  ──▶  JSON list of rows
 *   Kaggle ──POST {action:"update", key, updates:[…]}──▶ doPost ──▶ status/result columns
 *
 * Setup: see SUGGESTIONS.md in the repo root (run setup() once, then deploy as a web app).
 */

const SHEET_NAME = "Requests";
const HEADERS = [
  "id", "received_at", "type", "status",
  "name", "link", "field", "level", "category", "location", "language", "cost", "owner",
  "kind", "part", "details", "notes",
  "contact", "page_lang", "elapsed_ms",
  "processed_at", "result", "result_url", "bot_note",
];
const TYPES = ["change", "resource", "school"];
const STATUSES = ["new", "processing", "pr_opened", "issue_opened", "duplicate", "rejected", "needs_human", "done"];
const MAX_LEN = { details: 3000, notes: 1500, default: 300 };
const MAX_PER_MINUTE = 20; // simple global flood guard

/* ---------- run once from the editor ---------- */
function setup() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sh.setFrozenRows(1);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("API_KEY")) {
    props.setProperty("API_KEY", Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, ""));
  }
  Logger.log("API_KEY (save it as a Kaggle secret named SUGGEST_API_KEY): " + props.getProperty("API_KEY"));
}

/* ---------- web app entry points ---------- */
function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return json_({ ok: false, error: "bad_json" });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (body.action) return api_(body);
    return intake_(body);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!auth_(p.key)) return json_({ ok: false, error: "unauthorized" });
  const status = p.status || "new";
  const limit = Math.min(parseInt(p.limit || "50", 10) || 50, 200);
  const rows = readRows_().filter((r) => status === "all" || r.status === status).slice(0, limit);
  return json_({ ok: true, count: rows.length, rows: rows });
}

/* ---------- public intake from the site ---------- */
function intake_(b) {
  if (!TYPES.includes(b.type)) return json_({ ok: false, error: "bad_type" });
  if (!rateOk_()) return json_({ ok: false, error: "busy" });
  const d = b.data || {};
  const id = clip_(b.id || ("S-" + Date.now()), 40);
  const sh = sheet_();
  // ignore double submits of the same id
  const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().flat();
  if (ids.includes(id)) return json_({ ok: true, id: id, duplicate: true });

  if (b.type !== "change") {
    const link = String(d.link || "");
    if (!/^https?:\/\/\S+\.\S+/.test(link) || !String(d.name || "").trim()) return json_({ ok: false, error: "bad_fields" });
  } else if (String(d.details || "").trim().length < 3) {
    return json_({ ok: false, error: "bad_fields" });
  }

  const row = {
    id: id, received_at: new Date().toISOString(), type: b.type, status: "new",
    name: d.name, link: d.link, field: d.field, level: d.level, category: d.category,
    location: d.location, language: d.language, cost: d.cost, owner: d.owner ? "yes" : "",
    kind: d.kind, part: d.part, details: d.details, notes: d.notes,
    contact: b.contact, page_lang: b.page_lang, elapsed_ms: Number(b.elapsed_ms) || "",
  };
  sh.appendRow(HEADERS.map((h) => safe_(row[h], h)));
  return json_({ ok: true, id: id });
}

/* ---------- private API for the Kaggle notebook ---------- */
function api_(b) {
  if (!auth_(b.key)) return json_({ ok: false, error: "unauthorized" });
  if (b.action !== "update") return json_({ ok: false, error: "bad_action" });
  const sh = sheet_();
  const data = sh.getDataRange().getValues();
  const col = (name) => HEADERS.indexOf(name) + 1;
  let n = 0;
  (b.updates || []).forEach((u) => {
    if (u.status && !STATUSES.includes(u.status)) return;
    for (let r = 1; r < data.length; r++) {
      if (data[r][0] !== u.id) continue;
      if (u.status) sh.getRange(r + 1, col("status")).setValue(u.status);
      sh.getRange(r + 1, col("processed_at")).setValue(new Date().toISOString());
      if (u.result != null) sh.getRange(r + 1, col("result")).setValue(safe_(u.result));
      if (u.result_url != null) sh.getRange(r + 1, col("result_url")).setValue(safe_(u.result_url));
      if (u.bot_note != null) sh.getRange(r + 1, col("bot_note")).setValue(safe_(u.bot_note, "details"));
      n++;
      break;
    }
  });
  return json_({ ok: true, updated: n });
}

/* ---------- helpers ---------- */
function sheet_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sh) throw new Error("Run setup() first");
  return sh;
}
function readRows_() {
  const values = sheet_().getDataRange().getValues();
  const head = values.shift();
  return values.map((v) => Object.fromEntries(head.map((h, i) => [h, v[i]])));
}
function auth_(key) {
  const real = PropertiesService.getScriptProperties().getProperty("API_KEY");
  return !!real && key === real;
}
function rateOk_() {
  const cache = CacheService.getScriptCache();
  const k = "rate_" + Math.floor(Date.now() / 60000);
  const n = Number(cache.get(k) || 0) + 1;
  cache.put(k, String(n), 120);
  return n <= MAX_PER_MINUTE;
}
function clip_(v, n) {
  return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, n);
}
// Plain text only: a value starting with = + - @ would otherwise run as a Sheets formula.
function safe_(v, field) {
  if (typeof v === "number") return v;
  const s = clip_(v, MAX_LEN[field] || MAX_LEN.default);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}