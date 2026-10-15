# ShopKart

A full-stack e-commerce app: product browsing and search, cart, wishlist, checkout with Razorpay (test mode), and order tracking.

**Stack:** React + Vite (frontend) · Node.js + Express (backend) · MongoDB with Mongoose · JWT auth · Razorpay

## Project structure

```
backend/   Express API (controllers, models, routes, middlewares, seed.js)
frontend/  React app (pages, components, context, services)
```

## Prerequisites

- Node.js 18+
- A MongoDB database (local or MongoDB Atlas)
- Razorpay test keys (optional, needed only for checkout)

## Setup

### 1. Clone

```bash
git clone https://github.com/anugrah55/ShopKart.git
cd ShopKart
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your own values
npm run seed           # optional: load sample products
npm run dev            # or: npm start
```

The API runs on `http://localhost:8080`.

Environment variables (`backend/.env`):

| Variable | Description |
| --- | --- |
| `PORT` | API port (default 8080) |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `RAZORPAY_KEY_ID` | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret |

### 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The frontend expects the API at `http://localhost:8080`, which is set in `frontend/src/services/api.js`.

## Features

- Sign up and log in with JWT authentication
- Product listing, search, and details
- Cart and wishlist
- Checkout with Razorpay test payments
- Order history and status tracking
