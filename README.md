# Jappie Library Management System

React + Vite frontend, Express backend, and MySQL database.

## Requirements
- Node.js 20+
- MySQL 8+
- VS Code

## 1. Database
Open MySQL Workbench and run all SQL in `database/schema.sql`.

## 2. Backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env`, then set your MySQL username/password and a long JWT secret.

```bash
npm run create-admin
```

This creates the first administrator using `ADMIN_NAME`, `ADMIN_MEMBERSHIP_ID`, and `ADMIN_PASSWORD` from `.env`.

Start the API:

```bash
npm run dev
```

API runs at http://localhost:5000. Test http://localhost:5000/api/health.

## 3. Frontend
Open another terminal in `frontend`:

```bash
npm install
```

Copy `.env.example` to `.env` (the default API URL is fine), then:

```bash
npm run dev
```

Open the Vite URL shown in the terminal (usually http://localhost:5173).

## Login
Use the admin credentials you placed in `backend/.env`.

## Notes
- Do not commit `.env` files or `node_modules`.
- Admins can manage books and users.
- Logged-in users can view books and create borrowing/return transactions.
- Book quantity is changed through transactions, not by editing the book form.
- The API uses JWT bearer tokens and bcrypt password hashing.
