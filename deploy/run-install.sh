#!/usr/bin/env bash
# WSL에서 실행: 서버에 올린 server-install.sh를 원격 실행 (askpass + SUDOPW)
set -u
export SSH_ASKPASS="$HOME/akp.sh" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1 -p 11097 \
  ubuntu@164.125.19.178 \
  "cd ~/pnug-deploy && sed -i 's/\r$//' server-install.sh && SUDOPW=ubuntu bash server-install.sh"
