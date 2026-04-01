import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Camera, Upload, Save, User as UserIcon, X } from 'lucide-react';

const Profile = ({ user, setUser }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        mandal: user?.mandal || '',
        district: user?.district || '',
        state: user?.state || '',
        profileImage: user?.profileImage || ''
    });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [message, setMessage] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            setFormData({ ...formData, profileImage: imageData });
            stopCamera();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:8080/api/auth/profile/${user.id}`, formData);
            const updatedUser = res.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile.");
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0', maxWidth: '800px' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary-green)' }}>User Profile</h2>

                {message && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid var(--primary-green)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f0f0f0',
                        marginBottom: '20px',
                        position: 'relative'
                    }}>
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <UserIcon size={80} color="#ccc" />
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" className="btn-primary" onClick={() => document.getElementById('fileInput').click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px' }}>
                            <Upload size={18} /> Upload Photo
                        </button>
                        <input id="fileInput" type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        <button type="button" className="btn-accent" onClick={startCamera} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#3498db', color: 'white' }}>
                            <Camera size={18} /> Take Photo
                        </button>
                    </div>
                </div>

                {isCameraOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '80%' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '10px' }} />
                            <button onClick={stopCamera} style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={32} /></button>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                            <button onClick={capturePhoto} className="btn-primary" style={{ padding: '10px 30px', fontSize: '1.2rem' }}>Capture</button>
                            <button onClick={stopCamera} className="btn-secondary" style={{ padding: '10px 30px', fontSize: '1.2rem', backgroundColor: '#e74c3c' }}>Cancel</button>
                        </div>
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Full Home Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mandal</label>
                        <input type="text" name="mandal" value={formData.mandal} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>District</label>
                        <input type="text" name="district" value={formData.district} onChange={handleChange} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary btn-large" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'auto', padding: '12px 40px' }}>
                            <Save size={20} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
