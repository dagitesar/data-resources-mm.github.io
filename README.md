# Data Resources MM

An interactive map of data careers for aspiring data professionals in Myanmar —
**Business Analysis, Data Analysis & BI, Data Engineering, Data Science, Machine Learning
and AI Engineering** (Models / Deployment) — with hand-picked learning resources for each.

Live site: https://data-resources-mm.github.io

## What's on the page

- **A map of the fields.** Circle sizes and overlaps come from the tools each field uses.
  Click a field or an overlap to open its tree: overview, what you'll do, tools, skills and job titles.
- **Learn panel.** Courses, documentation, YouTube channels, practice sites, books and training schools,
  by level (beginner / intermediate).
- **For business owners.** What each role brings to a business, and when to hire.
- **Suggest.** Visitors can suggest a page change, a new resource or their training school — no account needed.
- English and Myanmar, light and dark mode, and a phone layout.

It's a plain static site: no build step, no framework. GitHub Pages serves the files as they are.

## Files

```
index.html          page structure
style.css           all styles (desktop + phone)
app.js              diagram, trees, panels, language switch
config.js           settings — paste the suggestion inbox URL here
data.js             fields: tools, overview, tasks, skills, job titles, business value
resources.js        learning resources per field and level (plain JSON)
schools.js          training schools (plain JSON)
quotes.js           quote of the day
i18n.js             Myanmar translations and interface text
SUGGESTIONS.md      how suggestions flow (Google Sheet → Kaggle bot → pull request) and setup steps
apps-script/
  Code.gs           Google Apps Script that stores suggestions in a Google Sheet
automation/
  process_suggestions.ipynb   scheduled Kaggle notebook that reviews suggestions and opens PRs
  process_suggestions.py      same code as a plain script
```

## Common edits

| To… | Edit |
|---|---|
| Add a learning resource | `resources.js` — add `["Name", "https://…"]` under the field, level and category |
| Add a training school | `schools.js` |
| Change a field's tools (this redraws the diagram) | `data.js` → `tools` |
| Change a field's texts | `data.js` (English) and `i18n.js` (Myanmar) |
| Add a quote | `quotes.js` |

`resources.js` and `schools.js` must stay valid JSON after the `=` (double quotes, no trailing commas),
because the suggestion bot edits them automatically.

To preview locally, open `index.html` in a browser.

## Contributing

Use the **Suggest** button on the site, or open an Issue / Pull Request here.
Every suggestion is reviewed before it goes live.

## License

This project is an educational resource collection. Individual resources belong to their
respective authors and organizations.