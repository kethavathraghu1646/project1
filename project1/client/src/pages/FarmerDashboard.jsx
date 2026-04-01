import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, MessageSquare, CheckCircle, XCircle, Clock, Plus, Upload, Camera, X, ShoppingBag } from 'lucide-react';

const FarmerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'purchases'
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        accepted: 0,
        delivered: 0
    });
    
    // Order Detail Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // Add Product Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        category: 'Grains',
        description: '',
        unit: 'kg',
        location: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const categories = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Spices'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?._id || user?.id;

            // Fetch Sales (Orders where I am the farmer)
            const salesRes = await axios.get(`http://localhost:8080/api/orders/farmer/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(salesRes.data);

            // Fetch My Purchases (Orders where I am the buyer)
            const purchasesRes = await axios.get(`http://localhost:8080/api/orders/buyer/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMyPurchases(purchasesRes.data);

            // Calculate Stats for Sales
            const pending = salesRes.data.filter(o => o.status === 'Pending Admin Approval').length;
            const accepted = salesRes.data.filter(o => ['Order Approved', 'In Transit'].includes(o.status)).length;
            const delivered = salesRes.data.filter(o => o.status === 'Delivered').length;
            setStats({ pending, accepted, delivered });
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert(`Order ${newStatus} successfully!`);
            fetchData();
        } catch (err) {
            alert("Failed to update status: " + err.message);
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const compressedBase64 = await compressImage(file);
            setImagePreview(compressedBase64);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!imagePreview) return alert("Please upload an image of the crop");
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            const productData = {
                ...formData,
                image: imagePreview,
                farmerName: user.name,
                location: formData.location || user.address || 'Local'
            };
            await axios.post('http://localhost:8080/api/products', productData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Crop listed successfully!");
            setShowAddModal(false);
            setFormData({ name: '', price: '', quantity: '', category: 'Grains', description: '', unit: 'kg', location: '' });
            setImagePreview(null);
            fetchData();
        } catch (err) {
            alert("Failed to list crop: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Admin Approval': return '#f39c12';
            case 'Order Approved': return '#27ae60';
            case 'In Transit': return '#3498db';
            case 'Delivered': return '#2ecc71';
            case 'Rejected': return '#e74c3c';
            default: return '#7f8c8d';
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>Farmer Dashboard</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                        onClick={() => setActiveTab('purchases')} 
                        className="btn-secondary" 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            backgroundColor: activeTab === 'purchases' ? 'var(--primary-green)' : '#fff',
                            color: activeTab === 'purchases' ? '#fff' : '#333'
                        }}
                    >
                        <Clock size={18} /> My Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('sales')} 
                        className="btn-secondary" 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: activeTab === 'sales' ? 'var(--primary-green)' : '#fff',
                            color: activeTab === 'sales' ? '#fff' : '#333'
                        }}
                    >
                        <ShoppingBag size={18} /> My Sales
                    </button>
                    <button onClick={() => window.location.href='/agri-shop'} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Fertilizers & Seeds
                    </button>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={20} /> List New Crop
                    </button>
                </div>
            </div>

            {/* Stats Overview (Shows for Sales tab) */}
            {activeTab === 'sales' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    <div className="card" style={{ textAlign: 'center', borderLeft: '5px solid #f39c12' }}>
                        <h1 style={{ color: '#f39c12' }}>{stats.pending}</h1>
                        <p>New Requests</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', borderLeft: '5px solid #3498db' }}>
                        <h1 style={{ color: '#3498db' }}>{stats.accepted}</h1>
                        <p>Active Orders</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', borderLeft: '5px solid #2ecc71' }}>
                        <h1 style={{ color: '#2ecc71' }}>{stats.delivered}</h1>
                        <p>Completed Sales</p>
                    </div>
                </div>
            )}

            <div className="card">
                <h3>{activeTab === 'sales' ? 'Recent Incoming Requests (Sales)' : 'My Placed Orders (Purchases)'}</h3>
                <div style={{ marginTop: '20px' }}>
                    {loading ? (
                        <p>Loading dashboard...</p>
                    ) : (activeTab === 'sales' ? orders : myPurchases).length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f9f9f9' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Order ID</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>{activeTab === 'sales' ? 'Buyer Info' : 'Crop/Item'}</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Quantity</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Total Amount</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'sales' ? orders : myPurchases).map(order => (
                                        <tr key={order.id || order._id} style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: '15px' }}>#{(order.id || order._id || '').slice(-6)}</td>
                                            <td style={{ padding: '15px' }}>
                                                {activeTab === 'sales' ? (
                                                    <span><strong>{order.buyerName || 'Buyer'}</strong></span>
                                                ) : (
                                                    <span>{order.products.map(p => p.name).join(', ')}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                {order.products.reduce((sum, p) => sum + p.quantity, 0)} units
                                            </td>
                                            <td style={{ padding: '15px' }}>₹{order.totalAmount}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                    backgroundColor: getStatusColor(order.status) + '22',
                                                    color: getStatusColor(order.status),
                                                    fontWeight: 'bold'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                                {activeTab === 'sales' ? (
                                                    <>
                                                        {order.status === 'Pending Admin Approval' && (
                                                            <span style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>Awaiting Admin Approval</span>
                                                        )}
                                                        {order.status === 'Order Approved' && (
                                                            <button onClick={() => handleStatusUpdate(order.id || order._id, 'In Transit')} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#3498db', color: 'white', border: 'none' }}>
                                                                Mark Shipped
                                                            </button>
                                                        )}
                                                        {order.status === 'In Transit' && (
                                                            <button onClick={() => handleStatusUpdate(order.id || order._id, 'Delivered')} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem', backgroundColor: '#2ecc71', color: 'white', border: 'none' }}>
                                                                Mark Delivered
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button onClick={() => window.location.href=`/order-confirmation/${order.id || order._id}`} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Trace Order</button>
                                                )}
                                                <button onClick={() => setSelectedOrder(order)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            {activeTab === 'sales' ? 'No incoming requests yet.' : 'You haven\'t placed any orders yet.'}
                        </p>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '30px', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0 }}>List New Crop for Sale</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        <form onSubmit={handleAddProduct}>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label>Crop Photo (Camera or Gallery)</label>
                                <div onClick={() => document.getElementById('crop-image').click()} style={{ border: '2px dashed #ddd', borderRadius: '12px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', backgroundColor: '#fafafa' }}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                                <Camera size={40} color="#888" />
                                                <Upload size={40} color="#888" />
                                            </div>
                                            <p style={{ color: '#888' }}>Tap to capture or upload</p>
                                        </>
                                    )}
                                    <input id="crop-image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Crop Name</label>
                                <input type="text" required placeholder="e.g. Organic Basmati Rice" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                                    {categories.map(cat => (
                                        <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} style={{ padding: '8px 16px', borderRadius: '20px', border: formData.category === cat ? '2px solid var(--primary-green)' : '1px solid #ddd', backgroundColor: formData.category === cat ? '#f0fdf4' : '#fff', color: formData.category === cat ? 'var(--primary-green)' : '#666', cursor: 'pointer', fontWeight: '600' }}>{cat}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Price (₹) per {formData.unit}</label>
                                    <input type="number" required placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Available Quantity ({formData.unit})</label>
                                    <input type="number" required placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Unit of Measurement</label>
                                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                    <option value="kg">kilogram (kg)</option>
                                    <option value="quintal">quintal (100kg)</option>
                                    <option value="ton">ton (1000kg)</option>
                                    <option value="liter">liter (L)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description & Quality Details</label>
                                <textarea required placeholder="Describe the crop, variety, and quality..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: '100px' }} />
                            </div>
                            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '15px' }}>{submitting ? 'Listing Product...' : 'Confirm & List Crop'}</button>
                        </form>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '30px', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Order Details</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <p><strong>Order ID:</strong> #{selectedOrder.id || selectedOrder._id}</p>
                            <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedOrder.status), fontWeight: 'bold' }}>{selectedOrder.status}</span></p>
                            <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
                        </div>

                        <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                {activeTab === 'sales' ? 'Buyer Information' : 'Farmer Information'}
                            </h4>
                            {activeTab === 'sales' ? (
                                <>
                                    <p style={{ margin: '5px 0' }}><strong>Name:</strong> {selectedOrder.buyerName || 'N/A'}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Address:</strong> {selectedOrder.deliveryDetails?.address || 'N/A'}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {selectedOrder.deliveryDetails?.phone || 'N/A'}</p>
                                </>
                            ) : (
                                <>
                                    <p style={{ margin: '5px 0' }}><strong>Farmer:</strong> {selectedOrder.farmerName || 'N/A'}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Status:</strong> {selectedOrder.status}</p>
                                </>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ marginBottom: '10px' }}>Products</h4>
                            {selectedOrder.products.map((p, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                                    <span>{p.name} (x{p.quantity})</span>
                                    <span>₹{p.price * p.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => alert("Chat feature coming soon!")}>
                                <MessageSquare size={18} /> Message {activeTab === 'sales' ? 'Buyer' : 'Farmer'}
                            </button>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedOrder(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
