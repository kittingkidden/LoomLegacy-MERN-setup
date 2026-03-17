import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../ui/Logo';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { count } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // specific links config
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'Artisans', path: '/artisans' },
        { name: 'Why We Exist', path: '/our-story' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10; // Lower threshold slightly
            setScrolled(prev => {
                if (prev !== isScrolled) return isScrolled;
                return prev;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ willChange: 'transform, opacity, padding' }} // GPU Hint
            className={`sticky top-0 z-100 transition-colors duration-500 ease-in-out py-4 ${scrolled
                ? 'bg-white/90 backdrop-blur-md shadow-sm'
                : 'bg-cream-50/50 backdrop-blur-[2px] border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo (Scales slightly on scroll) */}
                    <div className={`shrink-0 flex items-center transition-all ${scrolled ? 'scale-90' : 'scale-100'}`}>
                        <Logo />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-10 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="relative group text-stone-700 font-medium tracking-wide hover:text-terracotta-700 transition-colors"
                            >
                                {link.name}
                                {/* Animated Underline */}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-terracotta-600 transition-all duration-300 group-hover:w-full ${isActive(link.path) ? 'w-full' : ''}`}></span>
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* User / Logout button */}
                        {user ? (
                            <div className="flex items-center space-x-6">
                                <Link
                                    to={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller/dashboard' : '/dashboard'}
                                    className="text-stone-600 hover:text-terracotta-600 transition-colors"
                                    title="Dashboard"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <LayoutDashboard size={22} strokeWidth={2} />
                                    </motion.div>
                                </Link>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="text-stone-600 hover:text-red-600 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={22} strokeWidth={2} />
                                </motion.button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-stone-600 hover:text-terracotta-600 transition-colors">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-stone-600 hover:text-terracotta-600 transition-colors">
                                    <User size={22} strokeWidth={2} />
                                </motion.div>
                            </Link>
                        )}

                        {/* Cart button */}
                        {(!user || (user.role !== 'seller' && user.role !== 'admin')) && (
                            <Link to="/cart" className="relative group text-stone-600 hover:text-terracotta-600 transition-colors">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-stone-600 hover:text-terracotta-600 transition-colors">
                                    <ShoppingBag size={22} strokeWidth={2} />
                                </motion.div>
                                <AnimatePresence>
                                    {count > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-2 bg-terracotta-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                                        >
                                            {count}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        )}

                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-800 p-2">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {navLinks.map(link => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="block text-xl font-display font-medium text-stone-800 hover:text-terracotta-600 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="border-t border-stone-100 pt-6 mt-6">
                                {!user && (
                                    <Link to="/login" className="flex items-center gap-2 text-lg font-medium text-stone-600" onClick={() => setIsMenuOpen(false)}>
                                        <User size={20} /> Login
                                    </Link>
                                )}
                                {user && (
                                    <div className="space-y-4">
                                        <Link
                                            to={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller/dashboard' : '/dashboard'}
                                            className="flex items-center gap-2 text-lg font-medium text-stone-600"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <LayoutDashboard size={20} /> Dashboard
                                        </Link>
                                        <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-lg font-medium text-red-500">
                                            <LogOut size={20} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;  