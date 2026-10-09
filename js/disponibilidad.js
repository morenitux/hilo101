"use strict";
(() => {
  const store = window.OperacionStorage;
  let data = store.getStorageData();
  const lines = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "12", "A", "B"];
  const colors = { "1": "#e2231a", "2": "#00529b", "3": "#b31b34", "4": "#6b2d91", "5": "#f3c300", "6": "#da291c", "7": "#f58220", "8": "#00843d", "9": "#8a1538", "12": "#b6a278", A: "#9b0044", B: "#b5bd00" };
  const ranges = { laborable: 5, sabado: 6, festivo: 7 };
  const hours = Array.from({ length: 20 }, (_, index) => index + 5);
  const dateInput = document.getElementById("fechaCaptura");
  const pad = n => String(n).padStart(2, "0");
  const durationFor = (type, line) => data.durations[type]?.[line] ?? "";
  function intervalFor(duration, circulating) {
    const minutes = Number(duration);
    const trains = Number(circulating);
    if (!minutes || !trains) return "";
    const seconds = Math.round((minutes * 60 / trains) / 5) * 5;
    return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  }
  const today = new Date();
  dateInput.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  let selectedHour = hours[0];
  const keyFor = (date, hour) => `${date}|${pad(hour)}:00`;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  function dayType(date) {
    if (data.holidays.some(item => item.date === date)) return "festivo";
    const [year, month, day] = date.split("-").map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    return weekday === 0 ? "festivo" : weekday === 6 ? "sabado" : "laborable";
  }
  function programsFor(type, hour, line) { return data.polygons[type]?.[`${line}:${hour}`] ?? ""; }
  function captured() { return data.captures[keyFor(dateInput.value, selectedHour)] || {}; }
  function render() {
    data = store.getStorageData();
    const type = dayType(dateInput.value);
    const start = ranges[type];
    if (selectedHour < start) selectedHour = start;
    document.getElementById("tipoDia").textContent = { laborable: "Laborable", sabado: "Sábado", festivo: "Domingo / Festivo" }[type];
    document.getElementById("resumenDia").textContent = selectedHour < start ? `La captura comienza a las ${pad(start)}:00 para este tipo de día.` : `Configuración de trenes programados: ${type === "festivo" ? "Domingo / Festivo" : type === "sabado" ? "Sábado" : "Laborable"}.`;
    const hourButton = hour => {
      const active = hour === selectedHour;
      const available = hour >= start;
      const hasCapture = Boolean(data.captures[keyFor(dateInput.value, hour)]);
      const cls = active ? "btn-success" : hasCapture ? "btn-danger" : "btn-light border";
      return `<button type="button" class="btn btn-sm ${cls} hour-pill" data-hour="${hour}" aria-label="${pad(hour)}:00${hasCapture ? ", datos capturados" : ""}" aria-pressed="${active}" ${available ? "" : "disabled"}><span class="hour-label">${pad(hour)}:00</span>${hasCapture ? '<span class="hour-saved-check" aria-hidden="true">✓</span>' : ""}</button>`;
    };
    document.getElementById("horas").innerHTML = `<div class="hour-pills-row hour-pills-first">${hours.filter(hour => hour <= 14).map(hourButton).join("")}</div><div class="hour-pills-row hour-pills-second">${hours.filter(hour => hour >= 15).map(hourButton).join("")}</div>`;
    const capture = captured();
    document.getElementById("disponibilidadBody").innerHTML = lines.map(line => {
      const row = capture[line] || {};
      const input = (field, value = "", type = "number", attrs = "") => `<input class="form-control form-control-sm op-input" type="${type}" ${type === "number" ? 'min="0" step="1" inputmode="numeric"' : ""} data-line="${line}" data-field="${field}" value="${esc(value)}" aria-label="Línea ${line}: ${field}" ${attrs}>`;
      const programmed = programsFor(type, selectedHour, line);
      const retired = ["material", "personal", "lluviaFuera", "perdida"].reduce((sum, key) => sum + (Number(row[key]) || 0), 0);
      const circulating = programmed === "" ? "" : Math.max(0, Number(programmed) + (Number(row.supernumerarios) || 0) - retired);
      const duration = durationFor(type, line);
      return `<tr><th scope="row"><span class="line-dot" style="--line-color:${colors[line]}">Línea ${line}</span></th><td><span class="fixed-value" aria-label="Duración de vuelta Línea ${line}">${esc(duration)}</span></td><td><input class="form-control form-control-sm programmed-input" value="${esc(programmed)}" readonly aria-label="Trenes programados Línea ${line}"></td><td>${input("material", row.material)}</td><td>${input("encargado", String(row.encargado || "").toLocaleUpperCase("es-MX"), "text")}</td><td>${input("personal", row.personal)}</td><td>${input("lluviaFuera", row.lluviaFuera)}</td><td>${input("perdida", row.perdida)}</td><td>${input("supernumerarios", row.supernumerarios)}</td><td><input class="form-control form-control-sm circulating-input" value="${esc(circulating)}" readonly aria-label="Trenes circulando Línea ${line}"></td><td><span class="fixed-value interval-value" aria-label="Intervalo calculado Línea ${line}">${intervalFor(duration, circulating)}</span></td><td><div class="rain-controls"><input class="form-check-input rain-toggle" type="checkbox" data-line="${line}" ${row.rain ? "checked" : ""} aria-label="Activar reporte de lluvia Línea ${line}"><select class="form-select form-select-sm rain-level" data-line="${line}" ${row.rain ? "" : "disabled"} aria-label="Intensidad de lluvia Línea ${line}"><option value="" selected="${row.rain ? "" : "selected"}">Intensidad</option><option ${row.rain && row.rainLevel === "Ligera" ? "selected" : ""}>Ligera</option><option ${row.rain && row.rainLevel === "Moderada" ? "selected" : ""}>Moderada</option><option ${row.rain && row.rainLevel === "Intensa" ? "selected" : ""}>Intensa</option></select></div></td></tr>`;
    }).join("");
  }
  function saveField(line, field, value) {
    const key = keyFor(dateInput.value, selectedHour);
    if (!data.captures[key]) data.captures[key] = {};
    if (!data.captures[key][line]) data.captures[key][line] = {};
    data.captures[key][line][field] = value;
    store.saveStorageData(data);
  }
  function bind() {
    document.getElementById("horas").addEventListener("click", event => {
      const button = event.target.closest("[data-hour]"); if (!button || button.disabled) return;
      selectedHour = Number(button.dataset.hour); render();
    });
    document.getElementById("disponibilidadBody").addEventListener("input", event => {
      const el = event.target.closest("[data-field]");
      if (el) {
        if (el.dataset.field === "encargado") {
          const caret = el.selectionStart;
          el.value = el.value.toLocaleUpperCase("es-MX");
          el.setSelectionRange(caret, caret);
        }
        saveField(el.dataset.line, el.dataset.field, el.value);
        if (["material", "personal", "lluviaFuera", "perdida", "supernumerarios"].includes(el.dataset.field)) {
          const row = el.closest("tr");
          const read = field => Number(row.querySelector(`[data-field="${field}"]`)?.value) || 0;
          const programmed = Number(row.querySelector(".programmed-input").value);
          const circulating = row.querySelector(".programmed-input").value === "" ? "" : Math.max(0, programmed + read("supernumerarios") - read("material") - read("personal") - read("lluviaFuera") - read("perdida"));
          row.querySelector(".circulating-input").value = circulating;
          row.querySelector(".interval-value").textContent = intervalFor(durationFor(dayType(dateInput.value), el.dataset.line), circulating);
        }
      }
    });
    document.getElementById("disponibilidadBody").addEventListener("change", event => {
      const el = event.target;
      if (el.matches(".rain-toggle")) {
        const select = el.closest(".rain-controls").querySelector("select");
        select.disabled = !el.checked;
        saveField(el.dataset.line, "rain", el.checked);
        if (!el.checked) { select.value = ""; saveField(el.dataset.line, "rainLevel", ""); }
      }
      if (el.matches(".rain-level")) saveField(el.dataset.line, "rainLevel", el.value);
    });
    dateInput.addEventListener("change", () => render());
  }
  function csvCell(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
  function matrix(rainOnly = false) {
    const header = rainOnly ? ["Línea", "LLUVIA", "INTENSIDAD"] : ["Línea", "DUR. VTA", "TRENES PROGRAMADOS", "FUERA POR MATERIAL RODANTE", "ENCARGADO DE MATERIAL RODANTE CON QUIEN SE CONCILIÓ", "FUERA POR FALTA DE PERSONAL", "FUERA POR REGULACIÓN (LLUVIA)", "FUERA POR AFEC. DE PÉRDIDA DE VTA.", "TRENES SUP.", "TRENES CIRCULANDO", "INTERVALO", "LLUVIA", "INTENSIDAD"];
    const cap = captured();
    const type = dayType(dateInput.value);
    const rows = lines.filter(line => !rainOnly || cap[line]?.rain).map(line => {
      const row = cap[line] || {};
      const programmed = programsFor(type, selectedHour, line);
      const retired = ["material", "personal", "lluviaFuera", "perdida"].reduce((sum, key) => sum + (Number(row[key]) || 0), 0);
      const circulating = programmed === "" ? "" : Math.max(0, Number(programmed) + (Number(row.supernumerarios) || 0) - retired);
      const duration = durationFor(type, line);
      return rainOnly ? [`Línea ${line}`, "Sí", row.rainLevel] : [`Línea ${line}`, duration, programmed, row.material, String(row.encargado || "").toLocaleUpperCase("es-MX"), row.personal, row.lluviaFuera, row.perdida, row.supernumerarios, circulating, intervalFor(duration, circulating), row.rain ? "Sí" : "No", row.rainLevel];
    });
    return [header, ...rows];
  }
  function wrapCanvasText(context, text, maxWidth, uppercase = true) {
    const source = uppercase ? String(text ?? "").toLocaleUpperCase("es-MX") : String(text ?? "");
    const words = source.split(/\s+/);
    const result = [];
    let line = "";
    words.forEach(word => {
      if (context.measureText(word).width > maxWidth) {
        if (line) { result.push(line); line = ""; }
        let piece = "";
        Array.from(word).forEach(character => {
          if (piece && context.measureText(piece + character).width > maxWidth) { result.push(piece); piece = character; }
          else piece += character;
        });
        line = piece;
        return;
      }
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) { result.push(line); line = word; }
      else line = candidate;
    });
    if (line) result.push(line);
    return result.length ? result : [""];
  }
  function tableCanvas(titleLeft, titleRight, headers, rows, widths, groupedRainHeader = false, footerDate = "") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const padding = 18;
    const headerFont = groupedRainHeader ? "700 16px Arial, sans-serif" : "700 15px Arial, sans-serif";
    const bodyFont = groupedRainHeader ? "20px Arial, sans-serif" : "19px Arial, sans-serif";
    const lineHeight = groupedRainHeader ? 25 : 24;
    context.font = headerFont;
    const wrappedHeaders = headers.map((value, index) => wrapCanvasText(context, value, widths[index] - 20, false));
    const headerHeight = groupedRainHeader ? 76 : Math.max(...wrappedHeaders.map(lines => lines.length)) * lineHeight + 20;
    const wrappedRows = rows.map(row => {
      context.font = bodyFont;
      return row.map((value, index) => wrapCanvasText(context, value, widths[index] - 20));
    });
    const rowHeights = wrappedRows.map(cells => Math.max(52, Math.max(...cells.map(lines => lines.length)) * lineHeight + 18));
    const tableWidth = widths.reduce((sum, width) => sum + width, 0);
    const titleHeight = 72;
    canvas.width = tableWidth + padding * 2;
    const footerHeight = footerDate ? 28 : 0;
    canvas.height = titleHeight + headerHeight + rowHeights.reduce((sum, height) => sum + height, 0) + padding * 2 + footerHeight;
    context.fillStyle = "#f5f7fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#dc3545";
    context.font = "700 34px Arial, sans-serif";
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.fillText(titleLeft.toLocaleUpperCase("es-MX"), padding, padding + titleHeight / 2);
    context.fillStyle = "#000000";
    context.font = "700 22px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText(titleRight.toLocaleUpperCase("es-MX"), canvas.width - padding, padding + titleHeight / 2);
    let y = padding + titleHeight;
    let x = padding;
    const drawHeaderCell = (text, cellX, cellY, cellWidth, cellHeight) => {
      context.fillStyle = "#112c43";
      context.fillRect(cellX, cellY, cellWidth, cellHeight);
      context.strokeStyle = "#ffffff";
      context.strokeRect(cellX, cellY, cellWidth, cellHeight);
      context.fillStyle = "#ffffff";
      context.font = headerFont;
      context.textAlign = "center";
      const lines = wrapCanvasText(context, text, cellWidth - 16);
      lines.forEach((line, lineIndex) => context.fillText(line, cellX + cellWidth / 2, cellY + cellHeight / 2 + (lineIndex - (lines.length - 1) / 2) * lineHeight));
    };
    if (groupedRainHeader) {
      const groupHeight = 36;
      const subHeight = headerHeight - groupHeight;
      drawHeaderCell(headers[0], x, y, widths[0], headerHeight);
      x += widths[0];
      const intensityWidth = widths[1] + widths[2] + widths[3];
      drawHeaderCell("PRESENCIA DE LLUVIA", x, y, intensityWidth, groupHeight);
      let subX = x;
      [1, 2, 3].forEach(index => {
        drawHeaderCell(headers[index], subX, y + groupHeight, widths[index], subHeight);
        subX += widths[index];
      });
      drawHeaderCell(headers[4], subX, y, widths[4], headerHeight);
    } else {
      headers.forEach((header, index) => {
        drawHeaderCell(header, x, y, widths[index], headerHeight);
        x += widths[index];
      });
    }
    y += headerHeight;
    wrappedRows.forEach((row, rowIndex) => {
      const rowHeight = rowHeights[rowIndex];
      x = padding;
      row.forEach((cell, index) => {
        context.fillStyle = rowIndex % 2 ? "#f0f3f6" : "#ffffff";
        context.fillRect(x, y, widths[index], rowHeight);
        context.strokeStyle = "#aeb7c2";
        context.strokeRect(x, y, widths[index], rowHeight);
        context.fillStyle = "#000000";
        const lineMatch = index === 0 ? cell.join(" ").match(/^LÍNEA (1|2|3|4|5|6|7|8|9|12|A|B)\b/i) : null;
        context.font = index === 0 ? (groupedRainHeader ? "600 20px Arial, sans-serif" : "600 19px Arial, sans-serif") : bodyFont;
        context.textAlign = index === 0 ? "left" : "center";
        const centerY = y + rowHeight / 2;
        if (lineMatch) {
          context.fillStyle = colors[lineMatch[1]];
          context.fillRect(x + 1, y + 1, 7, rowHeight - 2);
          context.fillStyle = colors[lineMatch[1]];
        }
        if (cell.length === 1 && cell[0] === "✓") context.fillStyle = "#000000";
        cell.forEach((line, lineIndex) => context.fillText(line, index === 0 ? x + (lineMatch ? 16 : 10) : x + widths[index] / 2, centerY + (lineIndex - (cell.length - 1) / 2) * lineHeight));
        x += widths[index];
      });
      y += rowHeight;
    });
    if (footerDate) {
      context.fillStyle = "#555555";
      context.font = "italic 12px Arial, sans-serif";
      context.textAlign = "right";
      context.fillText(footerDate, canvas.width - padding, canvas.height - padding - footerHeight / 2);
    }
    context.textAlign = "left";
    return canvas;
  }
  function formatReferenceDate(date) {
    const [year, month, day] = date.split("-").map(Number);
    const monthName = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(new Date(year, month - 1, 15));
    return `${pad(day)}-${monthName}-${year}`;
  }
  function blobFromCanvas(canvas, type) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("No se pudo crear la imagen")), type, .92));
  }
  function showToast(message) {
    const notice = document.getElementById("avisoCopiado");
    clearTimeout(showToast.timer);
    notice.textContent = message;
    notice.classList.add("is-visible");
    showToast.timer = setTimeout(() => notice.classList.remove("is-visible"), 2500);
  }
  async function copyImage(canvas, message) {
    try {
      if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error("El navegador no permite copiar imágenes al portapapeles.");
      let blob = await blobFromCanvas(canvas, "image/jpeg");
      let mime = "image/jpeg";
      try { await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })]); }
      catch {
        blob = await blobFromCanvas(canvas, "image/png");
        mime = "image/png";
        await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })]);
      }
      showToast(message);
    } catch (error) {
      showToast(error.message || "No se pudo copiar la imagen");
    }
  }
  const captureTitleRight = (kind) => `${kind} - ${dateInput.value}`;
  document.getElementById("copiarTrenes").addEventListener("click", () => {
    const values = matrix().map(row => row.slice(0, 11));
    values[0][0] = "LÍNEA";
    values.slice(1).forEach(row => { row[0] = String(row[0]).toLocaleUpperCase("es-MX"); });
    const widths = [120, 82, 150, 120, 195, 120, 125, 130, 85, 125, 120];
    copyImage(tableCanvas(`HORA ${pad(selectedHour)}:00`, "Disponibilidad de Trenes", values[0], values.slice(1), widths, false, formatReferenceDate(dateInput.value)), "Tabla de disponibilidad copiada como imagen");
  });
  document.getElementById("copiarLluvia").addEventListener("click", () => {
    const categories = ["Ligera", "Moderada", "Intensa", "Sin lluvia"];
    const rainHeaders = ["LÍNEA", "LIGERA", "MODERADA", "INTENSA", "SIN LLUVIA"];
    const rows = lines.map(line => {
      const row = captured()[line] || {};
      const selected = row.rain ? row.rainLevel : "Sin lluvia";
      return [`Línea ${line}`, ...categories.map(category => selected === category ? "✓" : "")];
    });
    copyImage(tableCanvas(`HORA ${pad(selectedHour)}:00`, "Reporte de Lluvia", rainHeaders, rows, [120, 120, 140, 120, 125], true, formatReferenceDate(dateInput.value)), "Tabla de lluvia copiada como imagen");
  });
  document.getElementById("guardarCaptura").addEventListener("click", () => {
    const key = keyFor(dateInput.value, selectedHour);
    if (!data.captures[key]) data.captures[key] = {};
    showToast(store.saveStorageData(data) ? "Captura guardada" : "No se pudo guardar la captura");
    render();
  });
  document.getElementById("copiarHoraAnterior").addEventListener("click", () => {
    data = store.getStorageData();
    const firstHour = ranges[dayType(dateInput.value)];
    if (selectedHour <= firstHour) { showToast("No hay una hora anterior activa para esta fecha"); return; }
    const previous = data.captures[keyFor(dateInput.value, selectedHour - 1)];
    if (!previous) { showToast("No hay datos guardados en la hora anterior"); return; }
    data.captures[keyFor(dateInput.value, selectedHour)] = JSON.parse(JSON.stringify(previous));
    store.saveStorageData(data);
    render();
    showToast("Datos de la hora anterior copiados");
  });
  document.getElementById("limpiarTablaActual").addEventListener("click", () => {
    data = store.getStorageData();
    delete data.captures[keyFor(dateInput.value, selectedHour)];
    store.saveStorageData(data);
    render();
    showToast("Tabla actual limpiada");
  });
  document.getElementById("descargarCsv").addEventListener("click", event => {
    event.preventDefault();
    const content = `\uFEFFFecha,${csvCell(dateInput.value)},Hora,${csvCell(`${pad(selectedHour)}:00`)}\r\n` + matrix().map(row => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `disponibilidad-${dateInput.value}-${pad(selectedHour)}00.csv`; link.click(); URL.revokeObjectURL(url);
  });
  bind(); render();
})();
