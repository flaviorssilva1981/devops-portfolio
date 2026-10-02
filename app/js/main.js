const doc = document.documentElement;
doc.classList.add("js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

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
// Sem JS ou sem suporte a vídeo, o poster permanece.
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
    heroVideo.play().catch((err) => {
      if (err.name === "NotSupportedError") heroPause.hidden = true;
      else if (err.name === "NotAllowedError") { userPaused = true; label(); }
    });
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
let dlg = null, dlgBody = null, dlgOpener = null, dlgRestore = [];
const teasers = {};
const restoreLive = () => { dlgRestore.forEach((fn) => fn()); dlgRestore = []; };
// live: [{ node, home }] são nós reais (ex.: o formulário) movidos para o modal e devolvidos ao fechar.
const openModal = (nodes, from, live = []) => {
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.className = "modal";
    dlg.setAttribute("aria-labelledby", "modalTitle");
    dlg.innerHTML = '<div class="modal-card"><button type="button" class="modal-close" aria-label="Fechar">&times;</button><div class="modal-body"></div></div>';
    document.body.appendChild(dlg);
    dlgBody = $(".modal-body", dlg);
    dlg.addEventListener("close", () => {
      restoreLive();
      doc.classList.remove("modal-open");
      if (/^#(caso-|diagnostico-detalhes|contato|entregas)/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      if (dlgOpener) dlgOpener.focus();
    });
    dlg.addEventListener("click", (e) => {
      if (e.target.closest(".modal-back") && teasers.solucoes) { teasers.solucoes.show(null); return; }
      const link = e.target.closest("a[href^=\"#\"]");
      const swap = link && teasers[link.hash.slice(1)] && teasers[link.hash.slice(1)].openOnLink;
      if (e.target === dlg || e.target.closest(".modal-close") || (link && !swap)) dlg.close();
    });
  }
  restoreLive();
  const liveNodes = live.map((l) => l.node);
  const clones = nodes.map((n) => {
    if (liveNodes.includes(n)) return n;
    const c = n.cloneNode(true);
    $$("[id]", c).forEach((x) => x.removeAttribute("id"));
    [c, ...$$(".reveal", c)].forEach((x) => x.classList.remove("reveal", "is-visible"));
    $$("details", c).forEach((d) => { if ($(".tech-groups", d)) d.open = true; });
    return c;
  });
  live.forEach((l) => dlgRestore.push(() => l.home.append(l.node)));
  const title = clones.map((c) => (c.matches(".modal-title") ? c : $(".modal-title", c)) || (c.matches("h3") ? c : $("h3", c))).find(Boolean);
  if (title) title.id = "modalTitle";
  dlgBody.replaceChildren(...clones);
  dlgBody.scrollTop = 0;
  $(".modal-card", dlg).scrollTop = 0;
  const inside = from && dlg.contains(from);
  if (!inside && (from || !dlg.open)) dlgOpener = from || null;
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

// Seções inteiras viram um cartão-resumo (título, resumo, imagem) e o conteúdo completo abre no modal.
// O conteúdo original fica oculto na página (e intacto para quem não tem JS).
const collapse = (target, opt) => {
  const section = typeof target === "string" ? $(`#${target}`) : target;
  const id = typeof target === "string" ? target : opt.key;
  const src = section && $(":scope > .container", section);
  if (!src || !canModal) return;
  const title = $("h2", src).textContent;
  const leadText = opt.lead ? opt.lead(src) : ($(".desc", src) || {}).textContent || "";
  const btn = el("button", `btn ${opt.primary ? "btn-primary" : "btn-ghost"}`, `${opt.label} \u2192`);
  btn.type = "button";
  btn.setAttribute("aria-haspopup", "dialog");
  const text = el("div", "teaser-text");
  // O cartão herda o movimento marcado no original (.text-motion no título, .motion na foto)
  const h2 = el("h2", "title", title);
  const srcH2 = $("h2", src);
  if (srcH2.classList.contains("text-motion")) { h2.className = "title text-motion"; h2.innerHTML = srcH2.innerHTML; }
  text.append(h2, el("p", "desc", leadText), btn);
  const wrap = el("div", "container teaser");
  wrap.append(text);
  const img = $("figure img", src);
  if (img) {
    const fig = el("figure", img.closest("figure").classList.contains("motion") ? "cimg teaser-fig motion" : "cimg teaser-fig");
    fig.append(img.cloneNode(true));
    wrap.append(fig);
    wrap.classList.add("has-fig");
  }
  src.hidden = true;
  src.after(wrap);
  const show = (from) => {
    if (opt.build) {
      const { nodes, live } = opt.build(src);
      openModal(nodes, from, live);
      return;
    }
    const c = src.cloneNode(true);
    c.className = "modal-section";
    c.hidden = false;
    const h2 = $("h2", c);
    h2.replaceWith(el("h3", "modal-title", h2.textContent));
    openModal([c], from);
  };
  btn.addEventListener("click", () => show(btn));
  teasers[id] = { show, openOnLink: Boolean(opt.openOnLink) };
};
const contactBuild = (src) => {
  const form = $("#contactForm", src);
  form.classList.remove("reveal", "is-visible");
  const privacy = $(".consent a", form);
  if (privacy) { privacy.target = "_blank"; privacy.rel = "noopener"; }
  return {
    nodes: [el("h3", "modal-title", $("h2", src).textContent), el("p", "lead", $(".desc", src).textContent), form, $(".contact-list", src)],
    live: [{ node: form, home: form.parentElement }],
  };
};
if (canModal) {
  collapse("solucoes", { label: "Ver as sete frentes" });
  collapse("metodo", { label: "Ver as seis etapas" });
  collapse("cultura", { label: "Ver cultura e valores" });
  collapse("sobre", { label: "Ver o perfil completo" });
  collapse("contato", { label: "Abrir o formulário", primary: true, openOnLink: true, build: contactBuild });
  collapse("entregas", {
    label: "Ver o que entregamos",
    openOnLink: true,
    lead: (src) => { const t = $$(".deliver h3", src).map((h) => h.textContent); return `${t.length} entregas: ${t.slice(0, 3).join(", ")} e mais.`; },
  });
  // Páginas de solução: "Quatro passos" e "Dúvidas comuns" também viram cartão + modal (hero, chips e faixa de contato ficam na página)
  const stepsList = $(".steps-4");
  if (stepsList && stepsList.closest("section") && !stepsList.closest("section").id) {
    collapse(stepsList.closest("section"), {
      key: "passos",
      label: "Ver os quatro passos",
      lead: (src) => { const t = $$(".steps-4 li p", src).map((x) => x.textContent); return `${t.length} passos, de \u201c${t[0]}\u201d até \u201c${t[t.length - 1]}\u201d.`; },
    });
  }
  const faqList = $$(".faq").find((f) => !f.classList.contains("tech-more") && !f.closest("[hidden]"));
  if (faqList && faqList.closest("section")) {
    collapse(faqList.closest("section"), {
      key: "duvidas",
      label: "Ver as dúvidas comuns",
      lead: (src) => { const q = $$(".faq summary", src).map((x) => x.textContent); return `${q.length} perguntas, como \u201c${q[0]}\u201d`; },
    });
  }
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href^=\"#\"]");
    const t = a && teasers[a.hash.slice(1)];
    if (!t || !t.openOnLink) return;
    e.preventDefault();
    t.show(a.closest("dialog") ? null : a);
  });
}

