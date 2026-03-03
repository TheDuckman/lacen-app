# LACEN App

LACEN is a web application for co-expression network analysis of RNA-seq data. It wraps the [`lacen` R package](https://github.com/sanches-leo/lacen) in a guided, multi-step browser interface that walks researchers through the full WGCNA-based workflow: from raw count upload to module enrichment and lncRNA network analysis.

---

## Table of Contents

- [LACEN App](#lacen-app)
	- [Table of Contents](#table-of-contents)
	- [Architecture overview](#architecture-overview)
	- [Repository structure](#repository-structure)
	- [Docker image strategy](#docker-image-strategy)
		- [Stage 1 — `lacen-base`](#stage-1--lacen-base)
		- [Stage 2 — `lacen-app`](#stage-2--lacen-app)
	- [Backend](#backend)
		- [Express + Socket.io server](#express--socketio-server)
		- [Per-user session model](#per-user-session-model)
		- [R execution mechanism](#r-execution-mechanism)
			- [Pattern 1 — Stateless script call](#pattern-1--stateless-script-call)
			- [Pattern 2 — Stateful inline session](#pattern-2--stateful-inline-session)
			- [stdout / stderr streaming](#stdout--stderr-streaming)
		- [API routes](#api-routes)
		- [Socket.io events](#socketio-events)
		- [Backend environment variables](#backend-environment-variables)
	- [Frontend](#frontend)
		- [Analysis workflow (pages)](#analysis-workflow-pages)
		- [State management](#state-management)
		- [Socket.io on the frontend](#socketio-on-the-frontend)
		- [Frontend environment variables](#frontend-environment-variables)
	- [Local development (without Docker)](#local-development-without-docker)
		- [Prerequisites](#prerequisites)
		- [Backend](#backend-1)
		- [Frontend](#frontend-1)
	- [Building Docker images](#building-docker-images)
		- [Rebuild only the backend (most common)](#rebuild-only-the-backend-most-common)
		- [Rebuild both images (when R packages change)](#rebuild-both-images-when-r-packages-change)
	- [Deployment](#deployment)

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser                                                            │
│  Vue 3 SPA (Vite + Vuetify)                                         │
│  • Guided multi-step UI                                             │
│  • HTTP requests  ──────────────────────────┐                       │
│  • Socket.io (real-time events) ────────────┤                       │
└─────────────────────────────────────────────┼───────────────────────┘
                                              │ HTTPS / WSS
                                    ┌─────────▼──────────┐
                                    │  nginx (host)      │
                                    │  TLS termination   │
                                    │  proxy → :3000     │
                                    └─────────┬──────────┘
                                              │ HTTP (loopback)
                          ┌───────────────────▼───────────────────────┐
                          │  Docker container  (lacen-app image)       │
                          │                                            │
                          │  Node.js / Express  (:3000)                │
                          │  Socket.io server                          │
                          │    │                                       │
                          │    └── child_process.spawn ──► Rscript     │
                          │            │            (lacen R package)  │
                          │            └── stdout/stderr streamed      │
                          │                to Socket.io events         │
                          │                                            │
                          │  Volume mount: saved-files/                │
                          └────────────────────────────────────────────┘
```

---

## Repository structure

```
lacen-app-v2/
│
├── lacen-base/          # Stage 1: base Docker image (Ubuntu + R + lacen pkg)
│   ├── Dockerfile
│   ├── installpackages.R
│   ├── build.sh
│   └── logs/            # Timestamped build logs (gitignored)
│
├── back/                # Stage 2: application Docker image (Node.js backend)
│   ├── Dockerfile       # FROM gpato/lacen-base:x.y.z
│   ├── build.sh
│   ├── docker-compose.yml
│   ├── package.json     # Version is read by build.sh
│   ├── tsconfig.json
│   ├── openssl-config   # Self-signed cert config for prod
│   ├── default.env      # Template — copy to .env and fill in values
│   └── src/
│       ├── server.ts        # Entry point (Express + Socket.io bootstrap)
│       ├── app.ts           # Express app (middleware, static files, routes)
│       ├── logger.ts
│       ├── controllers/
│       │   └── main.controller.ts   # All route handlers
│       ├── routes/
│       │   └── routes.ts
│       ├── interface/
│       │   └── socket.interface.ts
│       ├── utils/
│       │   ├── constants.ts         # R script paths, variable names, events
│       │   ├── functions.ts         # spawn wrapper, pathsFilesCommands, etc.
│       │   └── types.ts
│       └── scripts/                 # R scripts (compiled into dist/scripts/)
│           ├── 00-getVariables.R
│           ├── 01-uploadFiles.R
│           └── 01-uploadFiles-datCounts.R
│
├── front/               # Vue 3 SPA (deployed separately, e.g. Netlify)
│   ├── vite.config.ts
│   ├── default.env      # Template — copy to .env and fill in values
│   └── src/
│       ├── pages/           # One Vue page per analysis step
│       ├── components/      # Shared UI components (drawer, navbar, dialogs)
│       ├── stores/          # Pinia stores (appState, userData)
│       ├── router/          # Vue Router (memory history)
│       ├── api/             # HTTP requester + Socket.io client
│       ├── composables/     # useFlowControl, useEmitter, useConfirmDialog
│       └── constants/
│
├── deploy/              # Production server setup (nginx, certbot, compose)
│   ├── DEPLOY.md        # Step-by-step deployment guide ← read this
│   ├── setup.sh         # Automated bootstrap script (fill placeholders first)
│   ├── default.env
│   ├── docker-compose.yml
│   └── nginx/
│       └── lacen-api.conf
│
├── saved-files/         # Persistent user data (Docker volume mount)
│   └── {identifier}/
│       ├── data/        # workspaceImage.RData
│       ├── imgs/        # PNGs generated by R (dendrograms, thresholds, etc.)
│       │   └── heatmaps/
│       ├── logs/        # fullLog.log  (all R stdout/stderr)
│       ├── lncrna/      # lncRNA analysis output files
│       └── uploads/     # Raw CSV files uploaded by the user
│
└── example/             # Sample dataset and expected output for testing
```

---

## Docker image strategy

LACEN uses a **two-stage image build** to keep the slow R package installation separate from the faster Node.js application build.

```
gpato/lacen-base:x.y.z          gpato/lacen-app:x.y.z
┌──────────────────────┐         ┌──────────────────────┐
│  Ubuntu 22.04 (Jammy)│         │  FROM lacen-base     │
│  R 4.x               │──FROM──▶│  Node.js backend     │
│  Node.js 20.x        │         │  TypeScript compiled │
│  lacen R package     │         │  R scripts           │
│  System dependencies │         │  SSL certs           │
└──────────────────────┘         └──────────────────────┘
   Build first                      Build second
   (slow, rarely changes)           (fast, changes often)
```

### Stage 1 — `lacen-base`

Defined in `lacen-base/Dockerfile`. Installs system libraries, R, Node.js 20, and the `lacen` R package from GitHub:

```r
# lacen-base/installpackages.R
install.packages(c("git2r", "Matrix", "BiocManager", "remotes"), ...)
BiocManager::install("sanches-leo/lacen")
```

Build and push:
```bash
cd lacen-base
./build.sh          # tags as gpato/lacen-base:VERSION and :latest
```

### Stage 2 — `lacen-app`

Defined in `back/Dockerfile`. Starts `FROM gpato/lacen-base:x.y.z`, installs Node.js dependencies, compiles TypeScript, copies R scripts to `dist/scripts/`, and generates a self-signed SSL certificate for production use.

Build and push:
```bash
cd back
./build.sh          # reads version from package.json
```

> ⚠️ When bumping the `lacen-base` version, update the `FROM` line in `back/Dockerfile` before rebuilding the app image.

---

## Backend

### Express + Socket.io server

`back/src/server.ts` bootstraps two servers from one Node.js process:

| Mode | Transport | Notes |
|---|---|---|
| Development | Plain HTTP | Socket.io at default path `/socket.io` |
| Production | HTTPS (self-signed cert) | Socket.io at custom path `/socket` (proxied by nginx) |

Both modes apply CORS from `BASE_URL_FRONT` so only the configured frontend origin can connect.

---

### Per-user session model

Every browser session is assigned a random **`identifier`** string. The backend uses this to namespace all file I/O for that session:

```
saved-files/
└── {identifier}/
    ├── data/workspaceImage.RData   ← persisted R workspace for this user
    ├── imgs/                       ← plots written by R
    │   └── heatmaps/
    ├── logs/fullLog.log            ← full R stdout + stderr log
    ├── lncrna/                     ← lncRNA output files
    └── uploads/                    ← user-uploaded CSVs
```

On first request (`GET /checkIdentifier`) the backend creates these folders. On session reset (`PUT /archiveRdata`) the folder is renamed with a timestamp and a fresh one is created.

---

### R execution mechanism

All R work is done by spawning child processes from Node.js using `child_process.spawn` (wrapped in `runProcessSpawn` in `back/src/utils/functions.ts`). There are two distinct patterns.

---

#### Pattern 1 — Stateless script call

Used when the operation maps cleanly to a single `.R` file (e.g. file ingestion).

```typescript
// Example: upload a CSV and store it in the user's RData workspace
await runProcessSpawn(identifier, "Rscript", [
  rScriptPaths.FILE_UPLOAD,          // e.g. dist/scripts/01-uploadFiles.R
  `${strObj.path.data}/workspaceImage.RData`,   // arg 1: path to RData file
  fileItem.variableName,             // arg 2: variable name to assign ("datExpression")
  filePath,                          // arg 3: path to the uploaded CSV
]);
```

The script receives its arguments via `commandArgs(trailingOnly = TRUE)`, loads the existing `.RData` workspace, does its work, saves the workspace back, and exits:

```r
# 01-uploadFiles.R
args <- commandArgs(trailingOnly = TRUE)
lacenVar_rdataPath <- args[1]
lacenVar_dataVar   <- args[2]
lacenVar_filepath  <- args[3]

if (file.exists(lacenVar_rdataPath)) load(lacenVar_rdataPath)

# Read the CSV into the named variable
do.call("<-", list(lacenVar_dataVar,
                   read.csv(lacenVar_filepath, check.names = FALSE)))

rm(lacenVar_dataVar, lacenVar_filepath, args)
save.image(lacenVar_rdataPath)
```

---

#### Pattern 2 — Stateful inline session

Used for most analysis steps, where the frontend sends arbitrary R expressions via `POST /runCommand`. The trick is to wrap the user's command together with the workspace load/save boilerplate and pipe the combined script into `Rscript /dev/stdin`:

```typescript
// back/src/controllers/main.controller.ts — runCommand handler
const result = await runProcessSpawn(identifier, "sh", [
  "-c",
  `printf "${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
]);
```

where `strObj.cmd` is assembled by `pathsFilesCommands()` in `functions.ts`:

```typescript
cmd: {
  // Load the workspace if the file exists
  load: `if (file.exists('${rdataFilepath}')) {\\nload('${rdataFilepath}');\\n}\\n`,
  // Save the workspace after the command runs
  save: `\\nsave.image('${rdataFilepath}');`,
  // Helper to load the lacen package
  lacen: "suppressPackageStartupMessages(library('lacen'));",
}
```

The full string piped to `Rscript /dev/stdin` therefore looks like:

```r
if (file.exists('/opt/app/saved-files/abc123/data/workspaceImage.RData')) {
  load('/opt/app/saved-files/abc123/data/workspaceImage.RData');
}
<user command here>
save.image('/opt/app/saved-files/abc123/data/workspaceImage.RData');
```

This lets the backend maintain a **persistent R workspace per user** across multiple HTTP requests without keeping a long-running R process alive — each request spins up a fresh `Rscript` process, but the state is preserved via the `.RData` file.

---

#### stdout / stderr streaming

Both patterns use the same `runSpawn` function, which streams `stdout` and `stderr` in real time:

1. Each chunk is appended to `saved-files/{identifier}/logs/fullLog.log`
2. Each chunk is broadcast to all connected Socket.io clients as `terminal-stdout` or `terminal-stderr` events, so the frontend can display a live terminal output

---

### API routes

All routes are prefixed at the root path and defined in `back/src/routes/routes.ts`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/checkIdentifier` | Create user folders if they don't exist; return existing session status |
| `PUT` | `/archiveRdata` | Archive current session and start fresh |
| `GET` | `/getVariables` | List variables currently in the user's R workspace |
| `POST` | `/runCommand` | Execute an arbitrary R expression in the user's workspace |
| `POST` | `/getImgPath` | Evaluate an R expression that returns an image path |
| `POST` | `/getHeatmapImgPath` | Same as above, for heatmap images |
| `POST` | `/setParameters` | Persist `maxBlockSize` and `numCores` settings to the session status |
| `POST` | `/uploadDataFiles` | Upload count, expression, and label CSV files |
| `POST` | `/uploadAnnotationFile` | Upload a coding/non-coding annotation file |
| `POST` | `/loadAnnotation` | Load annotation into R workspace |
| `GET` | `/instantiateLacenAndCheck` | Create the `lacenObject` and run initial QC |
| `GET` | `/filterTransform` | Filter and transform expression data |
| `POST` | `/selectOutlierSample` | Mark a sample as an outlier for removal |
| `POST` | `/acceptHeight` | Accept the dendrogram cut height |
| `GET` | `/generateThresholdPlot` | Generate soft-threshold power plot |
| `POST` | `/setIndicePower` | Set the chosen soft-threshold power |
| `GET` | `/runBootstrap` | Run bootstrap stability analysis |
| `GET` | `/skipBootstrap` | Skip bootstrap step |
| `GET` | `/downloadBootstrapCsv` | Download bootstrap results as CSV |
| `POST` | `/setCutBootstrap` | Set bootstrap cut value |
| `GET` | `/generateNetwork` | Build the WGCNA co-expression network |
| `GET` | `/generateStackedBarplot` | Generate stacked barplot for modules |
| `POST` | `/generateHeatmap` | Generate a module heatmap |
| `GET` | `/getHeatmapImgs` | List available heatmap image paths |
| `POST` | `/generateRnaNetworkAnalysisFiles` | Run lncRNA network analysis |
| `GET` | `/getLncRnaFolders` | List lncRNA output directories |
| `GET` | `/downloadLncRnaFile` | Download a specific lncRNA analysis file |

---

### Socket.io events

The server broadcasts events to the frontend during long-running R operations. All events carry `{ identifier, msg }`.

| Event name | Trigger |
|---|---|
| `update-status-obj` | Any step that modifies the session status JSON |
| `terminal-stdout` | R stdout chunk received |
| `terminal-stderr` | R stderr chunk received |
| `file-ok` | A data file was successfully loaded into the R workspace |
| `annotation-ok` | Annotation file loaded |
| `threshold-plot-ok` / `threshold-plot-error` | Soft-threshold plot generated or failed |
| `bootstrap-started` / `bootstrap-ok` / `bootstrap-error` | Bootstrap lifecycle |
| `generate-network-started` / `generate-network-ok` / `generate-network-error` | Network build lifecycle |
| `stacked-barplot-ok` / `stacked-barplot-error` | Stacked barplot generation |
| `heatmap-generated` / `heatmap-error` | Heatmap generation |
| `lncrna-network-analysis-generated` / `lncrna-network-analysis-error` | lncRNA analysis |

---

### Backend environment variables

Copy `back/default.env` to `back/.env` and fill in the values:

| Variable | Default (dev) | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` or `production` |
| `PORT` | `3000` | Port the Express server listens on |
| `SCRIPTS_PATH` | `src/scripts` | Path to R scripts. Use `dist/scripts` in production (compiled output) |
| `SAVED_FILES_PATH` | `saved-files` | Root directory for per-user session data |
| `INIT_MAXBLOCKSIZE` | `5000` | WGCNA `maxBlockSize`. Use `5000` for small VMs, `30000` for large ones |
| `INIT_NUM_CORES` | `4` | Number of CPU cores for parallel R operations (`nproc` on Linux) |
| `BASE_URL_FRONT` | `http://localhost:8080` | Exact frontend origin for Socket.io CORS — no trailing slash |

---

## Frontend

The frontend is a **Vue 3** single-page application built with **Vite** and **Vuetify 3**. It is deployed independently (e.g. on Netlify) and communicates with the backend over HTTPS and WebSockets.

### Analysis workflow (pages)

The application guides the user through a fixed sequence of steps managed by Vue Router and a Pinia store (`appState`):

| Step | Page component | What happens |
|---|---|---|
| — | `MainPage` | Landing page; user enters or recovers their session identifier |
| 1 | `DataInput` | Upload count matrix, expression matrix, and sample label CSV files |
| 2 | `RemovingOutliers` | Inspect sample dendrogram, mark and remove outlier samples |
| 3 | `PickingThreshold` | View soft-threshold power plot, select the appropriate power |
| 4 | `BootStraping` | (Optional) Run bootstrap to validate network stability |
| 5 | `CreatingNetwork` | Build the WGCNA co-expression network |
| 6 | `NetworkModules` | Browse network modules, view module plots |
| 7 | `EnrichedModules` | Gene set enrichment analysis on modules |
| 8 | `RnaNetworkAnalysis` | lncRNA–mRNA network analysis and file download |

The side drawer (`TheDrawer.vue`) shows all steps and their status (pending / current / done / skipped). Steps are locked by default — a step becomes navigable only after the previous one completes.

### State management

Two Pinia stores:

- **`appState`** — tracks the completion/skip status of each analysis step and the Socket.io connection state
- **`userData`** — stores the session `identifier` and per-step user inputs

### Socket.io on the frontend

`front/src/api/socket.ts` establishes the Socket.io connection on app load. Incoming events update the relevant Pinia state and/or trigger UI changes (e.g. displaying R terminal output, enabling the "next step" button when a long computation completes).

### Frontend environment variables

Copy `front/default.env` to `front/.env` and fill in the values:

| Variable | Default (dev) | Description |
|---|---|---|
| `VITE_NODE_ENV` | `development` | Environment label |
| `VITE_SERVER_URL` | `http://localhost:3000` | Backend base URL |
| `VITE_API_POSTFIX` | `/` | Postfix appended to `VITE_SERVER_URL` for REST calls |
| `VITE_STATIC_POSTFIX` | `/static/` | Postfix for static file URLs (images generated by R) |

> In production, set `VITE_SERVER_URL` to the HTTPS domain of the backend (e.g. `https://YOUR_DOMAIN`) via the Netlify environment variable panel.

---

## Local development (without Docker)

### Prerequisites

- Node.js 20+, Yarn
- R 4.x with the `lacen` package installed (`BiocManager::install("sanches-leo/lacen")`)

### Backend

```bash
cd back
cp default.env .env          # adjust SCRIPTS_PATH=src/scripts (already the default)
yarn install
yarn dev                     # ts-node-dev with hot reload on port 3000
```

### Frontend

```bash
cd front
cp default.env .env          # VITE_SERVER_URL=http://localhost:3000
yarn install
yarn dev                     # Vite dev server, typically on port 5173
```

The `saved-files/` directory at the repo root is used for session storage in dev mode (matches the default `SAVED_FILES_PATH=saved-files`).

---

## Building Docker images

### Rebuild only the backend (most common)

```bash
# 1. Make changes in back/src/
# 2. Bump version in back/package.json
cd back
./build.sh
```

### Rebuild both images (when R packages change)

```bash
# 1. Update lacen-base/installpackages.R if needed
# 2. Bump version in lacen-base/build.sh
cd lacen-base
./build.sh

# 3. Update FROM line in back/Dockerfile to the new base version
# 4. Bump version in back/package.json
cd ../back
./build.sh
```

Both build scripts require Docker Hub credentials in a `dockerhub-auth.txt` file in the respective directory (gitignored).

---

## Deployment

See [deploy/DEPLOY.md](deploy/DEPLOY.md) for the full step-by-step guide.

The short version:
1. Fill in the placeholders in `deploy/setup.sh` (or use your `deploy/setup.local.sh`)
2. Copy the `deploy/` folder to the server
3. Run `sudo bash setup.sh` — it installs Docker, nginx, certbot, pulls the image, and obtains a Let's Encrypt certificate

> **Note:** `NEW-README.md` in the repo root contains additional documentation focused specifically on the Docker build process and version management.
