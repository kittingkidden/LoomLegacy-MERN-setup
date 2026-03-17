import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShieldCheck, CreditCard, Truck, AlertCircle } from 'lucide-react';
import { allIndianCities, getStateByCity } from '../utils/indianCities';

import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const CheckoutPage = () => {
    const { cartItems, subtotal, discount, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 2.5: Details
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [formData, setFormData] = useState({
        firstName: user?.name ? user.name.split(' ')[0] : '',
        lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
    });

    const [validationError, setValidationError] = useState('');

    // Fetch addresses on mount if user is logged in
    React.useEffect(() => {
        const fetchAddresses = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`${API_URL}/api/users/${user.id}/addresses`);
                    if (res.ok) {
                        const data = await res.json();
                        setSavedAddresses(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch addresses:', error);
                }
            }
        };
        fetchAddresses();
    }, [user]);

    const [isValidatingPincode, setIsValidatingPincode] = useState(false);
    const [isPincodeValid, setIsPincodeValid] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'city') {
            const state = getStateByCity(value);
            setFormData(prev => ({ 
                ...prev, 
                city: value, 
                state: state || '', 
                country: state ? 'India' : '',
                pincode: '', // Reset pincode if city changes
                address: ''  // Reset address if city changes
            }));
            setIsPincodeValid(false);
        } else if (name === 'pincode') {
            setFormData(prev => ({ ...prev, pincode: value }));
            if (value.length === 6) {
                validatePincode(value);
            } else {
                setIsPincodeValid(false);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (validationError) setValidationError('');
    };

    const validatePincode = async (pincode) => {
        setIsValidatingPincode(true);
        try {
            const res = await fetch(`${API_URL}/api/pincodes/validate/${pincode}`);
            if (res.ok) {
                const data = await res.json();
                // Check if the pincode belongs to the selected city/state (optional but good)
                // For now, just mark as valid if it exists in DB
                setIsPincodeValid(true);
                setValidationError('');
            } else {
                setIsPincodeValid(false);
                setValidationError('Invalid Pincode. Please enter a valid Indian pincode.');
            }
        } catch (error) {
            console.error('Pincode validation failed:', error);
            setValidationError('Connection error while validating pincode.');
        } finally {
            setIsValidatingPincode(false);
        }
    };

    const handleSavedAddressSelect = (e) => {
        const addrId = e.target.value;
        setSelectedAddressId(addrId);
        
        if (!addrId) return; // 'Select Address' option chosen

        const addr = savedAddresses.find(a => a._id === addrId);
        if (addr) {
            // Split name best-effort
            const nameParts = (addr.name || '').split(' ');
            
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                address: addr.street || '',
                city: addr.city || '',
                state: getStateByCity(addr.city) || '',
                country: getStateByCity(addr.city) ? 'India' : '',
                pincode: addr.zip || ''
            });
            setIsPincodeValid(/^[1-9][0-9]{5}$/.test(addr.zip || ''));
            setValidationError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate City
        if (!allIndianCities.includes(formData.city)) {
            setValidationError('Please select a valid Indian city from the list.');
            return;
        }

        // Validate PIN Code
        const pinRegex = /^[1-9][0-9]{5}$/;
        if (!pinRegex.test(formData.pincode)) {
            setValidationError('Invalid PIN Code. It must be exactly 6 digits and cannot start with 0.');
            return;
        }

        setValidationError('');
        setStep(2);
    };

    const handlePayment = async (method = 'card', status = 'paid') => {
        setIsProcessing(true);
        try {
            const orderData = {
                user: user?.id || user?._id || null, // Use real ID
                products: cartItems.map(item => ({
                    product: item._id || item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: total,
                shippingAddress: `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pincode}`,
                paymentMethod: method,
                paymentStatus: status
            };

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const savedOrder = await response.json();
                clearCart();
                navigate(`/order/${savedOrder._id}`);
            } else {
                const err = await response.json();
                alert('Order failed: ' + (err.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong during checkout.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-800">Your cart is empty</h2>
                    <button onClick={() => navigate('/shop')} className="mt-4 text-terracotta-600 hover:underline">Continue Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Forms */}
                <div className="lg:col-span-2">
                    {step === 1 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center"><Truck className="mr-2" size={20} /> Shipping Address</h2>
                            
                            {validationError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p>{validationError}</p>
                                </div>
                            )}

                            {savedAddresses.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Use Saved Address</label>
                                    <select 
                                        value={selectedAddressId} 
                                        onChange={handleSavedAddressSelect}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-terracotta-500 transition-all text-stone-700 font-medium"
                                    >
                                        <option value="">-- Or enter a new address below --</option>
                                        {savedAddresses.map(addr => (
                                            <option key={addr._id} value={addr._id}>
                                                {addr.type} ({addr.city}) - {addr.street.substring(0, 20)}...
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
                                        <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
                                        <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                                        <input required list="indianCities" name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" placeholder="Search city..." autoComplete="off" />
                                        <datalist id="indianCities">
                                            {allIndianCities.map((cityName, idx) => (
                                                <option key={idx} value={cityName} />
                                            ))}
                                        </datalist>
                                    </div>
                                    
                                    {formData.city && formData.state && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
                                                <input readOnly name="state" value={formData.state} type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 text-stone-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">Country</label>
                                                <input readOnly name="country" value={formData.country} type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 text-stone-500 focus:outline-none" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                                    Pincode {isValidatingPincode && <span className="text-stone-400 text-xs animate-pulse">(Validating...)</span>}
                                                </label>
                                                <input required name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" maxLength="6" pattern="[1-9][0-9]{5}" title="6-digit Indian PIN Code starting with 1-9" className={`w-full px-3 py-2 border rounded-md focus:outline-none ${isPincodeValid ? 'border-green-300 focus:border-green-500 bg-green-50' : 'border-stone-200 focus:border-terracotta-500'}`} placeholder="e.g. 400001" />
                                            </div>
                                        </>
                                    )}

                                    {isPincodeValid && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Street Address</label>
                                            <input required name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" placeholder="Enter Full Street Address" />
                                        </div>
                                    )}
                                </div>
                                {isPincodeValid && formData.address && formData.address.trim().length > 0 ? (
                                    <button type="submit" className="w-full bg-terracotta-600 text-white py-3 rounded-md font-medium hover:bg-terracotta-700 transition-colors">
                                        Continue to Payment
                                    </button>
                                ) : (
                                    <div className="w-full bg-stone-100 text-stone-400 py-3 rounded-md font-medium text-center cursor-not-allowed mt-6 border border-stone-200">
                                        {!isPincodeValid ? 'Verify Pincode to Continue' : 'Enter Street Address to Continue'}
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center"><CreditCard className="mr-2" size={20} /> Payment Method</h2>
                            <div className="space-y-4">
                                <div onClick={() => setPaymentMethod('card')} className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-terracotta-500 bg-terracotta-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                                    <input type="radio" readOnly checked={paymentMethod === 'card'} className="h-4 w-4 text-terracotta-600 focus:ring-terracotta-500" />
                                    <span className="ml-3 font-medium text-stone-900">Credit / Debit Card</span>
                                </div>
                                <div onClick={() => setPaymentMethod('upi')} className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'upi' ? 'border-terracotta-500 bg-terracotta-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                                    <input type="radio" readOnly checked={paymentMethod === 'upi'} className="h-4 w-4 text-terracotta-600 focus:ring-terracotta-500" />
                                    <span className="ml-3 font-medium text-stone-900">UPI / Net Banking</span>
                                </div>
                                <div onClick={() => setPaymentMethod('cod')} className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-terracotta-500 bg-terracotta-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                                    <input type="radio" readOnly checked={paymentMethod === 'cod'} className="h-4 w-4 text-terracotta-600 focus:ring-terracotta-500" />
                                    <span className="ml-3 font-medium text-stone-900">Cash on Delivery</span>
                                </div>
                            </div>
                            
                            {paymentMethod === 'cod' ? (
                                <button onClick={() => handlePayment('cod', 'pending')} disabled={isProcessing} className="mt-8 w-full bg-terracotta-600 text-white py-3 rounded-md font-medium hover:bg-terracotta-700 transition-colors disabled:opacity-50">
                                    {isProcessing ? 'Processing...' : 'Pay after delivery'}
                                </button>
                            ) : (
                                <button onClick={() => setStep(2.5)} className="mt-8 w-full bg-terracotta-600 text-white py-3 rounded-md font-medium hover:bg-terracotta-700 transition-colors">
                                    Proceed to Payment Details
                                </button>
                            )}

                            <button onClick={() => setStep(1)} className="mt-4 w-full text-stone-500 text-sm hover:underline">
                                Back to Shipping
                            </button>
                        </div>
                    )}

                    {step === 2.5 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center"><CreditCard className="mr-2" size={20} /> Enter Details</h2>
                            {paymentMethod === 'card' && (
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">Card Number</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Expiry Date</label>
                                            <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">CVV</label>
                                            <input type="text" placeholder="123" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {paymentMethod === 'upi' && (
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">UPI ID</label>
                                        <input type="text" placeholder="username@bank" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-terracotta-500 focus:outline-none" />
                                    </div>
                                </div>
                            )}

                            <button onClick={() => handlePayment(paymentMethod, 'paid')} disabled={isProcessing} className="mt-2 w-full bg-terracotta-600 text-white py-3 rounded-md font-medium hover:bg-terracotta-700 transition-colors disabled:opacity-50">
                                {isProcessing ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                            </button>
                            <button onClick={() => setStep(2)} className="mt-4 w-full text-stone-500 text-sm hover:underline">
                                Back to Payment Methods
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 sticky top-24">
                        <h3 className="font-bold text-lg text-stone-800 mb-4">Order Summary</h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className={`w-16 h-16 rounded shrink-0 flex items-center justify-center ${(() => {
                                        const colors = [
                                            'bg-red-100 text-red-700',
                                            'bg-blue-100 text-blue-700',
                                            'bg-green-100 text-green-700',
                                            'bg-amber-100 text-amber-700',
                                            'bg-purple-100 text-purple-700',
                                            'bg-pink-100 text-pink-700',
                                            'bg-teal-100 text-teal-700',
                                            'bg-indigo-100 text-indigo-700'
                                        ];
                                        return colors[(item.id || 0) % colors.length];
                                    })()}`}>
                                        <span className="font-display font-bold text-lg opacity-90 tracking-tighter">
                                            {item.name
                                                .split(' ')
                                                .map(word => word[0])
                                                .join('')
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-stone-800 line-clamp-2">{item.name}</p>
                                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                        <p className="text-sm font-medium text-terracotta-700">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-stone-200 my-4 pt-4 space-y-2">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount (10%)</span>
                                    <span>-₹{discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-stone-800 font-bold text-lg pt-2 border-t border-stone-200">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="text-xs text-stone-500 flex items-center justify-center mt-4">
                            <ShieldCheck size={14} className="mr-1" /> Secure SSL Encryption
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
