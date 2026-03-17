import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Calendar, User, Phone, CreditCard, MapPin } from 'lucide-react';
import { API_URL } from '../../config';

const ManageOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        partnerName: '',
        partnerPhone: '',
        partnerPaymentDetails: '', // e.g. UPI ID
        pickupDate: '',
        distanceKm: ''
    });

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await fetch(`${API_URL}/api/orders/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDispatch = async (e) => {
        e.preventDefault();
        setDispatching(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/${id}/dispatch`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Order successfully dispatched!');
                navigate('/seller/dashboard');
            } else {
                alert('Failed to dispatch order. Please try again.');
            }
        } catch (error) {
            console.error("Dispatch error:", error);
            alert('An error occurred while dispatching.');
        } finally {
            setDispatching(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-stone-200 border-t-terracotta-600 rounded-full animate-spin"></div>
                    <p className="text-stone-500 font-medium">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Order Not Found</h2>
                    <button onClick={() => navigate(-1)} className="text-terracotta-600 font-medium hover:underline">Go Back</button>
                </div>
            </div>
        );
    }

    const { delivery } = order;
    const isDispatched = order.status === 'dispatched' || order.status === 'shipped' || order.status === 'delivered';

    return (
        <div className="bg-stone-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                <button 
                    onClick={() => navigate('/seller/dashboard')} 
                    className="flex items-center text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Manage Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h1>
                        <p className="text-stone-500 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase inline-flex items-center gap-2
                            ${isDispatched ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20' : 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20'}
                        `}>
                           {isDispatched ? 'Dispatched' : 'Pending Dispatch'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Details */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col h-full">
                        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2"><MapPin size={20} className="text-terracotta-500"/> Shipping Details</h2>
                        <div className="space-y-4 mb-8">
                            <div>
                                <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Destination</p>
                                <p className="font-medium text-stone-800">{order.shippingAddress}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Customer / Buyer</p>
                                <p className="font-medium text-stone-800">{order.user ? order.user.name : "Guest Purchaser"}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-stone-100 mt-auto">
                            <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-widest">Order Contents</h3>
                            <ul className="space-y-3">
                                {order.products.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-start text-sm">
                                        <span className="text-stone-600">{item.quantity}x {item.product?.name || 'Item'}</span>
                                        <span className="font-mono font-medium text-stone-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-100">
                                <span className="font-bold text-stone-900">Total Value</span>
                                <span className="text-xl font-bold font-mono text-terracotta-600">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dispatch Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                            <Truck size={20} className="text-terracotta-500" /> Delivery Assignment
                        </h2>

                        {isDispatched ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <p className="text-sm font-medium text-blue-800">This order has been handed over to a delivery partner.</p>
                                </div>
                                
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center py-2 border-b border-stone-50 text-sm">
                                        <span className="font-medium text-stone-500">Partner Name</span>
                                        <span className="font-bold text-stone-900">{delivery?.partnerName}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-stone-50 text-sm">
                                        <span className="font-medium text-stone-500">Contact Number</span>
                                        <span className="font-bold font-mono text-stone-900">{delivery?.partnerPhone}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-stone-50 text-sm">
                                        <span className="font-medium text-stone-500">Scheduled Pickup</span>
                                        <span className="font-bold text-stone-900">{delivery?.pickupDate ? new Date(delivery.pickupDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-stone-50 text-sm">
                                        <span className="font-medium text-stone-500">Distance</span>
                                        <span className="font-bold text-stone-900">{delivery?.distanceKm} km</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 text-sm">
                                        <span className="font-medium text-stone-500">Calculated Delivery Cost</span>
                                        <span className="font-bold text-terracotta-600 font-mono">₹{delivery?.deliveryCost}</span>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            <form onSubmit={handleDispatch} className="space-y-5">
                                <div className="p-4 bg-terracotta-50/50 border border-terracotta-100 rounded-xl mb-6">
                                    <p className="text-sm text-terracotta-800 font-medium">
                                        <strong className="font-bold">Important:</strong> If this order is Cash On Delivery (COD), explicitly instruct the delivery partner to collect the payment <strong className="underline">using your (Seller's) matching UPI ID</strong> upon handover to the customer.
                                    </p>
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-bold text-stone-700 mb-1.5"><User size={14}/> Partner Name</label>
                                    <input 
                                        required name="partnerName" value={formData.partnerName} onChange={handleInputChange} 
                                        type="text" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all text-sm" 
                                        placeholder="e.g. Ramesh Singh"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-bold text-stone-700 mb-1.5"><Phone size={14}/> Phone Number</label>
                                    <input 
                                        required name="partnerPhone" value={formData.partnerPhone} onChange={handleInputChange} 
                                        type="tel" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all text-sm" 
                                        placeholder="+91..."
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-bold text-stone-700 mb-1.5"><CreditCard size={14}/> Partner Payment Details / UPI ID</label>
                                    <input 
                                        required name="partnerPaymentDetails" value={formData.partnerPaymentDetails} onChange={handleInputChange} 
                                        type="text" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all text-sm" 
                                        placeholder="partner@bank"
                                    />
                                    <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider font-medium">For Admin record-keeping & payouts</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-stone-700 mb-1.5"><Calendar size={14}/> Pickup Date</label>
                                        <input 
                                            required name="pickupDate" value={formData.pickupDate} onChange={handleInputChange} 
                                            type="date" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-stone-700 mb-1.5"><MapPin size={14}/> Estimated Distance</label>
                                        <div className="relative">
                                            <input 
                                                required name="distanceKm" value={formData.distanceKm} onChange={handleInputChange} 
                                                type="number" min="1" step="0.1" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all pr-12 text-sm" 
                                                placeholder="e.g. 15"
                                            />
                                            <span className="absolute right-4 top-2.5 text-stone-400 font-bold text-sm">KM</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-stone-100 mt-2">
                                    <button 
                                        type="submit" 
                                        disabled={dispatching}
                                        className="w-full py-3.5 bg-stone-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {dispatching ? 'Dispatching...' : <><Truck size={18}/> Assign Partner & Dispatch Order</>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageOrderPage;
