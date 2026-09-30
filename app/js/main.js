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

// Vídeo do hero: só baixa e toca depois que a página carregou (fotos e fontes primeiro), não toca com
// "menos movimento", economia de dados ou conexão lenta, pausa fora da tela e pode ser pausado (WCAG 2.2.2).
// Sem JS ou sem suporte a WebM, o poster permanece.
const heroVideo = $(".hero-video"), heroPause = $("#heroPause");
if (heroVideo && heroPause) {
  const conn = navigator.connection;
  const slow = Boolean(conn && (conn.saveData || /2g|3g/.test(conn.effectiveType || "")));
  let userPaused = matchMedia("(prefers-reduced-motion: reduce)").matches || slow;
  let pageLoaded = document.readyState === "complete", inView = true;
  const label = () => {
    heroPause.classList.toggle("is-paused", userPaused);
    heroPause.setAttribute("aria-label", userPaused ? "Reproduzir animação de fundo" : "Pausar animação de fundo");
  };
  const play = () => {
    if (userPaused || !pageLoaded || !inView) return;
    heroVideo.play().catch((err) => { if (err.name === "NotSupportedError") heroPause.hidden = true; });
  };
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) play(); else heroVideo.pause(); }, { threshold: 0.1 }).observe(heroVideo);
  if (!pageLoaded) addEventListener("load", () => { pageLoaded = true; setTimeout(play, 300); }, { once: true });
  heroPause.addEventListener("click", () => {
    userPaused = !userPaused;
    pageLoaded = true;
    label();
    if (userPaused) heroVideo.pause(); else play();
  });
  label();
  heroPause.hidden = false;
}

// Tecnologias ficam recolhidas: abre o bloco quando alguém chega por #tecnologias
const techMore = $("#tecnologias");
if (techMore && techMore.tagName === "DETAILS") {
  const openIfTarget = () => { if (location.hash === "#tecnologias") techMore.open = true; };
  openIfTarget();
  addEventListener("hashchange", openIfTarget);
}

// Entrada ao rolar: uma vez por elemento, com cascata entre irmãos
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-visible");
    io.unobserve(e.target);
  });
}, { threshold: 0.05, rootMargin: "0px 0px -3% 0px" });
$$(".reveal").forEach((el) => {
  const sibs = $$(".reveal", el.parentElement);
  el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 5) * 60}ms`);
  io.observe(el);
});


// Formulário: monta a mensagem e abre o WhatsApp ou o e-mail, conforme o botão (nada é armazenado no site)
const form = $("#contactForm"), formNote = $("#formNote");
if (form) {
  const WHATSAPP = "5511950783983", EMAIL = "flavio.rssilva@gmail.com";
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
    if (event.submitter && event.submitter.value === "email") {
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Solicitação de diagnóstico")}&body=${encodeURIComponent(text)}`;
      formNote.textContent = "Abrindo o seu e-mail com a mensagem. Confirme o envio por lá.";
      return;
    }
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    formNote.textContent = "Abrindo o WhatsApp com a sua mensagem. Confirme o envio por lá.";
  });
}
