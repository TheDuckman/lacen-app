# LACEN Docker Build Process Documentation

## Overview

The LACEN application uses a **two-stage Docker image strategy** to separate the R environment setup from the Node.js backend application. This approach makes the R package installation process independent from the Node.js server creation, improving build times and maintainability.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LACEN System                            │
│                                                             │
│  ┌──────────────────┐         ┌─────────────────────┐       │
│  │  lacen-base      │────────▶│   lacen-app         │       │
│  │  (Base Image)    │  FROM   │   (Application)     │       │
│  │                  │         │                     │       │
│  │  - Ubuntu Jammy  │         │  - Node Backend     │       │
│  │  - R + Packages  │         │  - TypeScript       │       │
│  │  - Node.js 20    │         │  - R Scripts        │       │
│  │  - System Deps   │         │  - SSL Certs        │       │
│  └──────────────────┘         └─────────────────────┘       │
│         ^                              │                    │
│         │                              │                    │
│    Build First                    Depends On                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Stage 1: lacen-base Image

**Location:** `/lacen-base/`  
**Purpose:** Creates a base Docker image with all R dependencies, system libraries, and the custom LACEN R package pre-installed.

### What It Contains

1. **Base OS:** Ubuntu 22.04 LTS (Jammy)
2. **System Dependencies:**
   - R base (version 4.x)
   - Node.js 20.x
   - Yarn package manager
   - Development libraries (libcurl, libssl, libxml2, etc.)
   - Graphics libraries (harfbuzz, freetype, png, jpeg, tiff)
   - Geospatial libraries (GDAL, PROJ, GEOS)
   - Git, cron, and build tools

3. **R Packages:**
   - git2r
   - Matrix
   - BiocManager
   - remotes
   - **lacen** (custom R package from GitHub: `sanches-leo/lacen`)

### Build Process

#### File: `lacen-base/Dockerfile`

```dockerfile
FROM ubuntu:jammy
ENV DEBIAN_FRONTEND=noninteractive

# 1. System Updates & Basic Tools
# 2. Add R and Yarn Repositories
# 3. Install R, Node.js, and Yarn
# 4. Run R Package Installation Script
```

**Key Steps:**
1. Updates Ubuntu packages
2. Installs system dependencies required by R packages
3. Adds external repositories (R CRAN, Yarn, Node.js)
4. Installs R base and Node.js 20
5. Copies and runs `installpackages.R` to install R dependencies

#### File: `lacen-base/installpackages.R`

```r
options(timeout=9999)

install.packages(c("git2r", "Matrix", "BiocManager", "remotes"), 
                 dependencies=TRUE, 
                 repos = "http://cran.r-project.org")

BiocManager::install("sanches-leo/lacen")
```

**Purpose:** Installs the custom LACEN R package from GitHub along with its dependencies.

#### File: `lacen-base/build.sh`

```bash
VERSION=4.0.0
IMAGE="gpato/lacen-base"

# Creates timestamped logs in logs/ directory
# Builds the Docker image
# Tags with version and latest
# Pushes to Docker Hub
```

**Build Command:**
```bash
cd lacen-base
./build.sh
```

**Outputs:**
- Docker image: `gpato/lacen-base:4.0.0`
- Docker image: `gpato/lacen-base:latest`
- Build log: `logs/build_YYYYMMDD_HHMMSS.log`

---

## Stage 2: lacen-app Image

**Location:** `/back/`  
**Purpose:** Creates the Node.js backend application that runs the LACEN web server and coordinates R script execution.

### What It Contains

1. **Base:** Uses `gpato/lacen-base` image (inherits all R setup)
2. **Node.js Backend:**
   - TypeScript application
   - Express.js web server
   - Socket.io for real-time communication
   - R script execution handlers

3. **Application Structure:**
   - Compiled TypeScript code (`/opt/app/dist`)
   - R analysis scripts (`/opt/app/dist/scripts`)
   - SSL certificates for HTTPS
   - Saved data directory (`/opt/app/saved-files`)

