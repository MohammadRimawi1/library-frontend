# Athenaeum — Library Management System (Frontend)

React and TypeScript single-page application for the Library Management System, built against the Spring Boot backend below.

Live site: https://library-frontend-1-black.vercel.app
Backend API: https://library-management-system-monolith-1.onrender.com/api

The backend runs on Render's free tier, so the first request after a period of inactivity can take up to 30 seconds.

## Overview

Three role-based experiences, matching the backend's permission model directly.

**Borrower** browses the catalog, views item details, reserves physical or online items, and tracks or returns items from "My Reservations."

**Librarian** does everything a borrower can, plus adding catalog items and managing incoming reservations.

**Admin** has a separate set of pages: browse every account, promote a borrower to librarian or demote a librarian back, and permanently delete a user. Admin doesn't see the catalog or reservation pages, since neither is relevant to the role.

Physical item reservations are made per copy. The catalog shows each copy's individual availability, and a borrower picks a specific one to reserve or, if it's checked out, join the waitlist for. Online items reserve instantly, and the interface prevents a duplicate reservation on something already held.

## Stack

- React 18, TypeScript
- Vite
- React Router, with role-gated routes
- Tailwind CSS
- lucide-react
- Deployed on Vercel

## Architecture notes

Auth is a JWT stored in `localStorage`, with a session guard that checks token validity on tab-visibility change and reacts to an auth-expired event to log out cleanly on a failed request.

Routes are gated by role. A user who lands somewhere outside their role is redirected to their own home page rather than a generic fallback.

Types mirror the backend's response DTOs rather than its internal document structure.

The API client is a single fetch wrapper: attaches auth headers, unwraps the backend's response envelope, and maps error responses into a typed error object.

## Local setup
git clone <repo-url>
cd library-frontend
npm install

Set the API base URL in a `.env` file at the project root:
VITE_API_BASE_URL=http://localhost:8080/api

## Deployment

Deployed on Vercel as a Vite project. `VITE_API_BASE_URL` is set as a Vercel environment variable pointing at the deployed backend, rather than committed to the repo, so the same code runs against local and deployed backends without a code change.

## Known limitations

- No offline support or optimistic UI updates. Every action waits on a round trip to the API.
- No automated frontend test suite yet.

## License

MIT
