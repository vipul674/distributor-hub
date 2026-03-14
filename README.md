# Distributor Hub

Distributor Hub is a full-stack analytics app for retail distributors.

- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Express + TypeScript + ONNX Runtime (`onnxruntime-node`)
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

Create backend environment file:

```sh
cp server/.env.example server/.env
```

Default values are already suitable for local development:

- `PORT=5000`
- `CORS_ORIGIN=http://localhost:8080`
- `MODEL_DIR=../Retail_Models_Onnx`

## 4) Run the App (Development)

Start backend and frontend in separate terminals.

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

Backend build:

```sh
npm run server:build
```

Run built backend:

```sh
npm run server:start
```

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

- If backend fails to start, verify ONNX files exist and `MODEL_DIR` is correct.
- If frontend cannot reach API, ensure backend is running on port `5000`.
- If CORS issues appear, confirm `CORS_ORIGIN` matches frontend URL.
