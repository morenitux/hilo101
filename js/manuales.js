"use strict";
const manualInput = document.getElementById("buscarManual");
const manualClear = document.getElementById("borrarManual");
const manualSections = Array.from(document.querySelectorAll("[data-manual-section]"), section => ({
  section,
  rows: Array.from(section.querySelectorAll("[data-manual]"), row => ({
    row,
    text: Array.from(row.cells, cell => cell.textContent).join(" ")
  }))
}));
const manualExtras = Array.from(document.querySelectorAll("[data-manual-extra]"), row => ({row, text: row.textContent}));
const manualTotal = manualSections.reduce((sum, group) => sum + group.rows.length, 0);

function filterManuals() {
  const groups = manualInput.value.split(",").map(query => SiteSearch.terms(query)).filter(terms => terms.length);
  const terms = [...new Set(groups.flat())];
  let total = 0;
  manualSections.forEach(({ section, rows }) => {
    let count = 0;
    rows.forEach(({ row, text }) => {
      row.hidden = groups.length > 0 && !groups.some(group => SiteSearch.matches(text, group));
      SiteSearch.highlight(row, terms);
      if (!row.hidden) count++;
    });
    section.hidden = count === 0;
    total += count;
  });
  let extraCount = 0;
  manualExtras.forEach(({row, text}) => {
    row.hidden = groups.length > 0 && !groups.some(group => SiteSearch.matches(text, group));
    SiteSearch.highlight(row, terms);
    if (!row.hidden) extraCount++;
  });
  document.querySelector("[data-manual-extra-section]").hidden = extraCount === 0;
  manualClear.hidden = !manualInput.value;
  document.getElementById("sinManuales").hidden = total + extraCount !== 0;
  document.getElementById("estadoManuales").textContent = terms.length
    ? total + " de " + manualTotal + " manuales"
    : manualTotal + " manuales";
  document.getElementById("estadoManuales").textContent += " · " + extraCount + " documentos adicionales";
}
manualInput.addEventListener("input", filterManuals);
manualClear.addEventListener("click", () => {
  manualInput.value = "";
  filterManuals();
  manualInput.focus();
});
filterManuals();
