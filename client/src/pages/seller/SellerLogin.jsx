import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SellerLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin) {
            const success = await register(name, email, password, 'seller');
            if (success) {
                alert('Registration successful! Please login.');
                setIsLogin(true);
            } else {
                alert('Registration failed.');
            }
        } else {
            const success = await login(email, password, 'seller');
            if (success) {
                navigate('/seller/SellerDashboard');
            } else {
                alert('Login failed. Please check your credentials.');
            }
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-olive-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-stone-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-display font-bold text-stone-900">
                        {isLogin ? 'Welcome Back, Artisan' : 'Join LoomLegacy'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-stone-600">
                        {isLogin ? 'Sign in to manage your collections' : 'Start your journey with us'}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="sr-only">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-terracotta-500 focus:border-terracotta-500 focus:z-10 sm:text-sm mb-4"
                                    placeholder="Full Name"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-terracotta-500 focus:border-terracotta-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-terracotta-500 focus:border-terracotta-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-terracotta-600 hover:bg-terracotta-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500 transition-colors"
                        >
                            {isLogin ? 'Sign In' : 'Register'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-terracotta-600 hover:text-terracotta-500"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellerLogin;
