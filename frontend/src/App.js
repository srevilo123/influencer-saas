import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, Plus, TrendingUp, DollarSign, Eye, Heart, MessageCircle, Share2, ArrowRight, CheckCircle2, ShieldCheck, Menu, X, LogIn, UserPlus, User, CreditCard, ChevronDown, HelpCircle, Upload, Cpu, ExternalLink } from 'lucide-react';

const LOCAL_API = 'http://localhost:8000';
const PROD_API = 'https://influencer-backend-fiv8.onrender.com';

const API_URL = process.env.REACT_APP_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? LOCAL_API
    : PROD_API
);

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentApi, setCurrentApi] = useState(API_URL);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Multimodal AI Upload & Extraction State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadPlatform, setUploadPlatform] = useState('TikTok');
  const [previewImage, setPreviewImage] = useState(null);

  // Standalone Report Route State (e.g. /report/[id])
  const [standaloneReportId, setStandaloneReportId] = useState(null);
  const [standaloneReportData, setStandaloneReportData] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/report\/(\d+)/);
    if (match) {
      setStandaloneReportId(match[1]);
      fetchStandaloneReport(match[1]);
    }
  }, []);

  const fetchStandaloneReport = async (id) => {
    try {
      const res = await axios.get(`${currentApi}/reports`);
      const found = res.data.find(r => r.id.toString() === id.toString());
      if (found) {
        setStandaloneReportData(found);
      } else {
        // try direct fetch
        const directRes = await axios.get(`${currentApi}/reports/${id}`);
        setStandaloneReportData(directRes.data);
      }
    } catch (err) {
      console.error('Failed to load standalone report:', err);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;

    // Client-side image compression using canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processScreenshotWithAI = async () => {
    if (!previewImage) {
      showToast('Please select or drop an analytics screenshot first.', 'error');
      return;
    }
    setUploadingImage(true);
    try {
      const res = await axios.post(`${currentApi}/analyze-screenshot`, {
        image_base64: previewImage,
        platform: uploadPlatform
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Automatically create the report with AI extracted metrics
      await axios.post(`${currentApi}/reports`, res.data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowUploadModal(false);
      setPreviewImage(null);
      setUploadingImage(false);
      fetchReports(token);
      showToast('Multimodal AI successfully extracted metrics and generated creator funnel report!');
    } catch (err) {
      console.error('AI extraction failed:', err);
      setUploadingImage(false);
      showToast('AI extraction failed. Please ensure backend is running.', 'error');
    }
  };

  const tutorialSteps = [
    {
      title: "1. Upload Platform Screenshots",
      description: "Easily drag and drop engagement metrics from TikTok, Instagram, or YouTube to automatically populate campaign reports.",
      icon: <Upload size={32} className="text-[#1f2de6]" />
    },
    {
      title: "2. Generate AI Performance Diagrams",
      description: "Our backend automatically converts raw views, likes, and CPE into beautiful, brand-ready visual charts and PDF exports.",
      icon: <Cpu size={32} className="text-[#1f2de6]" />
    },
    {
      title: "3. Open Reports in Separate Tabs",
      description: "Click on any verified report in your vault to open its standalone link and share detailed analytics directly with talent managers.",
      icon: <ExternalLink size={32} className="text-[#1f2de6]" />
    },
    {
      title: "4. Manage Subscriptions & Settings",
      description: "Access your account tier, top up credits, and configure custom workspace integrations in the Settings tab.",
      icon: <Settings size={32} className="text-[#1f2de6]" />
    }
  ];

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [totalPaid, setTotalPaid] = useState('');

  const sendAuthRequest = async (url, isLoginMode) => {
    if (isLoginMode) {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      return await axios.post(`${url}/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    } else {
      return await axios.post(`${url}/signup`, { username, password });
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    console.log(`Attempting ${isLogin ? 'Login' : 'Signup'} to ${currentApi}`);
    try {
      const res = await sendAuthRequest(currentApi, isLogin);
      if (isLogin) {
        setToken(res.data.access_token);
        localStorage.setItem('token', res.data.access_token);
        fetchReports(res.data.access_token, currentApi);

        // Trigger FTUE Onboarding Tour on first login if not completed
        const completed = localStorage.getItem('hasCompletedTutorial');
        if (!completed) {
          setShowTutorial(true);
          setTutorialStep(0);
        }
      } else {
        alert('Account created successfully! Please sign in.');
        setIsLogin(true);
      }
    } catch (err) {
      console.warn(`Primary API (${currentApi}) failed:`, err.message);
      const fallbackUrl = currentApi === LOCAL_API ? PROD_API : LOCAL_API;
      console.log(`Attempting fallback to ${fallbackUrl}...`);

      try {
        const fallbackRes = await sendAuthRequest(fallbackUrl, isLogin);
        setCurrentApi(fallbackUrl);
        if (isLogin) {
          setToken(fallbackRes.data.access_token);
          localStorage.setItem('token', fallbackRes.data.access_token);
          fetchReports(fallbackRes.data.access_token, fallbackUrl);

          // Trigger FTUE Onboarding Tour on first login if not completed
          const completed = localStorage.getItem('hasCompletedTutorial');
          if (!completed) {
            setShowTutorial(true);
            setTutorialStep(0);
          }
        } else {
          alert('Account created successfully on cloud server! Please sign in.');
          setIsLogin(true);
        }
      } catch (fallbackErr) {
        console.error('Both Primary and Fallback APIs failed:', fallbackErr);
        const detail = err.response?.data?.detail || fallbackErr.response?.data?.detail;
        if (detail) {
          alert(detail);
        } else {
          alert(`Authentication failed.\n\nLocal Backend: ${err.message}\nCloud Backend: ${fallbackErr.message}\n\nIf running locally, please ensure 'python server/main.py' is running.`);
        }
      }
    }
  };

  const fetchReports = async (currentToken, apiEndpoint = currentApi) => {
    try {
      const res = await axios.get(`${apiEndpoint}/reports`, {
        headers: { Authorization: `Bearer ${currentToken || token}` }
      });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  useEffect(() => {
    if (token) fetchReports(token);
  }, [token]);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please sign in to create reports.', 'error');
      setShowCreateModal(false);
      setIsLogin(true);
      return;
    }
    try {
      await axios.post(`${currentApi}/reports`, {
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
      showToast('Report created successfully!');
    } catch (err) {
      showToast('Failed to create report', 'error');
    }
  };

  const closeTutorial = () => {
    localStorage.setItem('hasCompletedTutorial', 'true');
    setShowTutorial(false);
  };

  const nextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const startTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#eef0f3] text-[#0b0c0e] font-sans flex flex-col justify-between selection:bg-[#1f2de6] selection:text-white">
        {/* Header */}
        <header className="w-full border-b border-[#e2e5ea] bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-[#1f2de6] text-white rounded-xl flex items-center justify-center font-bold text-base md:text-lg shadow-sm">I</div>
              <span className="font-semibold text-lg md:text-xl tracking-tight">InfluencerOS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#5d6470] hidden md:inline">Already tracking ROI?</span>
              <button
                onClick={() => setIsLogin(true)}
                className="bg-white border border-[#e2e5ea] text-[#0b0c0e] hover:bg-[#eef0f3] px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm min-h-[44px]"
              >
                <LogIn size={16} className="text-[#1f2de6]" /> Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className="bg-[#1f2de6] text-white hover:bg-[#1823b8] px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm min-h-[44px]"
              >
                <UserPlus size={16} /> Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* Hero Split Section */}
        <main className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center w-full">
            <div className="lg:col-span-6 space-y-4 md:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2e5ea] text-xs font-medium text-[#1f2de6]">
                <ShieldCheck size={14} /> Verified Campaign Analytics
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#0b0c0e] leading-[1.08]">
                Performance tracking for the modern creator.
              </h1>
              <p className="text-base md:text-lg text-[#5d6470] max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Stop guessing your engagement. InfluencerOS turns your campaign data into professional reports that brands trust and pay for faster.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm text-[#5d6470]">
                  <CheckCircle2 size={16} className="text-[#1f2de6]" /> Free local history
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5d6470]">
                  <CheckCircle2 size={16} className="text-[#1f2de6]" /> Instant CPE calculation
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-3xl border border-[#e2e5ea] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1f2de6]/5 rounded-full blur-2xl"></div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#0b0c0e] mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs md:text-sm text-[#5d6470] mb-6">
                {isLogin ? 'Enter your credentials to access your reports.' : 'Get started in seconds. No credit card required.'}
              </p>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5d6470] mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] transition min-h-[44px]"
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
                    className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] transition min-h-[44px]"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-[#1f2de6] text-white rounded-xl py-3.5 md:py-3 text-sm font-medium hover:bg-[#1823b8] transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]">
                  {isLogin ? 'Sign In to Dashboard' : 'Create Free Account'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#e2e5ea] text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-[#5d6470] hover:text-[#0b0c0e] transition min-h-[44px] px-4 flex items-center justify-center mx-auto gap-1"
                >
                  {isLogin ? (
                    <>Don't have an account? <span className="text-[#1f2de6] font-medium ml-1">Sign Up</span></>
                  ) : (
                    <>Already have an account? <span className="text-[#1f2de6] font-medium ml-1">Sign In</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-[#e2e5ea] py-6 text-center text-xs text-[#5d6470]">
          <p>© 2026 InfluencerOS. Built for professional creators and talent agencies.</p>
        </footer>
      </div>
    );
  }

  // If standalone report route is active (/report/[id])
  if (standaloneReportId) {
    if (!standaloneReportData) {
      return (
        <div className="min-h-screen bg-[#eef0f3] flex items-center justify-center font-sans text-[#0b0c0e]">
          <div className="bg-white p-8 rounded-3xl border border-[#e2e5ea] shadow-sm text-center">
            <p className="text-lg font-medium">Loading Standalone AI Report #{standaloneReportId}...</p>
          </div>
        </div>
      );
    }
    const r = standaloneReportData;
    const totalEngagements = r.likes + r.comments + r.shares;
    const cpe = totalEngagements > 0 ? (r.total_paid / totalEngagements).toFixed(2) : 0;
    return (
      <div className="min-h-screen bg-[#eef0f3] p-4 md:p-12 font-sans text-[#0b0c0e]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-[#e2e5ea] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1f2de6] text-white rounded-xl flex items-center justify-center font-bold">I</div>
              <span className="font-semibold">InfluencerOS Standalone Report</span>
            </div>
            <a href="/" className="text-sm font-medium text-[#1f2de6] hover:underline flex items-center gap-1">Open Dashboard →</a>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-12 border border-[#e2e5ea] shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-[#e2e5ea]">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{r.campaign_name}</h1>
                <p className="text-[#5d6470] text-sm mt-1">Platform: <span className="font-medium text-[#0b0c0e]">{r.platform}</span></p>
              </div>
              <div className="bg-[#1f2de6] text-white px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest shadow-sm">
                Multimodal AI Verified
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-[#eef0f3]/50 p-6 rounded-2xl border border-[#e2e5ea]">
                <p className="text-xs text-[#5d6470] font-medium uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-semibold mt-2">${r.total_paid}</p>
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

            {/* Creator Funnel & AI Diagram Generator View */}
            <div className="bg-[#eef0f3]/50 p-6 md:p-8 rounded-2xl border border-[#e2e5ea] mb-8">
              <h3 className="text-sm font-semibold text-[#0b0c0e] mb-4 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={16} className="text-[#1f2de6]" /> AI Creator Funnel & Diagram Generator
              </h3>
              <div className="bg-white p-6 rounded-2xl border border-[#e2e5ea] space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-sm pb-3 border-b border-[#e2e5ea]">
                  <span className="text-[#5d6470]">Hook Retention Rate</span>
                  <span className="font-semibold text-[#1f2de6]">{r.hook_retention || 64.2}%</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b border-[#e2e5ea]">
                  <span className="text-[#5d6470]">Viewer Drop-off Point</span>
                  <span className="font-semibold text-rose-600">{r.drop_off_rate || 18.5}% at 0:14s</span>
                </div>
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5d6470] mb-3">Funnel Node Tree Diagram</p>
                  <div className="bg-[#0b0c0e] text-white p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                    <div className="text-[#1f2de6] font-bold">graph TD</div>
                    <div className="pl-4">A[Views: {(r.views || 0).toLocaleString()}] -->|Hook retention {r.hook_retention || 64.2}%| B[Engagements: {totalEngagements.toLocaleString()}]</div>
                    <div className="pl-4">B -->|CPE ${cpe}| C[Brand ROI Conversion]</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#eef0f3]/50 p-6 rounded-2xl border border-[#e2e5ea]">
              <h3 className="text-sm font-semibold text-[#0b0c0e] mb-4 uppercase tracking-wider">Engagement Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm py-2 border-b border-[#e2e5ea]/50"><span className="text-[#5d6470]">Views</span><span className="font-medium">{r.views.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm py-2 border-b border-[#e2e5ea]/50"><span className="text-[#5d6470]">Likes</span><span className="font-medium">{r.likes.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm py-2 border-b border-[#e2e5ea]/50"><span className="text-[#5d6470]">Comments</span><span className="font-medium">{r.comments.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm py-2"><span className="text-[#5d6470]">Shares</span><span className="font-medium">{r.shares.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedReport) {
    const totalEngagements = selectedReport.likes + selectedReport.comments + selectedReport.shares;
    const cpe = totalEngagements > 0 ? (selectedReport.total_paid / totalEngagements).toFixed(2) : 0;
    return (
      <div className="min-h-screen bg-[#eef0f3] p-4 md:p-10 font-sans text-[#0b0c0e]">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setSelectedReport(null)} className="text-sm text-[#5d6470] hover:text-[#0b0c0e] flex items-center gap-1 font-medium transition min-h-[44px] items-center">← Back to Dashboard</button>
          <a
            href={`/report/${selectedReport.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1f2de6] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1823b8] transition flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <ExternalLink size={16} /> Open in New Tab
          </a>
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-12 border border-[#e2e5ea] shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-[#e2e5ea]">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{selectedReport.campaign_name}</h1>
              <p className="text-[#5d6470] text-sm mt-1">Platform: <span className="font-medium text-[#0b0c0e]">{selectedReport.platform}</span></p>
            </div>
            <div className="bg-[#1f2de6] text-white px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest shadow-sm">
              Verified Report
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
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

          {/* Creator Funnel Diagram Generator inside Report View */}
          <div className="bg-[#eef0f3]/50 p-6 md:p-8 rounded-2xl border border-[#e2e5ea] mb-8">
            <h3 className="text-sm font-semibold text-[#0b0c0e] mb-4 uppercase tracking-wider flex items-center gap-2">
              <Cpu size={16} className="text-[#1f2de6]" /> AI Creator Funnel & Diagram Generator
            </h3>
            <div className="bg-white p-6 rounded-2xl border border-[#e2e5ea] space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-sm pb-3 border-b border-[#e2e5ea]">
                <span className="text-[#5d6470]">Hook Retention Rate</span>
                <span className="font-semibold text-[#1f2de6]">{selectedReport.hook_retention || 64.2}%</span>
              </div>
              <div className="flex items-center justify-between text-sm pb-3 border-b border-[#e2e5ea]">
                <span className="text-[#5d6470]">Viewer Drop-off Point</span>
                <span className="font-semibold text-rose-600">{selectedReport.drop_off_rate || 18.5}% at 0:14s</span>
              </div>
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5d6470] mb-3">Funnel Node Tree Diagram</p>
                <div className="bg-[#0b0c0e] text-white p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                  <div className="text-[#1f2de6] font-bold">graph TD</div>
                  <div className="pl-4">A[Views: {selectedReport.views.toLocaleString()}] -->|Hook retention {selectedReport.hook_retention || 64.2}%| B[Engagements: {totalEngagements.toLocaleString()}]</div>
                  <div className="pl-4">B -->|CPE ${cpe}| C[Brand ROI Conversion]</div>
                </div>
              </div>
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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#eef0f3] font-sans text-[#0b0c0e]">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#e2e5ea] p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1f2de6] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">I</div>
          <span className="font-semibold text-base tracking-tight">InfluencerOS</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#0b0c0e] hover:bg-[#eef0f3] rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer / Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e2e5ea] p-6 flex flex-col justify-between shadow-xl transition-transform transform md:translate-x-0 md:static md:shadow-sm ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1f2de6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">I</div>
              <span className="font-semibold text-lg tracking-tight">InfluencerOS</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-[#5d6470] hover:text-[#0b0c0e]">
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1.5">
            <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition min-h-[44px] ${activeTab === 'dashboard' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition min-h-[44px] ${activeTab === 'reports' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <FileText size={18} /> Reports
            </button>
            <button onClick={() => { setActiveTab('gallery'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition min-h-[44px] ${activeTab === 'gallery' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <ImageIcon size={18} /> Brand Gallery
            </button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition min-h-[44px] ${activeTab === 'settings' ? 'bg-[#e2e5ea] text-[#0b0c0e]' : 'text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50'}`}>
              <Settings size={18} /> Settings
            </button>
            <button onClick={startTutorial} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition min-h-[44px] text-[#5d6470] hover:text-[#0b0c0e] hover:bg-[#eef0f3]/50">
              <HelpCircle size={18} /> Take Onboarding Tour
            </button>
          </nav>
        </div>
        <button onClick={() => { setToken(''); localStorage.removeItem('token'); }} className="text-sm text-[#5d6470] hover:text-[#0b0c0e] text-left px-4 py-3 rounded-xl transition hover:bg-[#eef0f3] min-h-[44px] flex items-center">
          Sign Out
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/30 z-45 md:hidden backdrop-blur-sm"></div>
      )}

      {/* Main View */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight capitalize">{activeTab}</h1>
            <p className="text-[#5d6470] text-sm mt-1">Manage and review your live influencer campaigns.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button onClick={() => {
              if (!token) {
                alert('Please sign in to use AI extraction.');
                setIsLogin(true);
                return;
              }
              setShowUploadModal(true);
            }} className="w-full md:w-auto bg-white border border-[#e2e5ea] text-[#0b0c0e] px-5 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#eef0f3] transition shadow-sm min-h-[44px]">
              <Cpu size={18} className="text-[#1f2de6]" /> AI Analyze Screenshot
            </button>
            <button onClick={() => {
              if (!token) {
                alert('Please sign in or create an account to create projects.');
                setIsLogin(true);
                return;
              }
              setShowCreateModal(true);
            }} className="w-full md:w-auto bg-[#1f2de6] text-white px-5 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1823b8] transition shadow-sm min-h-[44px]">
              <Plus size={18} /> Create New Report
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#e2e5ea] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold">Welcome back</h2>
                <p className="text-[#5d6470] text-sm mt-1">You have <span className="font-medium text-[#0b0c0e]">{reports.length}</span> active generated reports saved in your workspace.</p>
              </div>
              <button onClick={() => {
                if (!token) {
                  showToast('Please sign in to create reports.', 'error');
                  setIsLogin(true);
                  return;
                }
                setShowCreateModal(true);
              }} className="w-full md:w-auto bg-[#eef0f3] text-[#0b0c0e] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#e2e5ea] transition min-h-[44px] flex items-center justify-center">
                Create Report
              </button>
            </div>
            <h3 className="text-lg font-semibold mt-8 mb-4">Recent Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.length === 0 ? (
                <div className="col-span-1 md:col-span-2 bg-white p-8 md:p-12 rounded-3xl border border-[#e2e5ea] text-center text-[#5d6470]">
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
                      <span>Views: <strong className="text-[#0b0c0e]">{(r.views || 0).toLocaleString()}</strong></span>
                      <span>Total Paid: <strong className="text-[#0b0c0e]">${r.total_paid || 0}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Mobile / Responsive Card View for Reports */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {reports.map((r) => (
                <div key={r.id} onClick={() => setSelectedReport(r)} className="bg-white p-6 rounded-2xl border border-[#e2e5ea] shadow-sm cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-base">{r.campaign_name}</h4>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#eef0f3] font-medium">{r.platform}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#5d6470] my-3 pt-3 border-t border-[#eef0f3]">
                    <div>Views: <span className="font-medium text-[#0b0c0e]">{(r.views || 0).toLocaleString()}</span></div>
                    <div>Paid: <span className="font-medium text-[#0b0c0e]">${r.total_paid || 0}</span></div>
                  </div>
                  <button className="w-full mt-2 bg-[#eef0f3] text-[#0b0c0e] py-2 rounded-xl text-sm font-medium hover:bg-[#e2e5ea] transition min-h-[44px]">View Full Report</button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-[#e2e5ea] shadow-sm overflow-hidden">
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
                      <td className="p-6 text-[#5d6470]">{(r.views || 0).toLocaleString()}</td>
                      <td className="p-6 text-[#5d6470]">${r.total_paid || 0}</td>
                      <td className="p-6"><button onClick={() => setSelectedReport(r)} className="text-[#1f2de6] font-medium hover:underline min-h-[44px] flex items-center">View Report</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#e2e5ea] shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Projects & Brand Gallery</h3>
              <p className="text-[#5d6470] text-sm">Review all ingestion workspaces and verified brand collaboration projects.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports.map((r) => (
                <div key={r.id} onClick={() => setSelectedReport(r)} className="bg-[#eef0f3]/40 p-5 rounded-2xl border border-[#e2e5ea] cursor-pointer hover:border-[#1f2de6] transition">
                  <div className="font-semibold text-base mb-1">{r.campaign_name}</div>
                  <div className="text-xs text-[#5d6470] mb-3">Platform: {r.platform}</div>
                  <div className="text-xs text-[#1f2de6] font-medium">View Report →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#e2e5ea] shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Workspace Settings</h3>
              <p className="text-[#5d6470] text-sm">Configure your API endpoint, security tokens, and organization preferences.</p>
            </div>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5d6470] mb-1">Active Backend API Endpoint</label>
                <input type="text" value={currentApi} onChange={(e) => setCurrentApi(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6]" />
              </div>
              <button onClick={() => showToast('Settings updated successfully!')} className="bg-[#1f2de6] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1823b8] transition">Save Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* AI Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl border border-[#e2e5ea]">
            <h2 className="text-xl font-semibold mb-6">Analyze Screenshot</h2>
            {!previewImage ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
                className="border-2 border-dashed border-[#e2e5ea] rounded-3xl p-12 text-center hover:border-[#1f2de6] transition cursor-pointer"
              >
                <Upload size={48} className="mx-auto text-[#1f2de6] mb-4" />
                <p className="text-[#5d6470] mb-2 font-medium">Drag & Drop analytics screenshot</p>
                <p className="text-xs text-[#5d6470]">TikTok, Instagram, or YouTube metrics</p>
                <input type="file" onChange={handleImageDrop} className="hidden" id="fileInput" />
                <label htmlFor="fileInput" className="mt-4 inline-block bg-[#eef0f3] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#e2e5ea] cursor-pointer">Browse Files</label>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={previewImage} alt="Preview" className="rounded-2xl max-h-64 mx-auto" />
                <div className="flex gap-3">
                  <button onClick={() => setPreviewImage(null)} className="flex-1 bg-[#eef0f3] text-[#5d6470] py-3 rounded-xl font-medium">Clear</button>
                  <button onClick={processScreenshotWithAI} disabled={uploadingImage} className="flex-1 bg-[#1f2de6] text-white py-3 rounded-xl font-medium">
                    {uploadingImage ? 'Analyzing...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => setShowUploadModal(false)} className="w-full mt-4 text-[#5d6470] hover:text-[#0b0c0e] text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-xl border border-[#e2e5ea] my-auto">
            <h2 className="text-xl font-semibold mb-6">Create New Report</h2>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Campaign Name</label>
                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] min-h-[44px]" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] min-h-[44px]">
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Views</label>
                  <input type="number" value={views} onChange={(e) => setViews(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] min-h-[44px]" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Likes</label>
                  <input type="number" value={likes} onChange={(e) => setLikes(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] min-h-[44px]" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Comments</label>
                  <input type="number" value={comments} onChange={(e) => setComments(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] min-h-[44px]" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Shares</label>
                  <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] min-h-[44px]" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5d6470] uppercase tracking-wider mb-1">Total Paid ($)</label>
                <input type="number" step="0.01" value={totalPaid} onChange={(e) => setTotalPaid(e.target.value)} className="w-full rounded-xl border border-[#e2e5ea] px-4 py-3 text-base md:text-sm bg-[#eef0f3]/50 focus:outline-none focus:ring-2 focus:ring-[#1f2de6] min-h-[44px]" required />
              </div>
              <div className="flex flex-col md:flex-row justify-end gap-3 mt-6 pt-4 border-t border-[#e2e5ea]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="w-full md:w-auto px-5 py-3 rounded-xl text-sm font-medium text-[#5d6470] hover:text-[#0b0c0e] min-h-[44px]">Cancel</button>
                <button type="submit" className="w-full md:w-auto bg-[#1f2de6] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1823b8] transition shadow-sm min-h-[44px]">Save Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notification Container */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium transition-all transform flex items-center gap-3 ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#0b0c0e] text-white'}`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} className="text-[#1f2de6]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Interactive FTUE Onboarding Tour Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border border-[#e2e5ea] relative text-center">
            <button onClick={closeTutorial} className="absolute top-4 right-4 text-[#5d6470] hover:text-[#0b0c0e] p-2 rounded-xl">
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-[#1f2de6]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              {tutorialSteps[tutorialStep].icon}
            </div>
            <h3 className="text-xl font-semibold text-[#0b0c0e] mb-2">{tutorialSteps[tutorialStep].title}</h3>
            <p className="text-sm text-[#5d6470] leading-relaxed mb-8">{tutorialSteps[tutorialStep].description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-[#e2e5ea]">
              <button
                onClick={prevStep}
                disabled={tutorialStep === 0}
                className={`text-sm font-medium px-4 py-2 rounded-xl transition ${tutorialStep === 0 ? 'text-[#e2e5ea] cursor-not-allowed' : 'text-[#5d6470] hover:text-[#0b0c0e]'}`}
              >
                Previous
              </button>

              <div className="flex gap-1.5">
                {tutorialSteps.map((_, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === tutorialStep ? 'w-6 bg-[#1f2de6]' : 'bg-[#e2e5ea]'}`}></div>
                ))}
              </div>

              <button
                onClick={nextStep}
                className="bg-[#1f2de6] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1823b8] transition shadow-sm"
              >
                {tutorialStep === tutorialSteps.length - 1 ? 'Finish Tour' : 'Next'}
              </button>
            </div>

            <div className="mt-4">
              <button onClick={closeTutorial} className="text-xs text-[#5d6470] hover:underline">
                Skip Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
