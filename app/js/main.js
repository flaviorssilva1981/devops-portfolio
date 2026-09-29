const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Navbar, progresso de rolagem e menu mobile
const navbar = $("#navbar"), navLinks = $("#navLinks"), navToggle = $("#navToggle"), progress = $("#scrollProgress");
const onScroll = () => {
  navbar.classList.toggle("scrolled", scrollY > 20);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
$$("a", navLinks).forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}));

// Reveal on scroll com cascata entre irmãos
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-visible");
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
$$(".reveal").forEach((el) => {
  el.style.setProperty("--d", `${Math.min($$(".reveal", el.parentElement).indexOf(el), 5) * 80}ms`);
  io.observe(el);
});

// Contadores (valores do perfil)
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
    countIO.unobserve(el);
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 1300, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$(".stat-num").forEach((el) => countIO.observe(el));

// Spotlight nos cards que segue o cursor
$$(".sol, .proj").forEach((el) => el.addEventListener("pointermove", (ev) => {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${ev.clientX - r.left}px`);
  el.style.setProperty("--my", `${ev.clientY - r.top}px`);
}));

// Rede de partículas (canvas em resolução nativa/HiDPI)
(() => {
  const cv = $("#fx");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let w, h, dpr, pts = [];
  const mouse = { x: -999, y: -999 };
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(80, Math.floor((w * h) / 18000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 }));
  };
  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.fillStyle = "rgba(25,227,234,.65)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(139,92,255,${0.3 * (1 - d / 130)})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      const md = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
      if (md < 160) {
        ctx.strokeStyle = `rgba(25,227,234,${0.5 * (1 - md / 160)})`;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!reduceMotion) requestAnimationFrame(document.hidden ? () => setTimeout(draw, 500) : draw);
  };
  resize();
  draw();
})();

// Formulário: monta a mensagem e abre o WhatsApp (nada é armazenado no site)
const form = $("#contactForm"), formNote = $("#formNote");
if (form) {
  const WHATSAPP = "5511950783983";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const d = new FormData(form);
    const text = [
      "Olá, Dublin Consulting! Gostaria de solicitar um diagnóstico.",
      `Nome: ${d.get("name")}`,
      `E-mail: ${d.get("email")}`,
      `Empresa: ${d.get("company") || "-"}`,
      `Cloud: ${d.get("cloud") || "-"}`,
      `Tipo de projeto: ${d.get("type")}`,
      "",
      d.get("message"),
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    formNote.textContent = "Abrindo o WhatsApp com a sua mensagem. Confirme o envio por lá.";
  });
}
