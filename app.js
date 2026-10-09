(function () {
  const D = window.DEMO, F = window.FORMAS;
  const $ = (s) => document.querySelector(s);
  const mxn = (n) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fecha = (d) => d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });

  // ---- vigencia: la demo se retira sola después de la fecha publicada en el aviso ----
  const fin = new Date(D.expira + "T23:59:59");
  $("#aviso-fecha").textContent = fecha(fin);
  if (new Date() > fin) {
    $("#venc-fecha").textContent = fecha(fin);
    $("#vencido").hidden = false;
    document.querySelector("main").remove();
    $(".top").remove();
    $("#aviso").remove();
    return;
  }

  // ---- nombre del negocio (opcional): ?n=Nombre. Solo cambia el título; las piezas siguen siendo de ejemplo ----
  const n = (new URLSearchParams(location.search).get("n") || "").replace(/[<>]/g, "").trim().slice(0, 40);
  if (n) {
    D.negocio = n;
    $("#marca").textContent = n;
    document.title = n + " · Catálogo mayorista (demo de Vonoa)";
  }
  $("#ciudad").textContent = "Mayoreo · " + D.ciudad;

  // ---- estado editable desde el panel (se recuerda solo en este navegador) ----
  const base = () => ({
    d12: D.descuentos.d12, d48: D.descuentos.d48, minimo: D.minimo,
    precio: Object.fromEntries(D.piezas.map((p) => [p.id, p.precio])),
    exist: Object.fromEntries(D.piezas.map((p) => [p.id, p.existencia]))
  });
  let estado = base();
  const CLAVE = "vonoa-vidrio-demo";
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (g && g.precio && g.exist && D.piezas.every((p) => g.precio[p.id] > 0 && g.exist[p.id] >= 0)) estado = g;
  } catch (e) { /* sin almacenamiento: se usan los valores de ejemplo */ }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {} };

  const pedido = {};   // "ID|color" -> cantidad
  const elegido = {};  // ID -> color mostrado en la tarjeta
  D.piezas.forEach((p) => { elegido[p.id] = p.colores[0]; });
  let foco = null;

  const qtySku = (id) => Object.keys(pedido).reduce((s, k) => s + (k.startsWith(id + "|") ? pedido[k] : 0), 0);
  const pct = (q) => (q >= 48 ? estado.d48 : q >= 12 ? estado.d12 : 0);
  const unidad = (p, q) => Math.round(estado.precio[p.id] * (1 - pct(q) / 100));
  const sobrePedido = (p, q) => Math.max(0, q - estado.exist[p.id]);

  // ---- reglas visibles ----
  function pintarReglas() {
    $("#reglas").innerHTML =
      `<li><span class="spec">12+ piezas</span><span class="v">−${estado.d12}%</span><span class="f">por pieza</span></li>` +
      `<li><span class="spec">48+ piezas</span><span class="v">−${estado.d48}%</span><span class="f">por pieza</span></li>` +
      `<li><span class="spec">Mínimo</span><span class="v">${mxn(estado.minimo)}</span><span class="f">por pedido</span></li>`;
  }

  // ---- catálogo ----
  function pintarGrid() {
    $("#grid").innerHTML = D.piezas.map((p) => {
      const q = qtySku(p.id), col = elegido[p.id], cn = D.colores[col];
      const enColor = pedido[p.id + "|" + col] || 0;
      const u = unidad(p, q), baseP = estado.precio[p.id];
      const po = sobrePedido(p, q);
      const t12 = Math.round(baseP * (1 - estado.d12 / 100)), t48 = Math.round(baseP * (1 - estado.d48 / 100));
      const act = q >= 48 ? 2 : q >= 12 ? 1 : 0;
      const dots = p.colores.map((c) =>
        `<button class="dot" data-a="color" data-c="${c}" style="--c:${D.colores[c].h}" aria-pressed="${c === col}" aria-label="${D.colores[c].n}"></button>`
      ).join("");
      const exist = estado.exist[p.id] <= 0
        ? `<div class="exist po">Sobre pedido · ${D.diasSobrePedido} días</div>`
        : po > 0
          ? `<div class="exist po">${po} pza${po === 1 ? "" : "s"} sobre pedido · ${D.diasSobrePedido} días</div>`
          : `<div class="exist">Hay ${estado.exist[p.id]} en existencia</div>`;
      return `<li class="pieza${q ? " en-pedido" : ""}" data-id="${p.id}">
        <div class="foto"><svg viewBox="0 0 120 120" class="vidrio" style="--c:${cn.h}" aria-hidden="true">${F[p.forma]}</svg></div>
        <div class="info">
          <h3>${p.nombre}</h3>
          <div class="meta">${p.medida}${p.cap !== "—" ? " · " + p.cap : ""} · caja de ${p.caja}</div>
          <div class="colores" role="group" aria-label="Color de ${p.nombre}">${dots}</div>
          <div class="color-nombre">${cn.n}${enColor ? " · " + enColor + " en este color" : ""}</div>
          <div class="precio">${u < baseP ? `<s>${mxn(baseP)}</s>` : ""}${mxn(u)} <small>c/u</small></div>
          <div class="escala"><span class="${act === 0 ? "act" : ""}">1–11 ${mxn(baseP)}</span><span class="${act === 1 ? "act" : ""}">12+ ${mxn(t12)}</span><span class="${act === 2 ? "act" : ""}">48+ ${mxn(t48)}</span></div>
          ${exist}
          <div class="fila">
            <div class="cant" role="group" aria-label="Cantidad de ${p.nombre} en ${cn.n}">
              <button data-a="menos" aria-label="Quitar una">−</button>
              <output>${enColor}</output>
              <button data-a="mas" aria-label="Agregar una">+</button>
            </div>
            <button class="caja" data-a="caja">+ caja (${p.caja})</button>
          </div>
        </div></li>`;
    }).join("");
    if (foco) {
      const sel = `[data-id="${foco.id}"] [data-a="${foco.a}"]` + (foco.c ? `[data-c="${foco.c}"]` : "");
      const el = $("#grid").querySelector(sel);
      if (el) el.focus({ preventScroll: true });
    }
  }

  function totales() {
    let piezas = 0, total = 0, po = 0;
    for (const p of D.piezas) {
      const q = qtySku(p.id);
      piezas += q; total += q * unidad(p, q); po += sobrePedido(p, q);
    }
    return { piezas, total, po };
  }

  function pintarBarra() {
    const t = totales();
    $("#total").textContent = mxn(t.total);
    $("#detalle").textContent = `${t.piezas} pieza${t.piezas === 1 ? "" : "s"}`;
    const falta = estado.minimo - t.total, el = $("#falta");
    if (t.piezas === 0) { el.textContent = `Mínimo de mayoreo: ${mxn(estado.minimo)}`; el.className = "falta"; }
    else if (falta > 0) { el.textContent = `Faltan ${mxn(falta)} para el mínimo`; el.className = "falta"; }
    else { el.textContent = "Ya cumple el mínimo de mayoreo"; el.className = "falta listo"; }
    $("#po").textContent = t.po > 0 ? `Incluye ${t.po} pza${t.po === 1 ? "" : "s"} sobre pedido (≈ ${D.diasSobrePedido} días)` : "";
    $("#enviar").disabled = t.piezas === 0 || falta > 0;
  }

  function textoPedido() {
    const lineas = [`Pedido de mayoreo (demo) · ${D.negocio}`, ""];
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
    const t = totales();
    lineas.push("", `Total: ${mxn(t.total)} · ${t.piezas} piezas`, "", "Nombre:", "Ciudad:");
    return lineas.join("\n");
  }

  // ---- eventos del catálogo ----
  $("#grid").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const li = b.closest(".pieza"); const p = D.piezas.find((x) => x.id === li.dataset.id);
    const a = b.dataset.a, k = p.id + "|" + elegido[p.id];
    foco = { id: p.id, a, c: b.dataset.c || null };
    if (a === "color") elegido[p.id] = b.dataset.c;
    else if (a === "mas") pedido[k] = (pedido[k] || 0) + 1;
    else if (a === "menos") pedido[k] = Math.max(0, (pedido[k] || 0) - 1);
    else if (a === "caja") pedido[k] = (pedido[k] || 0) + p.caja;
    pintarGrid(); pintarBarra();
  });
  $("#enviar").addEventListener("click", () => {
    window.open("https://wa.me/?text=" + encodeURIComponent(textoPedido()), "_blank", "noopener");
  });

  // ---- pestañas ----
  function verTab(cual) {
    const cliente = cual === "cliente";
    $("#tab-cliente").setAttribute("aria-selected", cliente);
    $("#tab-panel").setAttribute("aria-selected", !cliente);
    $("#vista-cliente").hidden = !cliente;
    $("#vista-panel").hidden = cliente;
    $("#barra").style.display = cliente ? "" : "none";
    window.scrollTo({ top: 0 });
  }
  $("#tab-cliente").addEventListener("click", () => verTab("cliente"));
  $("#tab-panel").addEventListener("click", () => verTab("panel"));

  // ---- panel del fabricante ----
  const form = $("#form-panel");
  const campo = (nombre) => form.querySelector(`[name="${nombre}"]`);
  const ej = D.piezas[0];

  function pintarEjemplo(d12) {
    const q = 24, bruto = q * estado.precio[ej.id];
    const d = d12 ?? estado.d12, neto = Math.round(q * Math.round(estado.precio[ej.id] * (1 - d / 100)));
    $("#ej-pieza").textContent = `${q} ${ej.nombre.toLowerCase()}: ${mxn(bruto)} → ${mxn(neto)} con ${d}% (el cliente lo ve solo al llegar a 12)`;
  }
  function llenarForm() {
    campo("d12").value = estado.d12; campo("d48").value = estado.d48; campo("minimo").value = estado.minimo;
    $("#tabla-cuerpo").innerHTML = D.piezas.map((p) =>
      `<tr><td>${p.nombre}</td>` +
      `<td>$<input type="number" inputmode="decimal" min="1" step="1" name="precio-${p.id}" aria-label="Precio de ${p.nombre}" value="${estado.precio[p.id]}"></td>` +
      `<td><input type="number" inputmode="numeric" min="0" step="1" name="exist-${p.id}" aria-label="Existencia de ${p.nombre}" value="${estado.exist[p.id]}"></td></tr>`
    ).join("");
    pintarEjemplo();
  }
  campo("d12").addEventListener("input", (e) => { const v = parseFloat(e.target.value); if (v >= 0 && v <= 60) pintarEjemplo(v); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d12 = parseFloat(campo("d12").value), d48 = parseFloat(campo("d48").value), minimo = parseFloat(campo("minimo").value);
    const msg = $("#ok"); msg.style.color = "#B3261E";
    if (!(d12 >= 0 && d12 <= 60) || !(d48 >= 0 && d48 <= 60)) { msg.textContent = "Los descuentos van de 0 a 60 %."; return; }
    if (d48 < d12) { msg.textContent = "El descuento de 48 piezas debe ser igual o mayor al de 12."; return; }
    if (!(minimo >= 0)) { msg.textContent = "Revise el pedido mínimo."; return; }
    const precio = {}, exist = {};
    for (const p of D.piezas) {
      const pr = parseFloat(form.querySelector(`[name="precio-${p.id}"]`).value);
      const ex = parseInt(form.querySelector(`[name="exist-${p.id}"]`).value, 10);
      if (!(pr > 0)) { msg.textContent = "Revise el precio de " + p.nombre + "."; return; }
      if (!(ex >= 0)) { msg.textContent = "Revise la existencia de " + p.nombre + "."; return; }
      precio[p.id] = pr; exist[p.id] = ex;
    }
    estado = { d12, d48, minimo, precio, exist };
    guardar();
    pintarReglas(); pintarGrid(); pintarBarra(); pintarEjemplo();
    msg.style.color = ""; msg.textContent = `Listo: ${D.piezas.length} piezas actualizadas. Véalo en "Lo que ve su cliente".`;
  });

  pintarReglas(); pintarGrid(); pintarBarra(); llenarForm();
})();
