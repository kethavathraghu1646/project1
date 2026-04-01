import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '',
        mandal: '', district: '', state: '', role: 'farmer',
        password: '', confirmPassword: '',
        companyDetails: { companyName: '', shopLicence: '', businessType: '' }
    });

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP states
    const [emailOtp, setEmailOtp] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isPhoneSent, setIsPhoneSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompanyChange = (e) => {
        setFormData({
            ...formData,
            companyDetails: { ...formData.companyDetails, [e.target.name]: e.target.value }
        });
    };

    const sendOtp = async (type) => {
        const identifier = type === 'email' ? formData.email : formData.phone;
        if (!identifier) {
            return setError(`Please enter your ${type} first`);
        }
        try {
            await axios.post('http://localhost:8080/api/auth/send-otp', { identifier });
            if (type === 'email') setIsEmailSent(true);
            else setIsPhoneSent(true);
            setMessage(`OTP sent to ${type}`);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to send OTP to ${type}`);
        }
    };

    const verifyOtp = async (type) => {
        const identifier = type === 'email' ? formData.email : formData.phone;
        const otp = type === 'email' ? emailOtp : phoneOtp;
        try {
            await axios.post('http://localhost:8080/api/auth/verify-otp', { identifier, otp });
            if (type === 'email') setIsEmailVerified(true);
            else setIsPhoneVerified(true);
            setMessage(`${type} verified successfully`);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || `Invalid OTP for ${type}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!isEmailVerified || !isPhoneVerified) {
            return setError('Please verify both email and phone number');
        }

        setLoading(true);
        try {
            const dataToSubmit = { ...formData, isEmailVerified, isPhoneVerified };
            if (formData.role !== 'buyer') {
                delete dataToSubmit.companyDetails;
            }

            const res = await axios.post('http://localhost:8080/api/auth/register', dataToSubmit);
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>I am a *</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px' }}>
                            <option value="farmer">Farmer</option>
                            <option value="buyer">Buyer (Company / Retailer)</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Full Name *</label>
                        <input type="text" name="name" onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px' }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Email Address *</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="email" name="email" onChange={handleChange} required disabled={isEmailVerified} className="form-control" style={{ flex: 1, padding: '8px' }} />
                            {!isEmailVerified && (
                                <button type="button" onClick={() => sendOtp('email')} className="btn btn-secondary">
                                    {isEmailSent ? 'Resend' : 'Send OTP'}
                                </button>
                            )}
                        </div>
                    </div>

                    {isEmailSent && !isEmailVerified && (
                        <div className="form-group" style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Enter Email OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} className="form-control" style={{ flex: 1, padding: '8px' }} />
                            <button type="button" onClick={() => verifyOtp('email')} className="btn btn-primary">Verify</button>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Phone Number *</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="tel" name="phone" onChange={handleChange} required disabled={isPhoneVerified} className="form-control" style={{ flex: 1, padding: '8px' }} />
                            {!isPhoneVerified && (
                                <button type="button" onClick={() => sendOtp('phone')} className="btn btn-secondary">
                                    {isPhoneSent ? 'Resend' : 'Send OTP'}
                                </button>
                            )}
                        </div>
                    </div>

                    {isPhoneSent && !isPhoneVerified && (
                        <div className="form-group" style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Enter Phone OTP" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} className="form-control" style={{ flex: 1, padding: '8px' }} />
                            <button type="button" onClick={() => verifyOtp('phone')} className="btn btn-primary">Verify</button>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Address *</label>
                        <textarea name="address" onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px' }}></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input type="text" name="mandal" placeholder="Mandal" onChange={handleChange} className="form-control" style={{ flex: 1, padding: '8px' }} />
                        <input type="text" name="district" placeholder="District" onChange={handleChange} className="form-control" style={{ flex: 1, padding: '8px' }} />
                        <input type="text" name="state" placeholder="State" onChange={handleChange} className="form-control" style={{ flex: 1, padding: '8px' }} />
                    </div>

                    {formData.role === 'buyer' && (
                        <div style={{ padding: '15px', backgroundColor: '#f9f9f9', marginBottom: '15px' }}>
                            <h4>Company Details</h4>
                            <input type="text" name="companyName" placeholder="Company Name" onChange={handleCompanyChange} required className="form-control" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                            <input type="text" name="shopLicence" placeholder="Shop / Trade Licence Number" onChange={handleCompanyChange} required className="form-control" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                            <input type="text" name="businessType" placeholder="Business Type" onChange={handleCompanyChange} required className="form-control" style={{ width: '100%', padding: '8px' }} />
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Password *</label>
                        <input type="password" name="password" onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Confirm Password *</label>
                        <input type="password" name="confirmPassword" onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px' }} />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>

                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
