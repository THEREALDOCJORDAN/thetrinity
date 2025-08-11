import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// FIXED: Get the Netlify Functions URL (match Express routes that start with /api)
const API = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api/api'
  : 'http://localhost:8888/.netlify/functions/api/api';

function App() {
  const [currentMode, setCurrentMode] = useState('product_designer');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const modes = [
    { id: 'product_designer', name: '🎨 Lil Sash Designer', color: 'pink' },
    { id: 'admin_dashboard', name: '👑 Lil Doc Admin', color: 'gold' },  
    { id: 'discovery_lab', name: '🌟 Jeeves Discovery Lab', color: 'purple' }
  ];

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'product_designer':
        return <ProductDesigner sessionId={sessionId} />;
      case 'admin_dashboard':
        return <AdminDashboard sessionId={sessionId} />;
      case 'discovery_lab':
        return <DiscoveryLab sessionId={sessionId} />;
      default:
        return <div>Select a mode above</div>;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎯 Doc Jordan's Trinity Platform</h1>
        <nav className="mode-selector">
          {modes.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${currentMode === mode.id ? 'active' : ''} ${mode.color}`}
              onClick={() => setCurrentMode(mode.id)}
            >
              {mode.name}
            </button>
          ))}
        </nav>
      </header>
      
      <main className="main-content">
        {renderCurrentMode()}
      </main>
    </div>
  );
}

// Lil Sash Product Designer Component
const ProductDesigner = ({ sessionId }) => {
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
      const response = await axios.post(`${API}/design/generate`, {
        brand: selectedBrand,
        item_type: 'hoodie',
        description: designPrompt,
        session_id: sessionId
      });

      setDesignOutput(response.data);
    } catch (error) {
      console.error('Error generating design:', error);
      alert('Error generating design. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-designer">
      <h2>🎨 Lil Sash - Product Designer</h2>
      <p>AI-powered design creation for your fashion empire</p>
      
      <div className="designer-interface">
        <div className="brand-selector">
          <h3>Choose Your Brand</h3>
          <div className="brand-buttons">
            {brands.map(brand => (
              <button
                key={brand.id}
                className={`brand-btn ${selectedBrand === brand.id ? 'active' : ''}`}
                style={{ borderColor: brand.color }}
                onClick={() => setSelectedBrand(brand.id)}
              >
                {brand.name}
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
          
          <button 
            className="generate-btn"
            onClick={generateImage}
            disabled={loading || !designPrompt.trim()}
          >
            {loading ? '🎨 Generating...' : '🛸 Generate Design'}
          </button>
        </div>

        {designOutput && designOutput.success && (
          <div className="design-output">
            <h3>🎨 Your Design by Lil Sash</h3>
            <div className="image-container">
              <img 
                src={designOutput.image_url} 
                alt={`${designOutput.brand} design`}
                className="generated-image"
              />
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
};

// Lil Doc Admin Dashboard Component
const AdminDashboard = ({ sessionId }) => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await axios.get(`${API}/stores`);
      setStores(response.data.stores || []);
      if (response.data.stores && response.data.stores.length > 0) {
        setSelectedStore(response.data.stores[0]);
        loadDashboardData(response.data.stores[0].shop_domain);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadDashboardData = async (shopDomain) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/dashboard/${shopDomain}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>👑 Lil Doc - Admin Dashboard</h2>
      <p>Business management and analytics for your fashion empire</p>
      
      <div className="dashboard-interface">
        <div className="store-selector">
          <h3>Select Store</h3>
          <select 
            value={selectedStore?.shop_domain || ''} 
            onChange={(e) => {
              const store = stores.find(s => s.shop_domain === e.target.value);
              setSelectedStore(store);
              if (store) loadDashboardData(store.shop_domain);
            }}
          >
            {stores.map(store => (
              <option key={store.id} value={store.shop_domain}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : dashboardData && (
          <div className="dashboard-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Products</h3>
                <div className="stat-value">{dashboardData.stats?.total_products || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Orders</h3>
                <div className="stat-value">{dashboardData.stats?.total_orders || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Revenue Today</h3>
                <div className="stat-value">${dashboardData.stats?.revenue_today || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Monthly Revenue</h3>
                <div className="stat-value">${dashboardData.stats?.revenue_month || 0}</div>
              </div>
            </div>

            <div className="recent-orders">
              <h3>Recent Orders</h3>
              {dashboardData.recent_orders?.map(order => (
                <div key={order.id} className="order-item">
                  <span>{order.id}</span>
                  <span>${order.total}</span>
                  <span>{order.customer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Jeeves Discovery Lab Component  
const DiscoveryLab = ({ sessionId }) => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await axios.get(`${API}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  return (
    <div className="discovery-lab">
      <h2>🌟 Jeeves - Discovery Lab</h2>
      <p>Your guide to wellness, mindfulness, and personal growth</p>
      
      <div className="lab-interface">
        <div className="activities-grid">
          {activities.map(activity => (
            <div 
              key={activity.id} 
              className="activity-card"
              onClick={() => setSelectedActivity(activity)}
            >
              <div className="activity-icon">
                {activity.id === 'mood-tracker' && '😊'}
                {activity.id === 'color-therapy' && '🌈'} 
                {activity.id === 'aura-builder' && '✨'}
                {activity.id === 'breathwork' && '🫁'}
              </div>
              <h3>{activity.name}</h3>
              <p>{activity.description}</p>
              <span className="activity-category">{activity.category}</span>
            </div>
          ))}
        </div>

        {selectedActivity && (
          <div className="activity-detail">
            <h2>{selectedActivity.name}</h2>
            <p>{selectedActivity.description}</p>
            <button className="start-activity-btn">
              Begin {selectedActivity.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
