"use strict";
const procedureInput = document.getElementById("buscarProcedimiento");
const procedureClear = document.getElementById("borrarProcedimiento");
const normalizeProcedure = value => value.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
const procedureRows = Array.from(document.querySelectorAll("[data-procedimiento]"), row=>({row,text:normalizeProcedure(row.textContent)}));
function filterProcedures() {
  const query = normalizeProcedure(procedureInput.value);
  let count = 0;
  procedureRows.forEach(({row,text})=>{
    row.hidden = !text.includes(query);
    if (!row.hidden) count++;
  });
  procedureClear.hidden = !procedureInput.value;
  document.getElementById("sinProcedimientos").hidden = count !== 0;
  document.getElementById("estadoProcedimientos").textContent = query ? count+" de "+procedureRows.length+" archivos" : procedureRows.length+" archivos";
}
procedureInput.addEventListener("input",filterProcedures);
procedureClear.addEventListener("click",()=>{procedureInput.value="";filterProcedures();procedureInput.focus();});
filterProcedures();
