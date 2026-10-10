"use strict";

// Bootstrap controla el panel, el fondo, Escape y el foco del teclado.
const menu = document.getElementById("menuPrincipal");
const menuToggle = document.getElementById("abrirMenu");

if (menu && menuToggle) {
  menu.addEventListener("show.bs.offcanvas", () => {
    menuToggle.setAttribute("aria-expanded", "true");
  });
  menu.addEventListener("hide.bs.offcanvas", () => {
    menuToggle.setAttribute("aria-expanded", "false");
  });

  menu.querySelectorAll("a.nav-link, a.dropdown-item").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (window.innerWidth < 768 && window.bootstrap) {
        const panel = bootstrap.Offcanvas.getInstance(menu);
        if (panel) {
          const requested = new URL(link.href, location.href);
          if (requested.pathname === location.pathname && requested.hash) {
            event.preventDefault();
            history.pushState(null, "", requested.hash);
          }
          menu.addEventListener("hidden.bs.offcanvas", () => {
            const destination = new URL(link.href, window.location.href);
            const target = destination.hash ? document.getElementById(destination.hash.slice(1)) : document.getElementById("contenido");
            if (target) requestAnimationFrame(() => {
              target.focus({ preventScroll: true });
              if (destination.hash) target.scrollIntoView({ behavior: "instant", block: "start" });
            });
          }, { once: true });
          panel.hide();
        }
      }
    });
  });
}

// Filtra por clave y por cualquiera de las descripciones, ignorando acentos.
const searchInput = document.getElementById("buscarLarin");
const clearSearch = document.getElementById("limpiarBusqueda");
const searchStatus = document.getElementById("estadoBusqueda");
const emptyResults = document.getElementById("sinResultados");
const normalizeSearch = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
const records = Array.from(document.querySelectorAll("[data-registro]"), (row) => ({
  row,
  text: normalizeSearch(row.textContent)
}));

const searchTerms = SiteSearch.terms;
const highlightLarin = SiteSearch.highlight;
function filterLarines() {
  clearSearch.hidden = searchInput.value.length === 0;
  const terms = searchTerms(searchInput.value);
  let visible = 0;
  records.forEach(({row,text}) => {
    row.hidden = !SiteSearch.matches(text, terms);
    if (!row.hidden) visible++;
    highlightLarin(row,terms);
  });
  emptyResults.hidden = visible !== 0;
  searchStatus.textContent = terms.length
    ? "Mostrando " + visible + " de " + records.length + " registros"
    : "Mostrando todos los registros";
}
if (searchInput && clearSearch && searchStatus && emptyResults) {
  searchInput.addEventListener("input", filterLarines);
  filterLarines();
  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    filterLarines();
    searchInput.focus();
  });
}



// Cada página declara su sección en data-page del body.
// La selección representa la página abierta, no un enlace provisional pulsado.
const currentPage = document.body.dataset.page;
document.querySelectorAll(".navbar-nav [data-page]").forEach((link) => {
  const isCurrentPage = link.dataset.page === currentPage;
  link.classList.toggle("active", isCurrentPage);
  if (isCurrentPage) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});




document.querySelectorAll("[data-page-group]").forEach(toggle => {
  toggle.classList.toggle("active", toggle.dataset.pageGroup.split(",").includes(currentPage));
});
// "instant" evita el desplazamiento suave definido por Bootstrap.
const goTop = document.getElementById("volverArriba");
if (goTop) {
  const updateGoTop = () => { goTop.hidden = window.scrollY <= 200; };
  window.addEventListener("scroll", updateGoTop, { passive: true });
  window.addEventListener("pageshow", updateGoTop);
  updateGoTop();
  goTop.addEventListener("click", () => {
    const start = document.getElementById("contenido");
    if (start) start.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    updateGoTop();
  });
}


