(function () {
  const D = window.DEMO, V = window.Vidrio;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const mxn = (n) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fecha = (d) => d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const anim = !!(G && !reducido);
  if (G && ST) G.registerPlugin(ST);

  // ---- vigencia: la demo se retira sola después de la fecha publicada en el aviso ----
  const fin = new Date(D.expira + "T23:59:59");
  $("#aviso-fecha").textContent = fecha(fin);
  if (new Date() > fin) {
    $("#venc-fecha").textContent = fecha(fin);
    $("#vencido").hidden = false;
    $("main").remove(); $(".top").remove(); $("#aviso").remove(); $(".pie").remove();
    return;
  }

  // ---- nombre del negocio (opcional): ?n=Nombre. Solo cambia textos; las piezas siguen siendo de ejemplo ----
  const n = (new URLSearchParams(location.search).get("n") || "").replace(/[<>]/g, "").trim().slice(0, 40);
  if (n) { D.negocio = n; document.title = n + " · Catálogo mayorista (demo de Vonoa)"; }
  $("#marca").textContent = D.negocio;
  $("#tel-nombre").textContent = D.negocio;
  $("#avatar").textContent = D.negocio.trim().charAt(0).toUpperCase() || "T";
  $("#hero-etiqueta").textContent = (n ? "Taller " + n + " · " : "") + "Vidrio soplado hecho a mano en " + D.ciudad;

  // ---- estado editable desde "Su taller" (se recuerda solo en este navegador) ----
  const base = () => ({
    d12: D.descuentos.d12, d48: D.descuentos.d48, xp: D.extra.pct, minimo: D.minimo,
    precio: Object.fromEntries(D.piezas.map((p) => [p.id, p.precio])),
    exist: Object.fromEntries(D.piezas.map((p) => [p.id, p.existencia]))
  });
  let E = base();
  const CLAVE = "vonoa-vidrio-demo-v2";
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (g && g.precio && g.exist && D.piezas.every((p) => g.precio[p.id] > 0 && g.exist[p.id] >= 0)) E = g;
  } catch (e) { /* sin almacenamiento: se usan los valores de ejemplo */ }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) {} };

  const pedido = {};   // "ID|color" -> cantidad
  const elegido = {};  // ID -> color mostrado en la tarjeta
  D.piezas.forEach((p) => { elegido[p.id] = p.colores[0]; });
  let cp = "";

  const pieza = (id) => D.piezas.find((p) => p.id === id);
  const qtySku = (id) => Object.keys(pedido).reduce((s, k) => s + (k.startsWith(id + "|") ? pedido[k] : 0), 0);
  const pct = (q) => (q >= 48 ? E.d48 : q >= 12 ? E.d12 : 0);
  const unidad = (p, q) => Math.round(E.precio[p.id] * (1 - pct(q) / 100));
  const sobrePedido = (p, q) => Math.max(0, q - E.exist[p.id]);
  const zonaCP = (c) => (/^\d{5}$/.test(c) ? D.envios[c[0] === "4" ? 0 : "01567".includes(c[0]) ? 1 : 2] : null);

  function totales() {
    let piezas = 0, sub = 0, po = 0;
    for (const p of D.piezas) { const q = qtySku(p.id); piezas += q; sub += q * unidad(p, q); po += sobrePedido(p, q); }
    const extra = sub >= D.extra.desde ? Math.round(sub * E.xp / 100) : 0;
    const z = zonaCP(cp);
    return { piezas, sub, po, extra, envio: z ? z.costo : 0, zona: z, total: sub - extra + (z ? z.costo : 0) };
  }

  // ---- vidrio: salir del horno y enfriarse hasta su color ----
  function enfriar(svg, retraso) {
    svg.classList.add("caliente");
    void svg.getBoundingClientRect();
    setTimeout(() => svg.classList.remove("caliente"), Math.max(60, retraso || 0));
  }
  function pintarVidrio(p, caliente) {
    const svg = $(`.pieza[data-id="${p.id}"] .vidrio`);
    svg.innerHTML = V.pieza(p.forma, D.colores[elegido[p.id]].h);
    if (caliente) enfriar(svg, 60);
  }

  // ---- reglas visibles ----
  function pintarReglas() {
    $("#reglas").innerHTML =
      `<li>Desde 12 piezas <b>−${E.d12}%</b></li><li>Desde 48 piezas <b>−${E.d48}%</b></li>` +
      `<li>Pedidos de más de ${mxn(D.extra.desde)} <b>−${E.xp}% extra</b></li><li>Mínimo <b>${mxn(E.minimo)}</b></li>`;
  }

  // ---- catálogo: se dibuja una vez y se actualiza en su lugar ----
  function crearGrid() {
    $("#grid").innerHTML = D.piezas.map((p) => {
      const dots = p.colores.map((c) =>
        `<button class="dot" data-a="color" data-c="${c}" style="--c:${D.colores[c].h}" aria-pressed="false" aria-label="${D.colores[c].n}"></button>`).join("");
      return `<li class="pieza" data-id="${p.id}">
        <div class="foto"><svg viewBox="0 0 140 150" class="vidrio" aria-hidden="true"></svg></div>
        <div class="info">
          <h3>${p.nombre}</h3>
          <div class="meta">${p.medida}${p.cap !== "—" ? " · " + p.cap : ""} · caja de ${p.caja}</div>
          <div class="colores" role="group" aria-label="Color de ${p.nombre}">${dots}</div>
          <div class="color-nombre"></div>
          <div class="precio"></div>
          <div class="escala"></div>
          <div class="exist"></div>
          <div class="fila">
            <div class="cant" role="group" aria-label="Cantidad de ${p.nombre}">
              <button data-a="menos" aria-label="Quitar una">−</button><output>0</output><button data-a="mas" aria-label="Agregar una">+</button>
            </div>
            <button class="caja" data-a="caja">+ caja (${p.caja})</button>
          </div>
        </div></li>`;
    }).join("");
    D.piezas.forEach((p) => { pintarVidrio(p, false); if (anim) $(`.pieza[data-id="${p.id}"] .vidrio`).classList.add("caliente"); actualizarCard(p); });
  }
  function actualizarCard(p) {
    const li = $(`.pieza[data-id="${p.id}"]`), col = elegido[p.id], cn = D.colores[col];
    const q = qtySku(p.id), enColor = pedido[p.id + "|" + col] || 0;
    const baseP = E.precio[p.id], u = unidad(p, q), po = sobrePedido(p, q);
    const t12 = Math.round(baseP * (1 - E.d12 / 100)), t48 = Math.round(baseP * (1 - E.d48 / 100));
    const act = q >= 48 ? 2 : q >= 12 ? 1 : 0;
    li.style.setProperty("--c", cn.h);
    li.classList.toggle("en-pedido", q > 0);
    li.querySelectorAll(".dot").forEach((d) => d.setAttribute("aria-pressed", d.dataset.c === col));
    li.querySelector(".color-nombre").textContent = cn.n + (enColor ? " · " + enColor + " en este color" : "");
    li.querySelector(".precio").innerHTML = (u < baseP ? `<s>${mxn(baseP)}</s>` : "") + `${mxn(u)} <small>c/u</small>`;
    li.querySelector(".escala").innerHTML =
      `<span class="${act === 0 ? "act" : ""}"><b>1–11</b>${mxn(baseP)}</span><span class="${act === 1 ? "act" : ""}"><b>12+</b>${mxn(t12)}</span><span class="${act === 2 ? "act" : ""}"><b>48+</b>${mxn(t48)}</span>`;
    const ex = li.querySelector(".exist");
    ex.className = "exist" + (E.exist[p.id] <= 0 || po > 0 ? " po" : "");
    ex.textContent = E.exist[p.id] <= 0 ? `Sobre pedido · ${D.diasSobrePedido} días`
      : po > 0 ? `${po} pza${po === 1 ? "" : "s"} sobre pedido · ${D.diasSobrePedido} días` : `Hay ${E.exist[p.id]} en existencia`;
    li.querySelector("output").textContent = enColor;
  }
  const actualizarTodas = () => D.piezas.forEach(actualizarCard);

  // ---- barra del pedido ----
  function pintarBarra() {
    const t = totales();
    $("#total").textContent = mxn(t.total);
    $("#detalle").textContent = `${t.piezas} pieza${t.piezas === 1 ? "" : "s"}` + (t.extra ? ` · −${mxn(t.extra)} extra` : "");
    const falta = E.minimo - t.sub, el = $("#falta");
    $("#medidor").style.width = Math.min(100, t.sub / E.minimo * 100) + "%";
    if (t.piezas === 0) { el.textContent = `Escoja una pieza para empezar`; el.className = "falta"; }
    else if (falta > 0) { el.textContent = `Faltan ${mxn(falta)} para el mínimo`; el.className = "falta"; }
    else { el.textContent = t.po > 0 ? `Cumple el mínimo · ${t.po} sobre pedido (≈ ${D.diasSobrePedido} días)` : "¡Ya cumple el mínimo de mayoreo!"; el.className = "falta listo"; }
    $("#enviar").disabled = t.piezas === 0 || falta > 0;
  }
  function pintarEnvio() {
    const z = zonaCP(cp), r = $("#envio-res");
    if (!cp) r.innerHTML = `<span class="res">Escriba su código postal</span> y vea cuánto cuesta el envío y en cuántos días llega.`;
    else if (!z) r.innerHTML = `<span class="res">Faltan dígitos.</span> El código postal tiene 5 números.`;
    else r.innerHTML = `<span class="res">Envío a ${esc(cp)} (${z.zona}): ${mxn(z.costo)}</span> · llega en ${z.dias}. Ya está sumado a su pedido.`;
  }
  function textoPedido() {
    const t = totales(), lineas = [`Pedido de mayoreo (demo) · ${D.negocio}`, ""];
    for (const p of D.piezas) {
      const q = qtySku(p.id); if (!q) continue;
      const u = unidad(p, q);
      for (const c of p.colores) {
        const k = pedido[p.id + "|" + c]; if (!k) continue;
        lineas.push(`• ${k} × ${p.nombre}, ${D.colores[c].n.toLowerCase()} · ${mxn(u)} c/u = ${mxn(k * u)}`);
      }
      const po = sobrePedido(p, q);
      if (po > 0) lineas.push(`   (${po} sobre pedido, ≈ ${D.diasSobrePedido} días)`);
    }
    lineas.push("", `Subtotal: ${mxn(t.sub)}`);
    if (t.extra) lineas.push(`Descuento extra ${E.xp}%: −${mxn(t.extra)}`);
    if (t.zona) lineas.push(`Envío a ${cp} (${t.zona.zona}): ${mxn(t.envio)} · ${t.zona.dias}`);
    lineas.push(`Total: ${mxn(t.total)} · ${t.piezas} piezas`, "", "Nombre:", "Ciudad:");
    return lineas.join("\n");
  }

  // ---- eventos del catálogo ----
  $("#grid").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const p = pieza(b.closest(".pieza").dataset.id), a = b.dataset.a, k = p.id + "|" + elegido[p.id];
    if (a === "color") { elegido[p.id] = b.dataset.c; pintarVidrio(p, true); }
    else if (a === "mas") pedido[k] = (pedido[k] || 0) + 1;
    else if (a === "menos") pedido[k] = Math.max(0, (pedido[k] || 0) - 1);
    else if (a === "caja") pedido[k] = (pedido[k] || 0) + p.caja;
    actualizarCard(p); pintarBarra();
  });
  $("#cp").addEventListener("input", (e) => { cp = e.target.value.replace(/\D/g, "").slice(0, 5); e.target.value = cp; pintarEnvio(); pintarBarra(); });
  $("#enviar").addEventListener("click", () => { window.open("https://wa.me/?text=" + encodeURIComponent(textoPedido()), "_blank", "noopener"); });

  // ---- pestañas ----
  const vistas = { catalogo: "#v-catalogo", asistente: "#v-asistente", taller: "#v-taller" };
  function verTab(cual) {
    Object.keys(vistas).forEach((k) => {
      const on = k === cual;
      $("#tab-" + k).setAttribute("aria-selected", on);
      $(vistas[k]).hidden = !on;
    });
    $("#barra").style.display = cual === "catalogo" ? "" : "none";
    window.scrollTo({ top: 0, behavior: "auto" });
    if (anim) G.fromTo(vistas[cual], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "all" });
    if (cual === "taller") pintarBarrasSemana();
    if (cual === "asistente") $("#chat").scrollTop = $("#chat").scrollHeight;
    if (ST) setTimeout(() => ST.refresh(), 60);
  }
  Object.keys(vistas).forEach((k) => $("#tab-" + k).addEventListener("click", () => verTab(k)));
  $("#marca").addEventListener("click", (e) => { e.preventDefault(); verTab("catalogo"); });

  // =================== ASISTENTE DE WHATSAPP ===================
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const COLORES_RE = [
    [/\broj[oa]s?\b/, "rojo"], [/\b(azul(es)?|cobaltos?)\b/, "cobalto"], [/\bverdes?\b/, "verde"],
    [/\b(ambares?|amarill[oa]s?)\b/, "ambar"], [/\b(aquas?|turquesas?)\b/, "aqua"], [/\b(humos?|gris(es)?)\b/, "humo"]
  ];
  const colorDe = (t) => { const m = COLORES_RE.find(([re]) => re.test(t)); return m ? m[1] : null; };
  const chat = $("#chat"), chips = $("#chips");
  let ctx = null, esperaCP = false, ocupado = false;

  function burbuja(texto, tipo, html) {
    const d = document.createElement("div");
    d.className = "burbuja " + tipo;
    if (html) d.innerHTML = texto; else d.textContent = texto;
    chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
  }
  function bot(texto, sigChips) {
    ocupado = true;
    const t = document.createElement("div"); t.className = "escribiendo"; t.innerHTML = "<i></i><i></i><i></i>";
    chat.appendChild(t); chat.scrollTop = chat.scrollHeight;
    setTimeout(() => { t.remove(); burbuja(texto, "entra", true); ocupado = false; pintarChips(sigChips); }, reducido ? 50 : 750);
  }
  function pintarChips(lista) {
    const l = lista || ["100 vasos roca cobalto", "¿Qué hay en existencia?", "24 copas aqua", "Lista de precios", "Envío a 45400"];
    chips.innerHTML = l.map((c) => `<button type="button">${esc(c)}</button>`).join("");
  }
  const hallarPieza = (t) => D.piezas.find((p) => p.palabras.some((w) => new RegExp("\\b" + w + "s?\\b").test(t)));
  function cantidadDe(t, p) {
    const pal = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, diez: 10 };
    let m = t.match(/\b(\d+|una?|dos|tres|cuatro|cinco|seis|diez)\s+(docenas?|cajas?)\b/);
    if (m) return (isNaN(m[1]) ? pal[m[1]] : +m[1]) * (m[2].startsWith("docena") ? 12 : p.caja);
    m = t.match(/\b(\d{1,5})\b/);
    return m ? +m[1] : null;
  }
  function textoEnvio(c) {
    const z = zonaCP(c);
    return z ? `Envío a <b>${esc(c)}</b> (${z.zona}): <b>${mxn(z.costo)}</b>, llega en ${z.dias}.` : null;
  }
  function responder(txt) {
    const t = norm(txt), cpM = t.match(/\b(\d{5})\b/), sinCP = t.replace(/\b\d{5}\b/g, " ");
    const p = hallarPieza(sinCP);

    if (/^(si|claro|dale|ok|va|mandeme|mandalo)\b/.test(t) && ctx) {
      esperaCP = true;
      const u = unidad(ctx.p, ctx.q);
      return bot(`Listo, le dejo su pedido armado:\n<b>${ctx.q} × ${ctx.p.nombre}${ctx.color ? ", " + ctx.color : ""}</b> = ${mxn(ctx.q * u)}\n\n¿A qué código postal se lo mandamos para calcular el envío?`, ["45400", "06600", "64000"]);
    }
    if (cpM && (esperaCP || /(envio|cp|codigo|postal|mandar|llega)/.test(t) || sinCP.trim() === "")) {
      const e = textoEnvio(cpM[1]);
      if (!e) return bot("Ese código postal no lo reconozco. Son 5 números, por ejemplo 45400.");
      if (esperaCP && ctx) {
        esperaCP = false;
        const sub = ctx.q * unidad(ctx.p, ctx.q), ex = sub >= D.extra.desde ? Math.round(sub * E.xp / 100) : 0, z = zonaCP(cpM[1]);
        return bot(`${e}\n\nTotal con envío: <b>${mxn(sub - ex + z.costo)}</b>${ex ? ` (ya con ${E.xp}% extra por pedido grande)` : ""}.\nEn un momento el taller le confirma y le manda la guía.`, ["Lista de precios", "¿Qué hay en existencia?"]);
      }
      return bot(e + "\nSi quiere, dígame qué piezas necesita y le cotizo todo junto.");
    }
    if (p) {
      const q = cantidadDe(sinCP, p);
      const color = colorDe(t);
      if (color && !p.colores.includes(color))
        return bot(`De ${p.nombre.toLowerCase()} tenemos estos colores: ${p.colores.map((c) => D.colores[c].n.toLowerCase()).join(", ")}. ¿Cuál le gusta?`, p.colores.slice(0, 4).map((c) => `${q || 24} ${p.nombre.toLowerCase()} ${D.colores[c].n.toLowerCase()}`));
      const bp = E.precio[p.id], t12 = Math.round(bp * (1 - E.d12 / 100)), t48 = Math.round(bp * (1 - E.d48 / 100));
      if (!q) return bot(`<b>${p.nombre}</b>: ${mxn(bp)} de 1 a 11 · <b>${mxn(t12)}</b> desde 12 · <b>${mxn(t48)}</b> desde 48.\n¿Cuántas necesita y en qué color?`, [`24 ${p.nombre.toLowerCase()}`, `48 ${p.nombre.toLowerCase()}`, `1 caja de ${p.nombre.toLowerCase()}`]);
      const u = unidad(p, q), sub = q * u, ex = sub >= D.extra.desde ? Math.round(sub * E.xp / 100) : 0, po = sobrePedido(p, q);
      const cn = color ? D.colores[color].n.toLowerCase() : null;
      ctx = { p, q, color: cn };
      const l = [`<b>${q} × ${p.nombre}${cn ? ", " + cn : ""}</b>`,
        `Precio: ${mxn(u)} c/u${pct(q) ? ` (ya con ${pct(q)}% por volumen)` : ""}`,
        `Subtotal: <b>${mxn(sub)}</b>`];
      if (ex) l.push(`Como pasa de ${mxn(D.extra.desde)}, le descuento ${E.xp}% extra: <b>${mxn(sub - ex)}</b>`);
      l.push(po === 0 ? `Lo tenemos en existencia: sale en ${D.envios[0].dias.replace("2 a 3", "1 a 2")}.` : `Hay ${E.exist[p.id]} en existencia; ${po} se fabrican sobre pedido (≈ ${D.diasSobrePedido} días).`);
      l.push(sub < E.minimo ? `Para mayoreo el pedido mínimo es ${mxn(E.minimo)}: le faltan ${mxn(E.minimo - sub)}. ¿Le sumo otra pieza?` : `Ya cumple el mínimo de mayoreo.`);
      l.push("", "¿Se lo armo?");
      return bot(l.join("\n"), ["Sí, mándeme el pedido", "Envío a 45400", "Lista de precios"]);
    }
    if (/(existencia|inventario|disponible|stock|que hay|tienen)/.test(t)) {
      const l = D.piezas.map((x) => `• ${x.nombre}: ${E.exist[x.id] > 0 ? "<b>" + E.exist[x.id] + "</b>" + (E.exist[x.id] <= x.caja * 4 ? " (quedan pocas)" : "") : "sobre pedido"}`);
      return bot("Esto es lo que hay hoy en existencia:\n" + l.join("\n") + `\nLo demás se fabrica en ≈ ${D.diasSobrePedido} días.`);
    }
    if (/(precio|lista|catalogo|cuanto|cuesta|costo)/.test(t)) {
      const l = D.piezas.map((x) => { const b = E.precio[x.id]; return `• ${x.nombre}: ${mxn(b)} · ${mxn(Math.round(b * (1 - E.d12 / 100)))} · ${mxn(Math.round(b * (1 - E.d48 / 100)))}`; });
      return bot(`Precios por pieza (de 1 a 11 · desde 12 · desde 48):\n${l.join("\n")}\n\nPedido mínimo de mayoreo: ${mxn(E.minimo)}.`);
    }
    if (/(hola|buen|buenas|que tal)/.test(t)) return bot("¡Buen día! Dígame qué piezas necesita, en qué color y cuántas, y le cotizo al momento.");
    return bot("Con gusto le ayudo. Pregúnteme por una pieza y una cantidad, por ejemplo: <b>100 vasos roca cobalto</b>, o por lo que hay en existencia.");
  }
  function enviarChat(txt) {
    const v = txt.trim(); if (!v || ocupado) return;
    burbuja(v, "sale"); chips.innerHTML = "";
    responder(v);
  }
  $("#form-chat").addEventListener("submit", (e) => { e.preventDefault(); const i = $("#msg"); enviarChat(i.value); i.value = ""; });
  chips.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) enviarChat(b.textContent); });
  burbuja(`¡Buen día! Soy el asistente de <b>${esc(D.negocio)}</b>. Dígame qué piezas necesita, en qué color y cuántas, y le cotizo al momento.`, "entra", true);
  pintarChips();

  // =================== SU TALLER ===================
  const HOY = { pedidos: 3, confirmados: 1, porSurtir: 2 };
  const thumb = (forma, hex) => `<svg class="vidrio" viewBox="0 0 140 150" aria-hidden="true">${V.pieza(forma, hex)}</svg>`;
  let semanaPintada = false;

  function pintarHoy() {
    const baja = D.piezas.map((p) => ({ p, r: E.exist[p.id] / p.caja })).sort((a, b) => a.r - b.r)[0];
    $("#saludo").textContent = `Buen día. Hoy le llegaron ${HOY.pedidos} pedidos`;
    $("#hoy").innerHTML =
      `<div class="dato"><div class="n">${HOY.pedidos}</div><p><b>pedidos nuevos hoy.</b> ${HOY.confirmados} ya está confirmado; los demás esperan su visto bueno.</p></div>` +
      `<div class="dato"><div class="n">${HOY.porSurtir}</div><p><b>pedidos con piezas sobre pedido.</b> Se fabrican en ≈ ${D.diasSobrePedido} días y el cliente ya lo sabe.</p></div>` +
      `<div class="dato"><div class="n">${E.exist[baja.p.id]}</div><p><b>${baja.p.nombre.toLowerCase()}</b> en existencia: es lo que primero se le acaba.</p></div>`;
  }
  function pintarSemana() {
    const s = D.semana, max = Math.max(...s.pedidos), mejor = s.pedidos.indexOf(max), total = s.pedidos.reduce((a, b) => a + b, 0);
    $("#semana-frase").textContent = `Su mejor día fue el ${s.nombres[mejor]}: ${max} pedidos. En total fueron ${total} esta semana.`;
    $("#barras").innerHTML = s.dias.map((d, i) =>
      `<div class="${i === mejor ? "mejor" : ""}"><b>${s.pedidos[i]}</b><i data-h="${Math.round(s.pedidos[i] / max * 100)}" style="height:0"></i><span>${d}</span></div>`).join("");
  }
  function pintarBarrasSemana() {
    const barras = $$("#barras i");
    const poner = () => barras.forEach((i) => { i.style.height = Math.max(8, +i.dataset.h * 0.78) + "%"; });
    barras.forEach((i) => { i.style.height = "0"; });
    requestAnimationFrame(() => setTimeout(poner, 40));
  }
  function pintarTop() {
    const max = Math.max(...D.masPedido.map((m) => m.piezas));
    $("#top").innerHTML = D.masPedido.map((m) => {
      const p = pieza(m.id), c = D.colores[m.color];
      return `<li style="--c:${c.h}"><div class="m">${thumb(p.forma, c.h)}</div><div class="t">${p.nombre}<small>${c.n}</small></div><div class="v">${m.piezas}</div><div class="r"><i style="width:${Math.round(m.piezas / max * 100)}%"></i></div></li>`;
    }).join("");
  }
  function pintarWA() {
    const ej = D.pedidoEjemplo, items = ej.lineas.map(([q, nom, col]) => {
      const p = D.piezas.find((x) => x.nombre === nom), k = +q;
      return { k, nom, col, u: unidad(p, k) };
    });
    const sub = items.reduce((a, i) => a + i.k * i.u, 0), ex = sub >= D.extra.desde ? Math.round(sub * E.xp / 100) : 0, z = D.envios[0];
    const l = [`<b>Pedido de mayoreo · ${esc(ej.cliente)}</b>`, ""]
      .concat(items.map((i) => `• ${i.k} × ${i.nom}, ${i.col} · ${mxn(i.u)} c/u = ${mxn(i.k * i.u)}`))
      .concat(["", `Subtotal: ${mxn(sub)}`]);
    if (ex) l.push(`Descuento extra ${E.xp}%: −${mxn(ex)}`);
    l.push(`Envío a 45500 (${z.zona}): ${mxn(z.costo)}`, `<b>Total: ${mxn(sub - ex + z.costo)}</b>`);
    $("#wa-mock").innerHTML = `<div class="burbuja entra">${l.join("\n")}</div><div class="burbuja sale">¡Gracias! Confirmado, sale el jueves. En un momento le mando la guía.</div>`;
  }
  function pintarFilas() {
    $("#filas").innerHTML = D.piezas.map((p) => {
      const c = D.colores[p.colores[0]];
      return `<div class="f" style="--c:${c.h}"><div class="m">${thumb(p.forma, c.h)}</div><b>${p.nombre}</b>
        <div class="campos"><label>Precio $<input type="number" inputmode="decimal" min="1" step="1" name="precio-${p.id}" value="${E.precio[p.id]}" aria-label="Precio de ${p.nombre}"></label>
        <label>Hay <input type="number" inputmode="numeric" min="0" step="1" name="exist-${p.id}" value="${E.exist[p.id]}" aria-label="Existencia de ${p.nombre}"></label></div></div>`;
    }).join("");
  }
  const form = $("#form-panel");
  const campo = (nombre) => form.querySelector(`[name="${nombre}"]`);
  function ejemplos() {
    const a = pieza("VR-08"), b = E.precio[a.id];
    const d12 = +campo("d12").value, d48 = +campo("d48").value;
    $("#o-d12").textContent = d12 + "%"; $("#o-d48").textContent = d48 + "%"; $("#o-xp").textContent = campo("xp").value + "%";
    $("#ej-d12").textContent = `Ejemplo: 24 × ${a.nombre} = ${mxn(24 * b)} → ${mxn(24 * Math.round(b * (1 - d12 / 100)))}`;
    $("#ej-d48").textContent = `Ejemplo: 48 × ${a.nombre} = ${mxn(48 * b)} → ${mxn(48 * Math.round(b * (1 - d48 / 100)))}`;
    $("#xd").textContent = mxn(D.extra.desde);
  }
  function llenarForm() {
    campo("d12").value = E.d12; campo("d48").value = E.d48; campo("xp").value = E.xp; campo("minimo").value = E.minimo;
    pintarFilas(); ejemplos();
  }
  ["d12", "d48", "xp"].forEach((k) => campo(k).addEventListener("input", ejemplos));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("#ok"); msg.className = "ok mal";
    const d12 = +campo("d12").value, d48 = +campo("d48").value, xp = +campo("xp").value, minimo = parseFloat(campo("minimo").value);
    if (d48 < d12) { msg.textContent = "El descuento de 48 piezas debe ser igual o mayor al de 12."; return; }
    if (!(minimo >= 0)) { msg.textContent = "Revise el pedido mínimo."; return; }
    const precio = {}, exist = {};
    for (const p of D.piezas) {
      const pr = parseFloat(campo("precio-" + p.id).value), ex = parseInt(campo("exist-" + p.id).value, 10);
      if (!(pr > 0)) { msg.textContent = "Revise el precio de " + p.nombre + "."; return; }
      if (!(ex >= 0)) { msg.textContent = "Revise la existencia de " + p.nombre + "."; return; }
      precio[p.id] = pr; exist[p.id] = ex;
    }
    E = { d12, d48, xp, minimo, precio, exist };
    guardar(); pintarReglas(); actualizarTodas(); pintarBarra(); pintarHoy(); pintarWA(); ejemplos();
    msg.className = "ok"; msg.textContent = "¡Listo! Su catálogo ya está al día. Véalo en la pestaña Catálogo.";
  });

  // =================== arranque ===================
  // portada: las piezas salen calientes y se enfrían hasta su color
  $("#hero-svg").innerHTML = V.escena();
  const hero = $$("#hero-svg .escena-pieza");
  if (anim) {
    hero.forEach((s) => s.classList.add("caliente"));
    hero.forEach((s, i) => setTimeout(() => s.classList.remove("caliente"), 450 + i * 280));
  }
  crearGrid(); pintarReglas(); pintarBarra(); pintarEnvio();
  pintarHoy(); pintarSemana(); pintarTop(); pintarWA(); llenarForm();

  // aparición escalonada al hacer scroll: cada pieza se enfría al mostrarse
  if (anim && ST) {
    G.set(".pieza", { opacity: 0, y: 26 });
    ST.batch(".pieza", {
      start: "top 94%", once: true,
      onEnter: (b) => {
        G.to(b, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power2.out", clearProps: "transform" });
        b.forEach((el, i) => setTimeout(() => el.querySelector(".vidrio").classList.remove("caliente"), 120 + i * 90));
      }
    });
    // el texto de portada nunca se oculta: solo sube un poco al entrar
    G.from(".hero-txt > *", { y: 18, duration: 0.7, stagger: 0.09, ease: "power2.out", clearProps: "transform" });
    // red de seguridad: si por algo las animaciones de scroll no arrancan, todo se muestra
    setTimeout(() => { if (!ST.getAll().length) G.set(".pieza", { opacity: 1, y: 0 }); }, 3000);
  } else {
    $$("#grid .vidrio").forEach((s) => s.classList.remove("caliente"));
  }
})();
