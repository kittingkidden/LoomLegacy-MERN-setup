import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Store, Fingerprint, ArrowRight, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Local Assets
import slide1 from '../assets/images/hero_model.png';
import slide2 from '../assets/images/hero_texture.png';
import slide3 from '../assets/images/hero_artisan.png';

const LoginPage = () => {
    const [roleView, setRoleView] = useState('buyer'); // 'buyer' | 'seller' | 'admin'
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const redirectParam = queryParams.get('redirect');

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Image Slider rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const role = roleView;

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
                    navigate('/seller/dashboard');
                } else if (redirectParam === '/cart') {
                    navigate('/cart');
                } else {
                    navigate('/dashboard');
                }
            }
        }
    };

    const handleDemoLogin = (role) => {
        setRoleView(role);
        if (role === 'admin') {
            setEmail('admin@loomlegacy.com');
            setPassword('admin');
        } else if (role === 'seller') {
            setEmail('artisan@loomlegacy.com');
            setPassword('demo123');
        } else {
            setEmail('buyer@example.com');
            setPassword('demo123');
        }
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
                        {redirectParam === '/cart' && roleView === 'buyer' && (
                            <div className="bg-terracotta-50 text-terracotta-700 p-3 rounded-xl mb-6 text-sm font-bold border border-terracotta-100 flex items-center justify-center gap-2 animate-pulse shadow-sm">
                                <ShoppingBag size={18}/> Please log in or sign up to start checkout.
                            </div>
                        )}
                        <h2 className="text-3xl font-bold text-stone-900 mb-2 font-display">
                            {isRegister ? 'Create Account' : (roleView === 'admin' ? 'Admin Portal' : (roleView === 'seller' ? 'Artisan Login' : 'Welcome Back'))}
                        </h2>
                        <p className="text-stone-500 text-sm">
                            {isRegister ? 'Join our community of handloom lovers.' : (roleView === 'admin' ? 'Manage the LoomLegacy platform.' : (roleView === 'seller' ? 'Manage your craft and legacy.' : 'Enter your details to access your account.'))}
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex bg-stone-100 p-1 rounded-xl mb-8 w-fit mx-auto md:mx-0">
                        <button
                            type="button"
                            onClick={() => setRoleView('buyer')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${roleView === 'buyer' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Buyer
                        </button>
                        <button
                            type="button"
                            onClick={() => setRoleView('seller')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${roleView === 'seller' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Seller
                        </button>
                        <button
                            type="button"
                            onClick={() => setRoleView('admin')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${roleView === 'admin' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Admin
                        </button>
                    </div>

                    {/* Social Login Removed */}

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
                            <button type="button" onClick={() => handleDemoLogin(roleView)} className="text-stone-500 hover:text-terracotta-600 transition-colors flex items-center gap-1">
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
