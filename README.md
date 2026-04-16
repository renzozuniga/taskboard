# TaskBoard

A Kanban-style task management web application inspired by Trello. Built as a portfolio project by **MAO Systems**, using a fullstack monorepo setup with Angular 17 on the frontend and Node.js/Express on the backend, connected to MongoDB Atlas.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running the App](#running-the-app)
- [Architecture](#architecture)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Data Model](#data-model)
- [API Reference](#api-reference)
- [Design System](#design-system)
- [Available Scripts](#available-scripts)

---

## Overview

TaskBoard allows users to organize their work using boards, lists, and cards — the classic Kanban methodology. Each user has their own workspace: they can create multiple boards, add lists (columns) to each board, and manage cards (tasks) within those lists. Cards can be moved between lists and reordered freely.

**Key features:**
- User registration and login with JWT authentication
- Personal dashboard showing all your boards
- Kanban board view with drag-and-drop-ready columns
- Full CRUD for boards, lists, and cards
- Move cards between lists with position management
- Batch reordering of lists
- Route protection with Angular auth guards
- Automatic token injection via HTTP interceptor

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular | 17.3 |
| Frontend UI | Angular CDK | 17.3 |
| Backend | Node.js + Express | Express 5.x |
| Database | MongoDB (via Mongoose) | MongoDB Atlas |
| Authentication | JSON Web Tokens (JWT) | jsonwebtoken 9.x |
| Password hashing | bcryptjs | 3.x |
| Input validation | express-validator | 7.x |
| Dev server | nodemon | 3.x |
| Language | TypeScript (client) / JavaScript (server) | TS 5.4 |

---

## Project Structure

```
taskboard/
├── client/                   # Angular 17 frontend
│   └── src/
│       └── app/
│           ├── core/
│           │   ├── guards/       # authGuard — protects private routes
│           │   ├── interceptors/ # authInterceptor — injects Bearer token
│           │   ├── models/       # TypeScript interfaces (Board, etc.)
│           │   └── services/     # auth, board, list, card services
│           ├── features/
│           │   ├── auth/         # login + register pages
│           │   ├── board/        # kanban board + sidebar, topbar, columns, cards
│           │   └── dashboard/    # boards overview page
│           └── shared/
│               └── components/   # avatar, badge, button, input, modal
├── server/                   # Node.js REST API
│   └── src/
│       ├── config/           # MongoDB Atlas connection
│       ├── controllers/      # auth, board, list, card
│       ├── middleware/        # authenticate (JWT), errorHandler
│       ├── models/           # Mongoose schemas: User, Board, List, Card
│       ├── routes/           # Express route definitions
│       ├── seeds/            # seed script for demo data
│       └── utils/            # JWT sign/verify helpers
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster (free tier works)
- Angular CLI (optional — the project uses the local version via `npx ng`)

### Environment Setup

**1. Clone the repository**

```bash
git clone <repository-url>
cd taskboard
```

**2. Configure the server**

```bash
cd server
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskboard
JWT_SECRET=a_long_random_secret_string
JWT_EXPIRES_IN=7d
```

> `JWT_SECRET` can be any long, random string. In production, use a cryptographically secure value (e.g., generated with `openssl rand -base64 64`).

**3. Install dependencies**

```bash
# From the server directory
npm install

# From the client directory
cd ../client
npm install
```

**4. (Optional) Seed demo data**

```bash
cd server
npm run seed
```

This populates the database with sample users, boards, lists, and cards so you can explore the app without creating data manually.

---

### Running the App

Open two terminals:

**Terminal 1 — Backend (port 3000)**

```bash
cd server
npm run dev
```

The server starts with nodemon (auto-restarts on file changes). You can verify it's running at:

```
GET http://localhost:3000/api/health
```

Expected response:
```json
{ "status": "OK", "timestamp": "2026-04-16T..." }
```

**Terminal 2 — Frontend (port 4200)**

```bash
cd client
npm start
```

Open your browser at `http://localhost:4200`. You will be redirected to `/login`.

---

## Architecture

### Backend

The backend is a **REST API** built with Express 5 and Mongoose. Entry point: `server/src/app.js`.

**Request flow:**

```
HTTP Request
    → CORS middleware
    → express.json()
    → Route handler
    → authenticate middleware (JWT verification)
    → Controller
    → Mongoose (MongoDB Atlas)
    → Response / errorHandler
```

**Authentication middleware** (`src/middleware/auth.middleware.js`) extracts the `Authorization: Bearer <token>` header, verifies it using `src/utils/jwt.js`, fetches the user from the database (excluding the password field), and attaches it to `req.user` for all downstream handlers.

**Error handling** is centralized in `src/middleware/error.middleware.js`. It normalizes common Mongoose errors:

| Error type | HTTP status |
|-----------|-------------|
| `ValidationError` | 400 |
| Duplicate key (`code 11000`) | 400 |
| `CastError` (invalid ObjectId) | 400 |
| Everything else | `err.statusCode` or 500 |

**Cascade deletes:**
- Deleting a board removes all its lists and all cards in those lists.
- Deleting a list removes all its cards.

**Position management:**  
`position` is a zero-based integer. New items are appended at `lastPosition + 1`. The `moveCard` endpoint uses a MongoDB `$inc` operation to shift existing cards in the target list before inserting the moved card.

---

### Frontend

The frontend is built with **Angular 17 standalone components** — no NgModules anywhere. Bootstrap is done via `bootstrapApplication` in `main.ts`.

**Routing** uses lazy-loaded standalone components:

| Path | Component | Protected |
|------|-----------|-----------|
| `/` | — redirects to `/login` | No |
| `/login` | `LoginComponent` | No |
| `/register` | `RegisterComponent` | No |
| `/dashboard` | `DashboardComponent` | Yes (authGuard) |
| `/board/:id` | `BoardComponent` | Yes (authGuard) |
| `**` | — redirects to `/login` | — |

`authGuard` (`core/guards/auth.guard.ts`) checks for a valid JWT in storage and redirects to `/login` if absent.

`authInterceptor` (`core/interceptors/auth.interceptor.ts`) automatically attaches the `Authorization: Bearer <token>` header to every outgoing HTTP request.

**Services** (`core/services/`):
- `AuthService` — register, login, logout, current user state
- `BoardService` — CRUD operations on boards
- `ListService` — CRUD + batch reorder for lists
- `CardService` — CRUD + move card between lists

**API base URL** is configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

### Data Model

```
User
 └── Board  (owner → User._id)
      └── List   (board → Board._id, position: Number)
           └── Card   (list → List._id, position: Number)
```

**User**
| Field | Type | Rules |
|-------|------|-------|
| `name` | String | required, max 100 chars |
| `email` | String | required, unique, lowercase |
| `password` | String | required, min 6 chars (stored hashed) |

**Board**
| Field | Type | Rules |
|-------|------|-------|
| `title` | String | required, max 100 chars |
| `description` | String | optional, max 500 chars |
| `owner` | ObjectId → User | required |

**List**
| Field | Type | Rules |
|-------|------|-------|
| `title` | String | required |
| `board` | ObjectId → Board | required |
| `position` | Number | required, min 0 |

**Card**
| Field | Type | Rules |
|-------|------|-------|
| `title` | String | required |
| `description` | String | optional |
| `list` | ObjectId → List | required |
| `position` | Number | required, min 0 |

> All models include `createdAt` and `updatedAt` timestamps automatically via Mongoose.

---

## API Reference

All routes except `/api/auth/register`, `/api/auth/login`, and `/api/health` require an `Authorization: Bearer <token>` header.

Board ownership is enforced on every board query using `{ _id, owner: req.user._id }`.

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create a new user account | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| GET | `/api/auth/me` | Get the current user's profile | Yes |

**POST `/api/auth/register`** — Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**POST `/api/auth/login`** — Request body:
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Response (both register and login):
```json
{
  "token": "<jwt>",
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | List all boards owned by the current user |
| POST | `/api/boards` | Create a new board |
| GET | `/api/boards/:id` | Get one board with all its lists and cards (nested) |
| PUT | `/api/boards/:id` | Update board title or description |
| DELETE | `/api/boards/:id` | Delete board (cascades to lists and cards) |

---

### Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lists` | Create a new list in a board |
| PUT | `/api/lists/:id` | Update list title |
| DELETE | `/api/lists/:id` | Delete list (cascades to cards) |
| PUT | `/api/lists/reorder` | Batch update positions for multiple lists |

---

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cards` | Create a new card in a list |
| PUT | `/api/cards/:id` | Update card title or description |
| DELETE | `/api/cards/:id` | Delete a card |
| PUT | `/api/cards/:id/move` | Move card to a different list and/or position |

**PUT `/api/cards/:id/move`** — Request body:
```json
{
  "listId": "<target-list-id>",
  "position": 2
}
```

---

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Returns server status (no auth required) |

---

## Design System

The frontend uses a **three-layer CSS architecture** loaded in `src/styles.css`:

1. **`src/styles/tokens.css`** — All CSS custom properties:
   - `--color-*` — color palette and semantic colors
   - `--spacing-*` — spacing scale
   - `--radius-*` — border radius values
   - `--shadow-*` — box shadow definitions
   - `--font-*` — typography scale
   - `--z-*` — z-index layers
   - Dark theme is supported via `[data-theme="dark"]` attribute on the root element.

2. **`src/styles/reset.css`** — Browser normalization

3. **`src/styles/utilities.css`** — Utility helper classes

**Shared components** (`src/app/shared/components/`):

| Component | Description |
|-----------|-------------|
| `ButtonComponent` | Variants: `primary`, `secondary`, `danger`, `ghost`. Emits `(clicked)` — not native `(click)` — to prevent events when disabled. |
| `InputComponent` | Implements `ControlValueAccessor` for direct use with `FormGroup` / `formControlName`. |
| `ModalComponent` | Overlay dialog. Header, body, and footer are content-projected. Footer uses `<ng-content select="[modal-footer]">`. |
| `AvatarComponent` | Displays user initials or an image. |
| `BadgeComponent` | Color-coded label chip. |

> Always use CSS tokens from `tokens.css` in component styles. Never hardcode color or spacing values.

---

## Available Scripts

### Server (`/server`)

```bash
npm run dev    # Start with nodemon (watch mode)
npm start      # Start in production mode
npm run seed   # Populate database with demo data
```

### Client (`/client`)

```bash
npm start          # Start dev server at localhost:4200
npm run build      # Production build (output: dist/)
npm run watch      # Build in watch mode (development)
npm test           # Run unit tests with Karma + Jasmine
```

---

*Built by [MAO Systems](https://github.com/renzozuniga) — Lima, Perú.*
