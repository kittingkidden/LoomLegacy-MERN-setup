import React, { useState, useEffect } from 'react';
import { Package, User, MapPin, ChevronRight, Clock, CheckCircle, Heart, Key, Edit2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config';

const BuyerDashboard = () => {
    const { user } = useAuth();
    const { wishlistItems, toggleWishlist } = useWishlist();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const [addresses, setAddresses] = useState([]);

    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        type: 'Home', name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false
    });

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/users/${user.id}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddress)
            });
            if (res.ok) {
                const updatedAddresses = await res.json();
                setAddresses(updatedAddresses);
                setIsAddingAddress(false);
                setNewAddress({ type: 'Home', name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
            }
        } catch (error) {
            console.error('Failed to add address:', error);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            const res = await fetch(`${API_URL}/api/users/${user.id}/addresses/${addressId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const updatedAddresses = await res.json();
                setAddresses(updatedAddresses);
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
        }
    };


    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;
            try {
                // Fetch Orders
                const orderRes = await fetch(`${API_URL}/api/orders/user/${user.id}`);
                if (orderRes.ok) setOrders(await orderRes.json());

                // Fetch Addresses
                const addressRes = await fetch(`${API_URL}/api/users/${user.id}/addresses`);
                if (addressRes.ok) {
                    setAddresses(await addressRes.json());
                } else if (user.addresses) {
                    setAddresses(user.addresses); // Fallback to context
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-stone-50">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
            >
                <div>
                    <h1 className="font-display text-4xl font-bold text-stone-800">My Account</h1>
                    <p className="text-stone-500 mt-2 text-lg">Welcome back, <span className="text-terracotta-600 font-semibold">{user?.name}</span></p>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
                {/* Sidebar Profile Info */}
                <div className="md:col-span-4 lg:col-span-3 space-y-6">
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 overflow-hidden relative">
                        {/* Decorative Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>

                        <div className="flex items-center space-x-4 mb-8 relative z-10">
                            <div className="w-16 h-16 bg-linear-to-br from-terracotta-100 to-terracotta-200 rounded-full flex items-center justify-center text-terracotta-700 font-bold text-2xl shadow-inner border border-white">
                                {user?.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-800 text-lg">{user?.name}</h3>
                                <p className="text-sm text-stone-500 truncate w-32">{user?.email}</p>
                            </div>
                        </div>
                        <nav className="space-y-2 relative z-10">
                            {[
                                { id: 'orders', icon: Package, label: 'My Orders' },
                                { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                                { id: 'addresses', icon: MapPin, label: 'Addresses' },
                                { id: 'profile', icon: User, label: 'Profile Details' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all shadow-sm group ${activeTab === item.id
                                        ? 'bg-terracotta-50 text-terracotta-700 font-medium'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon size={20} className={activeTab === item.id ? "text-terracotta-600" : "text-stone-400 group-hover:text-stone-600"} />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${activeTab === item.id ? "text-terracotta-400" : "text-stone-300 group-hover:text-stone-400"}`} />
                                </button>
                            ))}
                        </nav>
                    </motion.div>
                </div>

                {/* Main Content Areas */}
                <div className="md:col-span-8 lg:col-span-9 space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'orders' && (
                            <motion.div
                                key="orders"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-display text-2xl font-bold text-stone-800">Recent Orders</h2>
                                    <button className="text-terracotta-600 text-sm font-medium hover:underline">View All</button>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <p className="text-center text-stone-400 py-12">Loading orders...</p>
                                    ) : orders.length === 0 ? (
                                        <div className="bg-white p-12 rounded-2xl border border-dashed border-stone-200 text-center">
                                            <Package className="mx-auto text-stone-200 mb-4" size={48} />
                                            <p className="text-stone-500">No orders found. Start exploring our collections!</p>
                                        </div>
                                    ) : orders.map((order) => (
                                        <motion.div
                                            key={order._id}
                                            variants={itemVariants}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col hover:shadow-md transition-shadow group overflow-hidden"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                                <div className="space-y-2 mb-4 sm:mb-0">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="font-bold text-stone-800 text-lg group-hover:text-terracotta-600 transition-colors">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {order.status === 'delivered' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-stone-500">
                                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                                        <span className="font-semibold text-stone-700">₹{order.totalAmount.toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-stone-700 font-medium bg-stone-50 inline-block px-2 py-1 rounded-md mt-1">
                                                        {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                    className="px-5 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 text-sm font-medium transition-all duration-200"
                                                >
                                                    {expandedOrder === order._id ? 'Hide Details' : 'Order Details'}
                                                </button>
                                            </div>

                                            {/* Expandable Order Details Panel */}
                                            <AnimatePresence>
                                                {expandedOrder === order._id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-6 pt-6 border-t border-stone-100"
                                                    >
                                                        <h4 className="font-bold text-stone-800 mb-4">Items in this order</h4>
                                                        <div className="space-y-4">
                                                            {order.products.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                                                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-stone-200 shrink-0">
                                                                        <img src={item.product?.image || "https://placehold.co/100x100"} alt="product" className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-stone-800 text-sm">{item.product?.name || "Loom Product"}</p>
                                                                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-terracotta-600 text-sm">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-6 bg-stone-50 p-4 rounded-xl flex justify-between items-center text-sm border border-stone-100">
                                                            <div className="text-stone-600">
                                                                <span className="block font-bold text-stone-800 mb-1">Shipping Address</span>
                                                                {order.shippingAddress?.street ? (
                                                                    <>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zip}</>
                                                                ) : 'Default Shipping Address'}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-stone-500 mb-1">Payment Method</p>
                                                                <p className="font-bold text-stone-800 uppercase">{order.paymentMethod || 'Credit Card'}</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'wishlist' && (
                            <motion.div
                                key="wishlist"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <h2 className="font-display text-2xl font-bold text-stone-800 mb-6">My Wishlist</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {wishlistItems.map((item) => (
                                        <div key={item._id || item.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-lg transition-all group">
                                            <div className="relative h-64 overflow-hidden">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <button onClick={() => toggleWishlist(item)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg text-stone-800 mb-1">{item.name}</h3>
                                                <p className="text-terracotta-600 font-bold font-mono">₹{item.price.toLocaleString()}</p>
                                                <button className="w-full mt-4 bg-stone-900 text-white py-2.5 rounded-xl font-medium hover:bg-stone-800 transition-colors">
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'addresses' && (
                            <motion.div
                                key="addresses"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-display text-2xl font-bold text-stone-800">Saved Addresses</h2>
                                    {!isAddingAddress && (
                                        <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-2 text-terracotta-600 font-bold hover:bg-terracotta-50 px-4 py-2 rounded-lg transition-colors">
                                            <Plus size={18} /> Add New
                                        </button>
                                    )}
                                </div>

                                {isAddingAddress ? (
                                    <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 mb-6">
                                        <h3 className="font-bold text-lg text-stone-800">Add New Address</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Full Name" required value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-terracotta-500" />
                                            <input type="tel" placeholder="Phone Number" required value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-terracotta-500" />
                                            <input type="text" placeholder="Street Address" required value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className="col-span-1 md:col-span-2 w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-terracotta-500" />
                                            <input type="text" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-terracotta-500" />
                                            <div className="flex gap-4">
                                                <input type="text" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="w-1/2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-terracotta-500" />
                                                <input type="text" placeholder="ZIP" required value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} className="w-1/2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-terracotta-500" />
                                            </div>
                                            <select value={newAddress.type} onChange={e => setNewAddress({ ...newAddress, type: e.target.value })} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none text-stone-600 focus:border-terracotta-500">
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <label className="flex items-center gap-2 text-sm text-stone-600">
                                                <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="rounded text-terracotta-600 focus:ring-terracotta-500 outline-none" />
                                                Set as Default Address
                                            </label>
                                        </div>
                                        <div className="flex gap-3 justify-end pt-4">
                                            <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 py-2 text-stone-600 font-bold hover:bg-stone-50 rounded-lg transition-colors">Cancel</button>
                                            <button type="submit" className="px-6 py-2 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors shadow-md">Save Address</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {addresses.map((addr) => (
                                            <div key={addr._id} className={`bg-white p-6 rounded-2xl border-2 transition-all relative ${addr.isDefault ? 'border-terracotta-100 shadow-md ring-1 ring-terracotta-100' : 'border-stone-100 hover:border-stone-200'}`}>
                                                {addr.isDefault && (
                                                    <span className="absolute top-4 right-4 bg-terracotta-100 text-terracotta-700 text-xs font-bold px-2 py-1 rounded-full">Default</span>
                                                )}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <MapPin className="text-stone-400" size={20} />
                                                    <span className="font-bold text-stone-800 text-lg">{addr.type}</span>
                                                </div>
                                                <div className="space-y-1 text-stone-600 text-sm mb-6">
                                                    <p className="font-medium text-stone-800">{addr.name}</p>
                                                    <p>{addr.street}</p>
                                                    <p>{addr.city}, {addr.state} - {addr.zip}</p>
                                                    <p className="pt-2">Mobile: <span className="font-mono text-stone-700">{addr.phone}</span></p>
                                                </div>
                                                <div className="flex gap-3 pt-4 border-t border-stone-50">
                                                    <button onClick={() => handleDeleteAddress(addr._id)} className="flex-1 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-2xl"
                            >
                                <h2 className="font-display text-2xl font-bold text-stone-800 mb-8">Profile Details</h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-stone-700 mb-2">First Name</label>
                                            <input type="text" defaultValue={user?.name.split(' ')[0]} className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta-100 focus:border-terracotta-400 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-stone-700 mb-2">Last Name</label>
                                            <input type="text" defaultValue={user?.name.split(' ')[1] || ''} className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta-100 focus:border-terracotta-400 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2">Email Address</label>
                                        <input type="email" defaultValue={user?.email} disabled className="w-full px-4 py-3 bg-stone-100 border-stone-200 border rounded-xl text-stone-500 cursor-not-allowed" />
                                        <p className="text-xs text-stone-400 mt-1 flex items-center gap-1"><Key size={12} /> Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2">Phone Number</label>
                                        <input type="tel" placeholder="+91" className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta-100 focus:border-terracotta-400 transition-all" />
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button type="button" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
                                            <Edit2 size={18} /> Update Profile
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default BuyerDashboard;
