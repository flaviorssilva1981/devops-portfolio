# DevOps Portfolio — Site Estático para OKE

Site estático (HTML/CSS/JS puro) apresentando um portfólio de serviços de
desenvolvimento DevOps, empacotado em uma imagem Docker mínima (Nginx Alpine),
publicada no **Docker Hub** via **GitHub Actions** e implantada no cluster
**OKE (Oracle Kubernetes Engine)**.

Live: https://devops-portfolio.dublinconsulting.com.br

## Estrutura do projeto

```
.
├── app/                     # Site estático
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
├── Dockerfile               # Build da imagem (nginx:alpine, non-root, porta 8080)
├── nginx.conf                # Configuração do Nginx (inclui /healthz para probes)
├── .dockerignore
├── .github/workflows/ci-cd.yml   # Pipeline: build -> push (Docker Hub) -> deploy (OKE)
└── k8s/
    ├── namespace.yaml            # Aplicado uma única vez, manualmente (fora da pipeline)
    ├── deployment.yaml           # Deployment com probes, resources e securityContext
    ├── service.yaml              # ClusterIP, consumido pelo Ingress
    ├── service-loadbalancer.yaml # Alternativa: LoadBalancer nativo da OCI (sem Ingress)
    ├── ingress.yaml              # Ingress (ingress-nginx + cert-manager + external-dns)
    ├── hpa.yaml                  # Autoscaling horizontal (CPU)
    └── kustomization.yaml
```

## Pipeline de CI/CD (`.github/workflows/ci-cd.yml`)

A cada push na branch `main`:

1. **build-and-push**: builda a imagem e publica no Docker Hub com duas tags —
   `latest` e o SHA curto do commit (`docker.io/<usuario>/devops-portfolio:<sha>`).
2. **deploy**: aplica os manifests do namespace `devops-portfolio` no cluster
   OKE usando uma `ServiceAccount` com permissão restrita **apenas** a esse
   namespace (least privilege — sem acesso de cluster-admin), e atualiza a
   imagem do Deployment para a tag recém publicada.

### Secrets necessários no repositório GitHub

Configure em **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Descrição |
|---|---|
| `DOCKERHUB_USERNAME` | Usuário do Docker Hub |
| `DOCKERHUB_TOKEN` | Access Token do Docker Hub (Account Settings → Security → New Access Token). Nunca use a senha da conta. |
| `KUBE_CONFIG` | Kubeconfig (em base64) de uma ServiceAccount com acesso restrito ao namespace `devops-portfolio`. Gerado uma única vez pelo administrador do cluster — ver seção abaixo. |

> O repositório no Docker Hub (`<usuario>/devops-portfolio`) é criado
> automaticamente no primeiro `docker push`, como público. Se preferir criá-lo
> manualmente como privado antes do primeiro push, faça isso em
> hub.docker.com → Create Repository.

### RBAC de least privilege usado pela pipeline

A pipeline **não** usa um kubeconfig de administrador do cluster. Em vez
disso, existe uma `ServiceAccount` (`devops-portfolio-ci`) com uma `Role` +
`RoleBinding` restritas ao namespace `devops-portfolio`, permitindo apenas
`get/list/watch/create/update/patch` em `deployments`, `services`,
`ingresses`, `horizontalpodautoscalers` e leitura de `pods`/`pods/log` —
nada de acesso a outros namespaces, secrets de outras apps, ou recursos
cluster-wide. Os manifests de referência (não aplicados pela pipeline):

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: devops-portfolio-ci
  namespace: devops-portfolio
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: devops-portfolio-ci
  namespace: devops-portfolio
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  - apiGroups: [""]
    resources: ["services", "configmaps"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["networking.k8s.io"]
    resources: ["ingresses"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  - apiGroups: ["autoscaling"]
    resources: ["horizontalpodautoscalers"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: devops-portfolio-ci
  namespace: devops-portfolio
subjects:
  - kind: ServiceAccount
    name: devops-portfolio-ci
    namespace: devops-portfolio
roleRef:
  kind: Role
  name: devops-portfolio-ci
  apiGroup: rbac.authorization.k8s.io
```

O token dessa ServiceAccount foi obtido via um `Secret` do tipo
`kubernetes.io/service-account-token` e combinado com o endpoint/CA do
cluster em um kubeconfig mínimo — esse é o valor (em base64) do secret
`KUBE_CONFIG`. Se precisar revogar o acesso da pipeline, basta apagar esse
Secret e a ServiceAccount no cluster:

```bash
kubectl delete secret devops-portfolio-ci-token -n devops-portfolio
kubectl delete serviceaccount devops-portfolio-ci -n devops-portfolio
```

## Build e teste local

```bash
docker build -t devops-portfolio:local .
docker run --rm -p 8080:8080 devops-portfolio:local
# abra http://localhost:8080
```

## Deploy manual (sem a pipeline)

Requer um kubeconfig com permissão para criar o namespace (ex.: admin do
cluster):

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -k k8s/
kubectl get ingress -n devops-portfolio
```

## Verificação

```bash
kubectl get pods -n devops-portfolio
kubectl rollout status deployment/devops-portfolio -n devops-portfolio
kubectl logs -n devops-portfolio -l app=devops-portfolio
```

## Decisões de design

- **Nginx Alpine + arquivos estáticos**: menor superfície de ataque, imagem
  final com poucos MB, sem runtime de aplicação para manter/patchear.
- **Porta 8080 + usuário non-root**: compatível com clusters com Pod Security
  Standards `restricted`.
- **`/healthz`**: endpoint dedicado para `readinessProbe`/`livenessProbe`,
  evitando falsos positivos de disponibilidade.
- **RollingUpdate com `maxUnavailable: 0`**: garante zero downtime durante
  atualizações.
- **`topologySpreadConstraints`**: distribui réplicas entre nodes/zonas para
  resiliência a falha de um único node do OKE.
- **HPA**: escala horizontalmente sob carga sem intervenção manual (requer
  metrics-server no cluster).
- **RBAC de least privilege na pipeline**: a automação de CI/CD nunca recebe
  credenciais de cluster-admin — apenas o necessário para gerenciar seus
  próprios recursos, no seu próprio namespace.
- **Ingress + cert-manager + external-dns**: mesmo padrão das demais
  aplicações do cluster (TLS automático via Let's Encrypt, DNS gerenciado
  automaticamente no Cloudflare).

## Customização do conteúdo

Edite `app/index.html` para trocar textos, links de contato (e-mail,
LinkedIn, GitHub) e os cases de projetos. Estilos em `app/css/style.css` e
interações em `app/js/main.js`. Não há dependências externas de build — basta
editar os arquivos; o push para `main` já builda, publica e implanta
automaticamente.
