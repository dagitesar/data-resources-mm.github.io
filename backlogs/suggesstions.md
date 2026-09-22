# How suggestions work

The site is static (GitHub Pages), so visitor suggestions travel like this:

```
Visitor ── Suggest panel form ──▶ Google Apps Script ──▶ Google Sheet  (status: new)
                                                            │
             scheduled Kaggle notebook (local AI) ◀─────────┘ reads "new" rows
                    │
                    ├─ resource / training school, looks good ─▶ 1 pull request per run (1 commit each)
                    ├─ page-change request or unsure ──────────▶ GitHub issue for a maintainer
                    ├─ duplicate / dead link / spam ────────────▶ closed in the Sheet with a note
                    └─ writes the outcome back to the Sheet (status, PR/issue link, note)

Maintainer reviews and merges the pull request ─▶ GitHub Pages updates the site
```

Nothing reaches the site without a person merging it. The AI only *sorts and labels*;
the file edits are made by plain code, which only adds a name, a link and a few fixed
fields, so a malicious submission can't inject content or code into the page.
Contact details stay in the private Sheet and are never put in issues or pull requests.

| Folder / file | What it is |
|---|---|
| `config.js` | `suggestEndpoint` — paste the Apps Script web-app URL here |
| `apps-script/Code.gs` | the inbox: stores submissions in the Sheet, private API for the bot |
| `automation/process_suggestions.ipynb` | the Kaggle notebook (same code as `.py`) |
| `resources.js`, `schools.js` | the lists the bot edits (plain JSON inside) |

---

## 1. Google Sheet + Apps Script (one time, ~10 minutes)

1. Create a new Google Sheet (e.g. *Data Resources MM — Suggestions*). Keep it private.
2. **Extensions → Apps Script**. Delete the sample code, paste all of `apps-script/Code.gs`, save.
3. In the function menu pick **`setup`** → **Run** → allow the permissions.
   A **Requests** tab appears, and **View → Logs** shows an `API_KEY`. Copy it — this is the bot's password.
4. **Deploy → New deployment → Web app**
   - *Execute as:* **Me**
   - *Who has access:* **Anyone** (visitors must be able to post without signing in)
   → **Deploy**, then copy the **Web app URL** (ends in `/exec`).
5. In the repo, open `config.js` and paste that URL into `suggestEndpoint`. Commit.
   Until this is set, the Suggest forms fall back to opening a pre-filled GitHub issue.

> Changed `Code.gs` later? Use **Deploy → Manage deployments → Edit → New version**
> so the URL stays the same.

**Spam protection built in:** a hidden “honeypot” field bots fill in, required-field checks,
length limits, a cap of 20 submissions a minute, and formula-safe cells. The form also records
how long the visitor took to fill it in, and the bot treats very fast submissions with suspicion.

## 2. GitHub token (one time)

Create a **fine-grained personal access token** (GitHub → Settings → Developer settings):

- *Repository access:* only `data-resources-mm/data-resources-mm.github.io`
- *Permissions:* **Contents: Read and write**, **Pull requests: Read and write**, **Issues: Read and write**

Optional: create the labels `suggestion`, `bot`, `page-change`, `needs-review` in the repo.

## 3. Kaggle notebook (one time)

1. On Kaggle: **Create → New Notebook → File → Import Notebook** → upload
   `automation/process_suggestions.ipynb`.
2. **Settings:** Internet **On**; Accelerator **GPU T4 x2** (or P100).
3. **Add-ons → Secrets** — add three secrets and tick them for this notebook:
   - `SUGGEST_ENDPOINT` — the Web app URL from step 1
   - `SUGGEST_API_KEY` — the `API_KEY` from step 1
   - `GITHUB_TOKEN` — the token from step 2
4. First run with `DRY_RUN = True` (top settings cell): it prints what it would do and changes nothing.
   Then set `DRY_RUN = False`, **Save Version → Save & Run All**.
5. **Schedule it:** open the notebook's **Settings → Schedule** and pick daily or weekly.

**Model:** `MODEL` defaults to `Qwen/Qwen2.5-3B-Instruct`, downloaded from Hugging Face.
You can instead attach a model with **Add Input → Models** and put its folder path in `MODEL`.
If no GPU or model is available, the notebook still runs: every suggestion becomes an issue
marked *needs review* instead of being judged by the AI.

## Sheet status values

| status | meaning |
|---|---|
| `new` | waiting for the next bot run |
| `pr_opened` | added to that run's pull request (`result_url`) |
| `issue_opened` | page-change request turned into an issue (`result_url`) |
| `needs_human` | the AI wasn't sure → issue opened for a maintainer |
| `duplicate` | link is already on the site |
| `rejected` | spam, off-topic or dead link (`bot_note` says why) |

To re-process a row, set its status back to `new`.