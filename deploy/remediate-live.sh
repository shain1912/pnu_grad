#!/usr/bin/env bash
# 라이브 컨테이너에서 PII CSV 즉시 제거 + 노출 차단 확인
set -u
export SSH_ASKPASS="$HOME/akp.sh" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
OPTS="-o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1"
HOST=ubuntu@164.125.19.178
F=/app/s30/dist/assets/video/responses-2026-05-29.csv

ssh $OPTS -p 11097 $HOST "cd ~/pnug-stack && docker compose exec -T was sh -c 'rm -f $F && echo removed-from-container; ls /app/s30/dist/assets/video/'"
# 서버에 풀어둔 소스 사본에서도 제거
ssh $OPTS -p 11097 $HOST 'rm -f ~/pnu-grad/s30/public/assets/video/responses-2026-05-29.csv ~/pnu-grad/s30/dist/assets/video/responses-2026-05-29.csv 2>/dev/null; echo src-copy-cleaned'

echo "=== 라이브 재확인 (404 기대) ==="
curl -s -o /dev/null -w "  live CSV -> HTTP %{http_code}\n" --max-time 12 "https://arise-ai.pusan.ac.kr/s30/assets/video/responses-2026-05-29.csv"
curl -s -o /dev/null -w "  live /s30/ (정상?) -> HTTP %{http_code}\n" --max-time 12 "https://arise-ai.pusan.ac.kr/s30/"
