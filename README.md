# Demo: catálogo mayorista de vidrio soplado (Vonoa)

Piezas, colores, precios y ventas **de ejemplo** (no son de ningún taller). Publicado en
https://vonoaweb.github.io/vidrio-mayoreo-demo/

Tres vistas:
- **Catálogo** (lo que ve su cliente): portada con vidrio que sale del fuego y se enfría hasta su color, 8 piezas con
  color a elegir, precio por volumen (12+ y 48+), descuento extra por monto, existencia vs. sobre pedido, mínimo de
  pedido, envío por código postal y pedido armado por WhatsApp.
- **Asistente**: simulación de un WhatsApp que cotiza, dice qué hay en existencia y calcula el envío (reglas simples,
  sin IA ni servidor).
- **Su taller**: lo que ve el fabricante (pedidos de hoy, semana, lo más pedido, cómo le llega un pedido) y el editor
  de precios, descuentos y existencias que actualiza el catálogo.

## Diseño (por qué es así)
Referencias: Faire (crema cálido, serif, el lugar del artesano), Blenko y Simon Pearce (el producto como protagonista).
Prácticas de portales B2B: mínimos y escala de precios visibles junto a la pieza, medidor de avance al mínimo, pocos
números y en palabras sencillas en el panel. Un solo acento (terracota "brasa"); los colores vivos son los del vidrio.
El vidrio se dibuja en SVG con burbujitas de aire (la huella del soplado a mano); `vidrio.js`.

## Mecánica
- `?n=Nombre` pone el nombre del negocio (solo texto; las piezas siguen siendo de ejemplo).
- **Vigencia:** `datos.js` → `expira`. Pasada esa fecha la página muestra "Este demo ya venció". El aviso superior dice
  siempre hasta cuándo está disponible.
- Los cambios del panel se guardan solo en el navegador de quien los hace (localStorage).

## Retirarlo del todo
```bash
gh repo delete vonoaweb/vidrio-mayoreo-demo --yes
```
(o `gh api -X DELETE repos/vonoaweb/vidrio-mayoreo-demo/pages` para quitar solo la página y conservar el código)

## Quitarlo en la práctica
- Si el prospecto no contrata: se deja vencer o se borra en la fecha.
- Si contrata: se hace **su** versión (su catálogo, sus fotos, su dominio); este demo no se le entrega.
- Para otro giro: copiar la carpeta y cambiar `datos.js` (piezas, colores, textos) y las siluetas de `vidrio.js`.
