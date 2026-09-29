const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

$("#year").textContent = new Date().getFullYear();

// Navbar, barra de progresso e menu mobile
const navbar = $("#navbar"), navLinks = $("#navLinks"), navToggle = $("#navToggle"), progress = $("#scrollProgress");
const onScroll = () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  const tl = $("#timeline");
  if (tl) {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
    tl.style.setProperty("--tl", p.toFixed(3));
  }
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

// Reveal on scroll (com cascata entre irmãos)
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-visible");
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach((el) => {
  const siblings = $$(".reveal", el.parentElement);
  el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 90}ms`);
  io.observe(el);
});

// Contadores animados (valores verificáveis do perfil)
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
    countIO.unobserve(el);
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 1400, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$(".stat-num").forEach((el) => countIO.observe(el));

// Spotlight nos cards que segue o cursor
$$(".spot").forEach((el) => el.addEventListener("pointermove", (ev) => {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${ev.clientX - r.left}px`);
  el.style.setProperty("--my", `${ev.clientY - r.top}px`);
}));

// Carrossel do hero
(() => {
  const hero = $(".hero"), slides = $$(".slide"), dots = $$("#heroDots button");
  const SLIDE_MS = 6500;
  hero.style.setProperty("--slide-ms", `${SLIDE_MS}ms`);
  let idx = 0, timer = null;
  const go = (n) => {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === idx);
      s.setAttribute("aria-hidden", String(i !== idx));
    });
    dots.forEach((d, i) => d.setAttribute("aria-selected", String(i === idx)));
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    if (reduceMotion || hero.classList.contains("paused")) return;
    timer = setTimeout(() => go(idx + 1), SLIDE_MS);
  };
  $("#heroNext").addEventListener("click", () => go(idx + 1));
  $("#heroPrev").addEventListener("click", () => go(idx - 1));
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  hero.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(idx + 1);
    if (e.key === "ArrowLeft") go(idx - 1);
  });
  hero.addEventListener("pointerenter", () => { hero.classList.add("paused"); clearTimeout(timer); });
  hero.addEventListener("pointerleave", () => { hero.classList.remove("paused"); go(idx); });
  schedule();
})();

// Rede de partículas (canvas em resolução nativa/HiDPI) + brilho do cursor
(() => {
  const cv = $("#fx"), ctx = cv.getContext("2d"), glow = $("#cursorGlow");
  let w, h, dpr, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((w * h) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
  };
  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    glow.style.opacity = 1;
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.fillStyle = "rgba(25,227,234,.7)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.strokeStyle = `rgba(124,92,255,${0.28 * (1 - d / 130)})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      const mx = pts[i].x - mouse.x, my = pts[i].y - mouse.y, md = Math.hypot(mx, my);
      if (md < 160) {
        ctx.strokeStyle = `rgba(25,227,234,${0.5 * (1 - md / 160)})`;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!document.hidden) requestAnimationFrame(draw); else setTimeout(() => requestAnimationFrame(draw), 500);
  };
  resize();
  if (reduceMotion) { draw(); return; }
  requestAnimationFrame(draw);
})();

// Formulário de contato: site estático, sem backend. Abre o cliente de e-mail
// do visitante com a mensagem pré-preenchida (sem enviar dados a terceiros).
const form = $("#contactForm"), formNote = $("#formNote");
const CONTACT_EMAIL = "flavio.rssilva@gmail.com";
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = `Contato via portfólio — ${data.get("name")}`;
  const body = [
    `Nome: ${data.get("name")}`,
    `E-mail: ${data.get("email")}`,
    `Empresa: ${data.get("company") || "-"}`,
    "",
    data.get("message"),
  ].join("\n");
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  formNote.textContent = "Abrindo seu aplicativo de e-mail. Se nada abrir, escreva para " + CONTACT_EMAIL + " ou chame no WhatsApp.";
});
