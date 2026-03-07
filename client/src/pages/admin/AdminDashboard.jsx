import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, ShoppingBag, Shield, Search } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/users');
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}/role`, {
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
            const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
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

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
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
                            {loading ? (
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
