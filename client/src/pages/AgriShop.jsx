import React, { useState } from 'react';
import { ShoppingCart, Package, Info, CheckCircle, Search, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgriShop = ({ user }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    const initialProducts = [
        {
            _id: '67c5cf769641473138f8f011',
            name: 'NPK Fertilizer (19:19:19)',
            category: 'Fertilizers',
            price: 450,
            image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=800&auto=format&fit=crop',
            description: 'Balanced nutritional support for all types of crops. Promotes healthy growth.',
            unit: '5kg Bag',
            farmerId: '69a721f8f864063ee8fecf3f' // System Admin as Seller
        },
        {
            _id: '67c5cf769641473138f8f012',
            name: 'Urea (Prilled)',
            category: 'Fertilizers',
            price: 266,
            image: 'https://images.unsplash.com/photo-1592984140109-f38b43825700?q=80&w=800&auto=format&fit=crop',
            description: 'High nitrogen fertilizer for rapid vegetative growth.',
            unit: '45kg Bag',
            farmerId: '69a335bd0243488927b1f453'
        },
        {
            _id: '67c5cf769641473138f8f013',
            name: 'Paddy Seeds (BPT 5204)',
            category: 'Seeds',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1536675300543-0803539824de?q=80&w=800&auto=format&fit=crop',
            description: 'High-yield Sona Masuri variety, resistant to major pests.',
            unit: '25kg Bag',
            farmerId: '69a335bd0243488927b1f453'
        },
        {
            _id: '67c5cf7 voice769641473138f8f014',
            name: 'Hybrid Maize Seeds',
            category: 'Seeds',
            price: 850,
            image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=800&auto=format&fit=crop',
            description: 'Fast-growing hybrid maize seeds with high drought tolerance.',
            unit: '5kg Pack',
            farmerId: '69a335bd0243488927b1f453'
        },
        {
            _id: '67c5cf769641473138f8f015',
            name: 'Organic Neem Oil Pesticide',
            category: 'Pesticides',
            price: 320,
            image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800&auto=format&fit=crop',
            description: '100% natural and organic pest control solution.',
            unit: '1 Liter',
            farmerId: '69a335bd0243488927b1f453'
        },
        {
            _id: '67c5cf769641473138f8f016',
            name: 'Hand Compression Sprayer',
            category: 'Tools',
            price: 950,
            image: 'https://images.unsplash.com/photo-1589307304575-3057da8e5895?q=80&w=800&auto=format&fit=crop',
            description: '5-liter capacity durable sprayer for fertilizers and pesticides.',
            unit: 'Piece',
            farmerId: '69a335bd0243488927b1f453'
        },
        {
            _id: '67c5cf769641473138f8f017',
            name: 'Premium Vermicompost',
            category: 'Fertilizers',
            price: 350,
            image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=800&auto=format&fit=crop',
            description: '100% organic earthworm compost for enriching soil health naturally.',
            unit: '10kg Bag',
            farmerId: '69a721f8f864063ee8fecf3f'
        },
        {
            _id: '67c5cf769641473138f8f018',
            name: 'Hybrid Cotton Seeds (Bt)',
            category: 'Seeds',
            price: 1500,
            image: 'https://images.unsplash.com/photo-1447012921500-1c312781bcf7?q=80&w=800&auto=format&fit=crop',
            description: 'Bollworm-resistant premium hybrid cotton seeds for maximum yield.',
            unit: '450g Pack',
            farmerId: '69a721f8f864063ee8fecf3f'
        },
        {
            _id: '67c5cf769641473138f8f019',
            name: 'DAP Fertilizer (18:46:0)',
            category: 'Fertilizers',
            price: 1350,
            image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop',
            description: 'Di-ammonium Phosphate. Excellent source of phosphorus and nitrogen.',
            unit: '50kg Bag',
            farmerId: '69a335bd0243488927b1f453'
        },
        {
            _id: '67c5cf769641473138f8f020',
            name: 'Heavy Duty Sickle',
            category: 'Tools',
            price: 250,
            image: 'https://images.unsplash.com/photo-1542382103328-1b2c569f447a?q=80&w=800&auto=format&fit=crop',
            description: 'Carbon steel curved blade sickle with wooden handle. Perfect for harvesting.',
            unit: 'Piece',
            farmerId: '69a721f8f864063ee8fecf3f'
        },
        {
            _id: '67c5cf769641473138f8f021',
            name: 'Trichoderma Viride Biofungicide',
            category: 'Pesticides',
            price: 180,
            image: 'https://images.unsplash.com/photo-1585807963283-11bbabdfa495?q=80&w=800&auto=format&fit=crop',
            description: 'Eco-friendly biocontrol agent effective against root rot and wilt diseases.',
            unit: '1kg Pack',
            farmerId: '69a721f8f864063ee8fecf3f'
        }
    ];
    
    const [products, setProducts] = useState(initialProducts);

    const handleAddProduct = () => {
        const name = prompt("Enter product name:");
        if (!name) return;
        const price = prompt("Enter price:");
        const imageUrl = prompt("Enter Image URL (optional):");
        
        const newProduct = {
            _id: Math.random().toString(36).substring(7),
            name,
            category: 'Tools',
            price: Number(price) || 0,
            image: imageUrl ? imageUrl : 'https://images.unsplash.com/photo-1589307304575-3057da8e5895?q=80&w=800&auto=format&fit=crop',
            description: 'New product added by admin/buyer.',
            unit: 'Item',
            farmerId: user?._id || 'admin'
        };
        setProducts([...products, newProduct]);
    };

    const handleRemoveProduct = (id) => {
        if(window.confirm("Are you sure you want to remove this product?")) {
            setProducts(products.filter(p => p._id !== id));
        }
    };

    const addToCart = (product) => {
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = existingCart.find(item => item._id === product._id);

        let updatedCart;
        if (existingItem) {
            updatedCart = existingCart.map(item =>
                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            updatedCart = [...existingCart, { ...product, quantity: 1 }];
        }

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${product.name} added to cart!`);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'All' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <button
                onClick={() => navigate('/')}
                className="btn-secondary"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '20px'
                }}
            >
                <ArrowLeft size={18} /> Back to Home
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ color: 'var(--primary-green)', marginBottom: '10px' }}>Farmer's Input Shop</h1>
                    <p style={{ color: '#666' }}>Quality Fertilizers, Seeds, and Tools for Your Farm</p>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {(user?.role === 'admin' || user?.role === 'buyer') && (
                        <button onClick={handleAddProduct} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                            + Add Item
                        </button>
                    )}
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search inputs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px', width: '250px', marginBottom: 0 }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
                {['All', 'Fertilizers', 'Seeds', 'Pesticides', 'Tools'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={category === cat ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '8px 20px', borderRadius: '25px', whiteSpace: 'nowrap' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {filteredProducts.map(product => (
                    <div key={product._id} className="card product-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'inline-block', marginRight: '10px' }}>{product.name}</h3>
                                    <span style={{ fontSize: '0.75rem', backgroundColor: '#f0fdf4', color: 'var(--primary-green)', padding: '4px 10px', borderRadius: '15px', fontWeight: 'bold' }}>{product.category}</span>
                                </div>
                                {(user?.role === 'admin' || user?.role === 'buyer') && (
                                    <button onClick={() => handleRemoveProduct(product._id)} style={{ color: '#e53e3e', fontSize: '0.8rem', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                        Remove
                                    </button>
                                )}
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px', flex: 1 }}>{product.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <div>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>₹{product.price}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '5px' }}>/ {product.unit}</span>
                                </div>
                                <button onClick={() => addToCart(product)} className="btn-primary" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShoppingCart size={18} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Package size={48} color="#ddd" style={{ marginBottom: '15px' }} />
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>No items found matching your search.</p>
                </div>
            )}

            {/* Quality Assurance Banner */}
            <div className="card" style={{ marginTop: '60px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '20px', padding: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '50%' }}>
                    <CheckCircle size={40} color="var(--primary-green)" />
                </div>
                <div>
                    <h3 style={{ color: '#166534', marginBottom: '5px' }}>Government Certified Inputs</h3>
                    <p style={{ color: '#166534', opacity: 0.8 }}>All fertilizers and seeds sold on Farmers Market are certified for quality and compliance with agricultural standards.</p>
                </div>
            </div>
        </div>
    );
};

export default AgriShop;
