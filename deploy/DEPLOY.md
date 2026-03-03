# Backend Deployment Guide

Deploying the **lacen-app** backend to a fresh **Ubuntu 24.04 LTS** server.

**Architecture overview:**
- Docker container runs the Node.js + R API on port 3000 (loopback only)
- nginx sits in front, terminates HTTPS, and proxies all traffic to the container
- Let's Encrypt (via Certbot) provides the TLS certificate
- Since the app doesn't have a custom domain, `sslip.io` is used — a free public DNS service where `YOUR_DOMAIN` automatically resolves to `YOUR_SERVER_IP`

---

## Before you start — replace the placeholders

The deploy files committed to the repository use placeholders instead of real values to avoid exposing sensitive infrastructure details in a public repo. **Search-and-replace every placeholder before running anything.**

| Placeholder | What to put there | Where it appears |
|---|---|---|
| `YOUR_SERVER_IP` | Your server's public IPv4 address (e.g. `203.0.113.42`) | `setup.sh`, `nginx/lacen-api.conf`, this doc |
| `YOUR_DOMAIN` | The full domain that resolves to your server (e.g. `YOUR_SERVER_IP.sslip.io` if using sslip.io) | `setup.sh`, `nginx/lacen-api.conf`, this doc |
| `https://your-frontend.netlify.app` | The exact Netlify URL of your frontend (no trailing slash) | `setup.sh`, `default.env`, this doc |
| `your@email.com` | A real e-mail for Let's Encrypt renewal notices | `setup.sh` |

> **Local working copies:** `deploy/setup.local.sh` and `deploy/nginx/lacen-api.local.conf` are git-ignored copies of those files where you can store the real values safely. Edit them instead of the committed files when running the deploy on your server.

---

## Prerequisites

Before starting:

- SSH access to the server as the `ubuntu` user with `sudo` privileges
- The Docker image `gpato/lacen-app:4.0.0` is published on Docker Hub
- Port **80** and **443** are open in the cloud provider's firewall/security group (separate from UFW)
- Your Netlify frontend URL is known (needed for the CORS setting)

---

## Step 1 — Copy the deploy files to the server

From your **local machine**, copy the `deploy/` folder to the server:

```bash
scp -r deploy/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/lacen-deploy/
```

Then SSH into the server:

```bash
ssh ubuntu@YOUR_SERVER_IP
```

---

## Step 2 — Install Docker

Run the following on the server. Docker is installed from the official Docker repository, not the Ubuntu default (which ships an older version).

```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the Docker apt repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

# Install Docker Engine and the Compose plugin
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow the ubuntu user to run docker without sudo
sudo usermod -aG docker ubuntu
```

> **Important:** Log out and back in after running `usermod`, or run `newgrp docker` in the current session, so the group change takes effect.

Verify:

```bash
docker --version
docker compose version
```

---

## Step 3 — Install nginx and Certbot

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Verify nginx is running:

```bash
sudo systemctl status nginx
```

---

## Step 4 — Configure the firewall (UFW)

Allow SSH, HTTP, and HTTPS. Explicitly block port 3000 from the public internet — nginx proxies to Node internally over loopback.

```bash
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw deny 3000/tcp
sudo ufw --force enable
sudo ufw status numbered
```

Expected output includes rules for ports 22, 80, 443, and a DENY for 3000.

---

## Step 5 — Create the app directory and persistent storage

```bash
mkdir -p /home/ubuntu/lacen/saved-files
chmod 777 /home/ubuntu/lacen/saved-files
```

The broad `777` permission is needed because the container's `node` user (uid 1001) and `www-data` (uid 33) both write to this directory. You can tighten this after verifying which user actually writes in practice.

---

## Step 6 — Create the Docker Compose file

Copy the prepared compose file from the deploy package:

```bash
cp /home/ubuntu/lacen-deploy/docker-compose.yml /home/ubuntu/lacen/docker-compose.yml
```

The file binds port 3000 to `127.0.0.1` only, so the container is never directly reachable from the internet:

```yaml
services:
  node:
    container_name: lacen_back_node
    image: gpato/lacen-app:4.0.0
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    env_file:
      - ./.env
    volumes:
      - "/home/ubuntu/lacen/saved-files:/opt/app/saved-files"
```

---

## Step 7 — Create the production `.env`

Create `/home/ubuntu/lacen/.env` with the following content. Replace the `BASE_URL_FRONT` value with your actual Netlify URL.

