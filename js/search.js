"use strict";
window.SiteSearch = (() => {
  const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es");
  const ignored = new Set(["en","el","la","los","las","de","del","un","una","y"]);
  const invariant = new Set(["lunes","martes","miercoles","jueves","viernes","crisis","analisis","tesis","dosis","virus"]);
  const cache = new Map();
  function forms(word) {
    if (cache.has(word)) return cache.get(word);
    const result = new Set([word]);
    if (/^[a-z]+$/.test(word) && !invariant.has(word)) {
      if (word.length > 3 && /[aeiou]s$/.test(word)) result.add(word.slice(0,-1));
      if (word.length > 4 && /[^aeiou]es$/.test(word)) result.add(word.slice(0,-2));
      if (word.length > 3 && word.endsWith("ces")) result.add(word.slice(0,-3)+"z");
    }
    cache.set(word,result);
    return result;
  }
  function equivalent(a,b) {
    const other = forms(b);
    return [...forms(a)].some(form=>other.has(form));
  }
  function terms(value) {
    const words = normalize(value).trim().split(/[\s,]+/).filter(Boolean);
    const significant = words.filter(word=>!ignored.has(word));
    return [...new Set(significant.length ? significant : words)];
  }
  function matches(text,queryTerms) {
    const normalized = normalize(text);
    const words = normalized.match(/[a-z0-9]+/g) || [];
    return queryTerms.every(term => normalized.includes(term) || words.some(word=>equivalent(word,term)));
  }
  function highlight(row,queryTerms) {
    row.querySelectorAll("mark.larin-match").forEach(mark=>mark.replaceWith(document.createTextNode(mark.textContent)));
    row.normalize();
    if (!queryTerms.length || row.hidden) return;
    const walker = document.createTreeWalker(row,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const original=node.nodeValue;
      let normalized="", offset=0;
      const starts=[],ends=[];
      for(const char of original) {
        const plain=normalize(char);
        for(const part of plain) {
          normalized+=part;starts.push(offset);ends.push(offset+char.length);
        }
        offset+=char.length;
      }
      const ranges=[];
      for(const term of queryTerms) {
        let pos=normalized.indexOf(term);
        while(pos!==-1) {
          ranges.push([starts[pos],ends[pos+term.length-1]]);
          pos=normalized.indexOf(term,pos+term.length);
        }
        for(const match of normalized.matchAll(/[a-z0-9]+/g)) {
          if(equivalent(match[0],term)) ranges.push([starts[match.index],ends[match.index+match[0].length-1]]);
        }
      }
      if(!ranges.length)return;
      ranges.sort((a,b)=>a[0]-b[0]);
      const merged=[];
      ranges.forEach(range=>{
        const last=merged[merged.length-1];
        if(last && range[0]<=last[1]) last[1]=Math.max(last[1],range[1]);else merged.push([...range]);
      });
      const fragment=document.createDocumentFragment();let cursor=0;
      merged.forEach(([start,end])=>{
        fragment.append(document.createTextNode(original.slice(cursor,start)));
        const mark=document.createElement("mark");mark.className="larin-match";mark.textContent=original.slice(start,end);
        fragment.append(mark);cursor=end;
      });
      fragment.append(document.createTextNode(original.slice(cursor)));
      node.replaceWith(fragment);
    });
  }
  return {normalize,terms,matches,highlight};
})();