### Build Process

#### File: `back/Dockerfile`

```dockerfile
FROM gpato/lacen-base:3.1.0
ENV DEBIAN_FRONTEND=noninteractive

# 1. Create node user and working directories
# 2. Install Node.js dependencies
# 3. Copy source code
# 4. Build TypeScript application
# 5. Copy R scripts
# 6. Generate SSL certificates
```

**Key Steps:**

1. **User Setup:**
   - Creates `node` user (UID 1001, GID 513)
   - Creates `/opt/app` directory owned by `node`
   - Creates `/opt/app/saved-files` owned by `www-data` for data persistence

2. **Dependency Installation:**
   - Installs Node.js packages via Yarn
   - Uses production flag for optimized builds

3. **Application Build:**
   - Copies TypeScript source code
   - Compiles TypeScript to JavaScript (`yarn build`)
   - Copies R scripts to distribution folder

4. **SSL Certificate Generation:**
   - Creates self-signed SSL certificate for localhost
   - Uses OpenSSL with custom configuration

5. **Runtime:**
   - Sets entrypoint to `yarn production-run`
   - Runs the compiled Node.js application

#### File: `back/build.sh`

```bash
# Reads version from package.json
# Builds Docker image with --no-cache
# Tags with version and latest
# Pushes to Docker Hub
```

**Build Command:**
```bash
cd back
./build.sh
```

**Outputs:**
- Docker image: `gpato/lacen-app:3.1.0` (version from package.json)
- Docker image: `gpato/lacen-app:latest`

---

## Version Management

### Important Version Dependencies

⚠️ **Critical:** The `back/Dockerfile` references a specific version of `lacen-base`:

```dockerfile
FROM gpato/lacen-base:4.0.0
```

### Updating Versions

1. **When updating lacen-base:**
   ```bash
   # 1. Update version in lacen-base/build.sh
   VERSION=4.0.0
   
   # 2. Build and push
   cd lacen-base
   ./build.sh
   
   # 3. Update back/Dockerfile to use new base version
   FROM gpato/lacen-base:4.0.0
   
   # 4. Rebuild lacen-app
   cd ../back
   ./build.sh
   ```

2. **When updating lacen-app:**
   ```bash
   # 1. Update version in back/package.json
   "version": "4.0.0"
   
   # 2. Build and push (version is read from package.json)
   cd back
   ./build.sh
   ```

---

## Deployment

### Using Docker Compose

**File:** `back/docker-compose.yml`

```yaml
services:
  node:
    container_name: lacen_back_node
    image: gpato/lacen-app:4.0.0
    restart: always
    ports:
      - 3000:3000
    env_file:
      - ./.env
    volumes:
      - "/home/pato/Projects/lacen-app-v2/saved-files/:/opt/app/saved-files"
```

**Key Configuration:**
- **Port Mapping:** Host port 3000 → Container port 3000
- **Environment:** Loaded from `.env` file
- **Volume Mount:** Persistent storage for user data and R analysis results
- **Restart Policy:** Always restart on failure

**Start the application:**
```bash
cd back
docker-compose up -d
```

---

## Build Logs

Both build scripts now generate timestamped log files:

### lacen-base logs:
```
lacen-base/logs/build_20260215_132228.log
lacen-base/logs/build_20260215_145630.log
```

### lacen-app logs:
Each build captures the complete Docker build output for debugging.

---

## Directory Structure

