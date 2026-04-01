import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingBag, Plus, X, List, Search, Filter, CheckCircle, Package, MapPin, Calendar, Edit, Trash2, Camera } from 'lucide-react';

const MyListings = ({ user: propUser }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    
    const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem('user')));

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
            const res = await axios.get('http://localhost:8080/api/products');
            // Filter only the current farmer's products
            const farmerId = user?._id || user?.id;
            const myProducts = res.data.filter(p => p.farmerId === farmerId);
            setProducts(myProducts);
        } catch (err) {
            console.error("Error fetching listings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

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
                        farmerName: user?.name || user?.username,
                        harvestDate: formData.harvestDate ? new Date(formData.harvestDate) : null
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
            harvestDate: product.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : '',
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

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: 'var(--primary-green)', marginBottom: '10px' }}>My Crop Listings</h1>
                    <p style={{ color: '#666' }}>Manage and monitor your active harvest offerings</p>
                </div>
                
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'Cancel' : 'List New Crop'}
                </button>
            </div>

            {/* Premium Filter Bar */}
            <div className="card" style={{ marginBottom: '30px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', borderRadius: '15px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search your listings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '12px 12px 12px 45px', marginBottom: 0, width: '100%', borderRadius: '10px', border: '1px solid #eee' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: selectedCategory === cat ? 'var(--primary-green)' : '#f8f9fa',
                                color: selectedCategory === cat ? 'white' : '#666',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '40px', padding: '30px', borderRadius: '20px', border: '2px solid #e8f5e9' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag className="text-primary-green" />
                        {editProduct ? `Update ${editProduct.name}` : 'Create New Listing'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
                            {!editProduct && (
                                <>
                                    <div className="form-group">
                                        <label>Crop Name</label>
                                        <input type="text" name="name" value={formData.name} placeholder="e.g. Premium Sona Masoori" onChange={handleChange} required />
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
                                <label>Price (₹) <small>per unit</small></label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                            </div>
                            {!editProduct && (
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select name="unit" value={formData.unit} onChange={handleChange}>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="quintal">Quintal</option>
                                        <option value="ton">Ton</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label>Product Description & Quality details</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} style={{ height: '100px' }} required></textarea>
                        </div>

                        {!editProduct && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '20px' }}>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            placeholder="Direct image link"
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
                                                gap: '6px',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
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
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" name="location" value={formData.location} placeholder="e.g. Belgaum, Karnataka" onChange={handleChange} required />
                                </div>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editProduct ? 'Save Changes' : 'Publish Listing'}</button>
                            <button type="button" onClick={() => {setShowForm(false); setEditProduct(null);}} className="btn-secondary" style={{ flex: 0.3 }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '15px', color: '#888' }}>Loading your inventory...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                    {filteredProducts.length > 0 ? filteredProducts.map(product => (
                        <div key={product._id || product.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.3s' }}>
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0 }}>{product.name}</h3>
                                    <span style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>₹{product.price}/{product.unit}</span>
                                </div>
                                
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Package size={16} /> Stock: {product.quantity} {product.unit}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><MapPin size={16} /> {product.location}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Harvested: {new Date(product.harvestDate).toLocaleDateString()}</div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', pt: '15px', borderTop: '1px solid #eee' }}>
                                    <button onClick={() => handleEdit(product)} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(product._id || product.id)} className="btn-secondary" style={{ flex: 1, color: '#ef4444', borderColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '100px 0', background: '#f9fafb', borderRadius: '20px' }}>
                            <List size={60} color="#d1d5db" style={{ marginBottom: '20px' }} />
                            <h2>No listings found</h2>
                            <p style={{ color: '#666' }}>You haven't listed any crops for sale yet.</p>
                            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowForm(true)}>Start Selling Today</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyListings;
