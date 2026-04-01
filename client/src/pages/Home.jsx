import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShoppingBag, Truck, ShieldCheck, LayoutDashboard, ArrowLeft, Shield, Package } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import BuyerDashboard from './BuyerDashboard';
import FarmerDashboard from './FarmerDashboard';

const Home = ({ user }) => {
    const [view, setView] = useState('landing');

    const renderDashboard = () => {
        switch (view) {
            case 'admin': return <AdminDashboard />;
            case 'buyer': return <BuyerDashboard />;
            case 'farmer': return <FarmerDashboard />;
            default: return null;
        }
    };

    if (view !== 'landing') {
        return (
            <div className="dashboard-container">
                <div className="container" style={{ padding: '20px 0 0 0' }}>
                    <button
                        onClick={() => setView('landing')}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            border: '1px solid #ddd',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeft size={18} /> Back to Home Page
                    </button>
                </div>
                {renderDashboard()}
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '120px 0',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '15px', fontWeight: '800' }}>Welcome, {user.name}!</h1>
                    <p style={{ fontSize: '1.6rem', marginBottom: '40px', opacity: 0.9 }}>Direct from Farmers to Your Table</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                        {user?.role === 'admin' && (
                            <>
                                <button onClick={() => setView('admin')} className="btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem', backgroundColor: '#4f46e5', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Shield size={22} /> Admin Dashboard
                                </button>
                                <Link to="/agri-shop" className="btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem', textDecoration: 'none', backgroundColor: '#8b5cf6', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShoppingBag size={22} /> Fertilizer & Seeds
                                </Link>
                            </>
                        )}

                        {user?.role === 'buyer' && (
                            <button onClick={() => setView('buyer')} className="btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem', backgroundColor: '#2563eb', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShoppingBag size={22} /> Buyer Dashboard
                            </button>
                        )}

                        {user?.role === 'farmer' && (
                            <button onClick={() => setView('farmer')} className="btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem', backgroundColor: '#059669', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={22} /> Farmer Dashboard
                            </button>
                        )}

                        {user?.role !== 'admin' && (
                            <>
                                <Link to="/agri-shop" className="btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem', textDecoration: 'none', backgroundColor: '#8b5cf6', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShoppingBag size={22} /> Fertilizer & Seeds
                                </Link>

                                <Link to="/products" className="btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Leaf size={22} /> View Products
                                </Link>

                                <Link to="/farmers" className="btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem', textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    Explore Farmers
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container" style={{ padding: '80px 0' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.2rem', fontWeight: '700' }}>Empowering Agriculture, Seamlessly</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '40px', transition: 'transform 0.3s' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <ShoppingBag size={40} color="var(--primary-green)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Fresh Produce</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>Gathered daily from local farms to ensure maximum freshness for your family.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '40px', transition: 'transform 0.3s' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <ShieldCheck size={40} color="var(--primary-green)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Fair Prices</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>Ensuring farmers get their fair share while you get high-quality products at better prices.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '40px', transition: 'transform 0.3s' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <Truck size={40} color="var(--primary-green)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Fast Local Delivery</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>1–2 days delivery in your local area. Free delivery on orders above ₹500.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
