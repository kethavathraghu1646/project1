import React from 'react';

const Farmers = () => {
    const sampleFarmers = [
        { id: 1, name: 'Farmer Rajesh', location: 'Nashik, Maharashtra', photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', desc: 'Expert in organic fruit farming with 20 years of experience.' },
        { id: 2, name: 'Farmer Sunita', location: 'Ambala, Punjab', photo: 'https://images.unsplash.com/photo-1595273670150-db0a3bf37bca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', desc: 'Focuses on sustainable vegetable cultivation using natural composting.' },
        { id: 3, name: 'Farmer Amit', location: 'Coorg, Karnataka', photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', desc: 'Passionate about beekeeping and producing pure multi-floral honey.' }
    ];

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Our Local Farmers</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {sampleFarmers.map(farmer => (
                    <div key={farmer.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <img src={farmer.photo} alt={farmer.name} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px', border: '4px solid var(--primary-green)' }} />
                        <h3>{farmer.name}</h3>
                        <p style={{ fontWeight: 'bold', color: 'var(--primary-green)' }}>{farmer.location}</p>
                        <p style={{ marginTop: '10px' }}>{farmer.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Farmers;
