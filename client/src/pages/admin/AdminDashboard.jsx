import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Shield, Search, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [usersRes, ordersRes] = await Promise.all([
                    fetch(`${API_URL}/api/users`),
                    fetch(`${API_URL}/api/orders`)
                ]);

                if (usersRes.ok) {
                    const data = await usersRes.json();
                    setUsers(data);
                }
                if (ordersRes.ok) {
                    const orderData = await ordersRes.json();
                    setOrders(orderData);
                }
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setUsersLoading(false);
                setOrdersLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            if (response.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">Admin Control</h1>
                        <p className="text-stone-500 uppercase tracking-widest text-xs font-bold">Platform Overview & User Management</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-terracotta-500 w-64"
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-stone-600">Total Users</h3>
                        </div>
                        <p className="text-4xl font-display font-bold text-stone-900">{users.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-terracotta-50 rounded-xl text-terracotta-600">
                                <ShoppingBag size={24} />
                            </div>
                            <h3 className="font-bold text-stone-600">Total Sellers</h3>
                        </div>
                        <p className="text-4xl font-display font-bold text-stone-900">{users.filter(u => u.role === 'seller').length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-olive-50 rounded-xl text-olive-600">
                                <Shield size={24} />
                            </div>
                            <h3 className="font-bold text-stone-600">Active Buyers</h3>
                        </div>
                        <p className="text-4xl font-display font-bold text-stone-900">{users.filter(u => u.role === 'customer' || u.role === 'buyer').length}</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setActiveTab('users')} 
                        className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'users' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}
                    >
                        Manage Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')} 
                        className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'orders' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}
                    >
                        Platform Orders
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    {activeTab === 'users' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-100">
                                    <th className="px-8 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Name</th>
                                    <th className="px-8 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersLoading ? (
                                    <tr><td colSpan="4" className="px-8 py-12 text-center text-stone-400">Loading users...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="4" className="px-8 py-12 text-center text-stone-400">No users found.</td></tr>
                                ) : filteredUsers.map(user => (
                                    <tr key={user._id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                                        <td className="px-8 py-4 font-bold text-stone-900">
                                            {user.name}
                                            <p className="text-[10px] text-stone-400 font-normal">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-4 text-stone-600 text-sm">{user.email}</td>
                                        <td className="px-8 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border-none focus:ring-2 focus:ring-terracotta-200 cursor-pointer ${user.role === 'seller' ? 'bg-terracotta-100 text-terracotta-700' : 'bg-olive-100 text-olive-700'
                                                    }`}
                                            >
                                                <option value="buyer">Buyer</option>
                                                <option value="seller">Seller</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-4">
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-stone-50 border-b border-stone-100">
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Order ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Buyer Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Full Address</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Items</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Delivery Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Total</th>
                                        <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordersLoading ? (
                                        <tr><td colSpan="6" className="px-8 py-12 text-center text-stone-400">Loading orders...</td></tr>
                                    ) : orders.length === 0 ? (
                                        <tr><td colSpan="6" className="px-8 py-12 text-center text-stone-400">No orders found.</td></tr>
                                    ) : orders.map(order => (
                                        <tr key={order._id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-stone-900 text-sm">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-stone-800 text-sm">{order.user?.name || 'Guest User'}</p>
                                                <p className="text-xs text-stone-500">{order.user?.email || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-stone-600 max-w-xs">{order.shippingAddress}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-stone-700">
                                                <div className="flex flex-col gap-1">
                                                    {order.products.map((p, idx) => (
                                                        <span key={idx} className="truncate max-w-[200px]" title={p.product?.name}>
                                                            {p.quantity}x {p.product?.name || 'Unknown Product'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.delivery ? (
                                                    <div className="text-xs">
                                                        <p className="font-bold text-stone-800">{order.delivery.partnerName || 'Unknown Partner'}</p>
                                                        <p className="text-stone-500">{order.delivery.distanceKm} km</p>
                                                        <p className="font-bold text-terracotta-600 font-mono mt-1 w-max px-2 py-0.5 bg-terracotta-50 rounded">Cost: ₹{order.delivery.deliveryCost}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-stone-400 italic">No delivery assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-stone-800">₹{order.totalAmount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold uppercase text-stone-600 mb-1">{order.paymentMethod}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
