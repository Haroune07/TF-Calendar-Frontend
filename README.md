# TF-Calendar — Frontend

The web client for **TF-Calendar**, a smart scheduling app for CEGEP students. It lets users manage a personal calendar of courses, events, and group activities, see scheduling conflicts at a glance, invite friends, and import their real class schedule straight from Omnivox.

This is one of three repositories that make up the full project:

| Repo | Role |
|---|---|
| [TF-Calendar](https://github.com/ddryad/TF-Calendar) | NestJS REST API consumed by this app |
| [TF-Calendar-Omnivox](https://github.com/ddryad/TF-Calendar-Omnivox) | Scrapes a student's Omnivox schedule |
| **TF-Calendar-Frontend** *(this repo)* | React SPA |

## Features

- **Calendar view** with category filters (courses, work, personal, sport, other) and a live conflicts panel that highlights overlapping items.
- **Create/edit modal** for activities, events, and group activities, plus a detail modal for viewing/removing existing items.
- **Auth flows** — email/password sign-up and sign-in, backed by session cookies from the API; routes are guarded with React Router loaders (`requireAuthLoader` / `requireGuestLoader`) so protected pages redirect to `/login` and auth pages redirect away once logged in.
- **Friends & invitations** — search users, send friend requests, and accept/decline invitations to shared activities.
- **Profile management** — update personal info and Omnivox credentials used for schedule import.
- **Light/dark theme** that respects the OS preference on first load and persists the user's choice.

## Tech stack

- [React 19](https://react.dev/) + TypeScript
- [React Router 7](https://reactrouter.com/) (data router: loaders/actions per route)
- [Vite](https://vitejs.dev/) for dev server & build
- Plain `fetch` wrapper (`src/services/api.ts`) typed against the backend's DTOs — no additional data-fetching library
- CSS Modules for component-scoped styling

## Getting started

### Prerequisites
- Node.js 20+
- The [TF-Calendar API](https://github.com/ddryad/TF-Calendar) running locally (defaults to `http://localhost:3000`)

### Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL if the API isn't on localhost:3000
npm run dev
```

The app runs on `http://localhost:5173` by default.

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the TF-Calendar API (e.g. `http://localhost:3000`) |

### Other scripts

```bash
npm run build     # type-check + production build
npm run lint      # ESLint
npm run preview   # preview the production build locally
```

## Project structure

```
src/
├── components/    # Calendar, CreateProgrammable modal, DetailProgrammableModal,
│                  # ConflitsPanel, Navbar
├── layouts/        # MainLayout (shell for authenticated routes)
├── pages/          # Home, Login, Register, Profile, Invitations, Contact, NotFound
├── services/       # api.ts (typed fetch client), ThemeContext
└── router.tsx       # route tree with auth-aware loaders/actions
```

