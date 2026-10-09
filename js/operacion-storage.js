"use strict";

// Capa de persistencia aislada para facilitar su sustitución futura por una API.
window.OperacionStorage = (() => {
  const KEY = "apoyoJR.operacion.v1";
  const empty = () => ({ captures: {}, polygons: { laborable: {}, sabado: {}, festivo: {} }, durations: { laborable: {}, sabado: {}, festivo: {} }, holidays: [] });
  function getStorageData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!parsed || typeof parsed !== "object") return empty();
      return { ...empty(), ...parsed, polygons: { ...empty().polygons, ...(parsed.polygons || {}) }, durations: { ...empty().durations, ...(parsed.durations || {}) }, captures: parsed.captures || {}, holidays: Array.isArray(parsed.holidays) ? parsed.holidays : [] };
    } catch { return empty(); }
  }
  function saveStorageData(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (error) { console.error("No se pudo guardar la configuración local", error); return false; }
  }
  return { getStorageData, saveStorageData };
})();
