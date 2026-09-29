const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

$("#year").textContent = new Date().getFullYear();

// Navbar e menu mobile
const navbar = $("#navbar"), navLinks = $("#navLinks"), navToggle = $("#navToggle");
addEventListener("scroll", () => navbar.classList.toggle("scrolled", scrollY > 20), { passive: true });
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
}, { threshold: 0.15 });
$$(".reveal").forEach((el) => {
  el.style.setProperty("--d", `${Math.min($$(".reveal", el.parentElement).indexOf(el), 5) * 90}ms`);
  io.observe(el);
});

// Contador (valor do perfil: ~7 anos)
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
    countIO.unobserve(el);
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 1200, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$(".trust-num").forEach((el) => countIO.observe(el));

// Abas acessíveis (setas, Home/End)
(() => {
  const tabs = $$('[role="tab"]', $("#tabs"));
  const select = (i, focus) => {
    tabs.forEach((t, n) => {
      const on = n === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      select((k + tabs.length) % tabs.length, true);
    });
  });
})();

// Formulário: monta a mensagem e abre o WhatsApp (nada é armazenado no site)
const form = $("#contactForm"), formNote = $("#formNote");
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
