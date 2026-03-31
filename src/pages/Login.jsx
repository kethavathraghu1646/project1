import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', formData);
            const { token, user } = res.data;
            console.log("Login User Data:", user); // Debugging

            // Simple check: If user exists and is not admin, handle approval
            if (user.role !== 'admin' && user.isApproved === false) {
                setLoading(false);
                return setError('Your account is pending admin approval. Please check back later.');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            // Role-based redirection
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'buyer') navigate('/buyer-dashboard');
            else if (user.role === 'farmer') navigate('/farmer-dashboard');
            else navigate('/');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Market Login</h2>
                {error && <p style={{ color: 'red', textAlign: 'center', padding: '10px', backgroundColor: '#fff5f5', borderRadius: '5px', fontSize: '0.9rem' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <div className="form-group" style={{ marginTop: '15px' }}>
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary btn-large" style={{ width: '100%', padding: '10px', marginTop: '20px' }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--primary-green)', fontSize: '0.9rem' }}>Forgot Password?</Link>
                </p>

                <p style={{ marginTop: '10px', textAlign: 'center' }}>
                    New user? <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
