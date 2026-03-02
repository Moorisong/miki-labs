#!/bin/bash

# --- 설정 변수 ---
REMOTE_USER="ksh"
REMOTE_HOST="125.190.25.48"
SSH_PORT="2222"
REMOTE_DIR="~/haroo-box/apps/server"
LOCAL_SERVER_ROOT="."

echo "🌐 홈서버($REMOTE_HOST:$SSH_PORT)로 백엔드 단독 배포를 시작합니다..."

# 0. 서버에 디렉토리가 없으면 생성
ssh -p $SSH_PORT $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# 1. 로컬 백엔드 파일 서버로 동기화
echo "📤 파일 동기화 중 (rsync)..."
rsync -avz --progress -e "ssh -p $SSH_PORT" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env' \
  $LOCAL_SERVER_ROOT/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# 2. 서버에서 빌드 및 실행 명령 전달
echo "🛠️ 서버에서 빌드 및 PM2 실행 중..."
ssh -p $SSH_PORT $REMOTE_USER@$REMOTE_HOST "
  export NVM_DIR=\"\$HOME/.nvm\"
  [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
  
  if command -v nvm >/dev/null 2>&1; then
    nvm use 20
  fi
  
  echo \"사용중인 Node 버전: \$(node -v)\"
  
  cd $REMOTE_DIR && \
  npm install && \
  npm run build && \
  # PM2 실행 (기존 프로세스가 있으면 유지하고 리로드, 없으면 새로 시작)
  pm2 reload box-be --update-env || pm2 start ecosystem.config.js
"

echo "✅ 배포 완료!"
