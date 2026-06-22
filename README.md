# CivicPulse

**Fix Your City. Together.**

CivicPulse is a Phase 1 hackathon MVP for crowd-sourced civic infrastructure reporting. Residents can pin issues on a map, upload photos, upvote priority problems without login, and watch admin triage updates sync live across open clients.

## Stack

- MongoDB Atlas + Mongoose
- Express.js + Node.js
- React + Vite
- Leaflet with free OpenStreetMap tiles, no map API key required
- Cloudinary for image storage and CDN delivery
- Socket.io for live issue, upvote, and status updates
- Tailwind CSS, lucide-react, and Framer Motion for presentation

## Setup

### 1. Prerequisites

Install Node.js 18+, npm, and create free MongoDB Atlas and Cloudinary accounts.

### 2. MongoDB Atlas

1. Create a free M0 cluster.
2. Go to Database Access and create a database user with a password.
3. Go to Network Access and add `0.0.0.0/0` for hackathon demo access.
4. Copy your connection string.

### 3. Cloudinary

1. Create a free Cloudinary account.
2. Open the Dashboard.
3. Copy Cloud Name, API Key, and API Secret.

### 4. Environment Files

Copy the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
ADMIN_PASSCODE=civicpulse2026
```

Fill in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_DEFAULT_MAP_CENTER_LAT=23.2599
VITE_DEFAULT_MAP_CENTER_LNG=77.4126
VITE_ADMIN_PASSCODE=civicpulse2026
```

The default map center is Bhopal, India. Change the two `VITE_DEFAULT_MAP_CENTER_*` values to demo another city.

### 5. Install

From the project root:

```bash
npm run install:all
```

### 6. Seed Demo Data

From the project root:

```bash
npm run seed
```

This populates 20 realistic demo reports around the default city center with varied categories, statuses, photos, and upvote counts.

### 7. Run

From the project root:

```bash
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:5000`.

## Routes

- `/` Home with live stats, Map/Feed toggle, filters, upvotes, and realtime updates
- `/report` four-step report flow, also launched as a modal from the floating button
- `/issue/:id` shareable issue detail page
- `/admin` demo-gated triage dashboard

## Phase 1 Voting Limitation

CivicPulse has no real authentication in Phase 1. Duplicate vote prevention uses a generated browser `deviceId` stored in `localStorage`, and the server stores that ID per issue. This is honest hackathon-grade protection: clearing browser storage can reset the vote identity. Phase 2 should replace this with real user authentication.

## Admin Gate

The `/admin` route uses `VITE_ADMIN_PASSCODE` and `sessionStorage` as a demo speed bump only. It is not security. Real authentication and authorization belong in Phase 2.

Admin Dashboard Password : civicpulse2026
