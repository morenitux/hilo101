"use strict";
const procedureInput = document.getElementById("buscarManual");
const procedureClear = document.getElementById("borrarManual");
const normalizeProcedure = value => value.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
const procedureRows = Array.from(document.querySelectorAll("[data-manual]"), row=>({row,text:normalizeProcedure(row.textContent)}));
function filterProcedures() {
  const query = normalizeProcedure(procedureInput.value);
  const terms = SiteSearch.terms(procedureInput.value);
  let count = 0;
  procedureRows.forEach(({row,text})=>{
    row.hidden = !SiteSearch.matches(text, terms);
    SiteSearch.highlight(row, terms);
    if (!row.hidden) count++;
  });
  procedureClear.hidden = !procedureInput.value;
  document.getElementById("sinManuales").hidden = count !== 0;
  document.getElementById("estadoManuales").textContent = query ? count+" de "+procedureRows.length+" archivos" : procedureRows.length+" archivos";
}
procedureInput.addEventListener("input",filterProcedures);
procedureClear.addEventListener("click",()=>{procedureInput.value="";filterProcedures();procedureInput.focus();});
filterProcedures();