// En la barra lateral de tablet/escritorio, todos los submenús permanecen abiertos.
const sidebarNavigation = window.matchMedia("(min-width: 768px) and (max-width: 1199.98px)");
const updateSidebarDropdowns = () => {
  document.querySelectorAll(".navbar .dropdown-toggle").forEach(toggle => {
    const collapsibleSidebarGroup = ["menuLarines", "menuFracciones", "menuRecursos"].includes(toggle.id);
    const submenu = toggle.nextElementSibling;
    if (collapsibleSidebarGroup && submenu?.classList.contains("dropdown-menu")) {
      submenu.classList.toggle("show", sidebarNavigation.matches);
      toggle.setAttribute("aria-expanded", String(sidebarNavigation.matches));
    } else {
      toggle.setAttribute("aria-expanded", String(sidebarNavigation.matches));
    }
  });
};
document.querySelectorAll(".navbar .dropdown-toggle[data-bs-toggle='dropdown']").forEach(toggle => {
  toggle.addEventListener("click", event => {
    if (!sidebarNavigation.matches) return;
    if (["menuLarines", "menuFracciones", "menuRecursos"].includes(toggle.id)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toggle.setAttribute("aria-expanded", "true");
  }, true);
});
const resourcesToggle = document.getElementById("menuRecursos");
if (resourcesToggle) {
  resourcesToggle.addEventListener("click", event => {
    if (window.innerWidth < 768) return;
    event.preventDefault();
    const submenu = resourcesToggle.nextElementSibling;
    if (!submenu?.classList.contains("dropdown-menu")) return;
    const isOpen = submenu.classList.toggle("show");
    resourcesToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
sidebarNavigation.addEventListener("change", updateSidebarDropdowns);
updateSidebarDropdowns();
// Copia el texto largo sin modificar sus espacios ni su puntuación.
const copyNotice = document.getElementById("avisoCopiado");
if (copyNotice) {
  let noticeTimer;
  function showCopyNotice(message) {
    clearTimeout(noticeTimer);
    copyNotice.textContent = message;
    copyNotice.classList.add("is-visible");
    noticeTimer = setTimeout(() => copyNotice.classList.remove("is-visible"), 2500);
  }

  function legacyCopy(text) {
    const previousFocus = document.activeElement;
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;";
    document.body.appendChild(field);
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, field.value.length);
    let copied = false;
    try { copied = document.execCommand("copy"); }
    finally {
      field.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
    if (!copied) throw new Error("No se pudo copiar");
  }

  // Matrículas de formación: conserva el texto original aunque la búsqueda lo resalte.
  document.querySelectorAll(".formacion-table[data-sheet]").forEach(table => {
    const line = table.dataset.sheet;
    if (!/^L(?:[1-9]|A|B)$/.test(line)) return;
    const headers = Array.from(table.tHead.rows[0].cells, cell =>
      cell.textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase());
    const registrationIndex = headers.indexOf("matricula");
    const modelIndex = headers.indexOf("modelo");
    if (registrationIndex < 0 || modelIndex < 0) return;
    table.querySelectorAll("[data-formacion]").forEach(row => {
      const cell = row.cells[registrationIndex];
      const registration = cell.textContent.trim();
      const model = row.cells[modelIndex].textContent.trim();
      if (!registration) return;
      const text = (line === "LA" ? "FM-" : "M-") + registration + " " + model;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "train-copy";
      button.textContent = registration;
      button.title = "Copiar tren";
      button.setAttribute("aria-label", "Copiar tren " + text);
      button.addEventListener("click", async () => {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            try { await navigator.clipboard.writeText(text); }
            catch { legacyCopy(text); }
          } else {
            legacyCopy(text);
          }
          showCopyNotice("Tren copiado");
        } catch {
          showCopyNotice("No se pudo copiar. Inténtalo de nuevo.");
        }
      });
      cell.replaceChildren(button);
    });
  });

  document.querySelectorAll(".larines-table [data-registro]").forEach((row) => {
    const shortCell = row.cells[1];
    const longCell = row.cells[2];
    if (!shortCell || !longCell) return;
    const shortText = shortCell.textContent;
const button = document.createElement("button");
    button.type = "button";
    button.className = "larin-copy";
    button.textContent = shortText;
    button.setAttribute("aria-label", "Copiar larín " + row.cells[0].textContent.trim() + ": " + shortText);
    shortCell.replaceChildren(button);
    const copyLarin = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          try { await navigator.clipboard.writeText(longCell.textContent); }
          catch { legacyCopy(longCell.textContent); }
        } else {
          legacyCopy(longCell.textContent);
        }
        showCopyNotice("Larín copiado");
      } catch {
        showCopyNotice("No se pudo copiar. Inténtalo de nuevo.");
      }
    };
    button.addEventListener("click", copyLarin);
  });
}


// Reserva la altura real del navbar, incluso al cambiar el ancho o cargar la fuente.
const siteHeader = document.querySelector("body > header");
if (siteHeader) {
  const updateHeaderHeight = () => {
    document.documentElement.style.setProperty("--site-header-height", siteHeader.getBoundingClientRect().height + "px");
  };
  updateHeaderHeight();
  new ResizeObserver(updateHeaderHeight).observe(siteHeader);
}

