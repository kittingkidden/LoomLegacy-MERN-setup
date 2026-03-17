/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const ProductContext = createContext();

export const useProducts = () => {
    return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            const mappedData = data.map(item => ({
                ...item,
                id: item._id,
                price: Number(item.price) // Ensure price is a number
            }));

            if (mappedData.length > 0) {
                setProducts(mappedData);
            } else {
                console.warn("API returned empty array, using mock data.");
                setProducts(MOCK_PRODUCTS);
            }
            setError(null);
        } catch (err) {
            console.warn("API fetch failed, using mock data:", err);
            setProducts(MOCK_PRODUCTS);
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    // seeded
    const MOCK_PRODUCTS = [];

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSellerProducts = async (sellerId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/products/seller/${sellerId}`);
            if (!response.ok) throw new Error('Failed to fetch seller products');
            const data = await response.json();
            return data.map(item => ({ ...item, id: item._id, price: Number(item.price) }));
        } catch (err) {
            console.error("Error fetching seller products:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (newProductData) => {
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProductData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product');
            }

            const addedProduct = await response.json();
            const mappedProduct = { ...addedProduct, id: addedProduct._id, price: Number(addedProduct.price) };
            setProducts(prev => [mappedProduct, ...prev]);
            return true;
        } catch (err) {
            console.error("Error adding product:", err);
            setError(err.message);
            return false;
        }
    };

    const updateProduct = async (id, updatedData) => {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to update product');
            const data = await response.json();
            const mapped = { ...data, id: data._id, price: Number(data.price) };
            setProducts(prev => prev.map(p => (p.id === id || p._id === id) ? mapped : p));
            return true;
        } catch (err) {
            console.error("Error updating product:", err);
            return false;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete product');
            setProducts(prev => prev.filter(product => product.id !== id && product._id !== id));
            return true;
        } catch (err) {
            console.error("Error deleting product:", err);
            return false;
        }
    };

    const getProductById = (id) => {
        return products.find(p => String(p.id) === String(id) || String(p._id) === String(id));
    };

    const value = {
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        fetchSellerProducts
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
