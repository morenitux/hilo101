# Apoyo para Jefes de Reguladores

Sitio de consulta con larines, fracciones de vuelta y procedimientos, adaptado para computadoras y teléfonos.

## Secciones

- **Larines PCCI-C5/PCCII y PCC-L12:** búsqueda por clave o descripción. En móvil, toca la descripción corta para copiar el texto completo.
- **Fracciones de vuelta:** tablas por línea del Metro con acceso directo desde el menú.
- **Procedimientos:** listado de documentos PDF con buscador y enlaces para abrirlos.

Formación de trenes y Traslados de trenes están temporalmente deshabilitados.

## Uso

Abre `index.html` en tu navegador. Conserva los archivos HTML y las carpetas `css`, `js` y `files` en la misma ubicación.

Se necesita conexión a internet para cargar Bootstrap y la fuente Arimo. No requiere instalación ni compilación.

## Tecnologías

HTML, CSS, JavaScript y Bootstrap 5, con Arimo de Google Fonts.

## Actualizar procedimientos

Los documentos se encuentran en `files/procedimientos/`, organizados en carpetas y subcarpetas. El listado se mantiene en `procedimientos.html`: cada fila contiene el enlace al PDF y el nombre del procedimiento. Algunos nombres están pendientes de completar.

Si agregas o renombras un PDF, actualiza también su enlace en la tabla.

---

Sitio creado por [José Luis Moreno](https://morenitux.dev).

## Estructura

```text
css/
js/
files/
  manuales/
  procedimientos/
index.html
larines_pcl12.html
fracciones_vuelta.html
manuales.html
procedimientos.html
formacion_trenes.html
README.md
```

Los PDF de Manuales están en `files/manuales/`. Conserva estas rutas al publicar el sitio.
