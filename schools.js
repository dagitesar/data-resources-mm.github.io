/*
 * Training schools — shown in the "Learn" panel of every field they teach.
 *
 * Plain JSON after "window.SCHOOLS =" (double quotes, no trailing commas) so the
 * suggestion bot can add schools that people submit through the Suggest panel.
 * Each school:
 *   { "name": "…", "link": "https://…", "fields": ["data-analysis", …],
 *     "location": "Yangon", "language": "Myanmar", "cost": "Paid", "levels": "Beginner" }
 */
window.SCHOOLS = [];