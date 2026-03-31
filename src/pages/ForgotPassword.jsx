import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setMessage("Password reset OTP has been sent to your email.");
            setShowOtpInput(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8080/api/auth/verify-reset-otp', { email, otp });
            if (res.data.token) {
                navigate(`/reset-password/${res.data.token}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Forgot Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                    {showOtpInput 
                        ? "Enter the 6-digit OTP sent to your email to continue." 
                        : "Enter your email address and we will send you an OTP to reset your password."}
                </p>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}

                {!showOtpInput ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control"
                                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength="6"
                                className="form-control"
                                style={{ width: '100%', padding: '10px', marginTop: '5px', textAlign: 'center', letterSpacing: '5px', fontSize: '1.2em' }}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleSendOTP()} 
                            disabled={loading}
                            style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                            Resend OTP
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    Remember your password? <Link to="/login" style={{ color: 'var(--primary-green)' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
