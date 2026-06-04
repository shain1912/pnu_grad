#!/usr/bin/env bash
# 서버에서 실행: nginx 이미지 적재 + https 스택으로 전환 (self-signed)
set -u
SUDOPW="${SUDOPW:-ubuntu}"
if docker ps >/dev/null 2>&1; then DK(){ docker "$@"; }; else DK(){ echo "$SUDOPW" | sudo -S -p '' docker "$@"; }; fi
B="$HOME/pnug-deploy"; STACK="$HOME/pnug-stack"

echo "=== load nginx 이미지 ==="
DK load -i "$B/nginx.tar.gz"

mkdir -p "$STACK/nginx-https/conf.d" "$STACK/certs"
cp "$B/arise-ai.conf" "$STACK/nginx-https/conf.d/arise-ai.conf"
cp "$B/fullchain.pem" "$B/privkey.pem" "$STACK/certs/"
cp "$B/docker-compose.https.yml" "$STACK/docker-compose.yml"

cd "$STACK"
echo "=== compose up (nginx + was + postgres) ==="
DK compose up -d
sleep 4
echo "=== local 검증 ==="
curl -s  -o /dev/null -w "  http  :80  /health -> %{http_code}\n" --max-time 6 http://localhost/health
curl -sk -o /dev/null -w "  https :443 /health -> %{http_code}\n" --max-time 6 https://localhost/health
DK compose ps
echo "=== listening ==="; ss -tlnH 2>/dev/null | grep -E ':80 |:443 ' || true
echo "=== ENABLE-HTTPS DONE ==="