// "/" enfoca la búsqueda sin interceptar escritura, atajos del navegador ni composición.
const pageSearch = document.querySelector("#buscarLarin, #buscarManual, #buscarProcedimiento, #buscarFormacion");

// Atajos globales para navegar a las secciones principales desde cualquier página.
const navigationShortcuts = {
  l: "index.html",
  f: "formacion_trenes.html",
  v: "fracciones_vuelta.html",
  m: "manuales.html",
  p: "otros_recursos.html#perfiles-linea",
  t: "otros_recursos.html#terminales-vias",
  e: "otros_recursos.html#distribucion-energia",
  s: "otros_recursos.html#servicios-provisionales",
  r: "procedimientos.html"
};

// Marca la letra asociada al atajo dentro de los elementos disponibles del navbar.
const shortcutLabels = [
  ["#menuLarines .nav-item-label", "l"],
  ['.navbar a[data-page="formacion-de-trenes"]', "f"],
  ["#menuFracciones .nav-item-label", "v"],
  ['.navbar a[data-page="manuales"]', "m"],
  ['.navbar a[href="procedimientos.html"]', "r"],
  ['.navbar a[href$="#perfiles-linea"]', "p"],
  ['.navbar a[href$="#terminales-vias"]', "t"],
  ['.navbar a[href$="#distribucion-energia"]', "e", 1],
  ['.navbar a[href$="#servicios-provisionales"]', "s"]
];
shortcutLabels.forEach(([selector, letter, occurrence = 0]) => {
  document.querySelectorAll(selector).forEach(element => {
    const label = element.querySelector(".nav-item-label") || element;
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      const normalizedText = textNode.data.toLowerCase();
      let index = -1;
      let searchFrom = 0;
      for (let found = 0; found <= occurrence; found++) {
        index = normalizedText.indexOf(letter, searchFrom);
        if (index < 0) break;
        searchFrom = index + 1;
      }
      if (index < 0) continue;
      const match = textNode.data.slice(index, index + 1);
      const before = textNode.data.slice(0, index);
      textNode.data = textNode.data.slice(index + 1);
      const marker = document.createElement("span");
      marker.className = "shortcut-letter";
      marker.textContent = match;
      if (before) textNode.parentNode.insertBefore(document.createTextNode(before), textNode);
      textNode.parentNode.insertBefore(marker, textNode);
      break;
    }
  });
});

const updateShortcutHints = visible => document.documentElement.classList.toggle("shortcuts-visible", visible);
window.addEventListener("keydown", event => {
  if (event.key === "Alt" && !event.ctrlKey && !event.metaKey) updateShortcutHints(true);
}, true);
window.addEventListener("keyup", event => {
  if (event.key === "Alt") updateShortcutHints(false);
}, true);
window.addEventListener("blur", () => updateShortcutHints(false));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) updateShortcutHints(false);
});

// Panel de ayuda flotante con los atajos disponibles en el sitio.
const keyboardHelp = document.createElement("aside");
keyboardHelp.className = "keyboard-help";
keyboardHelp.id = "ayudaAtajos";
keyboardHelp.hidden = true;
keyboardHelp.setAttribute("role", "dialog");
keyboardHelp.setAttribute("aria-modal", "false");
keyboardHelp.setAttribute("aria-labelledby", "tituloAyudaAtajos");
keyboardHelp.innerHTML = `
  <div class="keyboard-help-header">
    <h2 id="tituloAyudaAtajos">Ayuda</h2>
    <button class="keyboard-help-close" type="button" aria-label="Cerrar ayuda">&times;</button>
  </div>
  <p class="keyboard-help-description">Atajos de teclado para navegar por el sitio:</p>
  <dl class="keyboard-help-list">
    <div><dt><kbd>Alt + L</kbd></dt><dd>Larines PCCI-C5/PCCII</dd></div>
    <div><dt><kbd>Alt + F</kbd></dt><dd>Formación de trenes</dd></div>
    <div><dt><kbd>Alt + V</kbd></dt><dd>Fracciones de vuelta</dd></div>
    <div><dt><kbd>Alt + M</kbd></dt><dd>Manuales</dd></div>
    <div><dt><kbd>Alt + P</kbd></dt><dd>Perfiles de Línea</dd></div>
    <div><dt><kbd>Alt + T</kbd></dt><dd>Terminales</dd></div>
    <div><dt><kbd>Alt + E</kbd></dt><dd>Distribución de la Energía</dd></div>
    <div><dt><kbd>Alt + S</kbd></dt><dd>Servicios provisionales</dd></div>
    <div><dt><kbd>Alt + R</kbd></dt><dd>Procedimientos</dd></div>
    <div><dt><kbd>/</kbd></dt><dd>Ir al cuadro de búsqueda</dd></div>
  </dl>
  <p class="keyboard-help-footer">Presiona <kbd>?</kbd> o <kbd>Esc</kbd> para cerrar.</p>`;
