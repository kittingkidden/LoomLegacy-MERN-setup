/* eslint-disable react-refresh/only-export-components */
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
            // Retrieve current storage based on user state
            const storedCart = localStorage.getItem(cartKey);
            let parsedCart = storedCart ? JSON.parse(storedCart) : [];

            // MERGE LOGIC: If a user just logged in (cartKey is not guest)
            // We check the guest cart for pending items to merge into their permanent cart
            if (user?.id) {
                const guestCartStr = localStorage.getItem('loom_cart_guest');
                if (guestCartStr && guestCartStr !== '[]') {
                    const guestCart = JSON.parse(guestCartStr);
                    
                    // Merge guest cart into parsed user cart securely
                    guestCart.forEach(guestItem => {
                        const existingIdx = parsedCart.findIndex(item => item.id === guestItem.id);
                        if (existingIdx >= 0) {
                            parsedCart[existingIdx].quantity += guestItem.quantity;
                        } else {
                            parsedCart.push(guestItem);
                        }
                    });

                    // Update storage with merged cart so effect captures it
                    localStorage.setItem(cartKey, JSON.stringify(parsedCart));
                    // Clear the guest cart so it doesn't re-merge on next refresh
                    localStorage.setItem('loom_cart_guest', '[]');
                }
            }

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCartItems(parsedCart);
        } catch (error) {
            console.error("Error parsing/merging cart from localStorage:", error);
            setCartItems([]);
        }
    }, [cartKey, user?.id]);

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
            const currentQty = existing ? existing.quantity : 0;
            const availableStock = product.stock !== undefined ? product.stock : 999;

            if (currentQty >= availableStock) {
                alert(`Sorry, only ${availableStock} items available in stock.`);
                return prev;
            }

            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    /**
     * Updates the quantity of an item in the cart.
     * @param {string} id - Product ID.
     * @param {number} newQuantity - Desired quantity.
     */
    const updateQuantity = (id, newQuantity) => {
        setCartItems(prev => {
            const item = prev.find(item => item.id === id);
            if (!item) return prev;

            // Ensure quantity is at least 1
            const qty = Math.max(1, newQuantity);
            
            // Check against stock
            const availableStock = item.stock !== undefined ? item.stock : 999;
            if (qty > availableStock) {
                alert(`Sorry, only ${availableStock} items available in stock.`);
                return prev.map(i => i.id === id ? { ...i, quantity: availableStock } : i);
            }

            return prev.map(i => i.id === id ? { ...i, quantity: qty } : i);
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

    const isGuest = !user;

    const value = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isPrepaid,
        setIsPrepaid,
        subtotal,
        discount,
        total,
        isGuest,
        count: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
