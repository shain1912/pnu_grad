#!/usr/bin/env bash
# WSL 오케스트레이터: nginx 이미지 pull/save → 서버 반입 → https 스택 전환 → 외부 443 도달 테스트
set -u
export SSH_ASKPASS="$HOME/akp.sh" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
OPTS="-o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1"
HOST=ubuntu@164.125.19.178
D=/mnt/c/Users/user/pnu-grad/deploy

if [ ! -f ~/deploy-bundle/nginx.tar.gz ]; then
  docker pull -q nginx:1.27-alpine
  docker save nginx:1.27-alpine | gzip -1 > ~/deploy-bundle/nginx.tar.gz
fi
ls -lh ~/deploy-bundle/nginx.tar.gz

echo "=== scp configs + image ==="
scp $OPTS -P 11097 \
  ~/deploy-bundle/nginx.tar.gz \
  "$D/docker-compose.https.yml" \
  "$D/nginx-https/conf.d/arise-ai.conf" \
  "$D/enable-https.sh" \
  "$D/certs/fullchain.pem" "$D/certs/privkey.pem" \
  $HOST:'~/pnug-deploy/'

echo "=== run enable-https on server ==="
ssh $OPTS -p 11097 $HOST "cd ~/pnug-deploy && sed -i 's/\r$//' enable-https.sh && SUDOPW=ubuntu bash enable-https.sh"

echo
echo "=== EXTERNAL https 도달 테스트 (인터넷 측) ==="
curl -sk -o /dev/null -w "  ext https IP     :443 -> %{http_code}\n" --max-time 12 https://164.125.19.178/health || echo "  ext IP :443 refused/timeout"
echo "  --- TLS 핸드셰이크 상세 (IP:443) ---"
curl -skv --max-time 12 https://164.125.19.178/health 2>&1 | grep -iE "Trying|Connected|refused|timed out|TLS|SSL connection|subject:|issuer:" | head -10
curl -sk -o /dev/null -w "  ext https domain :443 -> %{http_code}\n" --max-time 12 https://arise-ai.pusan.ac.kr/health || echo "  ext domain :443 refused/timeout"
curl -s  -o /dev/null -w "  ext http         :80  -> %{http_code}\n" --max-time 8 http://arise-ai.pusan.ac.kr/health
echo "=== PUSH-HTTPS DONE ==="
