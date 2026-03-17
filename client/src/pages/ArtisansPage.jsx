import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, MapPin, Search } from 'lucide-react';
import { API_URL } from '../config';

const ArtisansPage = () => {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchArtisans = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter for only seller accounts
                    const sellers = data.filter(u => u.role === 'seller');
                    setArtisans(sellers);
                }
            } catch (error) {
                console.error("Failed to fetch artisans:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtisans();
    }, []);

    const filteredArtisans = artisans.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.addresses && a.addresses[0] && a.addresses[0].city && a.addresses[0].city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const getPlaceholderColor = (index) => {
        const colors = [
            'bg-amber-100/50 text-amber-700 border-amber-200',
            'bg-stone-200/50 text-stone-700 border-stone-300',
            'bg-terracotta-100/30 text-terracotta-800 border-terracotta-200',
            'bg-green-100/40 text-green-800 border-green-200',
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-terracotta-200 border-t-terracotta-600 rounded-full animate-spin"></div>
                    <p className="text-stone-500 font-serif italic">Finding our weavers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 bg-noise">
            {/* Header */}
            <div className="bg-white border-b border-stone-100 py-20 px-4 relative overflow-hidden text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 font-display text-[16rem] leading-none pointer-events-none text-terracotta-600 whitespace-nowrap">
                    Our Makers
                </div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <Leaf className="mx-auto text-terracotta-400 mb-6" size={40} />
                    <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-900 mb-6">The Hands Behind the Loom</h1>
                    <p className="text-stone-600 text-lg font-serif italic leading-relaxed">
                        Meet the master artisans preserving centuries of Indian textile heritage. Every weaver has a story, every piece is a prayer.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* Search Bar */}
                <div className="max-w-md mx-auto mb-16 relative">
                    <input
                        type="text"
                        placeholder="Search artisans by name or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-full text-stone-700 focus:outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200/50 shadow-sm transition-all"
                    />
                    <Search size={20} className="absolute left-5 top-4 text-stone-400" />
                </div>

                {filteredArtisans.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredArtisans.map((artisan, index) => {
                            const initials = artisan.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                            const shopName = `${artisan.name.split(' ')[0]}'s Studio`;
                            const city = artisan.addresses?.[0]?.city || 'India';
                            
                            return (
                                <motion.div key={artisan._id} variants={itemVariants} className="group relative">
                                    <Link to={`/artisan/${artisan._id}`} className="block h-full">
                                        <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                                            
                                            {/* Decorative Background Element */}
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-stone-50 rounded-full mix-blend-multiply transition-transform group-hover:scale-150 duration-700 ease-out"></div>
                                            
                                            <div className="flex items-start gap-6 relative z-10 mb-8">
                                                <div className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center border-2 ${getPlaceholderColor(index)} shadow-inner`}>
                                                    <span className="font-display font-bold text-3xl opacity-80">{initials}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-display text-2xl font-bold text-stone-900 group-hover:text-terracotta-700 transition-colors mb-2">
                                                        {shopName}
                                                    </h3>
                                                    <p className="text-stone-500 text-sm font-medium mb-2">{artisan.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                                                        <MapPin size={12} className="text-terracotta-400" /> {city}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-stone-600 font-serif italic text-sm mb-8 flex-1 line-clamp-3">
                                                "Specializing in authentic handwoven textiles sourced directly from the heart of {city}. Discover the collections curated and crafted by {artisan.name}."
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between text-sm font-bold text-stone-900 group-hover:text-terracotta-600 transition-colors">
                                                <span>Explore Collection</span>
                                                <span className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-terracotta-50 transition-colors">
                                                    →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <Leaf className="mx-auto text-stone-300 mb-6" size={48} />
                        <h3 className="font-display text-2xl font-bold text-stone-800 mb-2">No artisans found</h3>
                        <p className="text-stone-500 font-serif italic">Try adjusting your search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtisansPage;
