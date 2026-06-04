#!/usr/bin/env bash
# 발급된 LE 인증서를 서버에 설치 + nginx 재시작 + 검증
set -u
export SSH_ASKPASS="$HOME/akp.sh" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
OPTS="-o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1"
HOST=ubuntu@164.125.19.178
DOMAIN=arise-ai.pusan.ac.kr
ACME="$HOME/.acme.sh/acme.sh"

echo "=== install-cert → /tmp ==="
"$ACME" --install-cert -d "$DOMAIN" --ecc \
  --fullchain-file /tmp/fullchain.pem --key-file /tmp/privkey.pem
ls -l /tmp/fullchain.pem /tmp/privkey.pem

echo "=== scp → 서버 certs ==="
scp $OPTS -P 11097 /tmp/fullchain.pem /tmp/privkey.pem $HOST:'~/pnug-stack/certs/'

echo "=== nginx 재시작 ==="
ssh $OPTS -p 11097 $HOST 'cd ~/pnug-stack && docker compose restart nginx && echo RESTARTED'
sleep 4

echo "=== 검증 ==="
echo "--- 인증서 ---"
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -issuer -subject -dates
echo "ssl_verify_result: $(curl -s -o /dev/null -w '%{ssl_verify_result}' --max-time 12 https://$DOMAIN/health)  (0=신뢰됨/경고없음)"
echo "https /health    : $(curl -s -o /dev/null -w '%{http_code}' --max-time 12 https://$DOMAIN/health)"
echo "https / (게이트) : $(curl -s -o /dev/null -w '%{http_code}' --max-time 12 https://$DOMAIN/)"
echo "=== INSTALL DONE ==="
