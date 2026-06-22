# CivicPulse - Technical Documentation

**Project Description:** A real-time civic issue reporting platform built with MERN stack + Socket.io, enabling residents to report infrastructure issues, upload photos, upvote problems, and allow admins to triage and resolve reports.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Database](#database)
7. [Real-time Features](#real-time-features)
8. [API Endpoints](#api-endpoints)
9. [Environment Configuration](#environment-configuration)
10. [Security Considerations](#security-considerations)
11. [Setup & Deployment](#setup--deployment)

---

## Architecture Overview

CivicPulse follows a **monorepo structure** with separate backend (Node.js + Express) and frontend (React + Vite) applications communicating via REST APIs and WebSockets.

```
CivicPulse/
├── server/           # Node.js + Express backend
├── client/           # React + Vite frontend
└── package.json      # Root configuration for concurrent dev
```

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React + Vite)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pages: Home, Report, IssueDetail, Admin                │ │
│  │  Components: Map, Feed, ReportWizard, AdminDashboard    │ │
│  │  State: Socket.io, localStorage (deviceId)              │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API + WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               Server (Express + Socket.io)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Routes: /api/issues, /api/stats                        │ │
│  │  Controllers: Issue CRUD, Status updates                │ │
│  │  Middleware: CORS, JSON parsing, Error handling         │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  WebSocket Events: issue:new, issue:upvoted,            │ │
│  │                   issue:statusChanged                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   MongoDB        Cloudinary      Socket.io
   (Data)         (Images)        (Real-time)
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | | | |
| | React | 18.3.1 | UI framework |
| | Vite | 6.0.7 | Build tool & dev server |
| | React Router | 6.28.2 | Client-side routing |
| | Socket.io Client | 4.8.1 | Real-time communication |
| | Leaflet | 1.9.4 | Interactive maps |
| | React-Leaflet | 4.2.1 | Leaflet React binding |
| | Tailwind CSS | 3.4.17 | Styling framework |
| | Framer Motion | 11.18.2 | Animation library |
| | Lucide React | 0.468.0 | Icon library |
| **Backend** | | | |
| | Node.js | 18+ | Runtime |
| | Express | 4.21.2 | Web framework |
| | Socket.io | 4.8.1 | Real-time server |
| | Mongoose | 8.9.5 | MongoDB ODM |
| | Multer | 2.0.2 | File upload handling |
| | Cloudinary | 2.5.1 | Image storage & CDN |
| | CORS | 2.8.5 | Cross-origin handling |
| | Dotenv | 16.4.7 | Environment variables |
| **Database** | MongoDB | | NoSQL document database |
| **External Services** | | | |
| | MongoDB Atlas | | Cloud database hosting |
| | Cloudinary | | Image hosting & CDN |

---

## Project Structure

### Backend Structure

```
server/
├── src/
│   ├── server.js              # Main Express server & Socket.io setup
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary & Multer config
│   ├── models/
│   │   └── Issue.js           # Issue schema & validation
│   ├── controllers/
│   │   ├── issueController.js # CRUD & business logic
│   │   └── statsController.js # Stats calculations
│   ├── routes/
│   │   ├── issues.js          # Issue endpoints
│   │   └── stats.js           # Stats endpoints
│   ├── sockets/
│   │   └── index.js           # Socket.io event handlers
│   └── seed.js                # Database seeding script
├── .env.example               # Environment template
├── package.json               # Dependencies & scripts
└── nodemon.json              # Dev server config
```

### Frontend Structure

```
client/
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Route definitions
│   ├── pages/
│   │   ├── Home.jsx           # Home with map/feed view
│   │   ├── Report.jsx         # Report page wrapper
│   │   ├── IssueDetail.jsx    # Single issue page
│   │   └── Admin.jsx          # Admin triage dashboard
│   ├── components/
│   │   ├── ReportWizard.jsx   # Multi-step report form
│   │   ├── Map.jsx            # Leaflet map component
│   │   ├── Feed.jsx           # Issues list view
│   │   ├── AdminDashboard.jsx # Admin panel
│   │   └── ToastProvider.jsx  # Toast notifications
│   ├── styles.css             # Tailwind & global styles
│   └── App.css                # Component styles
├── .env.example               # Environment template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies & scripts
```

---

## Backend

### Server Setup (`server/src/server.js`)

```javascript
// HTTP Server with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Middleware stack
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes mounted at /api/*
app.use('/api/issues', issuesRouter);
app.use('/api/stats', statsRouter);

// Global error handler
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong.';
  res.status(status).json({ message });
});
```

### Database Configuration

**MongoDB Connection** (`server/src/config/db.js`):
```javascript
mongoose.set('strictQuery', true);
await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB || undefined
});
```

**Features:**
- Strict query mode (only fields in schema are retrieved)
- Connection pooling via Mongoose
- Support for custom database name via environment variable

---

## Database

### Issue Model (`server/src/models/Issue.js`)

```javascript
Schema Fields:
├── title (String, required, max 100 chars)
├── description (String, required, max 500 chars)
├── category (Enum: Pothole, Garbage & Waste, Streetlight, Water Leakage/Logging, Broken Road/Footpath, Public Property Damage, Stray Animals, Other)
├── photoUrl (String, required - Cloudinary URL)
├── photoPublicId (String - for deletion)
├── location (GeoJSON Point)
│   ├── type: "Point"
│   └── coordinates: [longitude, latitude]
├── address (String, optional)
├── status (Enum: Reported, In Progress, Resolved; default: Reported)
├── upvoteCount (Number, default: 0, min: 0)
├── upvotedDeviceIds (Array of Strings - tracks device voters)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)

Indexes:
├── location: 2dsphere (geospatial queries)
├── createdAt: -1 (sort by newest)
└── upvoteCount: -1 (sort by most voted)
```

**Data Validation:**
- GeoJSON coordinates validated as [lng, lat] pairs
- Category restricted to predefined enum values
- Status restricted to three states
- Coordinates validated as finite numbers

---

## Controllers & Business Logic

### Issue Controller (`server/src/controllers/issueController.js`)

#### `listIssues(req, res, next)`
**Query Parameters:**
- `category` - Filter by category
- `status` - Filter by status
- `sort` - Sort by "votes" or default (newest first)
- `bbox` - Bounding box filter: `west,south,east,north`

**Response:**
- Array of issues with serialized data (upvotedDeviceIds removed for privacy)
- Limit: 250 issues

**Geospatial Query:**
```javascript
location: {
  $geoWithin: {
    $box: [[west, south], [east, north]]
  }
}
```

#### `getIssue(req, res, next)`
- Validates MongoDB ObjectId
- Returns single issue by ID
- Serializes sensitive data

#### `createIssue(req, res, next)`
**Request Body:**
```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing damage",
  "category": "Pothole",
  "lat": 23.2599,
  "lng": 77.4126,
  "address": "Main Street, Bhopal",
  "photo": <File>
}
```

**Process:**
1. Validate all fields (title, description, category, coordinates)
2. Upload image to Cloudinary with transformations (1400x1000, auto quality)
3. Create MongoDB document with image URL and public ID
4. Emit `issue:new` event via Socket.io
5. Return created issue (201 Created)

#### `toggleUpvote(req, res, next)`
**Request Body:**
```json
{
  "deviceId": "unique-device-identifier"
}
```

**Logic:**
- Check if device already voted
- If voted: remove from array, decrement count
- If not voted: add to array, increment count
- Emit `issue:upvoted` event with updated count
- Prevent duplicate votes using deviceId tracking

#### `updateStatus(req, res, next)`
**Request Body:**
```json
{
  "status": "In Progress"
}
```

**Logic:**
- Validate status is in enum
- Update issue document
- Emit `issue:statusChanged` event
- Admin-gated via session storage (Phase 1 limitation)

---

## Cloudinary Integration (`server/src/config/cloudinary.js`)

**Multer Configuration:**
- Storage: In-memory (no disk required)
- File size limit: 8 MB
- Accepted types: Images only

**Cloudinary Upload:**
```javascript
transformation: [
  {
    width: 1400,
    height: 1000,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto'
  }
]
```

**Benefits:**
- Automatic format optimization
- Responsive image sizing
- CDN delivery
- Secure public URLs

---

## Real-time Features

### Socket.io Integration (`server/src/sockets/index.js`)

**Events Emitted:**

1. **`socket:ready`** - Sent to client on connection
   ```javascript
   { id: socket.id }
   ```

2. **`issue:new`** - Broadcast when new issue created
   ```javascript
   {
     id, title, description, category, photoUrl,
     location, address, status, upvoteCount,
     createdAt, updatedAt
   }
   ```

3. **`issue:upvoted`** - Broadcast when upvote toggled
   ```javascript
   { id, upvoteCount }
   ```

4. **`issue:statusChanged`** - Broadcast when status updated
   ```javascript
   { id, status }
   ```

**Client Socket Connection:**
- Connects via `VITE_SOCKET_URL` environment variable
- Auto-reconnect on disconnect
- Real-time list updates for all connected users

---

## API Endpoints

### Issues Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/issues` | List all issues with filters | None |
| GET | `/api/issues/:id` | Get single issue | None |
| POST | `/api/issues` | Create new issue | None |
| POST | `/api/issues/:id/upvote` | Toggle upvote | deviceId only |
| PATCH | `/api/issues/:id/status` | Update status | Admin passcode |

**Query Parameters for GET /api/issues:**
```
?category=Pothole&status=Reported&sort=votes&bbox=77.3,23.1,77.5,23.4
```

### Health Check

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/health` | `{ ok: true, service: 'civicpulse-api' }` |

---

## Frontend

### React Router Structure

```javascript
/              → Home (map + feed + stats)
/report        → Report page or modal
/issue/:id     → Issue detail page
/admin         → Admin dashboard (passcode gated)
```

### Entry Point (`client/src/main.jsx`)

```javascript
Providers Stack:
├── BrowserRouter (React Router)
├── ToastProvider (Toast notifications)
└── App (Route definitions)
```

### Styling Stack

1. **Tailwind CSS** - Utility-first CSS framework
2. **Framer Motion** - Smooth animations
3. **PostCSS + Autoprefixer** - CSS transformations
4. **Component CSS** - Modular component styles

---

## Environment Configuration

### Server Environment (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/civicpulse?retryWrites=true&w=majority
MONGODB_DB=civicpulse
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
ADMIN_PASSCODE=civicpulse2026
```

### Client Environment (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_DEFAULT_MAP_CENTER_LAT=23.2599
VITE_DEFAULT_MAP_CENTER_LNG=77.4126
VITE_ADMIN_PASSCODE=civicpulse2026
```

**Environment-specific Configuration:**
- Production: Replace localhost with deployed domain
- Development: Local URLs for testing
- Map center: Adjustable per deployment city

---

## Security Considerations

### Phase 1 Limitations (MVP)

1. **No Authentication**
   - Anyone can create issues
   - No user identity tracking
   - Admin access via hardcoded passcode only

2. **Duplicate Vote Prevention**
   - Uses browser `deviceId` (stored in localStorage)
   - **Not cryptographically secure**
   - Can be bypassed by clearing localStorage or incognito browsing

3. **Admin Gate**
   - Uses `sessionStorage` (not persistent across page reload)
   - Passcode visible in frontend code
   - Intended as demo-only, not production security

### Recommended Phase 2 Improvements

- [ ] Implement OAuth/JWT authentication
- [ ] Database session management
- [ ] User role-based authorization
- [ ] Rate limiting on issue creation
- [ ] Input sanitization (XSS prevention)
- [ ] HTTPS enforcement
- [ ] API key rotation for Cloudinary
- [ ] CORS whitelist validation
- [ ] Request signing for sensitive operations

---

## Setup & Deployment

### Local Development

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Configure Environment**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   # Edit .env files with credentials
   ```

3. **Seed Demo Data**
   ```bash
   npm run seed
   ```

4. **Start Development Servers**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - API: http://localhost:5000

### Production Deployment

**Frontend (Vercel/Netlify):**
1. Deploy from `/client` directory
2. Set environment variables in CI/CD
3. Build: `npm run build`
4. Output directory: `dist/`

**Backend (Heroku/Railway/Render):**
1. Deploy from `/server` directory
2. Set environment variables in dashboard
3. Start command: `npm start`
4. Node version: 18+

**Database:**
- MongoDB Atlas (cloud-hosted)
- Ensure IP whitelist includes server IPs
- Regular backups enabled

**Static Assets:**
- Cloudinary CDN (configured in backend)
- No additional static hosting required

### Health Check

```bash
curl http://localhost:5000/health
# Response: {"ok":true,"service":"civicpulse-api"}
```

---

## Performance Considerations

### Database Indexing
- GeoJSON 2dsphere index for map queries
- Composite indexes on createdAt and upvoteCount for sorting
- Query limit: 250 issues to prevent large payloads

### Image Optimization
- Cloudinary transforms: 1400x1000 max size
- Automatic quality negotiation
- Format auto-selection (WebP for modern browsers)
- CDN caching for faster delivery

### Real-time Updates
- Socket.io broadcasts only to connected clients
- Minimal payload (only changed fields)
- No historical event replay

### Frontend Performance
- Vite for fast development builds
- React.lazy for code splitting (if routes grow)
- Tailwind CSS purging of unused styles
- Leaflet map tile caching

---

## Error Handling

### Server Error Responses

```javascript
// 400 Bad Request
{ "message": "Title is required and must be 100 characters or fewer." }

// 404 Not Found
{ "message": "Issue not found." }

// 500 Internal Server Error
{ "message": "Something went wrong." }
```

### Client Error Handling
- Toast notifications for user-facing errors
- Console logging for debugging
- Graceful fallbacks for failed API calls

---

## Monitoring & Debugging

### Server Logging
```bash
nodemon logs to console during development
Production: Use service logger (PM2, Systemd, container logs)
```

### Database Monitoring
- MongoDB Atlas Charts for metrics
- Query performance analyzer
- Connection pool monitoring

### Real-time Debugging
- Socket.io admin panel (optional)
- Browser DevTools for client events
- Network tab for API calls

---

## Future Enhancements

### Phase 2 Roadmap
- [ ] User authentication & profiles
- [ ] Notification system (email, SMS)
- [ ] Advanced filtering & search
- [ ] Issue timeline/history
- [ ] Admin photo verification
- [ ] Community reputation/badges
- [ ] Export reports (PDF, CSV)
- [ ] Mobile app (React Native)
- [ ] Multi-city support

### Technical Debt
- [ ] Comprehensive error boundary components
- [ ] Unit tests (Jest, React Testing Library)
- [ ] E2E tests (Cypress, Playwright)
- [ ] API rate limiting
- [ ] Request validation middleware (Joi, Zod)
- [ ] API documentation (Swagger/OpenAPI)

---

## References

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.io Documentation](https://socket.io/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/)
- [Cloudinary Documentation](https://cloudinary.com/documentation/)

---

## License

Refer to the main repository for license information.

---

## Document Version

- **Version:** 1.0
- **Last Updated:** 2026-06-22
- **Author:** CivicPulse Development Team
