"use strict";
(() => {
  const store = window.OperacionStorage;
  let data = store.getStorageData();
  const lines = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "12", "A", "B"];
  const ranges = { laborable: [5, 24], sabado: [6, 24], festivo: [7, 24] };
  const label = (line) => `Línea ${line}`;
  const safe = (value) => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  function paintGrid(day) {
    const [start, end] = ranges[day];
    const host = document.getElementById(`grid-${day}`);
    const hours = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    host.innerHTML = `<p class="small text-secondary">Configura la duración de vuelta por línea y los trenes programados por hora. Los cambios se guardan en este navegador.</p><div class="table-responsive"><table class="table table-sm table-bordered align-middle polygon-table"><thead><tr><th>Línea</th><th>Dur. vta. (min)</th>${hours.map(h => `<th>${String(h).padStart(2, "0")}:00</th>`).join("")}</tr></thead><tbody>${lines.map(line => `<tr><th scope="row">${label(line)}</th><td><input class="form-control form-control-sm polygon-input duration-input" type="number" min="1" step="1" inputmode="numeric" aria-label="Duración de vuelta de ${label(line)} en minutos" data-duration-day="${day}" data-line="${line}" value="${safe(data.durations[day][line] ?? "")}"></td>${hours.map(h => `<td><input class="form-control form-control-sm polygon-input" type="number" min="0" step="1" inputmode="numeric" aria-label="${label(line)}, ${String(h).padStart(2, "0")}:00" data-day="${day}" data-line="${line}" data-hour="${h}" value="${safe(data.polygons[day][`${line}:${h}`] ?? "")}"></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    host.querySelectorAll("[data-duration-day]").forEach(input => input.addEventListener("input", () => {
      const line = input.dataset.line;
      if (input.value === "") delete data.durations[day][line];
      else data.durations[day][line] = Math.max(1, Number(input.value) || 1);
      store.saveStorageData(data);
    }));
    host.querySelectorAll("[data-hour]").forEach(input => input.addEventListener("input", () => {
      const value = input.value;
      if (value === "") delete data.polygons[day][`${input.dataset.line}:${input.dataset.hour}`];
      else data.polygons[day][`${input.dataset.line}:${input.dataset.hour}`] = Math.max(0, Number(value) || 0);
      store.saveStorageData(data);
    }));
  }
  function paintHolidays() {
    const body = document.getElementById("holidayList");
    body.innerHTML = data.holidays.slice().sort((a,b) => a.date.localeCompare(b.date)).map(item => `<tr><td>${safe(item.date)}</td><td>${safe(item.name || "Festivo")}</td><td><button class="btn btn-sm btn-outline-danger" type="button" data-remove="${safe(item.date)}" aria-label="Eliminar ${safe(item.date)}">Eliminar</button></td></tr>`).join("") || '<tr><td colspan="3" class="text-secondary">No hay fechas especiales guardadas.</td></tr>';
  }
  document.querySelectorAll("[data-day]").forEach(button => button.addEventListener("shown.bs.tab", () => paintGrid(button.dataset.day)));
  Object.keys(ranges).forEach(paintGrid);
  paintHolidays();
  document.getElementById("holidayForm").addEventListener("submit", event => {
    event.preventDefault();
    const date = document.getElementById("holidayDate").value;
    const name = document.getElementById("holidayName").value.trim();
    if (!date) return;
    data.holidays = data.holidays.filter(item => item.date !== date);
    data.holidays.push({ date, name });
    store.saveStorageData(data); paintHolidays(); event.target.reset();
  });
  document.getElementById("holidayList").addEventListener("click", event => {
    const button = event.target.closest("[data-remove]"); if (!button) return;
    data.holidays = data.holidays.filter(item => item.date !== button.dataset.remove);
    store.saveStorageData(data); paintHolidays();
  });
})();