const openHash = () => {
  if (location.hash === "#diagnostico-detalhes") { const b = $("#diagnostico-detalhes"); if (b) b.click(); return; }
  const tz = teasers[location.hash.slice(1)];
  if (tz && tz.openOnLink) { tz.show(null); return; }
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
const viaModal = (selector, build) => {
  $$(selector).forEach((a) => a.setAttribute("aria-haspopup", "dialog"));
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest(selector);
    if (!a || (a.closest("dialog") && !a.matches(".sol"))) return;
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
  viaModal(".sol-list a.sol, a.tile", async (url, a) => {
    const d = await fetchPage(url.pathname);
    const deliver = $(".deliver", d);
    const cta = el("div", "cta-row");
    const open = el("a", "btn btn-primary", "Abrir a página completa");
    open.href = url.pathname;
    const ask = el("a", "btn btn-ghost", "Solicitar diagnóstico");
    ask.href = "#contato";
    cta.append(open, ask);
    const back = el("button", "modal-back", "\u2190 Voltar às sete frentes");
    back.type = "button";
    return [...(a.closest("dialog") && teasers.solucoes ? [back] : []), el("span", "proj-tag", "Solução"), el("h3", "", $("h1", d).textContent), el("p", "lead", $(".page-hero .lead", d).textContent), ...(deliver ? [deliver] : []), cta];
  });
}

// Textos com .text-motion: separa em palavras para entrar em cascata (não altera o texto lido; sem efeito com movimento reduzido)
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) $$(".text-motion").forEach((statement) => {
  let i = 0;
  const wrap = (node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const w = document.createElement("span");
      w.className = "w";
      w.style.setProperty("--i", i++);
      w.textContent = part;
      frag.append(w);
    });
    node.replaceWith(frag);
  };
  [...statement.childNodes].forEach((n) => {
    if (n.nodeType === 3) wrap(n);
    else if (n.nodeType === 1) [...n.childNodes].forEach((c) => c.nodeType === 3 && wrap(c));
  });
  statement.classList.add("is-split");
  // Simula a leitura: enquanto o título está na tela (acima de 85% da altura), um destaque ciano passa de palavra em palavra, da esquerda para a direita
  // (cada palavra apaga devagar atrás dele, então o movimento flui); depois pausa e repete. Reinicia quando o texto volta para baixo dessa linha ou sai da tela.
  // Em sequência: quando a última palavra termina, a linha de varredura da foto ao lado passa uma vez; depois uma pausa e o ciclo recomeça.
  const words = $$(".w", statement);
  const fig = $(".cimg.motion", statement.closest(".statement-grid, .teaser") || document);
  // Ritmo de leitura natural: palavra curta passa rápido, longa demora mais, e há uma pausa curta na vírgula e maior no ponto final
  const dur = (w) => { const t = w.textContent; return 100 + t.length * 16 + (/[,;:]$/.test(t) ? 260 : /[.!?]$/.test(t) ? 380 : 0); };
  const SCAN = 1600; // ms, igual ao padrão de --scan no CSS
  let on = false, k = -1, timer;
  const scan = () => { if (!fig) return; fig.classList.remove("is-scanning"); void fig.offsetWidth; fig.classList.add("is-scanning"); };
  const step = () => {
    if (words[k]) words[k].classList.remove("is-reading");
    k += 1;
    if (k >= words.length) { k = -1; scan(); timer = setTimeout(step, SCAN + 1200); return; }
    words[k].classList.add("is-reading");
    timer = setTimeout(step, dur(words[k]));
  };
  const play = (next) => {
    if (next === on) return;
    on = next;
    statement.classList.toggle("is-play", on);
    clearTimeout(timer);
    words.forEach((w) => w.classList.remove("is-reading"));
    if (fig) fig.classList.remove("is-scanning");
    k = -1;
    if (on) timer = setTimeout(step, 250);
  };
  new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) play(true);
    else if (e.boundingClientRect.top >= e.rootBounds.bottom) play(false);
  }), { rootMargin: "0px 0px -15% 0px" }).observe(statement);
  new IntersectionObserver((entries) => entries.forEach((e) => { if (!e.isIntersecting) play(false); })).observe(statement);
});

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

// Movimento contínuo das fotos: só roda enquanto o elemento está visível
const live = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting));
});
$$(".cimg.motion").forEach((el) => live.observe(el));

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
