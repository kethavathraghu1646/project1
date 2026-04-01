import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ShoppingBag, MapPin, Calendar, IndianRupee, X, Locate } from 'lucide-react';

const BuyerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        location: '',
        minPrice: '',
        maxPrice: '',
        minQuantity: '',
    });

    const categories = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Spices'];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await axios.get(`http://localhost:8080/api/products?${query}`);
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || data.address.state || "Current Location";
                setFilters(prev => ({ ...prev, location: city }));
            } catch (err) {
                console.error("Error fetching location data:", err);
                setFilters(prev => ({ ...prev, location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
            }
        }, (error) => {
            console.error("Error getting location:", error);
            alert("Unable to retrieve position. Please check your browser permissions.");
        });
    };

    const handlePlaceRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            const orderData = {
                farmerId: selectedProduct.farmerId,
                products: [{
                    productId: selectedProduct._id,
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    quantity: Number(orderQuantity)
                }],
                totalAmount: selectedProduct.price * Number(orderQuantity),
                paymentMode: 'On Delivery',
                deliveryDetails: {
                    address: user.address,
                    phone: user.phone
                }
            };

            await axios.post('http://localhost:8080/api/orders', orderData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert("Purchase request sent to farmer! You can track it in 'My Orders'.");
            setSelectedProduct(null);
            setOrderQuantity('');
        } catch (err) {
            alert("Failed to send request: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2>Bulk Crop Marketplace</h2>
                    <p style={{ color: '#666' }}>Connect directly with farmers for large-scale procurement</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={20} />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search crops..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            style={{ paddingLeft: '40px', marginBottom: 0 }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
                {/* Filters Sidebar */}
                <div className="card" style={{ height: 'fit-content', padding: '20px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Filter size={20} /> Filters
                    </h4>

                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Location</label>
                            <button 
                                type="button" 
                                onClick={handleGetCurrentLocation} 
                                title="Get Current Location"
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    color: 'var(--primary-green)',
                                    display: 'flex',
                                    padding: '0 0 5px 0'
                                }}
                            >
                                <Locate size={16} />
                            </button>
                        </div>
                        <input type="text" name="location" placeholder="City/Region" value={filters.location} onChange={handleFilterChange} />
                    </div>

                    <div className="form-group">
                        <label>Price Range (₹)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} />
                            <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Min Quantity</label>
                        <input type="number" name="minQuantity" placeholder="e.g. 100" value={filters.minQuantity} onChange={handleFilterChange} />
                    </div>

                    <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setFilters({ search: '', category: '', location: '', minPrice: '', maxPrice: '', minQuantity: '' })}>
                        Clear All
                    </button>
                </div>

                {/* Products Grid */}
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>Loading available crops...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {products.length > 0 ? products.map(product => (
                                <div key={product._id} className="card product-card" style={{ padding: 0, overflow: 'hidden', opacity: product.quantity === 0 ? 0.7 : 1 }}>
                                    <div style={{ height: '180px', position: 'relative' }}>
                                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: product.quantity === 0 ? '#e74c3c' : 'var(--primary-green)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                                            {product.quantity === 0 ? 'Sold Out' : product.category}
                                        </div>
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ marginBottom: '10px' }}>{product.name}</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <IndianRupee size={16} /> <strong>{product.price}</strong> / {product.unit}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: product.quantity === 0 ? '#e74c3c' : 'inherit' }}>
                                                <ShoppingBag size={16} /> {product.quantity > 0 ? `${product.quantity} ${product.unit}` : 'Out of Stock'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <MapPin size={16} /> {product.location || 'Local'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Calendar size={16} /> {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '20px', height: '40px', overflow: 'hidden' }}>{product.description}</p>

                                        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem' }}>by <strong>{product.farmerName}</strong></span>
                                            <button
                                                onClick={() => setSelectedProduct(product)}
                                                className="btn-primary"
                                                style={{ padding: '8px 15px', fontSize: '0.9rem', opacity: product.quantity === 0 ? 0.5 : 1, cursor: product.quantity === 0 ? 'not-allowed' : 'pointer' }}
                                                disabled={product.quantity === 0}
                                            >
                                                {product.quantity === 0 ? 'Unavailable' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                                    <p>No crops matching your criteria found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Modal */}
            {selectedProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Purchase Request</h3>
                            <button onClick={() => setSelectedProduct(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        <p style={{ marginBottom: '15px' }}>Requesting <strong>{selectedProduct.name}</strong> from {selectedProduct.farmerName}</p>
                        <form onSubmit={handlePlaceRequest}>
                            <div className="form-group">
                                <label>Required Quantity ({selectedProduct.unit})</label>
                                <input
                                    type="number"
                                    value={orderQuantity}
                                    placeholder={`e.g. 50 (Max: ${selectedProduct.quantity})`}
                                    onChange={(e) => setOrderQuantity(e.target.value)}
                                    max={selectedProduct.quantity}
                                    required
                                />
                            </div>
                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0fff4', borderRadius: '8px' }}>
                                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Expected Price:</span>
                                    <strong>₹{selectedProduct.price} / {selectedProduct.unit}</strong>
                                </p>
                                <p style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '1.1rem' }}>
                                    <span>Total Value:</span>
                                    <strong style={{ color: 'var(--primary-green)' }}>₹{selectedProduct.price * (Number(orderQuantity) || 0)}</strong>
                                </p>
                            </div>
                            <button type="submit" disabled={submitting || !orderQuantity} className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                                {submitting ? 'Sending Request...' : 'Send Bulk Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerDashboard;
