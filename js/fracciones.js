"use strict";

(() => {
  const targetFromHash = () => {
    const match = location.hash.match(/^#(linea(?:[1-9]|12|A|B))$/i);
    return match ? document.getElementById(match[1]) : null;
  };

  function highlightSection(section) {
    if (!section) return;
    document.querySelectorAll(".linea-section.is-highlighted").forEach(item => {
      if (item !== section) item.classList.remove("is-highlighted");
    });
    section.classList.remove("is-highlighted");
    // Reinicia la animación al volver a seleccionar la misma línea.
    void section.offsetWidth;
    section.classList.add("is-highlighted");
  }

  document.querySelectorAll('a[href*="fracciones_vuelta.html#linea"], .fracciones-line-link').forEach(link => {
    link.addEventListener("click", () => {
      const destination = new URL(link.href, location.href);
      if (destination.pathname !== location.pathname || !destination.hash) return;
      const section = document.getElementById(destination.hash.slice(1));
      const menu = document.getElementById("menuPrincipal");
      if (window.innerWidth < 1200 && menu?.classList.contains("show")) {
        menu.addEventListener("hidden.bs.offcanvas", () => {
          setTimeout(() => highlightSection(section), 80);
        }, { once: true });
      } else {
        setTimeout(() => highlightSection(section), 0);
      }
    });
  });

  window.addEventListener("hashchange", () => highlightSection(targetFromHash()));
  window.addEventListener("popstate", () => highlightSection(targetFromHash()));
  highlightSection(targetFromHash());
})();
