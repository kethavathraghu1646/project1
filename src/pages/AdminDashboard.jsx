import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShoppingCart, AlertTriangle, Check, X, Shield, BarChart3, IndianRupee, Truck, Calendar } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [buyers, setBuyers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterType, setFilterType] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Dashboard Stats
            let statsRes;
            try {
                statsRes = await axios.get('http://localhost:8080/api/admin/stats', { headers });
                setStats(statsRes.data);
            } catch (err) {
                console.error("Dashboard Stats Error:", err.response?.status, err.response?.data);
                setStats({ 
                    totalFarmers: 0, onlineFarmers: 0, offlineFarmers: 0,
                    totalBuyers: 0, onlineBuyers: 0, offlineBuyers: 0,
                    totalOrders: 0, totalTransactionValue: 0 
                });
            }

            // Fetch Pending Users
            const pendingRes = await axios.get('http://localhost:8080/api/admin/users/pending', { headers });
            setPendingUsers(pendingRes.data);

            // Fetch All Registered Users
            const allUsersRes = await axios.get('http://localhost:8080/api/admin/users', { headers });
            setFarmers(allUsersRes.data.filter(u => u.role === 'farmer'));
            setBuyers(allUsersRes.data.filter(u => u.role === 'buyer'));

            // Fetch All Orders
            const ordersRes = await axios.get('http://localhost:8080/api/orders', { headers });
            setOrders(ordersRes.data);
            setDisputes(ordersRes.data.filter(o => o.dispute && o.dispute.isRaised === true));
        } catch (err) {
            console.error("Admin Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/admin/users/approve/${userId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("User approved!");
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || "Approval failed";
            alert(`Error: ${msg}`);
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm("Are you sure you want to reject this registration?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/admin/users/reject/${userId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Registration rejected.");
            fetchData();
        } catch (err) {
            console.error("Rejection Error:", err.response);
            const msg = err.response?.data?.message || err.response?.statusText || "Rejection failed";
            const status = err.response?.status || "Unknown";
            alert(`Error (${status}): ${msg}`);
        }
    };

    const handleResolveDispute = async (orderId) => {
        const note = prompt("Enter resolution note:");
        if (!note) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/admin/disputes/${orderId}/resolve`,
                { resolutionNote: note },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Dispute marked as Resolved");
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || "Resolution failed";
            alert(`Error: ${msg}`);
        }
    };

    const handleUpdateOrder = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updateData = {
            status: formData.get('status'),
            expectedDeliveryDate: formData.get('expectedDate'),
            transportDetails: {
                vehicleNumber: formData.get('vehicle'),
                driverName: formData.get('driver'),
                driverPhone: formData.get('phone')
            }
        };

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/admin/orders/${selectedOrder.id || selectedOrder._id}`,
                updateData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Order updated successfully!");
            setSelectedOrder(null);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || "Update failed";
            alert(`Error: ${msg}`);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>System Administration</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`btn-${activeTab === 'users' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('users')}>
                        <Shield size={18} /> Approvals
                    </button>
                    <button className={`btn-${activeTab === 'farmers' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('farmers')}>
                        <Users size={18} /> Registered Farmers
                    </button>
                    <button className={`btn-${activeTab === 'buyers' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('buyers')}>
                        <Users size={18} /> Registered Buyers
                    </button>
                    <button className={`btn-${activeTab === 'orders' ? 'primary' : 'secondary'}`} onClick={() => { setActiveTab('orders'); setFilterType('all'); }}>
                        <ShoppingCart size={18} /> All Orders
                    </button>
                    <button className={`btn-${activeTab === 'farmer-orders' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('farmer-orders')}>
                        <Truck size={18} /> Farmer Purchases
                    </button>
                    <button className={`btn-${activeTab === 'disputes' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('disputes')}>
                        <AlertTriangle size={18} /> Disputes
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    <div className="stat-card" style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '5px solid #27ae60' }}>
                        <BarChart3 color="#27ae60" />
                        <div>
                            <h3 style={{ margin: 0 }}>{stats.totalFarmers}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Registered Farmers</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '0.75rem' }}>
                                <span><span style={{color: '#2ecc71'}}>●</span> {stats.onlineFarmers} Online</span>
                                <span><span style={{color: '#e74c3c'}}>●</span> {stats.offlineFarmers} Offline</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card" style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '5px solid #2980b9' }}>
                        <Users color="#2980b9" />
                        <div>
                            <h3 style={{ margin: 0 }}>{stats.totalBuyers}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Registered Buyers</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '0.75rem' }}>
                                <span><span style={{color: '#2ecc71'}}>●</span> {stats.onlineBuyers} Online</span>
                                <span><span style={{color: '#e74c3c'}}>●</span> {stats.offlineBuyers} Offline</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card" style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '5px solid #f39c12' }}>
                        <ShoppingCart color="#f39c12" />
                        <div>
                            <h3 style={{ margin: 0 }}>{stats.totalOrders}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Total Orders</p>
                        </div>
                    </div>
                    <div className="stat-card" style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '5px solid #2ecc71' }}>
                        <IndianRupee color="#2ecc71" />
                        <div>
                            <h3 style={{ margin: 0 }}>₹{stats.totalTransactionValue}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Total Volume</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                {activeTab === 'users' && (
                    <>
                        <h3>Pending User Approvals</h3>
                        <div style={{ marginTop: '20px' }}>
                            {pendingUsers.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ padding: '15px' }}>Name</th>
                                            <th style={{ padding: '15px' }}>Role</th>
                                            <th style={{ padding: '15px' }}>Region</th>
                                            <th style={{ padding: '15px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingUsers.map(u => (
                                            <tr key={u.id || u._id} style={{ borderTop: '1px solid #eee' }}>
                                                <td style={{ padding: '15px' }}>
                                                    <strong>{u.name}</strong><br />
                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{u.email}</span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{ fontSize: '0.75rem', backgroundColor: '#eef2ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px' }}>{u.mandal}, {u.district}</td>
                                                <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => handleApprove(u.id || u._id)} className="btn-primary" style={{ padding: '5px 15px', fontSize: '0.8rem' }}>
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleReject(u.id || u._id)} className="btn-secondary" style={{ padding: '5px 15px', fontSize: '0.8rem', backgroundColor: '#e74c3c', color: 'white', border: 'none' }}>
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No pending registrations at the moment.</p>}
                        </div>
                    </>
                )}
                
                {(activeTab === 'farmers' || activeTab === 'buyers') && (
                    <>
                        <h3>Registered {activeTab === 'farmers' ? 'Farmers' : 'Buyers'}</h3>
                        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: '15px' }}>Name</th>
                                        <th style={{ padding: '15px' }}>Email</th>
                                        <th style={{ padding: '15px' }}>Location</th>
                                        <th style={{ padding: '15px' }}>Activity</th>
                                        <th style={{ padding: '15px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'farmers' ? farmers : buyers).map(u => {
                                        const isOnline = u.lastActive && new Date(u.lastActive) > new Date(Date.now() - 5 * 60 * 1000);
                                        return (
                                            <tr key={u.id || u._id} style={{ borderTop: '1px solid #eee' }}>
                                                <td style={{ padding: '15px' }}><strong>{u.name}</strong></td>
                                                <td style={{ padding: '15px' }}>{u.email}</td>
                                                <td style={{ padding: '15px' }}>{u.mandal}, {u.district}</td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{ 
                                                        padding: '3px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold',
                                                        backgroundColor: isOnline ? '#dcfce7' : '#f3f4f6',
                                                        color: isOnline ? '#166534' : '#4b5563'
                                                    }}>
                                                        <span style={{color: isOnline ? '#2ecc71' : '#e74c3c'}}>●</span> {isOnline ? 'ONLINE' : 'OFFLINE'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{ 
                                                        padding: '3px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold',
                                                        backgroundColor: u.isApproved ? '#e0f2fe' : '#fee2e2',
                                                        color: u.isApproved ? '#0369a1' : '#991b1b'
                                                    }}>
                                                        {u.isApproved ? 'APPROVED' : 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {(activeTab === 'orders' || activeTab === 'farmer-orders') && (
                    <>
                        <h3>{activeTab === 'farmer-orders' ? "AgriShop Purchases by Farmers" : "Manage All Orders"}</h3>
                        <div style={{ marginTop: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: '15px' }}>Order ID</th>
                                        <th style={{ padding: '15px' }}>Crop</th>
                                        <th style={{ padding: '15px' }}>Quantity</th>
                                        <th style={{ padding: '15px' }}>Total Amount</th>
                                        <th style={{ padding: '15px' }}>Status</th>
                                        <th style={{ padding: '15px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.filter(o => activeTab === 'farmer-orders' ? (o.farmerId === '69a721f8f864063ee8fecf3f' || o.farmerId === 'admin') : true).map(o => (
                                        <tr key={o.id || o._id} style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: '15px' }}>#{(o.id || o._id || "").slice(-6)}</td>
                                            <td style={{ padding: '15px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {o.products?.map(p => p.name).join(', ')}
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                {o.products?.reduce((acc, p) => acc + p.quantity, 0)} units
                                            </td>
                                            <td style={{ padding: '15px' }}>₹{o.totalAmount}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ 
                                                    padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', 
                                                    backgroundColor: o.status === 'Delivered' ? '#dcfce7' : '#f0f0f0',
                                                    color: o.status === 'Delivered' ? '#166534' : '#333'
                                                }}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                                <button onClick={() => setSelectedOrder(o)} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem', color: '#27ae60', borderColor: '#27ae60' }}>
                                                    Details
                                                </button>
                                                {o.status === 'Pending Admin Approval' && (
                                                    <button onClick={async () => {
                                                        const token = localStorage.getItem('token');
                                                        await axios.patch(`http://localhost:8080/api/orders/${o.id || o._id}/status`, { status: 'Order Approved' }, { headers: { 'Authorization': `Bearer ${token}` } });
                                                        fetchData();
                                                        alert('Order Approved!');
                                                    }} className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.8rem', backgroundColor: '#2ecc71', border: 'none' }}>
                                                        Approve Order
                                                    </button>
                                                )}
                                                {o.status === 'Order Approved' && (
                                                    <button onClick={async () => {
                                                        const token = localStorage.getItem('token');
                                                        await axios.patch(`http://localhost:8080/api/orders/${o.id || o._id}/status`, { status: 'In Transit' }, { headers: { 'Authorization': `Bearer ${token}` } });
                                                        fetchData();
                                                        alert('Order marked as In Transit!');
                                                    }} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                                                        Start Delivery
                                                    </button>
                                                )}
                                                {o.status === 'In Transit' && (
                                                    <button onClick={async () => {
                                                        const token = localStorage.getItem('token');
                                                        await axios.patch(`http://localhost:8080/api/orders/${o.id || o._id}/status`, { status: 'Delivered' }, { headers: { 'Authorization': `Bearer ${token}` } });
                                                        fetchData();
                                                        alert('Marked as Delivered!');
                                                    }} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                                                        Complete Delivery
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'disputes' && (
                    <>
                        <h3>Open Disputes ({disputes.filter(d => d.dispute?.status === 'Open').length})</h3>
                        <div style={{ marginTop: '20px' }}>
                            {disputes.length > 0 ? disputes.map(d => (
                                        <div key={d.id || d._id} className="card" style={{ marginBottom: '15px', backgroundColor: '#fff5f5' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ color: '#e53e3e' }}>Order #{(d.id || d._id || '').slice(-6)} - {d.dispute?.status}</h4>
                                                    <p style={{ fontSize: '0.9rem' }}><strong>Reason:</strong> {d.dispute?.reason}</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Raised by {d.buyerName || d.buyerId?.name || 'Buyer'} against {d.farmerName || d.farmerId?.name || 'Farmer'}</p>
                                        </div>
                                        {d.dispute.status === 'Open' && (
                                            <button onClick={() => handleResolveDispute(d.id || d._id)} className="btn-primary" style={{ backgroundColor: '#e53e3e' }}>
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                    {d.dispute.status === 'Resolved' && (
                                        <p style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '5px', fontSize: '0.85rem' }}>
                                            <strong>Resolution:</strong> {d.dispute.resolutionNote}
                                        </p>
                                    )}
                                </div>
                            )) : <p style={{ textAlign: 'center', padding: '40px' }}>No active disputes found.</p>}
                        </div>
                    </>
                )}
            </div>

            {/* Logistics Update Modal (Simulated) */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '500px', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Order Details #{(selectedOrder.id || selectedOrder._id || '').slice(-6)}</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                <h5 style={{ margin: '0 0 10px 0' }}>Items in Order</h5>
                                {selectedOrder.products?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>Total Amount</span>
                                    <span>₹{selectedOrder.totalAmount}</span>
                                </div>
                            </div>

                            {selectedOrder.status === 'Delivered' && selectedOrder.deliveredAt && (
                                <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Check size={16} color="#166534" />
                                    <span style={{ fontSize: '0.85rem', color: '#166534' }}>
                                        <strong>Delivered At:</strong> {new Date(selectedOrder.deliveredAt).toLocaleString('en-IN', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit', hour12: true
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleUpdateOrder}>
                            <div className="form-group">
                                <label>Delivery Status</label>
                                <select name="status" defaultValue={selectedOrder.status}>
                                    <option value="Pending Admin Approval">Pending Admin Approval</option>
                                    <option value="Order Approved">Order Approved</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Expected Delivery</label>
                                <input type="date" name="expectedDate" defaultValue={selectedOrder.deliveryDetails?.expectedDeliveryDate?.split('T')[0]} />
                            </div>
                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                                <h5>Assign Transport Details</h5>
                                <div style={{ marginTop: '10px' }}>
                                    <input type="text" name="vehicle" placeholder="Vehicle Number (e.g. AP 02 AB 1234)" defaultValue={selectedOrder.transportDetails?.vehicleNumber} style={{ marginBottom: '10px' }} />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="text" name="driver" placeholder="Driver Name" defaultValue={selectedOrder.transportDetails?.driverName} />
                                        <input type="text" name="phone" placeholder="Driver Phone" defaultValue={selectedOrder.transportDetails?.driverPhone} />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
