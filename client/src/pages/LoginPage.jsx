import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Store, Fingerprint, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Local Assets
import slide1 from '../assets/images/hero_model.png';
import slide2 from '../assets/images/hero_texture.png';
import slide3 from '../assets/images/hero_artisan.png';

const LoginPage = () => {
    const [isSeller, setIsSeller] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Reset state upon component mount (e.g., when reaching the login page after a log out)
    useEffect(() => {
        if (!isAuthenticated) {
            setName('');
            setEmail('');
            setPassword('');
        }
    }, [isAuthenticated]);

    // Assets provided by user
    const slides = [
        slide1,
        slide2,
        slide3
    ];

    const quotes = [
        { text: "The sound of the loom is the heartbeat of our village.", author: "Rajesh, Master Weaver, Varanasi" },
        { text: "Every thread I weave carries a prayer for the one who wears it.", author: "Lakshmi, Artisan, Pochampally" },
        { text: "We don't just make cloth. We make memories.", author: "Kabir, Dyer, Kutch" }
    ];

    // Quote rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Image Slider rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const role = isSeller ? 'seller' : 'buyer';

        if (isRegister) {
            const user = await register(name, email, password, role);
            if (user) {
                alert('Registration successful! Please log in.');
                setIsRegister(false);
            }
        } else {
            const user = await login(email, password);
            if (user) {
                if (user.role === 'admin') {
                    navigate('/admin');
                } else if (user.role === 'seller') {
                    navigate('/seller/SellerDashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        }
    };

    const handleDemoLogin = (role) => {
        setIsSeller(role === 'seller');
        setEmail(role === 'seller' ? 'artisan@loomlegacy.com' : 'buyer@example.com');
        setPassword('demo123');
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] opacity-5"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl w-full flex rounded-3xl shadow-2xl overflow-hidden bg-white relative z-10 min-h-[600px]"
            >
                {/* Left Panel - Visual Storytelling */}
                <div className="hidden md:block w-1/2 relative bg-stone-900 overflow-hidden">
                    {/* Image Slider */}
                    <AnimatePresence mode='wait'>
                        <motion.img
                            key={currentSlide}
                            src={slides[currentSlide]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Handloom Story"
                        />
                    </AnimatePresence>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* Text Content */}
                    <div className="relative p-12 h-full flex flex-col justify-end text-white z-20">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h2 className="font-display text-4xl font-bold mb-2">
                                Discover Timeless Art.
                            </h2>

                            {/* Rotating Quotes */}
                            <div className="h-24">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentQuote}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <p className="text-xl font-serif italic text-stone-200 leading-relaxed opacity-90">
                                            "{quotes[currentQuote].text}"
                                        </p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="h-px w-8 bg-terracotta-400"></div>
                                            <p className="text-stone-400 text-xs uppercase tracking-widest">
                                                {quotes[currentQuote].author}
                                            </p>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Panel - Form Experience */}
                <div className="w-full md:w-1/2 p-10 md:p-14 bg-white flex flex-col justify-center">

                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-stone-900 mb-2 font-display">
                            {isRegister ? 'Create Account' : (isSeller ? 'Artisan Login' : 'Welcome Back')}
                        </h2>
                        <p className="text-stone-500 text-sm">
                            {isRegister ? 'Join our community of handloom lovers.' : (isSeller ? 'Manage your craft and legacy.' : 'Enter your details to access your account.')}
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex bg-stone-100 p-1 rounded-xl mb-8 w-fit mx-auto md:mx-0">
                        <button
                            onClick={() => setIsSeller(false)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isSeller ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Buyer
                        </button>
                        <button
                            onClick={() => setIsSeller(true)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isSeller ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Seller
                        </button>
                    </div>

                    {/* Social Login */}
                    {!isSeller && (
                        <div className="space-y-3 mb-6">
                            <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-sm font-bold text-stone-700">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Continue with Google
                            </button>
                            <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-sm font-bold text-stone-700">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.8 15.6 257.3c-15.1 130 51.5 220 100.3 220 25.1 0 42.8-18 73.1-18 31.8 0 46.8 17.5 72.8 17.5 50.3 0 105.7-83.6 116.7-133-31-18-49.7-43-49.8-75.1zM273.6 103c14.6-18.7 24.3-43.2 21.6-67-24.1 2.3-51.4 17.4-66.8 35.8-13.4 15.6-24.8 41.5-21 64.6 26.6 2.3 51.6-14.7 66.2-33.4z" /></svg>
                                Continue with Apple
                            </button>
                        </div>
                    )}

                    {(!isSeller) && (
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-stone-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-stone-500">Or continue with email</span>
                            </div>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {isRegister && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <label className="block text-xs font-bold text-stone-700 uppercase tracking-widest mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-500/10 transition-all font-medium"
                                    placeholder="Your Name"
                                    autoComplete="off"
                                />
                            </motion.div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-widest mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-500/10 transition-all font-medium"
                                placeholder="name@example.com"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-widest mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-500/10 transition-all font-medium pr-10"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <button type="button" onClick={() => handleDemoLogin(isSeller ? 'seller' : 'buyer')} className="text-stone-500 hover:text-terracotta-600 transition-colors flex items-center gap-1">
                                <Fingerprint size={12} /> Auto-Fill Demo
                            </button>
                            <button type="button" onClick={() => alert('Password reset link sent to your email!')} className="font-bold text-stone-900 hover:text-terracotta-600 transition-colors">Forgot password?</button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-4 rounded-xl bg-stone-900 text-white font-bold text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group"
                        >
                            {isRegister ? 'Create Account' : 'Log In'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-sm font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors"
                        >
                            {isRegister ? 'Already have an account? Log In' : 'No account? Join LoomLegacy'}
                        </button>
                    </div>

                    <p className="mt-8 text-center text-xs text-stone-400">
                        No spam. Ever. Your data stays with you.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
