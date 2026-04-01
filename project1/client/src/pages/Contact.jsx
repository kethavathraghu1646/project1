import React, { useState } from 'react';
import axios from 'axios';
import { Send, Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/contact', formData);
            setStatus('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            setStatus('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Contact Us</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                <div className="card">
                    <h3>Get In Touch</h3>
                    <p style={{ marginBottom: '20px' }}>Have questions about our produce or how to join as a farmer? Reach out to us!</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Phone size={20} color="var(--primary-green)" />
                            <span>+91 98765 43210</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={20} color="var(--primary-green)" />
                            <span>support@farmersfresh.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={20} color="var(--primary-green)" />
                            <span>123 Green Valley, Rural District</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Send a Message</h3>
                    {status && <p style={{ color: status.includes('success') ? 'green' : 'red', marginBottom: '15px' }}>{status}</p>}
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="name" value={formData.name} placeholder="Your Name" onChange={handleChange} required />
                        <input type="email" name="email" value={formData.email} placeholder="Your Email" onChange={handleChange} required />
                        <input type="text" name="phone" value={formData.phone} placeholder="Your Phone" onChange={handleChange} required />
                        <textarea
                            name="message"
                            value={formData.message}
                            placeholder="Your Message"
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #ddd', marginBottom: '15px', minHeight: '120px' }}
                        ></textarea>
                        <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Send size={20} /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
