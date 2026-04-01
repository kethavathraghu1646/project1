import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Plus, X, List, Search, Filter, CheckCircle, Package, IndianRupee, MapPin, Calendar, Camera } from 'lucide-react';

const Products = ({ user: propUser }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [myListingsOnly, setMyListingsOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();

    // Use propUser if available, otherwise fallback to localStorage
    const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem('user')));
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    // Handle initial view state and query param changes
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('view') === 'my-listings') {
            setMyListingsOnly(true);
        } else {
            setMyListingsOnly(false);
        }
    }, [location.search]);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        quantity: '',
        unit: 'kg',
        description: '',
        image: '',
        harvestDate: '',
        location: ''
    });

    const categories = ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Spices'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Fetch from the base /api/products endpoint (handles both public and private needs)
            const res = await axios.get('http://localhost:8080/api/products/public/all');

            let fetchedProducts = res.data;

            // Fallback to sample crops if database is empty to show how it looks
            if (!fetchedProducts || fetchedProducts.length === 0) {
                fetchedProducts = [
                    {
                        _id: 'sample1',
                        name: 'Organic Basmati Rice',
                        category: 'Grains',
                        price: 85,
                        quantity: 1500,
                        unit: 'kg',
                        description: 'Aromatic, long-grain basmati rice grown organically without synthetic pesticides.',
                        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop',
                        harvestDate: '2025-10-15',
                        farmerId: user?.role === 'farmer' ? (user?._id || user?.id) : 'farmer123',
                        farmerName: 'Ramesh Singh',
                        location: 'Punjab'
                    },
                    {
                        _id: 'sample2',
                        name: 'Fresh Red Tomatoes',
                        category: 'Vegetables',
                        price: 40,
                        quantity: 300,
                        unit: 'kg',
                        description: 'Farm-fresh, juicy red tomatoes perfect for commercial kitchens and retail.',
                        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop',
                        harvestDate: '2026-03-20',
                        farmerId: 'farmer456',
                        farmerName: 'Suresh Kumar',
                        location: 'Nashik'
                    },
                    {
                        _id: 'sample3',
                        name: 'Alphonso Mangoes',
                        category: 'Fruits',
                        price: 150,
                        quantity: 50,
                        unit: 'kg',
                        description: 'Premium quality Alphonso mangoes, naturally ripened and hand-picked.',
                        image: 'https://images.unsplash.com/photo-1553284965-83fd3e1a0655?q=80&w=800&auto=format&fit=crop',
                        harvestDate: '2026-05-01',
                        farmerId: 'farmer789',
                        farmerName: 'Priya Patel',
                        location: 'Ratnagiri'
                    },
                    {
                        _id: 'sample4',
                        name: 'Fresh Red Apples',
                        category: 'Fruits',
                        price: 120,
                        quantity: 200,
                        unit: 'kg',
                        description: 'Crispy and sweet red apples from Kashmiri orchards. Naturally grown.',
                        image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=800&auto=format&fit=crop',
                        harvestDate: '2026-04-10',
                        farmerId: 'farmer999',
                        farmerName: 'Abid Hussain',
                        location: 'Kashmir'
                    }
                ];
            }

            setProducts(fetchedProducts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // If the propeller user changes, update our local user state
        if (propUser) setUser(propUser);
    }, [propUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'image') setImagePreview(e.target.value);
    };

    const handleImageFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
        setFormData(prev => ({ ...prev, image: objectUrl }));
    };

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item._id === product._id || item.id === product.id);
        let newCart;
        if (existingItem) {
            newCart = cart.map(item => (item._id === product._id || item.id === product.id) ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
            newCart = [...cart, { ...product, quantity: 1 }];
        }
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${product.name} added to cart!`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editProduct) {
                await axios.put(`http://localhost:8080/api/products/${editProduct._id || editProduct.id}`,
                    {
                        price: formData.price,
                        quantity: formData.quantity,
                        description: formData.description
                    },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                alert("Product updated successfully!");
            } else {
                await axios.post('http://localhost:8080/api/products',
                    { 
                        ...formData, 
                        farmerId: user?._id || user?.id, 
                        farmerName: user?.name,
                        harvestDate: formData.harvestDate ? formData.harvestDate : null
                    },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                alert("Crop listing created successfully!");
            }
            setShowForm(false);
            setEditProduct(null);
            fetchData();
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            unit: product.unit,
            description: product.description,
            image: product.image,
            harvestDate: product.harvestDate?.split('T')[0],
            location: product.location || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Listing deleted successfully");
            fetchData();
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    };

    // Advanced Filtering Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMyListings = !myListingsOnly || product.farmerId === (user?._id || user?.id);
        
        return matchesSearch && matchesMyListings;
    });

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: 'var(--primary-green)', marginBottom: '10px' }}>
                        {myListingsOnly ? 'My Crop Listings' : 'Global Marketplace'}
                    </h1>
                    <p style={{ color: '#666' }}>
                        {myListingsOnly 
                            ? 'Manage your bulk offerings for buyers' 
                            : 'Direct from local farmers across the region'}
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    {user?.role === 'farmer' && (
                        <>
                            <button 
                                className={myListingsOnly ? "btn-primary" : "btn-secondary"}
                                onClick={() => setMyListingsOnly(!myListingsOnly)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <List size={20} /> {myListingsOnly ? 'Show All Products' : 'My Listings'}
                            </button>
                            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                                {showForm ? <X size={20} /> : <Plus size={20} />}
                                {showForm ? ' Cancel' : ' List New Crop'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Navigation & Search Bar */}
            <div className="card" style={{ marginBottom: '30px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search crops, varieties, or details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px', marginBottom: 0, width: '100%' }}
                    />
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '40px', backgroundColor: '#f0fff4', border: '1px solid var(--primary-green)' }}>
                    <h3 style={{ borderBottom: '1px solid #dcfce7', paddingBottom: '15px', marginBottom: '20px' }}>
                        {editProduct ? `Update ${editProduct.name}` : 'Add New Bulk Listing'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            {!editProduct && (
                                <>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Crop Name</label>
                                        <input type="text" name="name" value={formData.name} placeholder="e.g. Organic Basmati Rice" onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} required>
                                            <option value="">Select Category</option>
                                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="form-group">
                                <label>Price per Unit (₹)</label>
                                <input type="number" name="price" value={formData.price} placeholder="e.g. 80" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Available Quantity</label>
                                <input type="number" name="quantity" value={formData.quantity} placeholder="e.g. 500" onChange={handleChange} required />
                            </div>
                            {!editProduct && (
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select name="unit" value={formData.unit} onChange={handleChange}>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="quintal">Quintal (100kg)</option>
                                        <option value="ton">Ton (1000kg)</option>
                                        <option value="liters">Liters (L)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label>Description & Quality Specifications</label>
                            <textarea name="description" value={formData.description} placeholder="Mention variety, quality parameters, and shipping terms..." onChange={handleChange} style={{ width: '100%', height: '100px' }} required></textarea>
                        </div>

                        {!editProduct && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            placeholder="Paste photo link of the crop"
                                            onChange={handleChange}
                                            style={{ flex: 1, marginBottom: 0 }}
                                        />
                                        <button
                                            type="button"
                                            title="Take photo or upload image"
                                            onClick={() => fileInputRef.current.click()}
                                            style={{
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1.5px solid #2e7d32',
                                                backgroundColor: '#f0fff4',
                                                color: '#2e7d32',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Camera size={18} />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            style={{ display: 'none' }}
                                            onChange={handleImageFile}
                                        />
                                    </div>
                                    {imagePreview && (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                marginTop: '10px',
                                                width: '100%',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: '10px',
                                                border: '1px solid #e8f5e9'
                                            }}
                                            onError={() => setImagePreview('')}
                                        />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Harvest Date</label>
                                    <input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleChange} required />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Production Location</label>
                                    <input type="text" name="location" value={formData.location} placeholder="e.g. Karnal, Haryana" onChange={handleChange} required />
                                </div>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button type="submit" className="btn-primary" style={{ width: '200px' }}>
                                {editProduct ? 'Save Changes' : 'Publish Listing'}
                            </button>
                            <button type="button" onClick={() => {setShowForm(false); setEditProduct(null);}} className="btn-secondary" style={{ width: '150px' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading marketplace listings...</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                        {filteredProducts.length > 0 ? filteredProducts.map(product => (
                            <div key={product._id || product.id} className="card product-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                 {product.quantity === 0 && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold', transform: 'rotate(-15deg)' }}>SOLD OUT</div>
                                    </div>
                                )}
                                
                                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                        {product.category}
                                    </span>
                                </div>
                                
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{product.name}</h3>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{product.price}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>per {product.unit}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px', fontSize: '0.85rem', color: '#666' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} /> {product.quantity} units</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {product.location || 'Local'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} color="#10b981" /> Verified</div>
                                    </div>

                                    <p style={{ fontSize: '0.9rem', color: '#777', marginBottom: '20px', flex: 1 }}>{product.description}</p>
                                    
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Seller: <strong>{product.farmerName}</strong></span>
                                        
                                        {(user?.role === 'farmer' && (product.farmerId === (user?._id || user?.id))) ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleEdit(product)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</button>
                                                <button onClick={() => handleDelete(product._id || product.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fee2e2' }}>Delete</button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => addToCart(product)} 
                                                className="btn-primary" 
                                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                                disabled={product.quantity === 0}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '80px 0', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                                <ShoppingBag size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
                                <h3>No listings found</h3>
                                <p style={{ color: '#666' }}>Try adjusting your search filters or check back later.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Products;
