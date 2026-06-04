#!/usr/bin/env bash
set -u
export SSH_ASKPASS="$HOME/akp.sh" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
OPTS="-o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1"
HOST=ubuntu@164.125.19.178
D=/mnt/c/Users/user/pnu-grad/deploy

echo "=== HSTS preload 상태 조회 ==="
echo -n "pusan.ac.kr           : "; curl -fsS "https://hstspreload.org/api/v2/status?domain=pusan.ac.kr" 2>/dev/null || echo "(조회실패)"; echo
echo -n "arise-ai.pusan.ac.kr  : "; curl -fsS "https://hstspreload.org/api/v2/status?domain=arise-ai.pusan.ac.kr" 2>/dev/null || echo "(조회실패)"; echo

echo "=== nginx conf 갱신(HSTS 제거) + reload ==="
scp $OPTS -P 11097 "$D/nginx-https/conf.d/arise-ai.conf" $HOST:'~/pnug-deploy/arise-ai.conf'
ssh $OPTS -p 11097 $HOST 'cp ~/pnug-deploy/arise-ai.conf ~/pnug-stack/nginx-https/conf.d/arise-ai.conf && cd ~/pnug-stack && docker compose exec -T nginx nginx -t && docker compose exec -T nginx nginx -s reload && echo NGINX_RELOADED'

echo "=== 응답 헤더 확인 (HSTS 사라졌는지) ==="
curl -skI --max-time 10 https://arise-ai.pusan.ac.kr/health | grep -iE "^HTTP|strict-transport" || echo "(HSTS 헤더 없음 = 정상)"
