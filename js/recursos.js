"use strict";
const serviceChoices = Array.from(document.querySelectorAll("[data-service-line]"));
const servicePanels = Array.from(document.querySelectorAll("[data-service-panel]"));
function selectServiceLine(line) {
  if (!servicePanels.some(panel => panel.dataset.servicePanel === line)) return;
  serviceChoices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.serviceLine === line)));
  servicePanels.forEach(panel => { panel.hidden = panel.dataset.servicePanel !== line; });
}
if (serviceChoices.length) {
  document.querySelector(".service-line-picker").hidden = false;
  serviceChoices.forEach(button => button.addEventListener("click", () => selectServiceLine(button.dataset.serviceLine)));
  const requestedLine = location.hash.match(/^#servicio-linea([1-9AB])$/)?.[1];
  selectServiceLine(requestedLine || "1");
  window.addEventListener("hashchange", () => {
    const line = location.hash.match(/^#servicio-linea([1-9AB])$/)?.[1];
    if (line) selectServiceLine(line);
  });
}
