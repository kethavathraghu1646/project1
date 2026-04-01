import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, Package, Truck, MapPin, ChevronLeft, RefreshCcw, ShieldCheck } from 'lucide-react';

const OrderConfirmation = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/orders/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setOrder(res.data);
        } catch (err) {
            console.error("Error fetching order details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // Polling for updates every 30 seconds if pending approval
        const interval = setInterval(() => {
            if (order?.status === 'Pending Admin Approval') {
                fetchOrder();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [id, order?.status]);

    const getStatusStep = (status) => {
        const steps = ['Pending Admin Approval', 'Order Approved', 'In Transit', 'Delivered'];
        return steps.indexOf(status);
    };

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '20px', color: '#666' }}>Fetching order details...</p>
        </div>
    );

    if (!order) return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h3>Order not found</h3>
            <button className="btn-primary" onClick={() => navigate('/my-orders')} style={{ marginTop: '20px' }}>
                Go to My Orders
            </button>
        </div>
    );

    const isPending = order.status === 'Pending Admin Approval';

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <button 
                onClick={() => navigate('/my-orders')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#666', marginBottom: '20px' }}
            >
                <ChevronLeft size={20} /> Back to My Orders
            </button>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                {isPending ? (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '40px', borderRadius: '16px', display: 'inline-block', maxWidth: '600px' }}>
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                            <Clock size={64} color="#f59e0b" className="spin-slow" />
                            <ShieldCheck size={28} color="#f59e0b" style={{ position: 'absolute', bottom: -5, right: -5, backgroundColor: 'white', borderRadius: '50%' }} />
                        </div>
                        <h2 style={{ color: '#92400e', marginBottom: '15px' }}>Waiting for Admin's Approval</h2>
                        <p style={{ color: '#b45309', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Your bulk order request has been received. Our administrators are currently reviewing the transaction details for security and verification.
                        </p>
                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            <button onClick={fetchOrder} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fbbf24' }}>
                                <RefreshCcw size={18} /> Refresh Status
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', padding: '40px', borderRadius: '16px', display: 'inline-block', maxWidth: '600px' }}>
                        <CheckCircle size={64} color="var(--primary-green)" style={{ marginBottom: '20px' }} />
                        <h2 style={{ color: '#166534', marginBottom: '10px' }}>Order Approved & Confirmed!</h2>
                        <p style={{ color: '#15803d' }}>Your order is now being processed by the farmer and will be shipped shortly.</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* Order Trace (Timeline) */}
                <div className="card">
                    <h3 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={24} color="var(--primary-green)" /> Trace Your Order
                    </h3>
                    
                    <div style={{ padding: '20px 0', position: 'relative' }}>
                        {['Pending Admin Approval', 'Order Approved', 'In Transit', 'Delivered'].map((step, idx) => {
                            const currentIdx = getStatusStep(order.status);
                            const active = currentIdx >= idx;
                            const isCurrent = currentIdx === idx;
                            
                            return (
                                <div key={step} style={{ display: 'flex', gap: '20px', marginBottom: '40px', position: 'relative' }}>
                                    {/* Vertical Line */}
                                    {idx < 3 && (
                                        <div style={{ 
                                            position: 'absolute', left: '15px', top: '30px', bottom: '-40px', 
                                            width: '2px', backgroundColor: active && currentIdx > idx ? 'var(--primary-green)' : '#eee', 
                                            zIndex: 0 
                                        }}></div>
                                    )}
                                    
                                    <div style={{ 
                                        width: '32px', height: '32px', borderRadius: '50%', 
                                        backgroundColor: active ? 'var(--primary-green)' : 'white',
                                        border: `2px solid ${active ? 'var(--primary-green)' : '#eee'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: 'white', zIndex: 1, 
                                        boxShadow: isCurrent ? '0 0 0 4px #dcfce7' : 'none'
                                    }}>
                                        {active && <CheckCircle size={18} />}
                                    </div>
                                    
                                    <div>
                                        <h4 style={{ margin: 0, color: active ? '#333' : '#999' }}>{step}</h4>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: active ? '#666' : '#bbb' }}>
                                            {isCurrent ? 'Current Status' : active ? 'Completed' : 'Upcoming'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                        <span style={{ color: '#888' }}>Order ID:</span>
                        <span style={{ fontWeight: 'bold' }}>#{(order.id || order._id || '').slice(-8)}</span>
                    </div>
                    
                    <div style={{ marginTop: '20px' }}>
                        <h5 style={{ marginBottom: '10px' }}>Items</h5>
                        {order.products.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                                <span>{p.name} (x{p.quantity})</span>
                                <span>₹{p.price * p.quantity}</span>
                            </div>
                        ))}
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: 'var(--primary-green)', fontSize: '1.1rem' }}>
                            <span>Total Amount</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <h5 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="#666" /> Delivery Address</h5>
                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>{order.deliveryDetails.address}</p>
                    </div>

                    {order.transportDetails?.vehicleNumber && (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={18} color="#3498db" /> Shipping Info</h5>
                            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Vehicle:</strong> {order.transportDetails.vehicleNumber}</p>
                            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Driver:</strong> {order.transportDetails.driverName}</p>
                            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Phone:</strong> {order.transportDetails.driverPhone}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
