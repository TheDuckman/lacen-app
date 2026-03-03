#!/usr/bin/env bash
# deploy/setup.sh
#
# Bootstrap a fresh Ubuntu 22.04 server for the lacen-app backend.
# Run once as the ubuntu user (sudo access required).
#
# Usage:
#   1. Copy this repo (or at least the deploy/ folder) to the server
#   2. Edit deploy/.env with your real values (see deploy/default.env)
#   3. chmod +x deploy/setup.sh && sudo deploy/setup.sh
#
# What this script does:
#   - Installs Docker, Docker Compose plugin, nginx, certbot
#   - Configures UFW firewall
#   - Creates /home/ubuntu/lacen/ workspace
#   - Deploys the Docker Compose stack
#   - Installs the nginx config
#   - Obtains a Let's Encrypt certificate (requires DNS already pointing here)

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit these before running
# ---------------------------------------------------------------------------
#
# DOMAIN: If you don't have a custom domain, use sslip.io with your server IP.
#   sslip.io is a free public DNS service: <ip>.sslip.io resolves to <ip>.
#   This lets Certbot issue a real Let's Encrypt cert for a bare IP address.
#   Example for IP 200.144.245.37 → 200.144.245.37.sslip.io
#
#   If you have a custom domain later, just replace this value and re-run
#   certbot --nginx -d your.domain.com
#
DOMAIN="YOUR_SERVER_IP.sslip.io"          # sslip.io domain — replace YOUR_SERVER_IP with your server's public IP
FRONTEND_ORIGIN="https://your-frontend.netlify.app"  # Exact frontend URL (no trailing slash)
NUM_CORES="$(nproc)"                  # Auto-detected; override if needed
MAXBLOCKSIZE=30000                    # Adjust to server RAM (5000 = small, 30000 = large)
APP_DIR="/home/ubuntu/lacen"
SAVED_FILES_DIR="${APP_DIR}/saved-files"
IMAGE="gpato/lacen-app:4.0.0"

# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> [1/7] Installing system packages"
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw nginx certbot python3-certbot-nginx

# Docker (official repo)
if ! command -v docker &>/dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" \
      | tee /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker ubuntu
fi
echo "    Docker $(docker --version)"
echo "    Docker Compose $(docker compose version)"

echo "==> [2/7] Configuring firewall (UFW)"
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable
# Port 3000 must NOT be publicly accessible (nginx proxies to it over loopback)
ufw deny 3000/tcp
echo "    UFW status:"
ufw status numbered

echo "==> [3/7] Creating app directory structure"
mkdir -p "${SAVED_FILES_DIR}"
# Broad write permission so both node (uid 1001) and www-data (uid 33)
# inside the container can write. Tighten after verifying which uid writes.
chmod 777 "${SAVED_FILES_DIR}"
echo "    Directory: ${APP_DIR}"

echo "==> [4/7] Writing docker-compose.yml and .env"
cp "${SCRIPT_DIR}/docker-compose.yml" "${APP_DIR}/docker-compose.yml"

cat > "${APP_DIR}/.env" <<EOF
NODE_ENV=production
PORT=3000
SCRIPTS_PATH=dist/scripts
SAVED_FILES_PATH=saved-files
INIT_MAXBLOCKSIZE=${MAXBLOCKSIZE}
INIT_NUM_CORES=${NUM_CORES}
BASE_URL_FRONT=${FRONTEND_ORIGIN}
EOF

echo "    .env written to ${APP_DIR}/.env"
echo "    Review it with: cat ${APP_DIR}/.env"

echo "==> [5/7] Pulling image and starting Docker Compose stack"
cd "${APP_DIR}"
docker pull "${IMAGE}"
docker compose up -d
docker compose ps
echo "    Container logs (last 20 lines):"
docker compose logs --tail=20

echo "==> [6/7] Installing nginx configuration"
NGINX_CONF="/etc/nginx/sites-available/lacen-api"
cp "${SCRIPT_DIR}/nginx/lacen-api.conf" "${NGINX_CONF}"
# Replace placeholder domain with real domain in the config
sed -i "s/api.yourdomain.com/${DOMAIN}/g" "${NGINX_CONF}"
ln -sfn "${NGINX_CONF}" /etc/nginx/sites-enabled/lacen-api
# Remove default site if still present
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo "    nginx config installed for ${DOMAIN}"

echo "==> [7/7] Obtaining Let's Encrypt certificate"
echo ""
echo "    DNS propagation check: the domain ${DOMAIN} must already"
echo "    resolve to this server's public IP before continuing."
echo ""
read -rp "    Press ENTER to run certbot, or Ctrl-C to abort and run it manually later..."
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos \
    --email "your@email.com" \
    --redirect
echo ""
echo "    Certificate issued. Auto-renewal is handled by the certbot systemd timer."
systemctl status certbot.timer --no-pager | grep "Active:"

echo ""
echo "======================================================================"
echo "  Deployment complete!"
echo ""
echo "  API endpoint:  https://${DOMAIN}"
echo "  App directory: ${APP_DIR}"
echo "  Saved files:   ${SAVED_FILES_DIR}"
echo ""
echo "  Useful commands:"
echo "    docker compose -f ${APP_DIR}/docker-compose.yml logs -f"
echo "    docker compose -f ${APP_DIR}/docker-compose.yml restart"
echo "    certbot renew --dry-run"
echo "======================================================================"
