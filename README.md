# LoomLegacy - Handloom Artisan E-Commerce Platform

![LoomLegacy License](https://img.shields.io/badge/License-MIT-blue.svg) ![React](https://img.shields.io/badge/React-19-blue.svg) ![Node](https://img.shields.io/badge/Node-20-green.svg)

## 📜 Project Overview
LoomLegacy is a specialized e-commerce platform designed to bridge the gap between traditional Indian handloom artisans and modern consumers. The platform empowers rural weavers by providing a direct-to-consumer digital marketplace that emphasizes authenticity, storytelling, and fair trade.

**Motto:** *"Weaving Traditions, Empowering Artisans"*

## ✨ Key Features
- **Modern User Interface:** A visually stunning design using an earthy color palette (Terracotta, Olive, Cream) and glassmorphism effects.
- **Buyer Ecosystem:**
  - **Smart Cart:** Includes dynamic 10% Prepaid Discount logic.
  - **Product Discovery:** Advanced filtering by category, price, and material.
  - **Artisan Stories:** Dedicated sections highlighting the weavers behind the products.
- **Seller Ecosystem:**
  - **Dashboard:** A secured portal for artisans to track sales (Orders, Revenue).
  - **Product Management:** Easy-to-use form for uploading new products and stories.
- **Admin Ecosystem:**
  - **Management Console:** Centralized dashboard for overseeing platform activities.
  - **Role Assignment:** Tooling to upgrade users to administrative permissions securely.
- **Trust & Security:**
  - "Authenticity Guaranteed" badges.
  - Secure checkout indicators.

## 🛠️ Technology Stack
- **Frontend:** React 19 (Vite), Tailwind CSS 3.4, Lucide React, React Router DOM, React Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Community Edition (Mongoose ODM)

## 🌍 Live Deployment
The application is deployed and accessible online:
- **Backend API (Render):** `https://loomlegacy-server.onrender.com`
- **Frontend (Vercel):** Hosted on Vercel (Check your Vercel dashboard for the live `.vercel.app` link)

## 🚀 How to Run the Project Locally

### Prerequisites
- Node.js installed on your machine.
- MongoDB Atlas instance or local MongoDB instance running.

### 1. Clone the Repository
```bash
git clone https://github.com/kittingkidden/LoomLegacy-MERN-setup.git
cd LoomLegacy-MERN-setup
```

### 2. Setup Server Environment
Navigate to the `server` directory, install dependencies, and create a `.env` file.
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
```

### 3. Setup Client Environment
Navigate to the `client` directory, install dependencies, and create a `.env` file.
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5001
```

### 4. Start the Application Locally
You will need two terminal windows to run both the frontend and backend servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
Access the application at `http://localhost:5173`.

## 📂 Project Structure
```text
LoomLegacy/
├── client/               # React Frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI (Buttons, Navbar, Layouts)
│   │   ├── context/      # Global State (AuthContext, CartContext)
│   │   ├── pages/        # Main Views (Home, Shop, Admin, Seller, Buyer)
│   │   ├── App.jsx       # Main Application Entry & Routing
│   │   └── index.css     # Global Styles & Tailwind Directives
├── server/               # Node.js/Express Backend
│   ├── models/           # Mongoose Database Schemas
│   ├── routes/           # Express API Endpoints
│   ├── scripts/          # Utility scripts (makeAdmin.js, listUsers.js)
│   ├── index.js          # Main Server Entry Point
│   └── seed.js           # Database seeding logic
└── README.md             # Project Documentation
```

## 👨💻 Developer Notes
- **Design Decisions:** We chose Tailwind CSS for rapid, consistent styling. React Context API handles managing shopping cart and authentication state to avoid the unnecessary complexity of Redux for this scale.
- **Integration:** The Node.js/Express backend provides a fully functional REST API allowing direct connectivity to MongoDB Atlas. Mongoose is utilized for robust data modeling and schema validation.
- **Future Improvements:** Implementation of real-time payment gateway integration (e.g. Stripe/Razorpay) and live order-tracking logic.

*Created for College Project Submission | 2026*