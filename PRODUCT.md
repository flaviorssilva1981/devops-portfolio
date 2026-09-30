# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mid-size companies in Brazil buying cloud and DevOps services. The visitor is typically a CTO, engineering manager or IT lead who has an infrastructure, Kubernetes or delivery-pipeline problem and needs to judge credibility quickly, then start a conversation. Their job on the site: understand what is offered, decide whether the team is trustworthy, and request a diagnosis.

## Product Purpose

Marketing and lead-generation site for Dublin Consulting, a Cloud, DevOps and Kubernetes consultancy. It presents seven solution areas (Cloud & Multi-cloud, Kubernetes & Containers, CI/CD & Automação, Infraestrutura como Código, DevSecOps, Observabilidade, Soluções de IA), the technologies used, types of projects delivered, and a six-step method. Success is a qualified visitor submitting the contact form, which opens a prefilled WhatsApp conversation.

## Positioning

Multi-cloud and DevSecOps specialist: certified across AWS, Azure, GCP and OCI, with security built into delivery (secrets out of git, least-privilege RBAC/IAM, automated checks) and a read-before-write method (diagnose first, reversible plans, plan before apply).

## Operating Context

- Deployed as a static Nginx image (Alpine, non-root, port 8080) to OKE via GitHub Actions and Docker Hub; live at https://devops-portfolio.dublinconsulting.com.br.
- Conversion runs through a client-side form that composes a WhatsApp message; nothing is stored or sent to a backend. Users confirm before sending.

## Capabilities and Constraints

- Static HTML/CSS/JS only, no framework and no backend. Strict CSP and hardened nginx.conf must keep working; keep assets CSP-friendly (no inline handlers, no third-party origins without review).
- Copy is Portuguese (pt-BR). Form carries LGPD consent.
- Pages: `app/index.html`, seven solution pages in `app/solucoes/` (including `ia.html`), `404.html`, `robots.txt`, `sitemap.xml`.
- Contact channels: WhatsApp +55 11 95078-3983 (primary), e-mail, LinkedIn.
- Undecided: legal entity details, pricing, engagement models.

## Brand Commitments

Name: Dublin Consulting. Third-party vendor logos were removed at the owner's request (dark futuristic redesign); technologies are named in text. If vendor logos return, restore the footer disclaimer. Visual world: dark instrument field, transit-map diagram (one line per solution, told apart by stroke pattern), one electric-cyan accent.

## Evidence on Hand

- Real: technology list, solution descriptions, method steps, contact channels, and platform certifications held by the lead engineer (AWS SAA, AZ-900, GCP CDL, OCI Architect). AI Solutions copy is drawn from the lead engineer's own work: an AIOps agent that watches Kubernetes warning events and proposes/executes remediation via MCP, a real-time voice assistant on Gemini Live, and multi-provider LLM/MCP/RAG experience (Claude, GPT, Gemini). Owner should confirm wording.
- Real cases (owner-confirmed 2026-09-30, shown anonymized in the home "Projetos entregues" section): FinOps with multi-cloud governance, tagging and cost controls (~25% lower monthly cloud cost); refactor from VMs to AKS; migration of workloads from on-premises to AWS; the AIOps agent for Kubernetes. All four were client work: never name the clients. Own open-source projects on GitHub (flaviorssilva1981): guiadodevops (multi-cloud GitOps platform, self-hosted OpenClaw on OKE), boilerplate-copa-aiops, azuredevops-aks, AzureDevops-AppService, jarvis-ai. Case details beyond these facts (metrics, sectors, durations) are not confirmed.
- Founder (owner-confirmed 2026-09-30): Flavio Silva, senior DevOps engineer leading Dublin Consulting, 15 years of experience; real photo at `app/img/photos/flavio.webp` (the only real person on the site); GitHub github.com/flaviorssilva1981. Shown in the home "Quem está por trás" section (`#sobre`). The earlier "mais de 7 anos" claim is superseded by the confirmed 15 years.
- Absent, must not be fabricated: named clients, testimonials, case-study results beyond the confirmed cases above, customer logos, revenue or savings figures other than the confirmed ~25% FinOps result. Any stat on the site must reflect true, owner-confirmed facts (15 years of experience confirmed 2026-09-30).

## Product Principles

1. Credibility through specifics: name real tools, clouds and practices; never invent proof.
2. Safety is the differentiator: diagnosis, reversibility and least privilege are shown, not just claimed.
3. One clear conversion path: every page leads to the diagnosis request via WhatsApp.
4. Lightweight and hardened by default: static, fast, no trackers, nothing stored.

## Accessibility & Inclusion

Keyboard-navigable with a skip link (already present); pt-BR readers on both desktop and mobile. No formal standard was specified; treat WCAG AA as the working floor.

## Imagery note (2026-09-29)

The site uses owner-provided AI-generated imagery, including images of people in the "Cultura e valores" section, at the owner's request. Never caption them as the real team or as clients. The "mais de 7 anos" and "4 clouds / 4 Kubernetes" claims were removed from the home statement because they were unverified.
