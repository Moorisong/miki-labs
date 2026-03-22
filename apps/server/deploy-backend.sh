#!/bin/bash
set -e

# --- 공통 설정 ---
REMOTE_USER="ksh"
LOCAL_HOST="192.168.0.6"     # 집 (LAN)
REMOTE_HOST="125.190.25.48"  # 외부 (WAN)
SSH_PORT_LOCAL="22"
SSH_PORT_WAN="2222"
REMOTE_DIR="~/haroo-box/apps/server"
LOCAL_SERVER_ROOT="."

# --- 네트워크 자동 감지 ---
# 집 LAN IP로 ping 2초 내 응답 시 → 집 환경, 아니면 → 외부 환경
if ping -c 1 -W 2 "$LOCAL_HOST" > /dev/null 2>&1; then
  REMOTE_HOST="$LOCAL_HOST"
  SSH_PORT="$SSH_PORT_LOCAL"
  SSH_OPT=""
  RSYNC_SSH="ssh"
  echo "🏠 집 네트워크 감지됨 → LAN($REMOTE_HOST) 배포"
else
  SSH_PORT="$SSH_PORT_WAN"
  SSH_OPT="-p $SSH_PORT"
  RSYNC_SSH="ssh -p $SSH_PORT"
  echo "🌐 외부 네트워크 감지됨 → WAN($REMOTE_HOST:$SSH_PORT) 배포"
fi

# 0. 서버에 디렉토리가 없으면 생성
ssh $SSH_OPT $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# 1. 로컬 백엔드 파일 서버로 동기화 (삭제된 파일도 서버에서 제거)
echo "📤 파일 동기화 중 (rsync)..."
rsync -avz --delete --progress -e "$RSYNC_SSH" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env' \
  $LOCAL_SERVER_ROOT/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# 2. 서버에서 빌드 및 실행 명령 전달
echo "🛠️ 서버에서 빌드 및 PM2 실행 중..."
ssh $SSH_OPT $REMOTE_USER@$REMOTE_HOST "
  export NVM_DIR=\"\$HOME/.nvm\"
  [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
  
  if command -v nvm > /dev/null 2>&1; then
    nvm use 20
  fi
  
  echo \"사용중인 Node 버전: \$(node -v)\"
  
  cd $REMOTE_DIR && \
  npm install && \
  npm run build && \
  # PM2 설정이 변경되었을 가능성(경로 등)이 있으므로 기존 프로세스를 삭제하고 재시작하여 CWD 및 환경설정을 갱신함
  pm2 delete box-be || true && \
  pm2 start ecosystem.config.js
"

echo "✅ 배포 완료!"
