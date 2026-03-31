import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Farmers from './pages/Farmers';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import MyOrders from './pages/MyOrders';
import AboutUs from './pages/AboutUs';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';
import BuyerDashboard from './pages/BuyerDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgriShop from './pages/AgriShop';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderConfirmation from './pages/OrderConfirmation';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Re-check approval if not admin
            if (parsedUser.role !== 'admin' && !parsedUser.isApproved) {
                // Keep as is or logout if check fails
            }
            setUser(parsedUser);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router>
            <div className="App">
                {user && <Navbar user={user} logout={logout} />}
                <Routes>
                    <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Role-Based Dashboards */}
                    <Route path="/buyer-dashboard" element={user?.role === 'buyer' ? <BuyerDashboard /> : <Navigate to="/login" />} />
                    <Route path="/farmer-dashboard" element={user?.role === 'farmer' ? <FarmerDashboard /> : <Navigate to="/login" />} />
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />

                    <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
                    <Route path="/products" element={user ? <Products user={user} /> : <Navigate to="/login" />} />
                    <Route path="/farmers" element={user ? <Farmers /> : <Navigate to="/login" />} />
                    <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
                    <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
                    <Route path="/contact" element={user ? <Contact /> : <Navigate to="/login" />} />
                    <Route path="/my-orders" element={user ? <MyOrders /> : <Navigate to="/login" />} />
                    <Route path="/my-listings" element={user?.role === 'farmer' ? <MyListings user={user} /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
                    <Route path="/about" element={user ? <AboutUs /> : <Navigate to="/login" />} />
                    <Route path="/agri-shop" element={user ? <AgriShop user={user} /> : <Navigate to="/login" />} />
                    <Route path="/order-confirmation/:id" element={user ? <OrderConfirmation /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
