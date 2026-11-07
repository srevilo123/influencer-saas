import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, Plus, TrendingUp, DollarSign, Eye, Heart, MessageCircle, Share2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
        alert('Account created successfully! Please sign in.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Authentication failed. Please check your credentials or ensure backend is running.');
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

  useEffect(() => {
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
      <div className="min-h-screen bg-[#eef0f3] text-[#0b0c0e] font-sans flex flex-col justify-between selection:bg-[#1f2de6] selection:text-white">
        {/* Header */}
        <header className="w-full border-b border-[#e2e5ea] bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1f2de6] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">I</div>
              <span className="font-semibold text-xl tracking-tight">InfluencerOS</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#5d6470] hidden md:inline">Already tracking ROI?</span>
              <button onClick={() => setIsLogin(true)} className="text-sm font-medium hover:text-[#1f2de6] transition">Sign In</button>
            </div>
          </div>
        </header>

        {/* Hero Split Section */}
        <main className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2e5ea] text-xs font-medium text-[#1f2de6]">
                <ShieldCheck size={14} /> Verified Campaign Analytics
              </div>
              <h1 className="text-5xl lg:text-6xl font-normal tracking-tight text-[#0b0c0e] leading-[1.05]">
                Performance tracking for the modern creator.
              </h1>
              <p className="text-lg text-[#5d6470] max-w-lg leading-relaxed">
                Stop guessing your engagement. InfluencerOS turns your campaign data into professional reports that brands trust and pay for faster.
              </p>
              <div className="pt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[#5d6470]">
                  <CheckCircle2 size={16} className="text-[#1f2de6]" /> Free local history
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5d6470]">
                  <CheckCircle2 size={16} className="text-[#1f2de6]" /> Instant CPE calculation
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-[#e2e5ea] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1f2de6]/5 rounded-full blur-2xl"></div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0b0c0e] mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-[#5d6470] mb-6">
                {isLogin ? 'Enter your credentials to access your reports.' : 'Get started in seconds. No credit card required.'}
              </p>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5d6470] mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] transition"
                    placeholder="e.g. creator_pro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5d6470] mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-[#1f2de6] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#1823b8] transition shadow-sm flex items-center justify-center gap-2">
                  {isLogin ? 'Sign In to Dashboard' : 'Create Free Account'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#e2e5ea] text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-[#5d6470] hover:text-[#0b0c0e] transition">
                  {isLogin ? "Don't have an account? <span className='text-[#1f2de6] font-medium'>Sign Up</span>" : "Already have an account? <span className='text-[#1f2de6] font-medium'>Sign In</span>"}
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-[#e2e5ea] py-8 text-center text-xs text-[#5d6470]">
          <p>© 2026 InfluencerOS. Built for professional creators and talent agencies.</p>
        </footer>
      </div>
    );
  }

  if (selectedReport) {
    const totalEngagements = selectedReport.likes + selectedReport.comments + selectedReport.shares;
    const cpe = totalEngagements > 0 ? (selectedReport.total_paid / totalEngagements).toFixed(2) : 0;
    return (
      <div className="min-h-screen bg-[#eef0f3] p-10 font-sans text-[#0b0c0e]">
        <button onClick={() => setSelectedReport(null)} className="mb-6 text-sm text-[#5d6470] hover:text-[#0b0c0e] flex items-center gap-1 font-medium transition">← Back to Dashboard</button>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-12 border border-[#e2e5ea] shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#e2e5ea]">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{selectedReport.campaign_name}</h1>
              <p className="text-[#5d6470] text-sm mt-1">Platform: <span className="font-medium text-[#0b0c0e]">{selectedReport.platform}</span></p>
            </div>
            <div className="bg-[#1f2de6] text-white px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest shadow-sm">
              Verified Report
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#eef0f3]/50 p-6 rounded-2xl border border-[#e2e5ea]">
              <p className="text-xs text-[#5d6470] font-medium uppercase tracking-wider">Total Paid</p>
              <p className="text-2xl font-semibold mt-2">${selectedReport.total_paid}</p>
            </div>
            <div className="bg-[#eef0f3]/50 p-6 rounded-2xl border border-[#e2e5ea]">
              <p className="text-xs text-[#5d6470] font-medium uppercase tracking-wider">Total Engagements</p>
              <p className="text-2xl font-semibold mt-2">{totalEngagements.toLocaleString()}</p>
            </div>
            <div className="bg-[#eef0f3]/50 p-6 rounded-2xl border border-[#e2e5ea]">
              <p className="text-xs text-[#5d6470] font-medium uppercase tracking-wider">Cost Per Engagement</p>
              <p className="text-2xl font-semibold mt-2 text-[#1f2de6]">${cpe}</p>
            </div>
          </div>
          <div className="bg-[#eef0f3]/50 p-6 rounded-2xl border border-[#e2e5ea]">
            <h3 className="text-sm font-semibold text-[#0b0c0e] mb-4 uppercase tracking-wider">Engagement Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-[#e2e5ea]/50"><span className="text-[#5d6470]">Views</span><span className="font-medium">{selectedReport.views.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm py-2 border-b border-[#e2e5ea]/50"><span className="text-[#5d6470]">Likes</span><span className="font-medium">{selectedReport.likes.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm py-2 border-b border-[#e2e5ea]/50"><span className="text-[#5d6470]">Comments</span><span className="font-medium">{selectedReport.comments.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm py-2"><span className="text-[#5d6470]">Shares</span><span className="font-medium">{selectedReport.shares.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#eef0f3] font-sans text-[#0b0c0e]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-[#e2e5ea] p-6 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-[#1f2de6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">I</div>
            <span className="font-semibold text-lg tracking-tight">InfluencerOS</span>
          </div>
          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'reports' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <FileText size={18} /> My Reports
            </button>
            <button onClick={() => setActiveTab('gallery')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'gallery' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <ImageIcon size={18} /> Brand Gallery
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'settings' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>
        <button onClick={() => { setToken(''); localStorage.removeItem('token'); }} className="text-sm text-[#5d6470] hover:text-[#0b0c0e] text-left px-4 py-2 rounded-xl transition hover:bg-[#eef0f3]">
          Sign Out
        </button>
      </div>

      {/* Main View */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight capitalize">{activeTab}</h1>
            <p className="text-[#5d6470] text-sm mt-1">Manage and review your live influencer campaigns.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="bg-[#1f2de6] text-white px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 hover:bg-[#1823b8] transition shadow-sm">
            <Plus size={18} /> Create New Report
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-[#e2e5ea] shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Welcome back</h2>
                <p className="text-[#5d6470] text-sm mt-1">You have <span className="font-medium text-[#0b0c0e]">{reports.length}</span> active campaign reports saved in your vault.</p>
              </div>
              <button onClick={() => setShowCreateModal(true)} className="bg-[#eef0f3] text-[#0b0c0e] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#e2e5ea] transition">
                New Campaign
              </button>
            </div>
            <h3 className="text-lg font-semibold mt-8 mb-4">Recent Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.length === 0 ? (
                <div className="col-span-2 bg-white p-12 rounded-3xl border border-[#e2e5ea] text-center text-[#5d6470]">
                  <p>No reports found yet. Click "Create New Report" to add your first campaign!</p>
                </div>
              ) : (
                reports.map((r) => (
                  <div key={r.id} onClick={() => setSelectedReport(r)} className="bg-white p-6 rounded-2xl border border-[#e2e5ea] shadow-sm cursor-pointer hover:border-[#1f2de6] transition group">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-lg text-[#0b0c0e] group-hover:text-[#1f2de6] transition">{r.campaign_name}</h4>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#eef0f3] text-[#5d6470] font-medium">{r.platform}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#5d6470] pt-4 border-t border-[#eef0f3]">
                      <span>Views: <strong className="text-[#0b0c0e]">{r.views.toLocaleString()}</strong></span>
                      <span>Total Paid: <strong className="text-[#0b0c0e]">${r.total_paid}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-[#e2e5ea] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e5ea] text-xs text-[#5d6470] uppercase tracking-wider bg-[#eef0f3]/30">
                  <th className="p-6 font-medium">Campaign</th>
                  <th className="p-6 font-medium">Platform</th>
                  <th className="p-6 font-medium">Views</th>
                  <th className="p-6 font-medium">Total Paid</th>
                  <th className="p-6 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3] text-sm">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#eef0f3]/20 transition">
                    <td className="p-6 font-medium text-[#0b0c0e]">{r.campaign_name}</td>
                    <td className="p-6 text-[#5d6470]">{r.platform}</td>
                    <td className="p-6 text-[#5d6470]">{r.views.toLocaleString()}</td>
                    <td className="p-6 text-[#5d6470]">${r.total_paid}</td>
                    <td className="p-6"><button onClick={() => setSelectedReport(r)} className="text-[#1f2de6] font-medium hover:underline">View Report</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white p-8 rounded-3xl border border-[#e2e5ea] shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Brand Gallery</h3>
            <p className="text-[#5d6470] text-sm">Brand gallery showcases partner logos and historical collaborations across multiple networks.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-3xl border border-[#e2e5ea] shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
            <p className="text-[#5d6470] text-sm">Manage your profile, security tokens, and organization preferences.</p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl border border-[#e2e5ea]">
            <h2 className="text-xl font-semibold mb-6">Create New Report</h2>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Campaign Name</label>
                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-2.5 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-2.5 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]">
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Views</label>
                  <input type="number" value={views} onChange={(e) => setViews(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-2.5 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Likes</label>
                  <input type="number" value={likes} onChange={(e) => setLikes(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-2.5 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Comments</label>
                  <input type="number" value={comments} onChange={(e) => setComments(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-2.5 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Shares</label>
                  <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-2.5 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Total Paid ($)</label>
                <input type="number" step="0.01" value={totalPaid} onChange={(e) => setTotalPaid(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-2.5 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]" required />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e2e5ea]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#5d6470] hover:text-[#0b0c0e]">Cancel</button>
                <button type="submit" className="bg-[#1f2de6] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1823b8] transition shadow-sm">Save Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
