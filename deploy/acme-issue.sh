#!/usr/bin/env bash
# WSL에서 실행: Let's Encrypt HTTP-01(stateless) 발급. 검증은 서버 :80(부산대 포워딩) 경유.
# DNS/전산팀/sudo 불필요.
set -u
export SSH_ASKPASS="$HOME/akp.sh" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
OPTS="-o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1"
HOST=ubuntu@164.125.19.178
DOMAIN=arise-ai.pusan.ac.kr
EMAIL=sh.cho@pusan.ac.kr
ACME="$HOME/.acme.sh/acme.sh"

echo "=== [1] acme.sh 설치 ==="
if [ ! -f "$ACME" ]; then curl -s https://get.acme.sh | sh -s email="$EMAIL" >/dev/null 2>&1; fi
"$ACME" --set-default-ca --server letsencrypt >/dev/null 2>&1
echo "acme.sh: $("$ACME" --version 2>/dev/null | tail -1)"

echo "=== [2] 계정 등록 + thumbprint 추출 ==="
"$ACME" --register-account -m "$EMAIL" --server letsencrypt > /tmp/acme-reg.log 2>&1 || true
TP=$(grep -oE "ACCOUNT_THUMBPRINT='[^']+'" /tmp/acme-reg.log | head -1 | sed "s/.*='//; s/'.*//")
if [ -z "$TP" ]; then
  "$ACME" --register-account --server letsencrypt > /tmp/acme-reg2.log 2>&1 || true
  TP=$(grep -oE "ACCOUNT_THUMBPRINT='[^']+'" /tmp/acme-reg2.log | head -1 | sed "s/.*='//; s/'.*//")
fi
echo "THUMBPRINT=$TP"
[ -z "$TP" ] && { echo "thumbprint 추출 실패"; tail -5 /tmp/acme-reg.log; exit 1; }

echo "=== [3] nginx stateless 챌린지 응답 설정 push + reload ==="
cat > /tmp/arise-ai.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name arise-ai.pusan.ac.kr _;
    location ~ "^/\\.well-known/acme-challenge/([-_a-zA-Z0-9]+)\$" {
        default_type text/plain;
        return 200 "\$1.$TP";
    }
    location / {
        proxy_pass http://was:3001;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name arise-ai.pusan.ac.kr _;
    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    gzip on;
    location / {
        proxy_pass http://was:3001;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF
scp $OPTS -P 11097 /tmp/arise-ai.conf $HOST:'~/pnug-deploy/arise-ai.conf'
ssh $OPTS -p 11097 $HOST 'cp ~/pnug-deploy/arise-ai.conf ~/pnug-stack/nginx-https/conf.d/arise-ai.conf && cd ~/pnug-stack && docker compose exec -T nginx nginx -t && docker compose exec -T nginx nginx -s reload && echo RELOADED'

echo "=== [4] stateless 엔드포인트 자가검증 ==="
RESP=$(curl -s --max-time 8 "http://$DOMAIN/.well-known/acme-challenge/selftest123")
echo "  응답: $RESP"
echo "  기대: selftest123.$TP"
[ "$RESP" = "selftest123.$TP" ] || echo "  ⚠ 불일치 — 발급 실패 가능"

echo "=== [5] 인증서 발급 (LE HTTP-01 stateless) ==="
"$ACME" --issue --stateless -d "$DOMAIN" --server letsencrypt
RC=$?
if [ $RC -ne 0 ]; then echo "발급 실패 (rc=$RC)"; exit $RC; fi

echo "=== [6] 발급물 서버에 설치 + nginx 재시작 ==="
"$ACME" --install-cert -d "$DOMAIN" --fullchain-file /tmp/fullchain.pem --key-file /tmp/privkey.pem
scp $OPTS -P 11097 /tmp/fullchain.pem /tmp/privkey.pem $HOST:'~/pnug-stack/certs/'
ssh $OPTS -p 11097 $HOST 'cd ~/pnug-stack && docker compose restart nginx && echo NGINX_RESTARTED'

echo "=== [7] 검증 ==="
sleep 4
curl -sI --max-time 10 "https://$DOMAIN/health" | head -1
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -issuer -subject -dates 2>/dev/null
echo "ssl_verify(외부): $(curl -s -o /dev/null -w '%{ssl_verify_result}' --max-time 10 https://$DOMAIN/health)  (0=정상)"
echo "=== ACME DONE ==="
