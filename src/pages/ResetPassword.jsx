import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const res = await axios.post(`http://localhost:8080/api/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Reset Password</h2>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>New Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-control"
                            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="form-control"
                            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: 'var(--primary-green)' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