document.body.appendChild(keyboardHelp);

const keyboardHelpClose = keyboardHelp.querySelector(".keyboard-help-close");
let helpReturnFocus = null;
const setKeyboardHelp = visible => {
  keyboardHelp.hidden = !visible;
  if (visible) {
    helpReturnFocus = document.activeElement;
    keyboardHelpClose.focus({ preventScroll: true });
  } else if (helpReturnFocus instanceof HTMLElement) {
    helpReturnFocus.focus({ preventScroll: true });
  }
};
keyboardHelpClose.addEventListener("click", () => setKeyboardHelp(false));
window.addEventListener("keydown", event => {
  if (event.key === "Escape" && !keyboardHelp.hidden) {
    event.preventDefault();
    event.stopImmediatePropagation();
    setKeyboardHelp(false);
  }
}, true);
document.addEventListener("keydown", event => {
  if (event.key !== "?" || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.defaultPrevented) return;
  const target = event.target instanceof Element ? event.target : document.activeElement;
  if (target && (target.closest("input, textarea, select, [role='textbox']") || target.isContentEditable)) return;
  event.preventDefault();
  setKeyboardHelp(keyboardHelp.hidden);
});

document.addEventListener("keydown", event => {
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing || event.defaultPrevented) return;
  if (event.getModifierState?.("AltGraph")) return;
  const destination = navigationShortcuts[event.key.toLowerCase()];
  if (!destination) return;
  const target = event.target instanceof Element ? event.target : document.activeElement;
  if (target && (target.closest("input, textarea, select, [role='textbox']") || target.isContentEditable)) return;
  if (document.querySelector("dialog[open]")) return;
  event.preventDefault();
  window.location.href = destination;
});

if (pageSearch) {
  pageSearch.setAttribute("aria-keyshortcuts", "/ Escape");
  pageSearch.addEventListener("keydown", event => {
    if (event.key === "Escape" && !event.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      pageSearch.blur();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.defaultPrevented) return;
    const target = event.target instanceof Element ? event.target : document.activeElement;
    if (target && (target.closest("input, textarea, select, [role='textbox']") || target.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    event.preventDefault();
    const focusSearch = () => {
      pageSearch.focus({ preventScroll: true });
      pageSearch.select();
      pageSearch.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const openMenu = document.querySelector("#menuPrincipal.show");
    if (openMenu && window.bootstrap) {
      openMenu.addEventListener("hidden.bs.offcanvas", () => requestAnimationFrame(focusSearch), { once: true });
      bootstrap.Offcanvas.getOrCreateInstance(openMenu).hide();
    } else focusSearch();
  });
}





// Larines y Otros recursos permanecen desplegados dentro del menú móvil.
document.querySelectorAll("#menuLarines, #menuRecursos").forEach(larinesMenuToggle => {
 const collapsedNavigation=window.matchMedia("(max-width: 767.98px)");
 const updateLarinesNavigation=()=>{
  larinesMenuToggle.disabled=collapsedNavigation.matches;
  larinesMenuToggle.setAttribute("aria-expanded",String(collapsedNavigation.matches || larinesMenuToggle.nextElementSibling.classList.contains("show")));
 };
 collapsedNavigation.addEventListener("change",updateLarinesNavigation);
 updateLarinesNavigation();
});

// Cada desplegable conserva el anclaje horizontal a su opción y baja hasta el borde del navbar.
document.querySelectorAll(".navbar .nav-item.dropdown").forEach(item => {
  const alignDropdown = () => {
    if (window.innerWidth < 1200) return;
    const navbar = item.closest(".navbar");
    const distance = navbar.getBoundingClientRect().bottom - item.getBoundingClientRect().top;
    item.style.setProperty("--dropdown-nav-bottom", distance + "px");
  };
  item.addEventListener("show.bs.dropdown", alignDropdown);
  window.addEventListener("resize", alignDropdown);
  alignDropdown();
});
