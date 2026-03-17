import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, ChevronLeft, ShieldCheck, Truck } from 'lucide-react';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const OrderStatusPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Ensure backend has GET /api/orders/:id route
                const res = await fetch(`${API_URL}/api/orders/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Simple Authorization: Only owner or admin can view
                    if (data.user && user && (data.user._id === user.id || data.user === user.id || user.role === 'admin')) {
                         setOrder(data);
                    } else if (!data.user) {
                        setOrder(data); // Guest order
                    } else {
                        setError('Unauthorized to view this order.');
                    }
                } else {
                    setError('Order not found.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch order details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetails();
    }, [id, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="w-8 h-8 border-4 border-stone-300 border-t-terracotta-600 rounded-full animate-spin"></div>
                    <p className="text-stone-500 font-medium">Fetching Order Details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-stone-100">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-500 mb-6">
                        <Package size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Order Not Found</h2>
                    <p className="text-stone-500 mb-8">{error || 'We could not locate this order in our system.'}</p>
                    <button onClick={() => navigate('/')} className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-colors">
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-screen bg-stone-50">
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-stone-500 hover:text-stone-800 font-medium mb-8 group transition-colors"
            >
                <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            {/* Header Status */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-green-200">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-stone-800 tracking-tight mb-1">Order Status</h1>
                        <p className="text-stone-500">Order <span className="font-mono font-bold text-stone-700">#{order._id.substring(order._id.length - 8).toUpperCase()}</span> placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="relative z-10 md:text-right w-full md:w-auto">
                    <span className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-1">Current Status</span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-2 border shadow-sm
                        ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                    >
                        {order.status === 'delivered' ? <ShieldCheck size={16} /> : <Truck size={16} />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Delivery Info */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                            <Package className="text-terracotta-500" size={24} /> Items Ordered
                        </h2>
                        
                        <div className="space-y-6">
                            {order.products.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-stone-50/50 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
                                    <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border border-stone-200 shrink-0 shadow-sm">
                                        <img src={item.product?.image || "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=200"} alt="product" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="font-bold text-stone-800">{item.product?.name || "Loom Product"}</h3>
                                        <p className="text-sm text-stone-500 mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <p className="font-bold text-stone-800 font-mono text-lg">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Customer Info & Logistics */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-stone-400" /> Customer Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-1">Customer Name</p>
                                <p className="font-medium text-stone-800">{order.user?.name || order.shippingAddress.split(',')[0] || 'Guest Buyer'}</p>
                                {order.user?.email && <p className="text-sm text-stone-500">{order.user.email}</p>}
                            </div>
                            <div className="pt-4 border-t border-stone-100">
                                <p className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-1">Shipping Address</p>
                                <div className="text-stone-600 text-sm leading-relaxed p-4 bg-stone-50 rounded-xl border border-stone-100 mt-2">
                                    {order.shippingAddress.split(',').map((line, i) => (
                                        <p key={i} className={i === 0 ? "font-bold text-stone-800 mb-1 leading-none" : ""}>{line.trim()}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-stone-900 p-6 rounded-2xl shadow-md text-white">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard size={18} className="text-terracotta-400" /> Payment Summary</h3>
                        
                        <div className="space-y-3 mb-6 flex-1 text-sm border-b border-stone-700 pb-6">
                            <div className="flex justify-between text-stone-400">
                                <span>Subtotal</span>
                                <span className="text-white font-mono">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                                <span>Shipping Fees</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-stone-400">Method</span>
                                <span className="uppercase font-bold text-stone-300 text-xs px-2 py-1 bg-stone-800 rounded">{order.paymentMethod || 'Credit Card'}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-stone-400">Status</span>
                                <span className={`uppercase font-bold text-xs px-2 py-1 rounded ${order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{order.paymentStatus || 'unknown'}</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Total Paid</span>
                            <span className="font-display font-bold text-2xl text-terracotta-400 tracking-tight">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center pb-12">
                 <button onClick={() => navigate('/shop')} className="text-terracotta-600 hover:text-terracotta-700 font-bold underline transition-colors">
                     Continue Exploring Collections
                 </button>
            </div>
        </div>
    );
};

export default OrderStatusPage;