```
lacen-app-v2/
│
├── lacen-base/                 # Base Docker image with R environment
│   ├── Dockerfile              # Base image definition
│   ├── installpackages.R       # R package installation script
│   ├── build.sh                # Build script (creates versioned images)
│   ├── dockerhub-auth.txt      # Docker Hub credentials (gitignored)
│   └── logs/                   # Timestamped build logs
│       └── build_*.log
│
├── back/                       # Node.js application Docker image
│   ├── Dockerfile              # Application image definition (FROM lacen-base)
│   ├── build.sh                # Build script (version from package.json)
│   ├── docker-compose.yml      # Container orchestration
│   ├── openssl-config          # SSL certificate configuration
│   ├── package.json            # Node.js dependencies & version
│   ├── tsconfig.json           # TypeScript configuration
│   ├── src/                    # TypeScript source code
│   │   ├── server.ts           # Application entry point
│   │   ├── controllers/        # Route handlers
│   │   └── scripts/            # R analysis scripts
│   └── dockerhub-auth.txt      # Docker Hub credentials (gitignored)
│
├── saved-files/                # Persistent data (mounted as volume)
│   └── {identifier}/           # Per-user analysis data
│       ├── data/               # R data files (.RData)
│       ├── imgs/               # Generated plots
│       ├── logs/               # R execution logs
│       └── uploads/            # User-uploaded files
│
└── front/                      # Vue.js frontend (separate deployment)
```

---

## Common Tasks

### 1. Full Rebuild (Both Images)

```bash
# Build base image first
cd lacen-base
./build.sh

# Update back/Dockerfile if base version changed
# Then build app image
cd ../back
./build.sh
```

### 2. Update Only R Packages

```bash
# 1. Update lacen-base/installpackages.R
# 2. Increment version in lacen-base/build.sh
# 3. Rebuild base image
cd lacen-base
./build.sh

# 4. Update back/Dockerfile to use new base version
# 5. Rebuild app
cd ../back
./build.sh
```

### 3. Update Only Node.js Code

```bash
# 1. Make changes in back/src/
# 2. Update version in back/package.json
# 3. Rebuild app (base image unchanged)
cd back
./build.sh
```

### 4. Local Development (No Docker)

```bash
# Backend
cd back
yarn install
yarn dev

# Frontend
cd front
yarn install
yarn dev
```

---

## Troubleshooting

### Build Failures

1. **Check build logs:**
   ```bash
   tail -f lacen-base/logs/build_*.log
   ```

2. **Common issues:**
   - R package compilation errors → Check system dependencies in Dockerfile
   - Network timeouts → Increase timeout in installpackages.R
   - Permission errors → Verify user/group IDs match host system

### Version Mismatches

If you see errors about missing dependencies:
1. Check `back/Dockerfile` FROM statement matches built lacen-base version
2. Ensure lacen-base image exists: `docker images | grep lacen-base`
3. Pull from Docker Hub if needed: `docker pull gpato/lacen-base:3.1.0`

### Docker Hub Authentication

Both builds push to Docker Hub. Ensure `dockerhub-auth.txt` contains your password:
```bash
echo "your_password" > dockerhub-auth.txt
```

---

## Key Benefits of Two-Stage Approach

1. **Faster Iteration:** R packages (slow to install) are cached in base image
2. **Independent Updates:** Update Node.js code without reinstalling R packages
3. **Smaller App Builds:** Application layer is smaller and builds faster
4. **Versioning:** Can lock to specific R environment versions
5. **Separation of Concerns:** R environment vs application logic

---

## Production Checklist

Before deploying to production:

- [ ] Update version in `lacen-base/build.sh`
- [ ] Update version in `back/package.json`
- [ ] Ensure `back/Dockerfile` references correct lacen-base version
- [ ] Set production environment variables in `back/.env`
- [ ] Configure proper SSL certificates (not self-signed)
- [ ] Set up volume backups for `saved-files/`
- [ ] Configure reverse proxy (nginx/traefik) for HTTPS
- [ ] Set up monitoring and logging
- [ ] Test with production data

---

## Additional Notes

- **Node User Security:** Application runs as unprivileged `node` user (UID 1001)
- **Data Persistence:** `saved-files/` must be owned by UID 33 (www-data) on host
- **SSL Certificates:** Self-signed certs are for development only
- **Build Cache:** Use `--no-cache` flag in build.sh to force full rebuild
- **Port 3000:** Backend API default port (configurable via environment)
