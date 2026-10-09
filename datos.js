/* Piezas, colores y precios DE EJEMPLO para la demo. No son de ningún taller real.
   En la versión real, cada fábrica carga su catálogo y sus precios. */
window.DEMO = {
  negocio: "Vidrio soplado de ejemplo",
  ciudad: "Tonalá, Jal.",
  // La demo se retira sola después de esta fecha (hora local, fin del día).
  expira: "2026-10-23",
  contacto: "56 4464 5574",
  descuentos: { d12: 12, d48: 22 },   // % de descuento por volumen, por pieza
  minimo: 1500,                        // pedido mínimo de mayoreo (MXN)
  diasSobrePedido: 8,                  // fabricación de lo que no hay en existencia
  colores: {
    ambar:   { n: "Ámbar",         h: "#C98A1B" },
    cobalto: { n: "Cobalto",       h: "#1E4FA8" },
    aqua:    { n: "Aqua",          h: "#2FA9AE" },
    verde:   { n: "Verde botella", h: "#2F7D5B" },
    humo:    { n: "Humo",          h: "#7E858B" },
    rojo:    { n: "Rojo",          h: "#B83A2E" }
  },
  piezas: [
    { id: "VR-08", nombre: "Vaso roca",        forma: "roca",     medida: "8 cm",  cap: "300 ml", caja: 24, precio: 62,  existencia: 480, colores: ["ambar", "cobalto", "aqua", "verde", "rojo"] },
    { id: "VA-14", nombre: "Vaso alto",        forma: "alto",     medida: "14 cm", cap: "400 ml", caja: 24, precio: 68,  existencia: 360, colores: ["ambar", "cobalto", "aqua", "humo"] },
    { id: "TQ-06", nombre: "Tequilero",        forma: "tequilero",medida: "6 cm",  cap: "60 ml",  caja: 48, precio: 34,  existencia: 900, colores: ["ambar", "cobalto", "verde", "rojo", "humo"] },
    { id: "VM-09", nombre: "Vaso mezcalero",   forma: "mezcalero",medida: "9 cm",  cap: "120 ml", caja: 36, precio: 58,  existencia: 240, colores: ["ambar", "aqua", "verde", "humo"] },
    { id: "CP-17", nombre: "Copa de pie",      forma: "copa",     medida: "17 cm", cap: "350 ml", caja: 12, precio: 92,  existencia: 120, colores: ["cobalto", "aqua", "verde", "ambar"] },
    { id: "JR-24", nombre: "Jarra con asa",    forma: "jarra",    medida: "24 cm", cap: "1.5 L",  caja: 6,  precio: 215, existencia: 36,  colores: ["cobalto", "ambar", "aqua", "verde"] },
    { id: "ES-10", nombre: "Esfera decorativa",forma: "esfera",   medida: "10 cm", cap: "—",      caja: 12, precio: 49,  existencia: 300, colores: ["cobalto", "rojo", "aqua", "ambar", "verde", "humo"] },
    { id: "FL-22", nombre: "Florero panzón",   forma: "florero",  medida: "22 cm", cap: "—",      caja: 6,  precio: 148, existencia: 18,  colores: ["cobalto", "ambar", "verde", "humo"] }
  ]
};

/* Siluetas de vidrio (sin fotos: es una demo). Clases: g = cuerpo, b = fondo grueso, hi = brillo, l = asa. */
window.FORMAS = {
  roca: '<path class="g" d="M28 36 L92 36 L86 98 Q85 105 78 105 L42 105 Q35 105 34 98 Z"/><path class="b" d="M35 90 L85 90 L84 99 Q83 103 78 103 L42 103 Q37 103 36 99 Z"/><path class="hi" d="M40 44 L44 84"/>',
  alto: '<path class="g" d="M36 14 L84 14 L79 101 Q78 107 72 107 L48 107 Q42 107 41 101 Z"/><path class="b" d="M42 92 L78 92 L77 102 Q76 105 72 105 L48 105 Q44 105 43 102 Z"/><path class="hi" d="M44 22 L47 86"/>',
  tequilero: '<path class="g" d="M40 46 L80 46 L75 98 Q74 104 68 104 L52 104 Q46 104 45 98 Z"/><path class="b" d="M46 90 L74 90 L73 99 Q72 102 68 102 L52 102 Q48 102 47 99 Z"/><path class="hi" d="M47 52 L50 84"/>',
  mezcalero: '<path class="g" d="M32 42 Q32 37 38 37 L82 37 Q88 37 88 42 L83 92 Q81 105 70 105 L50 105 Q39 105 37 92 Z"/><path class="b" d="M38 86 L82 86 L81 94 Q79 102 70 102 L50 102 Q41 102 39 94 Z"/><path class="hi" d="M40 46 L43 80"/>',
  copa: '<path class="g" d="M34 16 Q34 66 60 68 Q86 66 86 16 Z"/><path class="b" d="M57 68 L57 94 L63 94 L63 68 Z"/><path class="b" d="M40 101 Q60 93 80 101 L80 106 L40 106 Z"/><path class="hi" d="M41 24 Q42 52 52 60"/>',
  jarra: '<path class="g" d="M30 24 L80 24 L85 100 Q85 108 77 108 L33 108 Q25 108 25 100 Z"/><path class="b" d="M26 92 L84 92 L85 100 Q85 105 77 105 L33 105 Q26 105 26 100 Z"/><path class="l" d="M82 38 Q108 42 104 66 Q101 84 83 88"/><path class="hi" d="M35 32 L38 84"/>',
  esfera: '<circle class="g" cx="60" cy="68" r="32"/><path class="b" d="M53 28 H67 V37 H53 Z"/><path class="l" d="M60 28 V16" style="stroke-width:3"/><path class="hi" d="M40 58 Q44 46 56 42"/>',
  florero: '<path class="g" d="M51 14 L69 14 L67 40 Q99 52 94 82 Q89 108 60 108 Q31 108 26 82 Q21 52 53 40 Z"/><path class="b" d="M30 88 Q38 104 60 104 Q82 104 90 88 Q82 98 60 98 Q38 98 30 88 Z"/><path class="hi" d="M38 66 Q40 56 50 50"/>'
};
