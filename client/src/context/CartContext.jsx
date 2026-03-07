import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create the Cart Context
const CartContext = createContext();

/**
 * Custom hook to access the Cart Context.
 * @returns {Object} Cart context values (cartItems, addToCart, etc.)
 */
export const useCart = () => useContext(CartContext);

/**
 * CartProvider Component
 * Manages the global state for the shopping cart, including:
 * - Adding/Removing items
 * - Calculating subtotals and totals
 * - Applying the 10% Prepaid Discount logic
 */
export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const cartKey = user?.id ? `loom_cart_${user.id}` : 'loom_cart_guest';

    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedCart = localStorage.getItem(cartKey);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
            return [];
        }
    });
    const [isPrepaid, setIsPrepaid] = useState(false); // Toggle for discount check

    // Refresh cart when user context switches (login/logout)
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem(cartKey);
            setCartItems(storedCart ? JSON.parse(storedCart) : []);
        } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
            setCartItems([]);
        }
    }, [cartKey]);

    // Save cart to local storage under the current user's distinct key
    useEffect(() => {
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }, [cartItems, cartKey]);

    /**
     * Adds a product to the cart.
     * If item exists, increments quantity.
     * @param {Object} product - The product object to add.
     */
    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // Remove item
    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = isPrepaid ? subtotal * 0.10 : 0;
    const total = subtotal - discount;

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isPrepaid,
        setIsPrepaid,
        subtotal,
        discount,
        total,
        count: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
