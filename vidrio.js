/* Dibujo de vidrio soplado (SVG, sin fotos: es una demo).
   Cada pieza lleva: cuerpo translúcido, borde grueso, base refractiva, burbujitas de aire,
   brillo y la luz de color que el vidrio proyecta sobre la mesa. La capa ".hot" es el vidrio
   recién salido del horno: se enfría hasta su color. */
(function () {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mezclar(hex, t, con) {
    const a = rgb(hex), b = rgb(con);
    return "#" + a.map((v, i) => clamp(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  const oscuro = (h, t) => mezclar(h, t, "#000000");
  const claro = (h, t) => mezclar(h, t, "#ffffff");

  // Siluetas en un lienzo de 140 × 150. La mesa está en y = 132.
  const F = {
    roca: {
      cuerpo: "M36 40 L104 40 L97 112 Q96 122 86 122 L54 122 Q44 122 43 112 Z",
      rim: [70, 40, 34, 7], base: "M44 103 Q70 111 96 103 L97 112 Q96 122 86 122 L54 122 Q44 122 43 112 Z",
      hi: ["M44 50 L48 100", "M97 54 L95 82"], bub: [[58, 80, 1.8], [84, 66, 1.3], [64, 96, 1.2]], caus: [70, 132, 40, 5]
    },
    alto: {
      cuerpo: "M45 16 L95 16 L91 116 Q90 126 80 126 L60 126 Q50 126 49 116 Z",
      rim: [70, 16, 25, 5.5], base: "M50 104 Q70 111 90 104 L91 116 Q90 126 80 126 L60 126 Q50 126 49 116 Z",
      hi: ["M52 26 L55 98", "M91 30 L89 62"], bub: [[64, 60, 1.6], [78, 84, 1.2], [66, 40, 1.1]], caus: [70, 134, 32, 4.5]
    },
    tequilero: {
      cuerpo: "M48 62 L92 62 L88 116 Q87 124 79 124 L61 124 Q53 124 52 116 Z",
      rim: [70, 62, 22, 5], base: "M52 104 Q70 110 88 104 L88 116 Q87 124 79 124 L61 124 Q53 124 52 116 Z",
      hi: ["M55 70 L57 98"], bub: [[68, 86, 1.3]], caus: [70, 134, 26, 4]
    },
    mezcalero: {
      cuerpo: "M38 54 Q38 48 45 48 L95 48 Q102 48 102 54 L97 108 Q95 124 80 124 L60 124 Q45 124 43 108 Z",
      rim: [70, 48, 32, 6.5], base: "M44 100 Q70 110 96 100 L97 108 Q95 124 80 124 L60 124 Q45 124 43 108 Z",
      hi: ["M46 58 L49 94", "M98 60 L96 86"], bub: [[60, 78, 1.7], [82, 72, 1.2], [70, 92, 1.3]], caus: [70, 134, 38, 5]
    },
    copa: {
      cuerpo: "M42 20 Q42 76 70 78 Q98 76 98 20 Z",
      rim: [70, 20, 28, 6],
      partes: ["M66 78 L66 114 L74 114 L74 78 Z", "M46 126 Q70 116 94 126 L94 131 Q70 136 46 131 Z"],
      nudo: [70, 98, 6.5, 3],
      hi: ["M49 28 Q50 60 60 70"], bub: [[62, 46, 1.5], [78, 38, 1.1]], caus: [70, 138, 34, 4]
    },
    jarra: {
      cuerpo: "M44 24 L96 24 L103 116 Q103 128 91 128 L49 128 Q37 128 37 116 Z",
      rim: [70, 24, 26, 6], base: "M38 108 Q70 118 102 108 L103 116 Q103 128 91 128 L49 128 Q37 128 37 116 Z",
      asa: "M97 38 Q130 42 126 76 Q123 104 101 108",
      hi: ["M50 34 L47 104", "M98 36 L100 70"], bub: [[60, 60, 2], [82, 80, 1.4], [70, 100, 1.2], [88, 46, 1.1]], caus: [70, 136, 42, 5]
    },
    esfera: {
      circulo: [70, 86, 38],
      partes: ["M61 46 L79 46 L81 54 L59 54 Z"], aro: [70, 30, 6],
      hi: ["M44 76 Q48 60 62 54"], bub: [[62, 92, 1.8], [84, 100, 1.3], [74, 72, 1.1]], caus: [70, 134, 28, 4]
    },
    florero: {
      cuerpo: "M60 14 L80 14 L78 46 Q118 60 113 94 Q108 128 70 128 Q32 128 27 94 Q22 60 62 46 Z",
      rim: [70, 14, 10, 3.5], base: "M32 108 Q42 124 70 124 Q98 124 108 108 Q98 118 70 118 Q42 118 32 108 Z",
      hi: ["M38 78 Q40 64 54 56"], bub: [[56, 92, 2], [84, 84, 1.4], [70, 104, 1.2]], caus: [70, 136, 38, 5]
    }
  };

  let contador = 0;
  /* Devuelve el interior de un <svg viewBox="0 0 140 150"> con la pieza dibujada. */
  function pieza(forma, hex) {
    const f = F[forma], u = "v" + (++contador);
    const c0 = oscuro(hex, 0.4), c1 = hex, c2 = claro(hex, 0.38);
    const cuerpoEl = f.circulo
      ? (cls, extra) => `<circle class="${cls}" cx="${f.circulo[0]}" cy="${f.circulo[1]}" r="${f.circulo[2]}" ${extra || ""}/>`
      : (cls, extra) => `<path class="${cls}" d="${f.cuerpo}" ${extra || ""}/>`;
    const sombra = f.caus;
    let s = `<defs>
      <linearGradient id="${u}g" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${c0}" stop-opacity=".95"/><stop offset=".16" stop-color="${c1}" stop-opacity=".8"/>
        <stop offset=".48" stop-color="${c2}" stop-opacity=".5"/><stop offset=".84" stop-color="${c1}" stop-opacity=".76"/>
        <stop offset="1" stop-color="${c0}" stop-opacity=".95"/></linearGradient>
      <linearGradient id="${u}b" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${c2}" stop-opacity=".92"/><stop offset="1" stop-color="${c0}" stop-opacity=".98"/></linearGradient>
      <radialGradient id="${u}c"><stop offset="0" stop-color="${hex}" stop-opacity=".6"/><stop offset="1" stop-color="${hex}" stop-opacity="0"/></radialGradient>
      <filter id="${u}f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>
    </defs>`;
    // luz de color proyectada sobre la mesa
    s += `<ellipse cx="${sombra[0] + 6}" cy="${sombra[1]}" rx="${sombra[2] * 1.25}" ry="${sombra[3]}" fill="url(#${u}c)" filter="url(#${u}f)"/>`;
    s += `<ellipse cx="${sombra[0]}" cy="${sombra[1] - 1}" rx="${sombra[2] * 0.7}" ry="${sombra[3] * 0.55}" fill="#2B1B14" opacity=".16" filter="url(#${u}f)"/>`;
    // asa (detrás del cuerpo)
    if (f.asa) {
      s += `<path d="${f.asa}" fill="none" stroke="${c0}" stroke-width="9" stroke-linecap="round" opacity=".9"/>` +
           `<path d="${f.asa}" fill="none" stroke="${c1}" stroke-width="6" stroke-linecap="round" opacity=".8"/>` +
           `<path d="${f.asa}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".5" transform="translate(-1.2 -1)"/>`;
    }
    // pie y tallo
    (f.partes || []).forEach((d) => { s += `<path d="${d}" fill="url(#${u}b)" stroke="${claro(hex, 0.25)}" stroke-width="1.2" stroke-opacity=".8"/>`; });
    if (f.aro) s += `<circle cx="${f.aro[0]}" cy="${f.aro[1]}" r="${f.aro[2]}" fill="none" stroke="${c1}" stroke-width="2.4" opacity=".85"/><path d="M70 36 L70 46" stroke="${c1}" stroke-width="2.4"/>`;
    if (f.nudo) s += `<ellipse cx="${f.nudo[0]}" cy="${f.nudo[1]}" rx="${f.nudo[2]}" ry="${f.nudo[3]}" fill="url(#${u}b)" stroke="${claro(hex, 0.3)}" stroke-width="1"/>`;
    // cuerpo
    s += cuerpoEl("g", `fill="url(#${u}g)" stroke="${claro(hex, 0.3)}" stroke-width="1.6" stroke-linejoin="round"`);
    if (f.base) s += `<path d="${f.base}" fill="url(#${u}b)" opacity=".9"/>`;
    if (f.rim) {
      const r = f.rim;
      s += `<ellipse cx="${r[0]}" cy="${r[1]}" rx="${r[2]}" ry="${r[3]}" fill="${c0}" fill-opacity=".35" stroke="${claro(hex, 0.55)}" stroke-width="1.8"/>` +
           `<ellipse cx="${r[0]}" cy="${r[1] + 0.8}" rx="${r[2] - 3}" ry="${Math.max(r[3] - 2, 1.4)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`;
    }
    // burbujitas de aire: la huella del soplado a mano
    (f.bub || []).forEach((b) => { s += `<circle cx="${b[0]}" cy="${b[1]}" r="${b[2]}" fill="#fff" fill-opacity=".34" stroke="#fff" stroke-opacity=".6" stroke-width=".5"/>`; });
    // brillos
    (f.hi || []).forEach((d, i) => { s += `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${i ? 0.28 : 0.72}" stroke-width="${i ? 2 : 3.2}" stroke-linecap="round"/>`; });
    // vidrio recién salido del horno
    s += cuerpoEl("hot", `fill="#FF8A2B" filter="url(#${u}f)"`);
    return s;
  }

  /* Escena de portada: piezas sobre una mesa, con la luz del taller. viewBox 0 0 640 380 */
  function escena(opts) {
    const o = opts || {};
    const lista = [
      // [forma, color, x, y, ancho]
      ["florero", "#1E4FA8", 8, 60, 236],
      ["jarra", "#C98A1B", 214, 36, 268],
      ["copa", "#2FA9AE", 436, 120, 150],
      ["esfera", "#B83A2E", 500, 188, 128],
      ["mezcalero", "#2F7D5B", 380, 206, 128],
      ["tequilero", "#7E858B", 308, 232, 92]
    ];
    let s = `<defs>
      <radialGradient id="esc-luz" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#FFE3B8" stop-opacity=".95"/><stop offset=".55" stop-color="#F6D9B3" stop-opacity=".35"/><stop offset="1" stop-color="#F6D9B3" stop-opacity="0"/></radialGradient>
      <linearGradient id="esc-mesa" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#D9C3A2"/><stop offset="1" stop-color="#C8AE88"/></linearGradient>
    </defs>
    <rect width="640" height="380" fill="#F1E3CC"/>
    <rect width="640" height="380" fill="url(#esc-luz)"/>
    <rect y="296" width="640" height="84" fill="url(#esc-mesa)"/>
    <path d="M0 296 H640" stroke="#B89B72" stroke-width="2" opacity=".6"/>`;
    lista.forEach((p, i) => {
      const alto = p[4] * 150 / 140;
      s += `<svg class="vidrio escena-pieza" data-i="${i}" x="${p[2]}" y="${p[3] + (o.sube || 0)}" width="${p[4]}" height="${alto}" viewBox="0 0 140 150" overflow="visible">${pieza(p[0], p[1])}</svg>`;
    });
    return s;
  }

  window.Vidrio = { pieza, escena };
})();
