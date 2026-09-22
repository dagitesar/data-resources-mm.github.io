/*
 * Site settings
 * -------------
 * suggestEndpoint: the Google Apps Script web-app URL that stores Suggest-panel
 *   submissions in a Google Sheet (see SUGGESTIONS.md). Leave it empty
 *   and the forms fall back to opening a pre-filled GitHub issue instead.
 */
window.SITE = {
  repo: "data-resources-mm/data-resources-mm.github.io",
  suggestEndpoint: "https://script.google.com/macros/s/AKfycbwtQArJ5oaq7mAZieZFIxPJD1bwk3i-OIWbjgNEg1R6kTSOD_b3cSt4YJ-3TLsjhZmDgQ/exec",
};