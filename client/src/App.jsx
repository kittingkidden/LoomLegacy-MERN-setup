import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { API_URL } from './config';
import ProtectedRoute from './components/routing/ProtectedRoute';
import ScrollToTop from './components/routing/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ShopPage from './pages/ShopPage';
import ArtisansPage from './pages/ArtisansPage';
import ArtisanShopPage from './pages/ArtisanShopPage';
import OurStoryPage from './pages/OurStoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageOrderPage from './pages/seller/ManageOrderPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderStatusPage from './pages/buyer/OrderStatusPage';

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
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        {/* Connection Status Bar (Tiny & subtle at the very top) */}
        <div className={`h-1 w-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Database Online' : 'Database Offline'} />

        <Navbar />

        <main className="grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/artisans" element={<ArtisansPage />} />
            <Route path="/artisan/:sellerId" element={<ArtisanShopPage />} />
            <Route path="/our-story" element={<OurStoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['customer', 'buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/dashboard" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/order/:id/manage" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <ManageOrderPage />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={['customer', 'buyer']}>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['customer', 'buyer']}>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/order/:id" element={
              <ProtectedRoute allowedRoles={['customer', 'buyer', 'admin']}>
                <OrderStatusPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;