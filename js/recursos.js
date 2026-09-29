"use strict";
const serviceChoices = Array.from(document.querySelectorAll("[data-service-line]"));
const servicePanels = Array.from(document.querySelectorAll("[data-service-panel]"));
function selectServiceLine(line) {
  if (!servicePanels.some(panel => panel.dataset.servicePanel === line)) return;
  serviceChoices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.serviceLine === line)));
  servicePanels.forEach(panel => { panel.hidden = panel.dataset.servicePanel !== line; });
}
if (serviceChoices.length) {
  document.querySelector("#servicios-provisionales .service-line-picker").hidden = false;
  serviceChoices.forEach(button => button.addEventListener("click", () => selectServiceLine(button.dataset.serviceLine)));
  const requestedLine = location.hash.match(/^#servicio-linea([1-9AB])$/)?.[1];
  selectServiceLine(requestedLine || "1");
  window.addEventListener("hashchange", () => {
    const line = location.hash.match(/^#servicio-linea([1-9AB])$/)?.[1];
    if (line) selectServiceLine(line);
  });
}

// Distribución de energía tiene su propio selector, independiente de los servicios.
const energyChoices = Array.from(document.querySelectorAll("[data-energy-line]"));
const energyPanels = Array.from(document.querySelectorAll("[data-energy-panel]"));
function selectEnergyLine(line) {
  if (!energyPanels.some(panel => panel.dataset.energyPanel === line)) return;
  energyChoices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.energyLine === line)));
  energyPanels.forEach(panel => { panel.hidden = panel.dataset.energyPanel !== line; });
}
if (energyChoices.length) {
  document.querySelector(".energy-line-picker").hidden = false;
  energyChoices.forEach(button => button.addEventListener("click", () => selectEnergyLine(button.dataset.energyLine)));
  selectEnergyLine(location.hash.match(/^#energia-linea([1-9AB])$/)?.[1] || "1");
  window.addEventListener("hashchange", () => {
    const line = location.hash.match(/^#energia-linea([1-9AB])$/)?.[1];
    if (line) selectEnergyLine(line);
  });
}

// Terminales: navegación preparada mientras se incorporan los documentos.
const terminalChoices = Array.from(document.querySelectorAll("[data-terminal-line]"));
const terminalPanels = Array.from(document.querySelectorAll("[data-terminal-panel]"));
function selectTerminalLine(line) {
  if (!terminalPanels.some(panel => panel.dataset.terminalPanel === line)) return;
  terminalChoices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.terminalLine === line)));
  terminalPanels.forEach(panel => { panel.hidden = panel.dataset.terminalPanel !== line; });
}
if (terminalChoices.length) {
  document.querySelector(".terminal-line-picker").hidden = false;
  terminalChoices.forEach(button => button.addEventListener("click", () => selectTerminalLine(button.dataset.terminalLine)));
  selectTerminalLine(location.hash.match(/^#terminal-linea(12|[1-9AB])$/)?.[1] || "1");
  window.addEventListener("hashchange", () => {
    const line = location.hash.match(/^#terminal-linea(12|[1-9AB])$/)?.[1];
    if (line) selectTerminalLine(line);
  });
}

