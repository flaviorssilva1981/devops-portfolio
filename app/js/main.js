// Ano no rodapé
document.getElementById("year").textContent = new Date().getFullYear();

// Navbar com sombra ao rolar + menu mobile
const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("navLinks");
const navToggle = document.getElementById("navToggle");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 12);
});

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// Reveal animations on scroll
const animatedEls = document.querySelectorAll("[data-animate]");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
animatedEls.forEach((el) => revealObserver.observe(el));

// Contador animado das estatísticas do hero
const counters = document.querySelectorAll(".stat-num");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.floor(progress * target);
        el.textContent = value + (target >= 90 ? "" : "");
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((el) => countObserver.observe(el));

// Formulário de contato: site estático, sem backend. Abre o cliente de e-mail
// do visitante com a mensagem pré-preenchida (sem enviar dados a terceiros).
const form = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
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

  window.location.href =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  formNote.textContent =
    "Abrindo seu aplicativo de e-mail. Se nada abrir, escreva para " +
    CONTACT_EMAIL + " ou chame no WhatsApp.";
});
