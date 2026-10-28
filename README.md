# UIID Passkey-as-a-Service Demo

A lightweight demo application showcasing Passkey (WebAuthn) authentication integration powered by UIID Passkey-as-a-Service.

This repository demonstrates how to implement Passwordless Passkey registration and login in a web application with zero external npm dependencies using Node.js 20+ built-in features (`http`, `crypto`, native `fetch`).

---

## Features

- **Passwordless Passkey Authentication:** Fast and secure WebAuthn registration and sign-in.
- **Zero Third-Party Dependencies:** Implemented purely with Node.js 20+ native APIs (`http`, `fetch`, `crypto`).
- **Container Ready:** Includes `Dockerfile` and `docker-compose.yml` for quick deployment.
- **Configurable Backend:** Easily configurable via environment variables.

---

## Prerequisites

- **Node.js**: Version 20.0.0 or higher (for native global `fetch` support).
- **Docker & Docker Compose** (Optional, for containerized execution).

---

## Environment Variables

Configure your credentials and server endpoints using environment variables or a `.env` file setup:

| Variable | Default Value | Description |
|---|---|---|
| `UIID_CLIENT_ID` (or `CLIENT_ID`) | `""` | Your UIID Passkey Provider Client ID. |
| `UIID_CLIENT_SECRET` (or `CLIENT_SECRET`) | `""` | Your UIID Passkey Provider Client Secret. |
| `UIID_BASE_URL` | `https://uiid.linkspreed.com` | Base URL of the UIID service API. |
| `PORT` | `3000` | Port on which the demo server listens. |

---

## Quick Start

### Running locally with Node.js

1. Clone the repository:
   ```bash
   git clone https://github.com/linkspreed/UIID-Passkey-as-a-Service
   cd UIID-Passkey-as-a-Service
   ```

2. Start the server:
   ```bash
   UIID_CLIENT_ID="your_client_id" UIID_CLIENT_SECRET="your_client_secret" node server.js
   ```

3. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

---

### Running with Docker

1. Build and run the Docker container:
   ```bash
   docker build -t uiid-passkey-demo .
   docker run -p 3000:3000 -e UIID_CLIENT_ID="your_client_id" -e UIID_CLIENT_SECRET="your_client_secret" uiid-passkey-demo
   ```

---

### Running with Docker Compose

1. Start using Docker Compose:
   ```bash
   docker compose up --build
   ```

---

## How It Works

### Registration Flow
1. **Begin Registration (`/api/register/begin`):** The backend calls the UIID API (`/api/v1/passkey-provider/register/begin`) to retrieve WebAuthn creation options.
2. **Browser Prompt (`navigator.credentials.create`):** The browser prompts the user to create a passkey using Touch ID, Face ID, Windows Hello, or a security key.
3. **Finish Registration (`/api/register/finish`):** The generated credential is submitted to UIID (`/api/v1/passkey-provider/register/finish`) for verification and storage.

### Authentication Flow
1. **Begin Login (`/api/login/begin`):** The backend requests authentication challenge options from UIID (`/api/v1/passkey-provider/authenticate/begin`).
2. **Browser Prompt (`navigator.credentials.get`):** The browser prompts the user to sign in with their saved passkey.
3. **Finish Login (`/api/login/finish`):** The signed assertion credential is sent back to UIID (`/api/v1/passkey-provider/authenticate/finish`) for validation.

---

## Project Structure

```text
.
├── server.js            # Node.js 20+ HTTP server proxying WebAuthn API calls to UIID
├── public/
│   └── index.html       # WebAuthn frontend UI & browser credentials integration
├── Dockerfile           # Minimal Node 20 Alpine container image definition
├── docker-compose.yml   # Docker Compose setup
└── LICENSE              # Project license
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
