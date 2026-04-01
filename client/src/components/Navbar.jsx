import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Home, Leaf, Users, MessageSquare, User, Shield, Package, ShoppingBag, List } from 'lucide-react';

const Navbar = ({ user, logout }) => {
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const count = cart.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
        };

        updateCount();
        // Listen for storage changes (works across tabs)
        window.addEventListener('storage', updateCount);

        // Custom event for same-tab updates
        window.addEventListener('cartUpdated', updateCount);

        return () => {
            window.removeEventListener('storage', updateCount);
            window.removeEventListener('cartUpdated', updateCount);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                        <Leaf size={24} color="white" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                    </div>
                    <span style={{
                        background: 'linear-gradient(to right, #ffffff, #f0fdf4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Farmers Fresh
                    </span>
                </Link>

                <ul className="nav-links">
                    <li><Link to="/"><Home size={20} /> Home</Link></li>

                    {/* Admin Links */}
                    {user?.role === 'admin' && (
                        <li><Link to="/admin" style={{ color: '#ffeb3b', fontWeight: 'bold' }}><Shield size={20} /> System Admin</Link></li>
                    )}

                    {/* Buyer Links */}
                    {user?.role === 'buyer' && (
                        <>
                            <li><Link to="/products"><ShoppingBag size={20} /> Marketplace</Link></li>
                            <li><Link to="/my-orders"><ShoppingCart size={20} /> My Bulk Orders</Link></li>
                        </>
                    )}

                    {/* Farmer Links */}
                    {user?.role === 'farmer' && (
                        <>
                            <li><Link to="/farmer-dashboard"><Package size={20} /> Sales Dashboard</Link></li>
                            <li><Link to="/my-listings"><List size={20} /> My Listings</Link></li>
                        </>
                    )}

                    {/* General Links */}
                    {user?.role !== 'admin' && (
                        <li><Link to="/contact"><MessageSquare size={20} /> Support</Link></li>
                    )}
                </ul>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {user && (
                        <Link to="/cart" style={{ color: 'white', position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-10px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid var(--primary-green)'
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', padding: '5px 10px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        {user?.profileImage ? (
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: '1px solid white' }}>
                                <img src={user.profileImage} alt="User Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ) : (
                            <User size={20} />
                        )}
                        <span>{user?.name?.split(' ')[0]}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '10px' }}>
                            {user?.role}
                        </span>
                    </Link>

                    <button onClick={logout} className="btn-logout" title="Logout" style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px', borderRadius: '5px', lineHeight: 0 }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
