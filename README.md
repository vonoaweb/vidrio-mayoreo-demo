# Demo: catálogo mayorista de vidrio soplado (Vonoa)

Piezas, colores y precios **de ejemplo** (no son de ningún taller). Muestra: precio por volumen (12+ y 48+),
existencia vs. sobre pedido, mínimo de pedido y pedido armado por WhatsApp, más un panel donde el fabricante
cambia precios y existencias. Publicado en https://vonoaweb.github.io/vidrio-mayoreo-demo/

- `?n=Nombre` pone el nombre del negocio en el encabezado (solo texto; las piezas siguen siendo de ejemplo).
- **Vigencia:** `datos.js` → `expira: "2026-10-23"`. Pasada esa fecha la página muestra "Este demo ya venció".
- El aviso superior dice siempre hasta cuándo está disponible.

## Retirarlo del todo
```bash
gh repo delete vonoaweb/vidrio-mayoreo-demo --yes
```
(o `gh api -X DELETE repos/vonoaweb/vidrio-mayoreo-demo/pages` para quitar solo la página y conservar el código)

## Quitarlo en la práctica
- Si el prospecto no contrata: se deja vencer o se borra en la fecha.
- Si contrata: se hace **su** versión (su catálogo, sus fotos, su dominio); este demo no se le entrega.
