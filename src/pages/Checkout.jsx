import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Truck, Wallet, MapPin } from 'lucide-react';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [deliveryData, setDeliveryData] = useState({
        address: '',
        phone: '',
        preferredDate: '',
        paymentMode: 'COD'
    });
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const navigate = useNavigate();

    const handleDetectLocation = () => {
        setDetecting(true);
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setDetecting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                if (res.data && res.data.display_name) {
                    setDeliveryData(prev => ({ ...prev, address: res.data.display_name }));
                }
            } catch (err) {
                console.error("Error fetching address:", err);
                alert("Could not fetch address details. Please enter manually.");
            } finally {
                setDetecting(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Error accessing location. Please check browser permissions.");
            setDetecting(false);
        });
    };

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cart')) || [];
        if (items.length === 0) navigate('/products');
        setCartItems(items);

        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setDeliveryData(prev => ({ ...prev, address: user.address, phone: user.phone }));
        }
    }, [navigate]);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + deliveryFee;

    const handleChange = (e) => {
        setDeliveryData({ ...deliveryData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const orderData = {
                products: cartItems.map(item => ({
                    productId: item.id || item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: total,
                paymentMode: deliveryData.paymentMode,
                farmerId: cartItems[0]?.farmerId,
                buyerId: user?._id || user?.id,
                deliveryDetails: {
                    address: deliveryData.address,
                    phone: deliveryData.phone,
                    preferredDate: deliveryData.preferredDate
                }
            };

            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8080/api/orders', orderData, {
                headers: { 'x-auth-token': token }
            });

            localStorage.removeItem('cart');
            navigate(`/order-confirmation/${res.data._id || res.data.id}`);
        } catch (err) {
            alert('Failed to place order: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <h2 style={{ marginBottom: '30px' }}>Checkout & Delivery Details</h2>
            <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div className="card">
                    <h3>Delivery Information</h3>
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ marginBottom: 0 }}>Delivery Address</label>
                            <button
                                type="button"
                                onClick={handleDetectLocation}
                                disabled={detecting}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                                title="Detect Current Location"
                            >
                                <MapPin size={16} />
                                {detecting ? 'Detecting...' : 'Use Current Location'}
                            </button>
                        </div>
                        <input type="text" name="address" value={deliveryData.address} onChange={handleChange} placeholder="Full Address" required />

                        <label>Phone Number</label>
                        <input type="text" name="phone" value={deliveryData.phone} onChange={handleChange} placeholder="Contact Number" required />

                        <label>Preferred Delivery Date</label>
                        <input type="date" name="preferredDate" value={deliveryData.preferredDate} onChange={handleChange} required />
                    </div>

                    <h3 style={{ marginTop: '30px' }}>Payment Method</h3>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                            <input type="radio" name="paymentMode" value="UPI" onChange={handleChange} style={{ width: 'auto', marginBottom: '0' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Wallet size={20} /> UPI (GPay / PhonePe)
                            </div>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                            <input type="radio" name="paymentMode" value="Card" onChange={handleChange} style={{ width: 'auto', marginBottom: '0' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CreditCard size={20} /> Debit / Credit Card
                            </div>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                            <input type="radio" name="paymentMode" value="COD" onChange={handleChange} defaultChecked style={{ width: 'auto', marginBottom: '0' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Truck size={20} /> Cash on Delivery (COD)
                            </div>
                        </label>
                    </div>
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h3>Order Review</h3>
                    <div style={{ margin: '20px 0' }}>
                        {cartItems.map(item => (
                            <div key={item.id || item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>{item.name} (x{item.quantity})</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                        <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span> <span>₹{subtotal}</span></p>
                        <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery Fee:</span> <span>₹{deliveryFee}</span></p>
                        <h3 style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: 'var(--primary-green)' }}>
                            <span>Total:</span> <span>₹{total}</span>
                        </h3>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary btn-large" style={{ marginTop: '20px' }}>
                        {loading ? 'Processing...' : 'Place Order Now'}
                    </button>
                    <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--gray-text)', textAlign: 'center' }}>
                        Delivery estimate: 1–2 days locally
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
