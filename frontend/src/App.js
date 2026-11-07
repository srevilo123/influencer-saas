import React, { useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, Plus, TrendingUp, DollarSign, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

const API_URL = 'https://influencer-backend-fiv8.onrender.com';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [totalPaid, setTotalPaid] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const res = await axios.post(`${API_URL}/login`, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        setToken(res.data.access_token);
        localStorage.setItem('token', res.data.access_token);
        fetchReports(res.data.access_token);
      } else {
        await axios.post(`${API_URL}/signup`, { username, password });
        alert('Account created! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      alert('Authentication failed');
    }
  };

  const fetchReports = async (currentToken) => {
    try {
      const res = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${currentToken || token}` }
      });
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (token) fetchReports(token);
  }, [token]);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/reports`, {
        campaign_name: campaignName,
        platform,
        views: Number(views),
        likes: Number(likes),
        comments: Number(comments),
        shares: Number(shares),
        total_paid: Number(totalPaid)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      fetchReports(token);
      // Reset form
      setCampaignName('');
      setViews('');
      setLikes('');
      setComments('');
      setShares('');
      setTotalPaid('');
    } catch (err) {
      alert('Failed to create report');
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <button type="submit" className="w-full bg-black text-white rounded-xl py-2 text-sm font-medium hover:bg-gray-800 transition">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </p>
        </div>
      </div>
    );
  }

  if (selectedReport) {
    const totalEngagements = selectedReport.likes + selectedReport.comments + selectedReport.shares;
    const cpe = totalEngagements > 0 ? (selectedReport.total_paid / totalEngagements).toFixed(2) : 0;
    return (
      <div className="min-h-screen bg-white p-8 font-sans">
        <button onClick={() => setSelectedReport(null)} className="mb-6 text-sm text-gray-500 hover:text-black">← Back to Dashboard</button>
        <div className="max-w-4xl mx-auto bg-gray-50 rounded-3xl p-12 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{selectedReport.campaign_name}</h1>
              <p className="text-gray-500 text-sm mt-1">Platform: {selectedReport.platform}</p>
            </div>
            <div className="bg-black text-white px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest">
              Verified Report
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Paid</p>
              <p className="text-2xl font-semibold mt-2">${selectedReport.total_paid}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Engagements</p>
              <p className="text-2xl font-semibold mt-2">{totalEngagements.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cost Per Engagement (Cpe)</p>
              <p className="text-2xl font-semibold mt-2 text-emerald-600">${cpe}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Engagement Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Views</span><span className="font-medium">{selectedReport.views.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Likes</span><span className="font-medium">{selectedReport.likes.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Comments</span><span className="font-medium">{selectedReport.comments.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Shares</span><span className="font-medium">{selectedReport.shares.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white font-bold">I</div>
            <span className="font-semibold text-lg tracking-tight">InfluencerOS</span>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'reports' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              <FileText size={18} /> My Reports
            </button>
            <button onClick={() => setActiveTab('gallery')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'gallery' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              <ImageIcon size={18} /> Brand Gallery
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'settings' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>
        <button onClick={() => { setToken(''); localStorage.removeItem('token'); }} className="text-sm text-gray-400 hover:text-black text-left px-4">
          Sign Out
        </button>
      </div>

      {/* Main View */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight capitalize">{activeTab}</h1>
          <button onClick={() => setShowCreateModal(true)} className="bg-black text-white px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition">
            <Plus size={18} /> Create New Report
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">You have {reports.length} active campaign reports saved.</p>
              </div>
              <button onClick={() => setShowCreateModal(true)} className="bg-gray-100 text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                New Campaign
              </button>
            </div>
            <h3 className="text-lg font-semibold mt-8 mb-4">Recent Reports</h3>
            <div className="grid grid-cols-2 gap-4">
              {reports.map((r) => (
                <div key={r.id} onClick={() => setSelectedReport(r)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-gray-300 transition">
                  <h4 className="font-semibold text-gray-900">{r.campaign_name}</h4>
                  <p className="text-xs text-gray-400 mt-1">Platform: {r.platform}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="p-6 font-medium">Campaign</th>
                  <th className="p-6 font-medium">Platform</th>
                  <th className="p-6 font-medium">Views</th>
                  <th className="p-6 font-medium">Total Paid</th>
                  <th className="p-6 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="p-6 font-medium text-gray-900">{r.campaign_name}</td>
                    <td className="p-6 text-gray-500">{r.platform}</td>
                    <td className="p-6 text-gray-500">{r.views.toLocaleString()}</td>
                    <td className="p-6 text-gray-500">${r.total_paid}</td>
                    <td className="p-6"><button onClick={() => setSelectedReport(r)} className="text-black font-medium hover:underline">View Report</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">Brand gallery showcases partner logos and historical collaborations.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">Manage your profile and account settings.</p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-semibold mb-6">Create New Report</h2>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Campaign Name</label>
                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Views</label>
                  <input type="number" value={views} onChange={(e) => setViews(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Likes</label>
                  <input type="number" value={likes} onChange={(e) => setLikes(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Comments</label>
                  <input type="number" value={comments} onChange={(e) => setComments(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Shares</label>
                  <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Total Paid ($)</label>
                <input type="number" step="0.01" value={totalPaid} onChange={(e) => setTotalPaid(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-black">Cancel</button>
                <button type="submit" className="bg-black text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">Save Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
