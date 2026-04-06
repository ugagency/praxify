#!/usr/bin/env bash
set -euo pipefail

EMAIL="${EMAIL:-evelyn.martins@sparkbs.com.br}"   # export EMAIL=... se quiser trocar
SUB="${SUB:-praxify.infrassys.com}"                  # export SUB=... para outro host
APP_PORT="${APP_PORT:-5005}"                      # porta publicada no HOST (docker -> host:5005)
CERT_NAME="${CERT_NAME:-$SUB}"                    # nome do certificado

need_root(){ [ "$(id -u)" -eq 0 ] || { echo "Execute como root (sudo -i)"; exit 1; }; }
log(){ echo -e "\n==> $*"; }

pkg(){
  log "Instalando pacotes nginx/certbot..."
  apt-get update -y
  apt-get install -y nginx certbot python3-certbot-nginx
  systemctl enable nginx
}

purge_old_site(){
  log "Removendo vhosts antigos do domínio e o 'default'..."
  mkdir -p /root/nginx-bkp
  cp -a /etc/nginx/sites-available /root/nginx-bkp/sites-available.$(date +%s) 2>/dev/null || true
  cp -a /etc/nginx/sites-enabled   /root/nginx-bkp/sites-enabled.$(date +%s)   2>/dev/null || true

  rm -f /etc/nginx/sites-enabled/default || true
  rm -f /etc/nginx/sites-available/${SUB} /etc/nginx/sites-enabled/${SUB} || true

  # remove qualquer outro vhost que cite esse server_name
  for f in /etc/nginx/sites-enabled/* /etc/nginx/sites-available/*; do
    [ -e "$f" ] || continue
    if grep -qE "server_name\s+${SUB}\b" "$f"; then
      rm -f "$f"
    fi
  done
}

purge_old_cert(){
  if [ -d "/etc/letsencrypt/live/${CERT_NAME}" ]; then
    log "Removendo certificado antigo: ${CERT_NAME}"
    certbot delete --cert-name "${CERT_NAME}" -n || true
    rm -f "/etc/letsencrypt/renewal/${CERT_NAME}.conf" || true
  fi
}

# Criamos um vhost mínimo HTTP para validação ACME e depois pedimos o cert "certonly"
create_min_http_for_acme(){
  log "Criando vhost mínimo em :80 para validação ACME..."
  cat > /etc/nginx/sites-available/${SUB}.acme <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SUB};
    # local padrão que o plugin nginx do certbot usa
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    location / {
        return 200 'ACME ready';
        add_header Content-Type text/plain;
    }
}
EOF
  ln -sf /etc/nginx/sites-available/${SUB}.acme /etc/nginx/sites-enabled/${SUB}.acme
  nginx -t && systemctl reload nginx
}

issue_cert(){
  log "Emitindo certificado (certonly) para ${SUB}..."
  mkdir -p /var/www/html
  certbot certonly --nginx --non-interactive --agree-tos -m "$EMAIL" -d "$SUB"
  systemctl enable --now certbot.timer
}

write_final_vhost(){
  log "Escrevendo vhost final (HTTPS + proxy) para ${SUB}..."
  # remove vhost ACME temporário
  rm -f /etc/nginx/sites-enabled/${SUB}.acme /etc/nginx/sites-available/${SUB}.acme || true

  cat > /etc/nginx/sites-available/${SUB} <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SUB};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${SUB};

    ssl_certificate     /etc/letsencrypt/live/${SUB}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SUB}/privkey.pem;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};

        proxy_http_version 1.1;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;

        # Evita loop: informa ao backend que a origem é HTTPS/443
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port  443;
        proxy_set_header X-Forwarded-Host  \$host;

        # WebSockets (se houver)
        proxy_set_header Upgrade           \$http_upgrade;
        proxy_set_header Connection        "upgrade";

        proxy_read_timeout 300;
        proxy_connect_timeout 60;
    }

    # headers de segurança
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy no-referrer-when-downgrade always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

  ln -sf /etc/nginx/sites-available/${SUB} /etc/nginx/sites-enabled/${SUB}
  nginx -t && systemctl reload nginx
}

checks(){
  log "Checando certificado entregue:"
  set +e
  openssl s_client -connect ${SUB}:443 -servername ${SUB} </dev/null 2>/dev/null \
   | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
  set -e
  echo
  echo "Teste HTTPs rápido (status/headers iniciais):"
  curl -vkI https://${SUB} | sed -n '1,20p' || true
  echo
  echo "Se aparecer 301 infinito, rode: nginx -T | grep -n \"server_name ${SUB}\" -nA10"
}

need_root
pkg
purge_old_site
purge_old_cert
create_min_http_for_acme
issue_cert
write_final_vhost
checks

echo -e "\n✅ Pronto! Acesse: https://${SUB}\n"
