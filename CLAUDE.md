# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing/lead-gen site for **Dublin Consulting** (Cloud, DevOps, Kubernetes consultancy). Pure static HTML/CSS/JS — no framework, no package manager, no build step, no tests, no linter. Served by hardened Nginx (Alpine, non-root, port 8080), image published to Docker Hub and deployed to OKE by GitHub Actions on every push to `main`. Live: https://dublinconsulting.com.br

Site copy is **pt-BR**. README.md is also in Portuguese and documents the RBAC/secrets setup in detail.

## Commands

```bash
# Quick preview (no Docker)
python3 -m http.server 8080 --directory app

# Production-like preview (exercises nginx.conf, CSP headers, /healthz, extensionless URLs)
docker build -t devops-portfolio:local .
docker run --rm -p 8080:8080 devops-portfolio:local
curl -i localhost:8080/healthz

# Validate manifests without touching the cluster
kubectl kustomize k8s/
```

`python -m http.server` does **not** resolve extensionless URLs (`/solucoes/cicd`) or apply CSP; use the Docker run to verify those.

## Architecture

- `app/` is copied verbatim into `/usr/share/nginx/html`. Pages: `index.html`, `404.html`, `privacidade.html`, `diagnostico-exemplo.html` (sample report, fictitious data), and seven solution pages in `app/solucoes/` (cicd, cloud, devsecops, ia, iac, kubernetes, observabilidade). All share `css/style.css` and `js/main.js`; there are no templates or includes, so **shared chrome (nav, footer, head) is duplicated across all 8 HTML pages — change it in every file**. New pages must also be added to `sitemap.xml` and linked from the nav/solutions list.
- Images are optimized `.webp` in `app/img/photos/` with `-800`/`-1100` width variants (use `srcset`; solution-page hero backgrounds use the `-1100` file under 800px via a media query and matching `<link rel=preload media=...>`); icons come from the `img/sprite.svg` sprite. `main.js` holds lazy photos that are more than 600px below the viewport (1x1 placeholder, released by an IntersectionObserver) so they do not compete with the hero poster on slow links, and builds the section-teaser photos without `src` until they are in the page (a cloned `loading="lazy"` image downloads immediately while detached). Source/raw art lives in the untracked top-level `images/` — don't ship it in `app/`.
- The hero video is **MP4 (H.264) only**: `app/media/cloud-hero.mp4`, a single `<source>` in `index.html`. The WebM was dropped in PR #45 (2.8 MB vs 1.0 MB, no compatibility gain); don't re-add it without a reason. `main.js` plays it only after page load and when in view (and not with `prefers-reduced-motion`, data saver or a slow connection); if the browser blocks autoplay (iOS Low Power Mode) the poster stays. There is deliberately no pause button on the hero (removed at the owner's request), so the video loops silently in the background. `nginx.conf` still lists `webm` in the static-asset regex; that is harmless.
- `docs/` holds the software architecture diagram (`architecture-v2.png`, embedded in `README.md`, plus its `architecture-v2.html` SVG source). It is outside `app/`, so it is not shipped. To change it, edit the HTML and re-export the PNG with a headless browser (viewport 1600x1010, device scale factor 2). Brand marks come from Simple Icons (CC0); Oracle is not in that set, so OKE is text-only. This is documentation, not site content, so the "no vendor logos on the site" rule does not apply to it; keep it out of `app/`.
- The contact form is client-side only: `main.js` builds a message and opens WhatsApp (`wa.me`). Nothing is stored or POSTed; the form carries LGPD consent. Don't add a backend or third-party trackers.
- The WhatsApp number the site publishes (+55 11 95078-3983) is answered by an AI assistant ("Alice", agent `atendimento` in the OpenClaw release defined in the separate `guiadodevops` repo, PR #205), not by anything in this repo. `privacidade.html` discloses that, names OpenAI as the processor (possibly outside Brazil), and states a 90-day retention for WhatsApp conversations. Keep that page in sync with what the agent really does: don't change the retention period or the processors there without the matching change in `guiadodevops`.
- **CSP is strict and defined three times in `nginx.conf`** (server level and again inside the CSS/JS and the static-asset `location`s, because `add_header` in a location discards inherited headers). Only `'self'` scripts, styles and fonts are allowed (fonts are self-hosted in `app/fonts/`, latin subset, with metric-matched fallbacks in `style.css`; Google Fonts was removed): no inline `<script>`/`onclick`/inline event handlers (JSON-LD `<script type="application/ld+json">` data blocks are the exception: they are not executed, so CSP allows them; keep them in sync with visible content), no new third-party origins. If you change a security header, change all three places. CSS/JS are served with `Cache-Control: no-cache` at the origin, but Cloudflare (proxy enabled) overrides that to a 4-hour browser cache unless a Cache Rule bypasses `/css/*` and `/js/*`. Until that rule exists, **bump the `?v=` on the `style.css`/`main.js` links in all HTML pages whenever you change them** (currently `20261007`), otherwise HTML and CSS/JS can be out of sync for hours.
- **Cloudflare injects an inline script** (JavaScript Detections: `/cdn-cgi/challenge-platform/scripts/jsd/main.js`, appended after `main.js` in the HTML that reaches the browser, not present in `app/`). The strict CSP blocks it, so DevTools shows "Executing inline script violates the Content Security Policy" at the last line of every page. That is expected and harmless; do not loosen `script-src` to silence it. To remove the noise, turn off JavaScript Detections in the Cloudflare dashboard (Security > Settings > Bot traffic).
- **Home highlight cards (`.tile`, `#destaques`)**: on hover (mouse only: `hover: hover` + `pointer: fine`, and not under `prefers-reduced-motion`) the whole card scales to 1.05 with a shadow/cyan outline (650ms) and the photo to 1.06 (900ms), both on `--ease-smooth`. The rules sit on `.js .tile.reveal` because the old `.js .tile.reveal { transform: none; transition: none }` override beats a plain `.tile:hover`. Touch devices get no hover growth. Clicking a card opens the solution page in the modal (`viaModal` in `main.js`), so the URL stays `/`; there is no page navigation to test.
- Nginx serves `try_files $uri $uri.html $uri/`, so internal links are extensionless. `/healthz` returns 200 and backs the k8s probes and Docker `HEALTHCHECK`. The container runs as UID 101 with temp paths under `/tmp` and pid at `/tmp/nginx.pid` — keep those if editing `nginx.conf`/`Dockerfile`.

## Deploy pipeline (`.github/workflows/ci-cd.yml`)

`build-and-push` (tags `latest` + short SHA to Docker Hub) → `deploy` (skipped when repo variable `SKIP_DEPLOY=true`). Deploy uses a namespace-scoped ServiceAccount kubeconfig (`KUBE_CONFIG` secret, base64), **not** cluster-admin. Consequences:

- The pipeline applies only `deployment.yaml`, `service.yaml`, `ingress.yaml`, `hpa.yaml` individually, then `kubectl set image` to the SHA tag. **`namespace.yaml` and `pdb.yaml` are not applied by CI** (the Role has no rights on them); apply them manually via `kubectl apply -k k8s/` with admin credentials. If you add a new resource kind, the CI Role must be extended too and the workflow must list the file.
- `service-loadbalancer.yaml` is an alternative to Service+Ingress (commented out in `kustomization.yaml`); never enable both.
- Deployment: RollingUpdate with `maxUnavailable: 0`, topology spread, PSS-restricted-compatible securityContext. Ingress relies on ingress-nginx + cert-manager + external-dns (Cloudflare) already present in the cluster.

**Always test the site with Playwright on every platform, before and after each deploy.** Before opening/merging the PR, run the page locally (`python3 -m http.server 8080 --directory app`, or the Docker build when CSP/extensionless URLs matter); after the GitHub Actions run succeeds, repeat against https://dublinconsulting.com.br (hard-reload or add `?v=` since Cloudflare caches CSS/JS for 4 hours). Cover at least: desktop with mouse (1440 and 1920), a laptop/tablet-landscape width (1024), desktop with `reducedMotion: reduce`, tablet touch (iPad 820), iOS touch (iPhone 390 and SE 375, iOS user agent), and Android touch (Pixel 412 and a 360 width, Android user agent). `mcp__playwright__browser_run_code_unsafe` can open one context per device (`hasTouch`, `isMobile`, `userAgent`, viewport). Check on each: page loads with no unexpected console errors (the Cloudflare inline-script CSP error is expected), no horizontal scroll, the changed feature behaves correctly (hover only on mouse, tap opens the modal on touch), and key flows still work. Playwright emulates Chromium, so say so in the report and note that real iOS/Android hardware was not tested.

Merging to `main` = production deploy. Work on a branch and open a PR (`gh pr`); recent history uses `feat:`/`fix:` conventional prefixes with the PR number in the subject.

## Design and content constraints

Read `PRODUCT.md` (audience, positioning, what may/must not be claimed) and `DESIGN.md` / `.impeccable/design.json` (tokens, components) before UI or copy changes. Key rules:

- Visual system: soft slate ground (`#141a22`), near-white ink, a single cyan accent (`#22d3ee`), transit-map motif (one line per solution, distinguished by stroke pattern); fonts Bricolage Grotesque (display) + Figtree (body). Reuse CSS custom properties in `style.css` rather than adding new colors.
- **Never fabricate proof**: no named clients, testimonials, invented case-study results or savings figures (the confirmed cases and the ~25% FinOps figure are listed in PRODUCT.md), or customer/vendor logos (vendor logos were removed on purpose; technologies are named in text). The home "Projetos entregues" section shows real, anonymized cases; do not add details (metrics, sectors, durations) the owner has not confirmed. "15 anos de experiência" is owner-confirmed (see PRODUCT.md); other unverified claims ("4 clouds") were deliberately removed — verify before reintroducing any stat.
- Imagery is owner-provided AI-generated art, including people in "Cultura e valores": never caption it as the real team or clients. The one real photo is the founder portrait (`img/photos/flavio.webp`) in `#sobre`.
- Accessibility floor is WCAG AA; keep the skip link, keyboard navigation and `prefers-reduced-motion` behavior.

## Tooling in `.claude/` and `.github/`

The **impeccable** design skill/agents are installed (`.claude/skills`, `.claude/agents`, mirrored under `.github/`; pinned via `skills-lock.json`). `.claude/settings.local.json` registers hooks that run the impeccable detector after Edit/Write on UI files and a deeper pass on Stop. `.impeccable/`, `.claude/`, `.playwright-mcp/`, `images/` and `.DS_Store` are currently untracked local artifacts.
