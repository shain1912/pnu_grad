#!/usr/bin/env bash
set -u
DOMAIN=arise-ai.pusan.ac.kr
TP=R5G_5ys6TO2iVfNBbCbiKWpapj75uA33Zeap4WsTLqg
ACME="$HOME/.acme.sh/acme.sh"

echo "=== stateless 엔드포인트 (로컬 WSL→서버 :80) ==="
echo "expect: selftest123.$TP"
echo -n "got   : "; curl -s --max-time 10 "http://$DOMAIN/.well-known/acme-challenge/selftest123"; echo
echo "code  : $(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://$DOMAIN/.well-known/acme-challenge/selftest123")"
echo
echo "=== 기본 접속 ==="
echo "http  /health : $(curl -s  -o /dev/null -w '%{http_code}' --max-time 10 http://$DOMAIN/health)"
echo "https /health : $(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 https://$DOMAIN/health)"
echo
echo "=== 발급 재시도 (--force, 전체 로그) ==="
"$ACME" --issue --stateless -d "$DOMAIN" --server letsencrypt --force > /tmp/acme-issue.log 2>&1
echo "rc=$?"
echo "--- 로그 마지막 30줄 ---"
tail -30 /tmp/acme-issue.log
