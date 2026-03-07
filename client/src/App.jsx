import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { API_URL } from './config';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ShopPage from './pages/ShopPage';
import OurStoryPage from './pages/OurStoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import SellerDashboard from './pages/seller/SellerDashboard';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/health-check`)
      .then(res => res.json())
      .then(data => setIsConnected(data.database.includes('✅')))
      .catch(() => setIsConnected(false));
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Connection Status Bar (Tiny & subtle at the very top) */}
        <div className={`h-1 w-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Database Online' : 'Database Offline'} />

        <Navbar />

        <main className="grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/our-story" element={<OurStoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/dashboard" element={<BuyerDashboard />} />
            <Route path="/seller/SellerDashboard" element={<SellerDashboard />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Add more routes as you move more files */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;