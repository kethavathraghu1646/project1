import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(items);
    }, []);

    const updateQuantity = (id, delta) => {
        const updatedCart = cartItems.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const removeItem = (id) => {
        const updatedCart = cartItems.filter(item => item._id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = total >= 500 ? 0 : 40;

    if (cartItems.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h2>Your Cart is Empty</h2>
                <Link to="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Go Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <h2 style={{ marginBottom: '30px' }}>Your Shopping Cart</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cartItems.map(item => (
                        <div key={item._id} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div style={{ flex: 1 }}>
                                <h3>{item.name}</h3>
                                <p>₹{item.price} / kg</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button onClick={() => updateQuantity(item._id, -1)} className="btn-secondary" style={{ padding: '5px' }}><Minus size={20} /></button>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, 1)} className="btn-secondary" style={{ padding: '5px' }}><Plus size={20} /></button>
                            </div>
                            <p style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>₹{item.price * item.quantity}</p>
                            <button onClick={() => removeItem(item._id)} style={{ background: 'none', color: 'red' }}><Trash2 size={24} /></button>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h3>Order Summary</h3>
                    <div style={{ margin: '20px 0', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Subtotal:</span>
                            <span>₹{total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Delivery Fee:</span>
                            <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px', fontSize: '1.3rem' }}>
                            <span>Total:</span>
                            <span>₹{total + deliveryFee}</span>
                        </div>
                    </div>
                    <button onClick={() => navigate('/checkout')} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
