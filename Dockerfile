# Imagem estática de portfólio DevOps, servida via Nginx, pronta para OKE.
FROM nginx:1.27-alpine

# Roda em porta não-privilegiada (8080) e como usuário não-root, boa prática
# de segurança recomendada para clusters Kubernetes/OKE com PodSecurity restritiva.
RUN sed -i '/user  nginx;/d' /etc/nginx/nginx.conf || true

COPY nginx.conf /etc/nginx/nginx.conf
COPY app/ /usr/share/nginx/html/

RUN mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /usr/share/nginx/html /etc/nginx /tmp/client_temp /tmp/proxy_temp \
      /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp /var/cache/nginx

# UID numérico exigido pelo Kubernetes quando runAsNonRoot=true
USER 101:101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
