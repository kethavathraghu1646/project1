import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, AlertTriangle, MapPin } from 'lucide-react';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        setUser(savedUser);

        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const endpoint = `buyer/${savedUser?._id || savedUser?.id}`;
                const res = await axios.get(`http://localhost:8080/api/orders/${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusStep = (status) => {
        const steps = ['Pending Admin Approval', 'Order Approved', 'In Transit', 'Delivered'];
        return steps.indexOf(status);
    };

    const handleRaiseDispute = async (orderId) => {
        const reason = prompt("Enter reason for dispute:");
        if (!reason) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/orders/${orderId}/dispute`, { reason }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Dispute raised. Admin will review it.");
            window.location.reload();
        } catch (err) {
            alert("Failed to raise dispute");
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '50px' }}>Loading orders...</div>;

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>{user?.role === 'buyer' ? 'My Bulk Orders' : 'My Purchases'}</h2>
                <div style={{ padding: '8px 15px', backgroundColor: '#f0fff4', borderRadius: '20px', color: 'var(--primary-green)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {orders.length} Total Requests
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <Package size={64} color="#eee" style={{ marginBottom: '20px' }} />
                    <h3>No bulk orders found</h3>
                    <p style={{ color: '#888' }}>Browse the marketplace to start sending purchase requests to farmers.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {orders.map(order => (
                        <div key={order.id || order._id} className="card" style={{ borderLeft: order.dispute?.isRaised ? '5px solid #e74c3c' : '5px solid var(--primary-green)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <h4 style={{ marginBottom: '5px' }}>Order #{(order.id || order._id || '').slice(-6)}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>
                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                                        backgroundColor: order.status === 'Delivered' ? '#e6fffa' : '#fffaf0',
                                        color: order.status === 'Delivered' ? '#2c7a7b' : '#b7791f'
                                    }}>
                                        {order.status}
                                    </span>
                                    {order.dispute?.isRaised && (
                                        <div style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                                            <AlertTriangle size={14} /> Dispute: {order.dispute.status}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '30px', padding: '0 20px' }}>
                                <div style={{ position: 'absolute', top: '10px', left: '40px', right: '40px', height: '2px', backgroundColor: '#eee', zIndex: 0 }}></div>
                                {['Pending Admin Approval', 'Order Approved', 'In Transit', 'Delivered'].map((step, idx) => {
                                    const active = getStatusStep(order.status) >= idx;
                                    return (
                                        <div key={step} style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 8px',
                                                backgroundColor: active ? 'var(--primary-green)' : 'white',
                                                border: `2px solid ${active ? 'var(--primary-green)' : '#eee'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                            }}>
                                                {active && <CheckCircle size={14} />}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: active ? 'bold' : 'normal', color: active ? '#333' : '#999' }}>{step}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                                <div>
                                    <h5 style={{ marginBottom: '10px' }}>Items</h5>
                                    {order.products.map((p, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span>{p.name} (x{p.quantity})</span>
                                            <span>₹{p.price * p.quantity}</span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Total</span>
                                        <span>₹{order.totalAmount}</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <h5 style={{ marginBottom: '10px' }}>Delivery Details</h5>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} /> {order.deliveryDetails?.address || 'N/A'}</p>
                                    {order.transportDetails?.vehicleNumber && (
                                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #eee' }}>
                                            <p style={{ fontWeight: 'bold' }}>Transport Info</p>
                                            <p>Vehicle: {order.transportDetails.vehicleNumber}</p>
                                            <p>Driver: {order.transportDetails.driverName} ({order.transportDetails.driverPhone})</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => navigate(`/order-confirmation/${order._id || order.id}`)} className="btn-primary" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Truck size={18} /> Trace Order
                                </button>
                                <button className="btn-secondary" style={{ padding: '8px 15px' }}>Contact Support</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
