# 🍵 MacTea - QR / Table-Based Digital Ordering Web Application

A full-stack, mobile-first **Table & QR Digital Ordering App** built for **MacTea** *(by Malhars)* café (+94 76 995 5518), powered by Vite + React + Express + MongoDB Atlas + Vercel deployment support.

---

## 🚀 Features

- **Menu-First Experience**: Clean text-based food & drink menu matching the official MacTea logo palette (`#5C3E2E` Mocha Brown).
- **Checkout Table Selector (T1–T6)**: Customers pick food items first, then select Table Number & Customer Name at checkout.
- **MongoDB Atlas Persistence**: Connected to MongoDB Atlas (`Cluster0`) for live cloud persistence of menu items, orders, and sales stats across serverless invocations.
- **Live Order Tracker**: Persistent active order status tracking across page refreshes until staff completes & removes the order from live orders board.
- **Staff Admin Dashboard (`/admin`)**: Real-time order pipeline with Web Audio chime alerts, menu manager (stock availability toggle & price edit), kitchen ticket printer, and table QR code generator.

---

## 🛠️ Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Backend Server**:
   ```bash
   npm run server
   ```

3. **Run Frontend Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

---

## 📤 Push Code to GitHub

Execute the following commands in terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mactea.git
git branch -M main
git push -u origin main
```

---

## ⚡ Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your **mactea** GitHub repository.
3. In **Environment Variables**, add:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://meerasafina1967_db_user:Aadhil2005@cluster0.tss4xbh.mongodb.net/mactea?retryWrites=true&w=majority`
4. Click **Deploy**. Vercel will automatically build the Vite frontend and deploy the Express serverless API handler (`/api`).

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## 🔑 Default Credentials

- **Admin Route**: `http://localhost:5173/admin`
- **Default Staff Passcode**: `mactea123`
