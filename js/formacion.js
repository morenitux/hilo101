"use strict";
const formationInput=document.getElementById("buscarFormacion");
const formationClear=document.getElementById("borrarFormacion");
const formationSections=Array.from(document.querySelectorAll("[data-formacion-section]"),section=>({
 section,rows:Array.from(section.querySelectorAll("[data-formacion]"),row=>({row,text:Array.from(row.cells,c=>c.textContent).join(" ")}))
}));
const formationTotal=formationSections.reduce((sum,section)=>sum+section.rows.length,0);
function filterFormations(){
 const terms=SiteSearch.terms(formationInput.value);
 let total=0;
 formationSections.forEach(({section,rows})=>{
  let count=0;
  rows.forEach(({row,text})=>{
   row.hidden=!SiteSearch.matches(text,terms);
   SiteSearch.highlight(row,terms);
   if(!row.hidden)count++;
  });
  section.hidden=count===0;
  total+=count;
 });
 formationClear.hidden=!formationInput.value;
 document.getElementById("sinFormacion").hidden=total!==0;
 document.getElementById("estadoFormacion").textContent=terms.length ? total+" de "+formationTotal+" formaciones" : formationTotal+" formaciones";
}
formationInput.addEventListener("input",filterFormations);
formationClear.addEventListener("click",()=>{formationInput.value="";filterFormations();formationInput.focus();});
filterFormations();
