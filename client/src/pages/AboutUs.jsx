import React from 'react';
import { Leaf, Heart, Users } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                <Leaf size={64} color="var(--primary-green)" style={{ marginBottom: '20px' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>About Farmers Fresh Market</h2>
                <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                    This project is a student initiative dedicated to bridging the gap between local farmers and urban consumers.
                    Our mission is to ensure fresh, healthy produce reaches your table directly, while farmers earn a fair price for their hard work.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                    <div>
                        <Heart size={40} color="var(--primary-green)" style={{ marginBottom: '10px' }} />
                        <h3>Fresh Daily</h3>
                        <p>Picked at peak ripeness and delivered within 1–2 days.</p>
                    </div>
                    <div>
                        <Users size={40} color="var(--primary-green)" style={{ marginBottom: '10px' }} />
                        <h3>Supporting Locals</h3>
                        <p>Every purchase directly benefits a rural farming family.</p>
                    </div>
                    <div>
                        <Leaf size={40} color="var(--primary-green)" style={{ marginBottom: '10px' }} />
                        <h3>Fair Trade</h3>
                        <p>No middlemen. Better prices for farmers, honest cost for you.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