```bash
cat > /home/ubuntu/lacen/.env << 'EOF'
NODE_ENV=production
PORT=3000
SCRIPTS_PATH=dist/scripts
SAVED_FILES_PATH=saved-files
INIT_MAXBLOCKSIZE=30000
INIT_NUM_CORES=4
BASE_URL_FRONT=https://your-frontend.netlify.app
EOF
```

> **Variable notes:**
> - `SCRIPTS_PATH=dist/scripts` — do not change. In the built Docker image the R scripts live at `dist/scripts/`, not `src/scripts/`.
> - `INIT_MAXBLOCKSIZE` — set to `5000` for servers with <16 GB RAM, `30000` for larger.
> - `INIT_NUM_CORES` — run `nproc` on the server and use that number.
> - `BASE_URL_FRONT` — the exact origin of the frontend (no trailing slash). This is the Socket.IO CORS whitelist.

Verify the file looks correct:

```bash
cat /home/ubuntu/lacen/.env
```

---

## Step 8 — Pull the image and start the container

```bash
cd /home/ubuntu/lacen
docker pull gpato/lacen-app:4.0.0
docker compose up -d
```

Check that it started cleanly:

```bash
docker compose ps
docker compose logs --tail=30
```

You should see:
```
[EXPRESS] Production server up and running. Port 3000
```

The container is running but not yet accessible from outside — nginx is not configured yet.

---

## Step 9 — Install the nginx configuration

Copy the prepared config and replace the placeholder domain with the real one:

```bash
sudo cp /home/ubuntu/lacen-deploy/nginx/lacen-api.conf /etc/nginx/sites-available/lacen-api
sudo ln -sfn /etc/nginx/sites-available/lacen-api /etc/nginx/sites-enabled/lacen-api

# Remove the default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test the configuration
sudo nginx -t
sudo systemctl reload nginx
```

At this point the server responds on port 80 (HTTP) but has no TLS yet. The HTTPS server block does **not** exist yet — Certbot creates it in the next step. This is intentional: nginx cannot start a `listen 443 ssl` block without a certificate already in place.

---

## Step 10 — Obtain the Let's Encrypt certificate

Certbot will verify domain ownership over HTTP, issue the certificate, and automatically rewrite the nginx config to add the HTTPS server block.

```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

Follow the interactive prompts (enter an email address for renewal notices, agree to TOS).

When it finishes, verify the certificate and auto-renewal timer:

```bash
sudo certbot certificates
sudo systemctl status certbot.timer
```

Reload nginx to apply the new TLS config:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 11 — Verify the deployment

Test the REST API:

```bash
curl -k https://YOUR_DOMAIN/checkIdentifier?identifier=test
```

Expected: a JSON response (not a connection error or 502).

Test from a browser by opening the Netlify frontend — watch the browser DevTools Network tab and confirm:
- API calls go to `https://YOUR_DOMAIN/...` and return 200
- The Socket.IO connection establishes to `wss://YOUR_DOMAIN/socket`

---

## Useful commands post-deployment

```bash
# View live container logs
docker compose -f /home/ubuntu/lacen/docker-compose.yml logs -f

# Restart the container (e.g. after editing .env)
docker compose -f /home/ubuntu/lacen/docker-compose.yml restart

# Reload nginx after any config change
sudo nginx -t && sudo systemctl reload nginx

# Test certificate renewal (dry run, no changes)
sudo certbot renew --dry-run

# Check disk usage of saved user files
du -sh /home/ubuntu/lacen/saved-files/
```

---

## Migrating to a custom domain later

If you acquire a custom domain (e.g. `api.yourdomain.com`):

1. Add an `A` record pointing `api.yourdomain.com` → `YOUR_SERVER_IP`
2. Update the nginx config:
   ```bash
   sudo sed -i 's/YOUR_DOMAIN/api.yourdomain.com/g' \
       /etc/nginx/sites-available/lacen-api
   ```
3. Issue a new certificate:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```
4. Update `BASE_URL_FRONT` in `/home/ubuntu/lacen/.env` and update the frontend's `VITE_SERVER_URL` env var on Netlify to the new domain.

---

## Automated setup (optional)

All steps above are encoded in `deploy/setup.sh`. Edit the variables at the top of the file and run it as root to perform the full setup in one shot:

```bash
# Edit DOMAIN and FRONTEND_ORIGIN at the top of the script first
nano /home/ubuntu/lacen-deploy/setup.sh

sudo bash /home/ubuntu/lacen-deploy/setup.sh
```
