#!/usr/bin/env bash
# WSL에서 실행: 마이그레이션 런타임 검증 (postgres + was 컨테이너 일회성 기동)
set -u
SMOKE=/mnt/c/Users/user/pnu-grad/deploy/smoke.mjs

docker rm -f pg-test was-test >/dev/null 2>&1 || true
docker network create pnugtest >/dev/null 2>&1 || true

echo "=== start postgres ==="
docker run -d --name pg-test --network pnugtest \
  -e POSTGRES_USER=pnug -e POSTGRES_PASSWORD=testpw -e POSTGRES_DB=pnug \
  postgres:16-alpine >/dev/null
ok=0
for i in $(seq 1 25); do
  if docker exec pg-test pg_isready -U pnug -d pnug >/dev/null 2>&1; then ok=1; echo "pg ready (${i}s)"; break; fi
  sleep 1
done
if [ "$ok" != 1 ]; then echo "PG FAIL"; docker logs pg-test 2>&1 | tail; docker rm -f pg-test >/dev/null 2>&1; exit 1; fi

echo
echo "=== init-db.js (seed) ==="
docker run --rm --network pnugtest \
  -e DATABASE_URL=postgres://pnug:testpw@pg-test:5432/pnug \
  -e ADMIN_BOOTSTRAP_USERNAME=admin -e ADMIN_BOOTSTRAP_PASSWORD=test1234 \
  pnug-was:latest node src/init-db.js

echo
echo "=== start was ==="
docker run -d --name was-test --network pnugtest \
  -e DATABASE_URL=postgres://pnug:testpw@pg-test:5432/pnug \
  -e NODE_ENV=production -e JWT_SECRET=testsecret -e ALLOWED_EMAIL_DOMAIN=pusan.ac.kr \
  -p 13001:3001 pnug-was:latest >/dev/null
sleep 4
echo "--- /health ---"; curl -s localhost:13001/health; echo

echo
echo "=== E2E smoke (read/write/tx/json/stats/csv) ==="
docker cp "$SMOKE" was-test:/app/backend/smoke.mjs
docker exec -w /app/backend was-test node smoke.mjs
RC=$?

echo
echo "--- was logs tail ---"; docker logs was-test 2>&1 | tail -6
docker rm -f pg-test was-test >/dev/null 2>&1 || true
echo "=== verify exit: $RC ==="
exit $RC
