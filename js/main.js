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
      if (window.innerWidth < 1200 && window.bootstrap) {
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


// Desplegable por cursor solo en escritorio con ratón; toque y teclado conservan Bootstrap.
document.querySelectorAll(".navbar .dropdown-toggle").forEach(fractionsToggle => {
if (fractionsToggle && window.bootstrap) {
  const dropdownContainer = fractionsToggle.closest(".dropdown");
  const desktopHover = window.matchMedia("(min-width: 1200px) and (hover: hover) and (pointer: fine)");
  const dropdown = bootstrap.Dropdown.getOrCreateInstance(fractionsToggle);
  let closeDropdownTimer;
  dropdownContainer.addEventListener("mouseenter", () => {
    if (!desktopHover.matches) return;
    clearTimeout(closeDropdownTimer);
    dropdown.show();
  });
  dropdownContainer.addEventListener("mouseleave", () => {
    if (!desktopHover.matches) return;
    closeDropdownTimer = setTimeout(() => {
      if (!dropdownContainer.contains(document.activeElement)) dropdown.hide();
    }, 150);
  });
  dropdownContainer.addEventListener("focusout", () => {
    if (!desktopHover.matches) return;
    setTimeout(() => {
      if (!dropdownContainer.matches(":hover") && !dropdownContainer.contains(document.activeElement)) dropdown.hide();
    }, 0);
  });
  desktopHover.addEventListener("change", () => {
    clearTimeout(closeDropdownTimer);
    dropdown.hide();
  });
}
});
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

  document.querySelectorAll(".larines-table [data-registro]").forEach((row) => {
    const shortCell = row.cells[1];
    const longCell = row.cells[2];
    if (!shortCell || !longCell) return;
    const shortText = shortCell.textContent;
    const label = document.createElement("span");
    label.className = "larin-short-text";
    label.textContent = shortText;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "larin-copy";
    button.textContent = shortText;
    button.setAttribute("aria-label", "Copiar larín " + row.cells[0].textContent.trim() + ": " + shortText);
    shortCell.replaceChildren(label, button);
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
    const longButton = document.createElement("button");
    longButton.type = "button";
    longButton.className = "larin-copy-long";
    longButton.setAttribute("aria-label", "Copiar descripción larga del larín " + row.cells[0].textContent.trim());
    longButton.title = "Copiar larín";
    while (longCell.firstChild) longButton.append(longCell.firstChild);
    longCell.append(longButton);
    longButton.addEventListener("click", copyLarin);
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
const pageSearch = document.querySelector("#buscarLarin, #buscarManual, #buscarProcedimiento");
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
      pageSearch.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const openMenu = document.querySelector("#menuPrincipal.show");
    if (openMenu && window.bootstrap) {
      openMenu.addEventListener("hidden.bs.offcanvas", () => requestAnimationFrame(focusSearch), { once: true });
      bootstrap.Offcanvas.getOrCreateInstance(openMenu).hide();
    } else focusSearch();
  });
}




