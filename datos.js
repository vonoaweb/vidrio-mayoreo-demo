/* Piezas, colores, precios y ventas DE EJEMPLO para la demo. No son de ningún taller real.
   En la versión real, cada fábrica carga su catálogo, sus fotos y sus precios. */
window.DEMO = {
  negocio: "Su taller de vidrio",
  ciudad: "Tonalá, Jalisco",
  // La demo se retira sola después de esta fecha (hora local, fin del día).
  expira: "2026-10-23",
  contacto: "56 4464 5574",
  descuentos: { d12: 12, d48: 22 },        // % por pieza al llegar a 12 y a 48 piezas
  extra: { desde: 15000, pct: 5 },         // % extra sobre el pedido al pasar de este monto
  minimo: 1500,                            // pedido mínimo de mayoreo (MXN)
  diasSobrePedido: 8,                      // fabricación de lo que no hay en existencia
  // Envío de ejemplo por zona, según el código postal (no son tarifas reales de ninguna paquetería).
  envios: [
    { zona: "Jalisco y Occidente", costo: 180, dias: "2 a 3 días" },
    { zona: "Centro del país",     costo: 320, dias: "3 a 5 días" },
    { zona: "Resto del país",      costo: 450, dias: "4 a 6 días" }
  ],
  colores: {
    ambar:   { n: "Ámbar",         h: "#C98A1B" },
    cobalto: { n: "Cobalto",       h: "#1E4FA8" },
    aqua:    { n: "Aqua",          h: "#2FA9AE" },
    verde:   { n: "Verde botella", h: "#2F7D5B" },
    humo:    { n: "Humo",          h: "#7E858B" },
    rojo:    { n: "Rojo",          h: "#B83A2E" }
  },
  piezas: [
    { id: "VR-08", nombre: "Vaso roca",         forma: "roca",      palabras: ["roca"],                medida: "8 cm",  cap: "300 ml", caja: 24, precio: 62,  existencia: 480, colores: ["ambar", "cobalto", "aqua", "verde", "rojo"] },
    { id: "VA-14", nombre: "Vaso alto",         forma: "alto",      palabras: ["alto", "highball"],    medida: "14 cm", cap: "400 ml", caja: 24, precio: 68,  existencia: 360, colores: ["ambar", "cobalto", "aqua", "humo"] },
    { id: "TQ-06", nombre: "Tequilero",         forma: "tequilero", palabras: ["tequilero", "caballito"], medida: "6 cm", cap: "60 ml", caja: 48, precio: 34,  existencia: 900, colores: ["ambar", "cobalto", "verde", "rojo", "humo"] },
    { id: "VM-09", nombre: "Vaso mezcalero",    forma: "mezcalero", palabras: ["mezcalero", "mezcal"], medida: "9 cm",  cap: "120 ml", caja: 36, precio: 58,  existencia: 240, colores: ["ambar", "aqua", "verde", "humo"] },
    { id: "CP-17", nombre: "Copa de pie",       forma: "copa",      palabras: ["copa"],                medida: "17 cm", cap: "350 ml", caja: 12, precio: 92,  existencia: 120, colores: ["cobalto", "aqua", "verde", "ambar"] },
    { id: "JR-24", nombre: "Jarra con asa",     forma: "jarra",     palabras: ["jarra"],               medida: "24 cm", cap: "1.5 L",  caja: 6,  precio: 215, existencia: 36,  colores: ["cobalto", "ambar", "aqua", "verde"] },
    { id: "ES-10", nombre: "Esfera decorativa", forma: "esfera",    palabras: ["esfera", "esferas"],   medida: "10 cm", cap: "—",      caja: 12, precio: 49,  existencia: 300, colores: ["cobalto", "rojo", "aqua", "ambar", "verde", "humo"] },
    { id: "FL-22", nombre: "Florero panzón",    forma: "florero",   palabras: ["florero", "panzon"],   medida: "22 cm", cap: "—",      caja: 6,  precio: 148, existencia: 18,  colores: ["cobalto", "ambar", "verde", "humo"] }
  ],
  // Lo que se ve en "Su taller" (todo de ejemplo)
  semana: { dias: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], pedidos: [3, 4, 2, 5, 6, 9, 4], nombres: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] },
  masPedido: [
    { id: "VR-08", color: "cobalto", piezas: 312 },
    { id: "TQ-06", color: "ambar",   piezas: 264 },
    { id: "ES-10", color: "rojo",    piezas: 180 },
    { id: "CP-17", color: "aqua",    piezas: 96 }
  ],
  pedidoEjemplo: {
    cliente: "Hotel de ejemplo · Puerto Vallarta",
    lineas: [["48", "Vaso roca", "cobalto"], ["24", "Copa de pie", "aqua"], ["12", "Jarra con asa", "ámbar"]]
  }
};
