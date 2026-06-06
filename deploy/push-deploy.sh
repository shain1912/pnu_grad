#!/usr/bin/env bash
# WSL에서 실행: 번들 + 설정 + 소스를 서버로 scp 전송 (비대화형 비밀번호: askpass)
set -u
export SSH_ASKPASS="$HOME/akp.sh" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
OPTS="-o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1"
SSH="ssh $OPTS -p 11097"
SCP="scp $OPTS -P 11097"
HOST=ubuntu@164.125.19.178
B="$HOME/deploy-bundle"
D=/mnt/c/Users/user/pnu-grad/deploy

echo "=== mkdir ~/pnug-deploy on server ==="
$SSH $HOST 'mkdir -p ~/pnug-deploy'

echo "=== scp bundle + configs (~471M) ==="
time $SCP "$B/docker-29.5.3.tgz" "$B/docker-compose-linux-x86_64" "$B/images.tar.gz" "$B/pnu-grad-src.tgz" \
     "$D/server-install.sh" "$D/docker-compose.prod.yml" \
     $HOST:'~/pnug-deploy/'
$SCP "$D/.env" $HOST:'~/pnug-deploy/env.prod'
$SCP "$D/sheets-sa.json" $HOST:'~/pnug-deploy/sheets-sa.json'

echo "=== extract source -> ~/pnu-grad ==="
$SSH $HOST 'tar xzf ~/pnug-deploy/pnu-grad-src.tgz -C ~ && echo extracted: && ls -d ~/pnu-grad'

echo "=== uploaded files ==="
$SSH $HOST 'ls -lh ~/pnug-deploy'
echo "PUSH_DONE"
