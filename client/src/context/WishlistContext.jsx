import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`http://localhost:5001/api/wishlist/user/${user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setWishlistItems(data.products || []);
                    }
                } catch (error) {
                    console.error("Error fetching wishlist:", error);
                }
            } else {
                setWishlistItems([]);
            }
        };
        fetchWishlist();
    }, [user]);

    const toggleWishlist = async (product) => {
        if (!user) {
            alert("Please login to wishlist items.");
            return false;
        }

        const productId = product._id || product.id;
        const isCurrentlyWishlisted = wishlistItems.some(item => (item._id === productId || item.id === productId));

        // Optimistic update
        if (isCurrentlyWishlisted) {
            setWishlistItems(prev => prev.filter(item => (item._id !== productId && item.id !== productId)));
        } else {
            setWishlistItems(prev => [...prev, product]);
        }

        try {
            const res = await fetch(`${API_URL}/api/wishlist/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId: productId })
            });
            if (!res.ok) {
                throw new Error("Failed to toggle API");
            }
            return !isCurrentlyWishlisted;
        } catch (error) {
            console.error("Error toggling wishlist via API:", error);
            // Revert optimistic update gracefully
            if (isCurrentlyWishlisted) {
                setWishlistItems(prev => [...prev, product]);
            } else {
                setWishlistItems(prev => prev.filter(item => (item._id !== productId && item.id !== productId)));
            }
            return isCurrentlyWishlisted;
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => (item._id === productId || item.id === productId));
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, setWishlistItems }}>
            {children}
        </WishlistContext.Provider>
    );
};
