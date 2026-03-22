#!/bin/bash
set -e

# --- 공통 설정 ---
REMOTE_USER="ksh"
LOCAL_HOST="192.168.0.6"     # 집 (LAN)
REMOTE_HOST="125.190.25.48"  # 외부 (WAN)
SSH_PORT_LOCAL="22"
SSH_PORT_WAN="2222"
REMOTE_DIR="~/srv/box"
LOCAL_CLIENT_ROOT="."

# --- 네트워크 자동 감지 ---
# 집 LAN IP의 SSH 포트(22)가 2초 내 응답 시 → 집 환경, 아니면 → 외부 환경
if nc -z -G 2 "$LOCAL_HOST" "$SSH_PORT_LOCAL" > /dev/null 2>&1; then
  REMOTE_HOST="$LOCAL_HOST"
  SSH_PORT="$SSH_PORT_LOCAL"
  SSH_OPT=""
  RSYNC_SSH="ssh"
  echo "🏠 집 네트워크 감지됨 → LAN($REMOTE_HOST) 배포"
else
  REMOTE_HOST="125.190.25.48" # WAN 주소 재설정 (위에서 이미 설정했지만 명시적)
  SSH_PORT="$SSH_PORT_WAN"
  SSH_OPT="-p $SSH_PORT"
  RSYNC_SSH="ssh -p $SSH_PORT"
  echo "🌐 외부 네트워크 감지됨 → WAN($REMOTE_HOST:$SSH_PORT) 배포"
fi

# 0. TOBY 앱 빌드 및 복사 (정적 서빙 대비)
echo "📦 TOBY 앱 빌드 중..."
cd ../toby
npm install && npm run build
cd ../web
mkdir -p public/toby
rm -rf public/toby/*
cp -r ../toby/dist/* public/toby/
echo "✅ TOBY 빌드 및 복사 완료"

# 1. 서버에 디렉토리가 없으면 생성
ssh $SSH_OPT $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# 1. 로컬 클라이언트 파일 서버로 동기화 (삭제된 파일도 서버에서 제거)
echo "📤 파일 동기화 중 (rsync)..."
rsync -avz --delete --progress -e "$RSYNC_SSH" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  $LOCAL_CLIENT_ROOT/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# 2. 서버에서 빌드 및 실행 명령 전달
echo "🛠️ 서버에서 빌드 및 PM2 실행 중..."
ssh $SSH_OPT $REMOTE_USER@$REMOTE_HOST "
  export NVM_DIR=\"\$HOME/.nvm\"
  [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
  
  if command -v nvm > /dev/null 2>&1; then
    nvm use 22 || nvm use 20
  fi
  
  echo \"사용중인 Node 버전: \$(node -v)\"
  
  cd $REMOTE_DIR && \
  npm install --legacy-peer-deps --ignore-engines && \
  export NEXT_PUBLIC_API_URL=https://claw-addict-server.haroo.site && \
  export NODE_OPTIONS=\"--max-old-space-size=4096\" && \
  npm run build && \
  pm2 reload box-fe --update-env || pm2 start ecosystem.config.js
"

echo "✅ 배포 완료! https://box.haroo.site 주소를 확인하세요."
