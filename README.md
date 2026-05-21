# Distributor Hub

Distributor Hub is a full-stack analytics app for retail distributors.

- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Express + JavaScript + ONNX Runtime (`onnxruntime-node`)
- ML Models: demand forecast + trend classification + recommendation scoring

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- Git

## Project Structure

```text
.
├── src/                  # Frontend (Vite + React)
├── server/               # Backend API (Express + TS + ONNX)
└── Retail_Models_Onnx/   # ONNX model files
```

## 1) Clone the Repository

```sh
git clone https://github.com/Rameshkorada07/distributor-hub.git
cd distributor-hub
```

## 2) Install Dependencies

Install frontend dependencies:

```sh
npm install
```

Install backend dependencies:

```sh
npm --prefix server install
```

## 3) Configure Environment

Create the backend environment file. The preferred location is `server/env/.env`, though `server/.env` is also supported:

```sh
cp server/env/.env.example server/env/.env
```

Set these values for local development:

- `PORT=5000`
- `CORS_ORIGIN=http://localhost:8080`
- `MODEL_DIR=../Retail_Models_Onnx`
- `DATA_MODE=auto`
- `MONGODB_URI=<your MongoDB connection string>`
- `MONGODB_DB_NAME=supplyDesk`
- `JWT_SECRET=<your JWT secret>`

With `DATA_MODE=auto`, the backend will use MongoDB whenever it is configured and only fall back to in-memory sample data when MongoDB is unavailable. Mongo-backed mode does not auto-seed demo products, bills, or analytics data.

## 4) Run the App (Development)

Start the full app from the project root:

```sh
npm run dev
```

If you want to run them separately, use these commands.

Terminal 1 (backend):

```sh
npm run server:dev
```

Terminal 2 (frontend):

```sh
npm run dev
```

URLs:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

The frontend proxies `/api` and `/health` to the backend during local development.

## 5) Build for Production

Frontend build:

```sh
npm run build
```

Run built backend:

```sh
npm run server:start
```

## Deploy for Portfolio (Recommended: Render Single Service)

This repository can be deployed as one URL where the Express backend serves the built Vite frontend. This is the simplest setup to share with clients.

### Why this option

- One public link for demo (`https://your-app.onrender.com`)
- No frontend/backend CORS or proxy complexity
- Free/low-cost tier suitable for portfolio projects

### Steps

1. Push this repository to GitHub.
2. Create a new **Web Service** on Render from your GitHub repo.
3. Use these settings:

- Build Command: `npm install && npm --prefix server install && npm run build`
- Start Command: `npm --prefix server run start`

4. Add environment variables in Render:

- `NODE_ENV=production`
- `PORT=10000` (Render also injects `PORT`, so keeping this is optional)
- `CORS_ORIGIN=https://<your-render-domain>`
- `MODEL_DIR=../Retail_Models_Onnx`
- `DATA_MODE=auto`
- `MONGODB_URI=<your mongodb uri>`
- `MONGODB_DB_NAME=supplyDesk`
- `JWT_SECRET=<strong-random-secret>`

5. Deploy and verify:

- App URL loads the frontend.
- `GET /health` returns JSON.
- API requests from the UI succeed.

### Render Blueprint (optional)

You can also deploy using the included `render.yaml` file for faster setup.

## ONNX Models Required

These files must exist in `Retail_Models_Onnx/`:

- `demand_forecast_rf.onnx`
- `trend_scaler.onnx`
- `trend_kmeans.onnx`

If models are stored elsewhere, update `MODEL_DIR` in `server/.env`.

## Useful API Endpoints

- `POST /api/bills/upload` (multipart field: `files`)
- `POST /api/bills/process`
- `GET /api/ml/forecast`
- `GET /api/ml/trends`
- `GET /api/ml/recommendations`
- `GET /api/dashboard/stats`
- `GET /api/sales/monthly`
- `GET /api/sales/yearly`
- `GET /api/sales/weekly`
- `GET /api/sales/by-category`
- `GET /api/stock/alerts`
- `GET /api/stock/damaged`
- `GET /api/insights/business`
- `GET /api/insights/recommendations`

## Quick Troubleshooting

- If you cloned the repo before this cleanup, replace any committed env credentials with your own local values.
- If backend fails to start, verify ONNX files exist and `MODEL_DIR` is correct.
- If frontend cannot reach API, ensure backend is running on port `5000`.
- If CORS issues appear, confirm `CORS_ORIGIN` matches frontend URL.
