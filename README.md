# VoltPaste - Secure Zero-Knowledge Pastebin
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

VoltPaste is a high-performance, minimalist, zero-knowledge pastebin application built with FastAPI and vanilla JavaScript. All encryption and decryption happens locally in the browser using the Web Crypto API (AES-GCM-256), meaning the server never sees your unencrypted data or your decryption keys.

## Features

- **Zero-Knowledge Encryption:** Data is encrypted and decrypted purely on the client-side.
- **Auto & Password Encryption:** Automatically generated secure URLs (`#key`) or manual password protection.
- **Custom Burn Limits:** Self-destruct pastes after a specific number of views (1, 2, 5, 10, 50) or keep them permanent.
- **Expiring Pastes:** Set pastes to automatically expire after a specific time (10 mins, 1 hour, 1 day, 1 week).
- **Monaco Editor Integration:** Real-time syntax highlighting, code hinting, and beautiful rendering for multiple languages.
- **Live Markdown Preview:** True side-by-side split-screen live preview for Markdown files as you type.
- **Frictionless Generation:** Bypasses intermediate screens; instantly creates your paste, copies the URL to your clipboard, and drops you into the viewer.
- **QR Code Sharing:** Dedicated modal to generate QR codes for secure mobile sharing.
- **Developer Workflow:** Clone & Edit, global keyboard shortcuts (`Ctrl+S`, `Ctrl+H`, `Esc`), and local paste history.
- **Rate Limiting:** Built-in IP rate limiting via SlowAPI to protect the backend.
- **Minimalist Aesthetic:** Clean, high-contrast UI with dynamic Light and Dark themes.

## Technology Stack

- **Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic, SlowAPI.
- **Database:** MongoDB (Motor Async Driver).
- **Frontend:** HTML5, Vanilla JS, Vanilla CSS.
- **Dependencies (Frontend):** Monaco Editor (Syntax/Editing), Marked.js (Markdown Parsing), QRCode.js (QR Generation), zxcvbn.js (Password Strength).

## Getting Started

### Prerequisites
- Python 3.9+
- MongoDB instance running locally or via Atlas.

### Installation

1. Clone the repository and install dependencies:
```bash
pip install fastapi uvicorn motor pydantic pydantic-settings httpx slowapi
```

2. Create a `.env` file in the root directory to configure the database:
```ini
MONGO_URI=mongodb://localhost:27017
DB_NAME=pastebin_db
COLLECTION_NAME=pastes
```

3. Start the server:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

4. Open your browser and navigate to `http://127.0.0.1:8000/`.

## Architecture

The project is structured into two main layers:
- `frontend/`: Contains all UI elements, theming, and the zero-knowledge Web Cryptography logic.
- `backend/`: Provides the REST API for creating, retrieving, and tracking paste metadata with integrated rate limiting. Data is stored fully encrypted.

