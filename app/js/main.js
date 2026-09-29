const doc = document.documentElement;
doc.classList.add("js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Menu mobile
const navLinks = $("#navLinks"), navToggle = $("#navToggle");
if (navLinks && navToggle) {
  const setOpen = (open) => {
    navLinks.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  navToggle.addEventListener("click", () => setOpen(!navLinks.classList.contains("open")));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setOpen(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

// Entrada ao rolar: uma vez por elemento, com cascata entre irmãos
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-visible");
    io.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
$$(".reveal").forEach((el) => {
  const sibs = $$(".reveal", el.parentElement);
  el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 5) * 60}ms`);
  io.observe(el);
});

// Mapa do hero: desenhado uma única vez ao carregar
const heroMap = $("#heroMap");
if (heroMap) requestAnimationFrame(() => heroMap.classList.add("is-drawn"));

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
