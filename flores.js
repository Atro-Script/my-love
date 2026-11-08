(function () {
  const d = window.DATOS, $ = id => document.getElementById(id);
  const tema = d.tema || {}, pal = d.flores || {};
  const paletaMsg = pal.mensaje && pal.mensaje.length ? pal.mensaje : ["#FFD21F"];
  const paletaCampo = pal.campo && pal.campo.length ? pal.campo : paletaMsg;
  // Tema: variables CSS (acento, brillo "r g b", tarjeta1, tarjeta2, borde, tarjetaTxt, boton1, boton2, botonTxt, texto, suelo)
  ["acento", "brillo", "tarjeta1", "tarjeta2", "borde", "tarjetaTxt", "boton1", "boton2", "botonTxt", "texto", "suelo"].forEach(k => { if (tema[k]) document.documentElement.style.setProperty("--" + k, tema[k]); });
  const horizonte = (tema.horizonte || "255 214 60").replace(/,/g, " ").trim().split(/\s+/).join(","), cieloFin = tema.cielo || "#4B3A12", cieloMed = tema.cieloMedio || "#15163D";
  const cv = $("espacio"), ctx = cv.getContext("2d");
  let W = 0, H = 0, estrellas = [], motas = [], t0 = 0, fase = "espera", viajeT = 16000, versoIdx = -1, leidas = new Set(), previo = 0;
  document.title = d.titulo; $("titulo").textContent = d.titulo; $("sub").textContent = d.subtitulo;
  if (d.para) $("para").textContent = "Para " + d.para; else $("para").hidden = true;
  $("llegada").textContent = d.llegada;
  const alea = (a, b) => a + Math.random() * (b - a), elige = a => a[Math.floor(Math.random() * a.length)];
  function medir() { const r = window.devicePixelRatio || 1; W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0); }
  window.addEventListener("resize", medir); medir();
  for (let i = 0; i < 260; i++) estrellas.push({ x: alea(-1, 1), y: alea(-1, 1), z: alea(.05, 1) });
  for (let i = 0; i < 36; i++) motas.push({ x: Math.random(), y: alea(.4, 1), f: alea(0, 6.28), v: alea(.00002, .00007), r: alea(1, 2.4) });
  const planetas = [{ t: 3500, c: ["#FFB36B", "#B5481E"], lado: -1 }, { t: 7800, c: ["#8EC9FF", "#2D5FB5"], lado: 1 }, { t: 11800, c: ["#E9A8FF", "#7A2FB5"], lado: -1 }];
  function velocidad(t) { if (fase === "llegado") return .0006; if (t < 2500) return .0008 + t / 2500 * .02; if (t < viajeT - 3000) return .024; return Math.max(.0008, .024 * (viajeT - t) / 3000); }
  function dibujar(t, dt) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#03040F"); g.addColorStop(.7, fase === "llegado" ? cieloMed : "#080A24"); g.addColorStop(1, fase === "llegado" ? cieloFin : "#0C0F30");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H * (fase === "llegado" ? .35 : .5), v = velocidad(t) * dt / 16;
    if (fase !== "llegado") planetas.forEach(p => { const a = t - p.t; if (a < 0 || a > 4200) return; const k = a / 4200, r = 8 + k * k * W * .55, x = cx + p.lado * (30 + k * W * .55), y = cy + (k - .2) * H * .12; const rg = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); rg.addColorStop(0, p.c[0]); rg.addColorStop(1, p.c[1]); ctx.globalAlpha = Math.min(1, k * 4) * (1 - Math.max(0, k - .8) * 5); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
    estrellas.forEach(s => {
      const z0 = s.z; s.z -= v; if (s.z <= .02) { s.z = 1; s.x = alea(-1, 1); s.y = alea(-1, 1); return; }
      const k = W * .3, x0 = cx + s.x / z0 * k, y0 = cy + s.y / z0 * k, x1 = cx + s.x / s.z * k, y1 = cy + s.y / s.z * k;
      if (x1 < -50 || x1 > W + 50 || y1 < -50 || y1 > H + 50) { s.z = 1; return; }
      ctx.strokeStyle = "rgba(255,255,255," + (1 - s.z * .8).toFixed(2) + ")"; ctx.lineWidth = .6 + (1 - s.z) * 1.8; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    });
    if (fase === "llegado") {
      const h = ctx.createRadialGradient(cx, H * .85, 10, cx, H * .85, W * 1.05); h.addColorStop(0, "rgba(" + horizonte + ",.45)"); h.addColorStop(1, "rgba(" + horizonte + ",0)"); ctx.fillStyle = h; ctx.fillRect(0, 0, W, H);
      motas.forEach(m => { m.y -= m.v * dt; m.f += dt * .0015; if (m.y < .3) m.y = 1; const x = (m.x + Math.sin(m.f) * .02) * W, y = m.y * H; ctx.globalAlpha = .35 + .35 * Math.sin(m.f * 2); ctx.fillStyle = "rgb(" + horizonte + ")"; ctx.beginPath(); ctx.arc(x, y, m.r, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
    }
  }
  function cuadro(ahora) {
    const dt = Math.min(50, ahora - previo || 16); previo = ahora; const t = ahora - t0;
    if (fase === "viaje") {
      const i = Math.min(d.viaje.length - 1, Math.floor(t / ((viajeT - 3000) / d.viaje.length)));
      if (i !== versoIdx && t > 1200) { versoIdx = i; const v = $("verso"); v.classList.remove("ver"); void v.offsetWidth; v.textContent = d.viaje[i]; v.classList.add("ver"); }
      if (t >= viajeT) llegar();
    }
    dibujar(fase === "espera" ? 0 : t, dt); requestAnimationFrame(cuadro);
  }
  // Flor dibujada una sola vez (symbol) y reutilizada: así caben cientos sin pesar.
  const SIMBOLO = (function () {
    let p1 = "", p2 = "", sem = "";
    for (let k = 0; k < 13; k++) p1 += '<ellipse class="petalo" cx="30" cy="10.5" rx="5" ry="11.5" transform="rotate(' + (k * 27.7).toFixed(1) + ' 30 30)"/>';
    for (let k = 0; k < 9; k++) p2 += '<ellipse class="petalo petalo2" cx="30" cy="17" rx="4.2" ry="8" transform="rotate(' + (k * 40 + 14) + ' 30 30)"/>';
    for (let k = 0; k < 7; k++) { const a = k * 2.4, r = 1.2 + k * .65; sem += '<circle class="semilla" cx="' + (30 + Math.cos(a) * r).toFixed(1) + '" cy="' + (30 + Math.sin(a) * r).toFixed(1) + '" r=".7"/>'; }
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="flor-sim" viewBox="0 0 60 120" overflow="visible"><path class="tallo" d="M30 34c-2 24 3 50 0 86"/><path class="hoja" d="M30 82c-14-3-22-11-24-20 12 0 22 6 24 20zM30 96c14-3 20-9 22-18-12 0-20 5-22 18z"/>' + p1 + p2 + '<circle class="centro" cx="30" cy="30" r="8.2"/><circle class="centro2" cx="30" cy="30" r="8.2"/>' + sem + '</symbol></defs></svg>';
  })();
  function flor(esMensaje, i, x, bottomPx, s, z) {
    const b = document.createElement("button"); b.type = "button"; b.className = "flor" + (esMensaje ? " msg mece" : Math.random() < .55 ? " mece" : "");
    b.style.left = x + "px"; b.style.bottom = bottomPx + "px"; b.style.setProperty("--s", s.toFixed(2)); b.style.zIndex = z; b.style.color = esMensaje ? paletaMsg[i % paletaMsg.length] : elige(paletaCampo);
    if (b.classList.contains("mece")) b.style.animationDelay = (-Math.random() * 4).toFixed(2) + "s";
    b.innerHTML = '<svg viewBox="0 0 60 120" aria-hidden="true"><use href="#flor-sim"/></svg>';
    if (esMensaje) { const m = d.mensajes[i]; b.setAttribute("aria-label", "Flor con un mensaje: " + m.titulo); b.onclick = () => abrir(i, b); } else { b.tabIndex = -1; b.setAttribute("aria-hidden", "true"); b.onclick = () => { b.classList.add("florece"); setTimeout(() => b.classList.remove("florece"), 900); }; }
    return b;
  }
  function abrir(i, b) { const m = d.mensajes[i]; $("tTit").textContent = m.titulo; $("tTxt").textContent = m.texto; $("tTxt").scrollTop = 0; $("tarjeta").hidden = false; b.classList.add("leida"); leidas.add(i); $("progreso").textContent = "Flores leídas: " + leidas.size + " de " + d.mensajes.length; $("cerrar").focus(); }
  $("cerrar").onclick = () => { $("tarjeta").hidden = true; if (leidas.size === d.mensajes.length) { $("final").hidden = false; $("final").textContent = d.final; $("campo").classList.add("completo"); } };
  function sembrar() {
    const c = $("flores"); c.replaceChildren(); c.insertAdjacentHTML("afterbegin", SIMBOLO);
    const cw = c.clientWidth, ch = c.clientHeight, FILAS = 11, alto = ch * .66, escala = k => .34 + k * .72, f = document.createDocumentFragment();
    for (let r = 0; r < FILAS; r++) {                       // r=0 lejos (arriba, pequeñas) … r=FILAS-1 cerca (abajo, grandes)
      const k = r / (FILAS - 1), s = escala(k), paso = 58 * s * .78, bottom = (1 - k) * alto - 6;
      for (let x = -paso * .5; x < cw + paso; x += paso) f.append(flor(false, 0, x + alea(-.35, .35) * paso, bottom + alea(-5, 5), s * alea(.9, 1.12), 10 + r * 10));
    }
    const n = d.mensajes.length, profundidad = [.5, .78, .42, .86, .6, .7, .46, .82];
    for (let i = 0; i < n; i++) {
      const k = profundidad[i % profundidad.length], s = escala(k) * 1.35, ancho = 58 * s, cx = cw * (.1 + .8 * (n === 1 ? .5 : i / (n - 1)));
      f.append(flor(true, i, Math.max(4, Math.min(cw - ancho - 4, cx - ancho / 2)), (1 - k) * alto - 4, s, 500 + i));
    }
    c.append(f);
  }
  function llegar() {
    if (fase === "llegado") return; fase = "llegado"; $("verso").textContent = ""; $("saltar").hidden = true; $("campo").hidden = false; $("intro").hidden = true;
    sembrar(); $("progreso").textContent = "Flores leídas: 0 de " + d.mensajes.length;
  }
  let ancho0 = innerWidth; window.addEventListener("resize", () => { if (fase === "llegado" && Math.abs(innerWidth - ancho0) > 60 && !leidas.size) { ancho0 = innerWidth; sembrar(); } });
  $("partir").onclick = () => { fase = "viaje"; t0 = performance.now(); $("intro").hidden = true; $("saltar").hidden = false; };
  $("saltar").onclick = llegar;
  requestAnimationFrame(cuadro);
  window.FloresAmarillas = { llegar, estado: () => ({ fase, flores: $("flores").querySelectorAll(".flor").length, leidas: leidas.size }) };
})();
