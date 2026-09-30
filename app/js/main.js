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

// Modal de conteúdo: <dialog> nativo (foco preso, Esc fecha, foco volta ao botão). Sem JS, o conteúdo completo
// continua visível na página. Usado nos casos (#caso-*) e nos detalhes do diagnóstico (#diagnostico-detalhes).
let dlg = null, dlgBody = null, dlgOpener = null;
const openModal = (nodes, from) => {
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.className = "modal";
    dlg.setAttribute("aria-labelledby", "modalTitle");
    dlg.innerHTML = '<div class="modal-card"><button type="button" class="modal-close" aria-label="Fechar">&times;</button><div class="modal-body"></div></div>';
    document.body.appendChild(dlg);
    dlgBody = $(".modal-body", dlg);
    dlg.addEventListener("close", () => {
      doc.classList.remove("modal-open");
      if (/^#(caso-|diagnostico-detalhes)/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      if (dlgOpener) dlgOpener.focus();
    });
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest(".modal-close") || e.target.closest("a[href^=\"#\"]")) dlg.close(); });
  }
  const clones = nodes.map((n) => n.cloneNode(true));
  clones.forEach((c) => {
    $$("[id]", c).forEach((n) => n.removeAttribute("id"));
    [c, ...$$(".reveal", c)].forEach((n) => n.classList.remove("reveal", "is-visible"));
  });
  const title = clones.map((c) => c.matches("h3") ? c : $("h3", c)).find(Boolean);
  if (title) title.id = "modalTitle";
  dlgBody.replaceChildren(...clones);
  dlgOpener = from || null;
  doc.classList.add("modal-open");
  if (!dlg.open) dlg.showModal();
};
const canModal = typeof HTMLDialogElement === "function";

// Casos: cada caso vira um cartão compacto com o resultado; o caso completo abre no modal.
const cases = $$(".proj-list .case");
if (cases.length && canModal) {
  cases.forEach((c) => {
    const res = $(".case-res", c);
    const summary = document.createElement("p");
    summary.className = "case-summary";
    summary.textContent = res ? res.textContent : "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "case-open";
    btn.innerHTML = 'Ver o caso completo <span aria-hidden="true">&rarr;</span>';
    btn.setAttribute("aria-label", `Ver o caso completo: ${$("h3", c).textContent}`);
    const show = (from) => {
      const tag = document.createElement("span");
      tag.className = "proj-tag";
      tag.textContent = $(".proj-tag", c).textContent;
      openModal([tag, $(".case-main", c)], from);
    };
    btn.addEventListener("click", () => show(btn));
    c.show = show;
    $(".case-main", c).append(summary, btn);
    c.classList.add("is-card");
  });
}

// Diagnóstico: fatos e preço ficam visíveis; "O que analisamos" e "Como funciona" abrem no modal.
const offer = $(".offer-card");
if (offer && canModal) {
  const [facts, scope, how] = [$(".offer-facts", offer), $(".offer-list", offer)?.parentElement, $("p", offer)];
  if (facts && scope && how) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "case-open";
    btn.id = "diagnostico-detalhes";
    btn.innerHTML = 'O que analisamos e como funciona <span aria-hidden="true">&rarr;</span>';
    btn.addEventListener("click", () => {
      const wrap = document.createElement("div");
      wrap.className = "offer-detail";
      const h = document.createElement("h3");
      h.textContent = "O diagnóstico, em detalhe";
      const sc = scope.cloneNode(true);
      $("h3", sc)?.remove();
      const t1 = document.createElement("h3"); t1.className = "sub"; t1.textContent = "O que analisamos";
      const t2 = document.createElement("h3"); t2.className = "sub"; t2.textContent = "Como funciona";
      const hp = how.cloneNode(true);
      const plain = how.textContent.replace(/^Como funciona:\s*/, "");
      hp.textContent = plain.charAt(0).toUpperCase() + plain.slice(1);
      wrap.append(h, t1, sc, t2, hp);
      openModal([wrap], btn);
    });
    offer.classList.add("is-compact");
    offer.append(btn);
  }
}

const openHash = () => {
  if (location.hash === "#diagnostico-detalhes") { const b = $("#diagnostico-detalhes"); if (b) b.click(); return; }
  const c = cases.find((x) => `#${x.id}` === location.hash);
  if (c && c.show) c.show(null);
};
openHash();
addEventListener("hashchange", openHash);

// Pop-ups em todo o site: links internos abrem o conteúdo no modal, buscado da própria página de destino
// (mesma origem, sem duplicar texto). Ctrl/Cmd+clique, clique do meio e falha de rede seguem o link normal.
const pageCache = new Map();
const fetchPage = (path) => {
  if (!pageCache.has(path)) {
    pageCache.set(path, fetch(path, { credentials: "same-origin" })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => new DOMParser().parseFromString(t, "text/html"))
      .catch((err) => { pageCache.delete(path); throw err; }));
  }
  return pageCache.get(path);
};
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
const viaModal = (selector, build) => {
  $$(selector).forEach((a) => a.setAttribute("aria-haspopup", "dialog"));
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest(selector);
    if (!a || a.closest("dialog")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname.replace(/\.html$/, "") === location.pathname.replace(/\.html$/, "") && !a.matches(".sol")) return;
    e.preventDefault();
    build(url, a).then((nodes) => openModal(nodes, a)).catch(() => { location.href = a.href; });
  });
};
if (canModal && window.fetch && window.DOMParser) {
  // Política de privacidade (rodapé e consentimento do formulário)
  viaModal('a[href="/privacidade"]', async (url) => {
    const d = await fetchPage(url.pathname);
    const title = el("h3", "", $("h1", d).textContent);
    const legal = $(".legal", d);
    legal.className = "legal";
    return [title, el("p", "lead", $(".lead", d).textContent), legal];
  });
  // Casos vindos das páginas de solução: a home já abre pelo #caso-*
  if (!cases.length) {
    viaModal('a[href*="#caso-"]', async (url) => {
      const d = await fetchPage("/");
      const c = $(url.hash, d);
      if (!c) throw new Error("caso");
      return [el("span", "proj-tag", $(".proj-tag", c).textContent), $(".case-main", c)];
    });
  }
  // Soluções na home: resumo e entregas no modal, com link para a página completa
  viaModal(".sol-list a.sol", async (url, a) => {
    const d = await fetchPage(url.pathname);
    const deliver = $(".deliver", d);
    const cta = el("div", "cta-row");
    const open = el("a", "btn btn-primary", "Abrir a página completa");
    open.href = url.pathname;
    const ask = el("a", "btn btn-ghost", "Solicitar diagnóstico");
    ask.href = "#contato";
    cta.append(open, ask);
    return [el("span", "proj-tag", "Solução"), el("h3", "", $("h1", d).textContent), el("p", "lead", $(".page-hero .lead", d).textContent), ...(deliver ? [deliver] : []), cta];
  });
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
