import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = '/api';

export default function App() {
  const [currentMode, setCurrentMode] = useState('product_designer');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

  const modes = [
    { id: 'product_designer', name: '🎨 Lil Sash Designer', color: 'pink' },
    { id: 'admin_dashboard', name: '👑 Lil Doc Admin', color: 'gold' },
    { id: 'discovery_lab', name: '🌟 Jeeves Discovery Lab', color: 'purple' }
  ];

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'product_designer': return <ProductDesigner sessionId={sessionId} />;
      case 'admin_dashboard':  return <AdminDashboard />;
      case 'discovery_lab':    return <DiscoveryLab />;
      default: return <div>Select a mode above</div>;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎯 Doc Jordan&apos;s Trinity Platform</h1>
        <nav className="mode-selector">
          {modes.map(m => (
            <button
              key={m.id}
              className={`mode-btn ${currentMode === m.id ? 'active' : ''} ${m.color}`}
              onClick={() => setCurrentMode(m.id)}
            >
              {m.name}
            </button>
          ))}
        </nav>
      </header>
      <main className="main-content">{renderCurrentMode()}</main>
    </div>
  );
}

// Lil Sash
function ProductDesigner({ sessionId }) {
  const [designPrompt, setDesignPrompt] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALKAMI');
  const [designOutput, setDesignOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const brands = [
    { id: 'ALKAMI', name: 'ALKAMI', color: '#00ffff' },
    { id: 'skid_row_joe', name: 'Skid Row Joe', color: '#ff6b35' },
    { id: 'cali_diva', name: 'Cali Diva', color: '#ff69b4' }
  ];

  const generateImage = async () => {
    if (!designPrompt.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/design/generate`, {
        brand: selectedBrand,
        item_type: 'hoodie',
        description: designPrompt,
        session_id: sessionId
      });
      setDesignOutput(data);
    } catch (e) {
      alert('Error generating design. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-designer">
      <h2>🎨 Lil Sash - Product Designer</h2>
      <div className="designer-interface">
        <div className="brand-selector">
          <h3>Choose Your Brand</h3>
          <div className="brand-buttons">
            {brands.map(b => (
              <button
                key={b.id}
                className={`brand-btn ${selectedBrand === b.id ? 'active' : ''}`}
                style={{ borderColor: b.color }}
                onClick={() => setSelectedBrand(b.id)}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="design-input">
          <h3>Describe Your Design</h3>
          <textarea
            value={designPrompt}
            onChange={(e) => setDesignPrompt(e.target.value)}
            placeholder="Describe your design idea..."
            className="design-textarea"
          />
          <button className="generate-btn" onClick={generateImage} disabled={loading || !designPrompt.trim()}>
            {loading ? '🎨 Generating...' : '🛸 Generate Design'}
          </button>
        </div>

        {designOutput?.success && (
          <div className="design-output">
            <h3>🎨 Your Design by Lil Sash</h3>
            <div className="image-container">
              <img src={designOutput.image_url} alt={`${designOutput.brand} design`} className="generated-image" />
              <div className="image-details">
                <p><strong>Brand:</strong> {designOutput.brand}</p>
                <p><strong>Prompt:</strong> {designOutput.prompt_used}</p>
                <p><strong>Generated:</strong> {new Date(designOutput.generated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Lil Doc
function AdminDashboard() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadStores(); }, []);

  const loadStores = async () => {
    try {
      const { data } = await axios.get(`${API}/stores`);
      setStores(data.stores || []);
      if (data.stores?.length) {
        setSelectedStore(data.stores[0]);
        loadDashboardData(data.stores[0].shop_domain);
      }
    } catch {}
  };

  const loadDashboardData = async (shopDomain) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/dashboard/${shopDomain}`);
      setDashboardData(data);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="admin-dashboard">
      <h2>👑 Lil Doc - Admin Dashboard</h2>
      <div className="dashboard-interface">
        <div className="store-selector">
          <h3>Select Store</h3>
          <select value={selectedStore?.shop_domain || ''} onChange={(e) => {
            const s = stores.find(x => x.shop_domain === e.target.value);
            setSelectedStore(s);
            if (s) loadDashboardData(s.shop_domain);
          }}>
            {stores.map(s => (<option key={s.id} value={s.shop_domain}>{s.name}</option>))}
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : dashboardData && (
          <div className="dashboard-stats">
            <div className="stats-grid">
              <div className="stat-card"><h3>Products</h3><div className="stat-value">{dashboardData.stats?.total_products || 0}</div></div>
              <div className="stat-card"><h3>Orders</h3><div className="stat-value">{dashboardData.stats?.total_orders || 0}</div></div>
              <div className="stat-card"><h3>Revenue Today</h3><div className="stat-value">${dashboardData.stats?.revenue_today || 0}</div></div>
              <div className="stat-card"><h3>Monthly Revenue</h3><div className="stat-value">${dashboardData.stats?.revenue_month || 0}</div></div>
            </div>
            <div className="recent-orders">
              <h3>Recent Orders</h3>
              {dashboardData.recent_orders?.map(o => (
                <div key={o.id} className="order-item">
                  <span>{o.id}</span><span>${o.total}</span><span>{o.customer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Jeeves
function DiscoveryLab() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => { loadActivities(); }, []);

  const loadActivities = async () => {
    try {
      const { data } = await axios.get(`${API}/activities`);
      setActivities(data);
    } catch {}
  };

  return (
    <div className="discovery-lab">
      <h2>🌟 Jeeves - Discovery Lab</h2>
      <div className="lab-interface">
        <div className="activities-grid">
          {activities.map(a => (
            <div key={a.id} className="activity-card" onClick={() => setSelectedActivity(a)}>
              <div className="activity-icon">
                {a.id === 'mood-tracker' && '😊'}
                {a.id === 'color-therapy' && '🌈'}
                {a.id === 'aura-builder' && '✨'}
                {a.id === 'breathwork' && '🫁'}
              </div>
              <h3>{a.name}</h3>
              <p>{a.description}</p>
              <span className="activity-category">{a.category}</span>
            </div>
          ))}
        </div>

        {selectedActivity && (
          <div className="activity-detail">
            <h2>{selectedActivity.name}</h2>
            <p>{selectedActivity.description}</p>
            <button className="start-activity-btn">Begin {selectedActivity.name}</button>
          </div>
        )}
      </div>
    </div>
  );
}
