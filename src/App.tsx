/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { 
  LayoutDashboard, 
  Files, 
  Upload, 
  BarChart3, 
  Settings, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Menu,
  X,
  Globe,
  Database,
  Zap,
  Activity,
  Shield,
  Network,
  Server,
  Cpu,
  Lock,
  Wifi,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import IntroPage from './components/IntroPage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Types ---

declare global {
  interface Window {
    puter: any;
  }
}

interface CDNFile {
  name: string;
  size: number;
  modified: Date;
  type: string;
  url: string;
}

interface Stats {
  totalAssets: number;
  storageUsed: number;
  cacheHitRate: number;
  requestsServed: number;
}

// --- Utils ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void, key?: React.Key }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 50, x: '-50%' }}
    className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 glass-card",
      type === 'success' ? "border-emerald-500/50" : "border-red-500/50"
    )}
  >
    {type === 'success' ? <CheckCircle2 className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-red-500 w-5 h-5" />}
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 hover:text-white/70">
      <X size={16} />
    </button>
  </motion.div>
);

interface LogEntry {
  id: string;
  type: 'NETWORK' | 'CACHE_HIT' | 'CACHE_MISS' | 'CACHE_STORED' | 'ERROR' | 'SYSTEM';
  message: string;
  timestamp: number;
  details?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'upload' | 'analytics' | 'dns' | 'security' | 'network' | 'logs' | 'cache' | 'settings'>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cachedUrls, setCachedUrls] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 1024 : true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cdnDomain, setCdnDomain] = useState<string>('');
  const [files, setFiles] = useState<CDNFile[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAssets: 0,
    storageUsed: 0,
    cacheHitRate: 84.2, // Simulated
    requestsServed: 1240 // Simulated
  });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'error' }[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
      details
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  }, []);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const types: LogEntry['type'][] = ['CACHE_HIT', 'CACHE_MISS', 'NETWORK', 'SYSTEM'];
      const type = types[Math.floor(Math.random() * types.length)];
      const paths = ['/assets/main.js', '/images/hero.webp', '/api/v1/config', '/styles/global.css', '/fonts/inter.woff2'];
      const path = paths[Math.floor(Math.random() * paths.length)];
      const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Singapore', 'Mumbai'];
      const city = cities[Math.floor(Math.random() * cities.length)];

      addLog(type, `${type}: ${path}`, `Edge Node: ${city} • Latency: ${Math.floor(Math.random() * 50) + 5}ms`);
      
      if (type === 'CACHE_HIT' || type === 'CACHE_MISS') {
        setStats(prev => ({ ...prev, requestsServed: prev.requestsServed + 1 }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, addLog]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    addLog(type === 'success' ? 'SYSTEM' : 'ERROR', message);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const [initError, setInitError] = useState<string | null>(null);

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  // --- Puter Initialization ---

  const initCDN = useCallback(async () => {
    console.log("Initializing Vayu Edge...");
    try {
      if (!window.puter) {
        // Try to wait for a few more milliseconds in case of race condition
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!window.puter) {
          throw new Error("Vayu Edge engine (Puter SDK) could not be found. Please check your internet connection or disable any ad-blockers that might be blocking 'js.puter.com'.");
        }
      }

      // Check authentication
      const signedIn = await window.puter.auth.isSignedIn();
      setIsSignedIn(signedIn);
      
      if (!signedIn) {
        console.log("User not signed in to Vayu Cloud");
        setIsLoaded(true);
        setLoading(false);
        return;
      }

      // 1. Ensure /cdn directory exists
      addLog('SYSTEM', 'Initializing CDN infrastructure...', 'Checking /cdn directory');
      try {
        await window.puter.fs.stat("cdn");
        addLog('SYSTEM', '/cdn directory verified');
      } catch (e) {
        addLog('SYSTEM', 'Creating /cdn directory...');
        await window.puter.fs.mkdir("cdn");
      }
      // 2. Setup hosting
      addLog('SYSTEM', 'Configuring edge hosting...');
      let sites = await window.puter.hosting.list();
      let domain = "";

      if (sites.length === 0) {
        addLog('SYSTEM', 'Creating new edge subdomain...');
        const subdomain = "cdn-" + Math.random().toString(36).substring(2, 8);
        const site = await window.puter.hosting.create(subdomain, "cdn");
        domain = site.subdomain + ".puter.site";
      } else {
        domain = sites[0].subdomain + ".puter.site";
      }

      addLog('SYSTEM', 'Edge domain active', domain);
      setCdnDomain(domain);
      localStorage.setItem("cdnDomain", domain);
      await refreshFiles();
      setIsLoaded(true);
    } catch (error: any) {
      console.error("Init error:", error);
      setInitError(error.message || "Unknown initialization error");
      addToast("Failed to initialize CDN infrastructure", "error");
      // Still set loaded to true so user can see the UI even if it's partially broken
      setIsLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignIn = async () => {
    if (!window.puter) {
      addToast("Vayu Edge engine not loaded yet. Please wait.", "error");
      return;
    }
    try {
      addLog('SYSTEM', 'Attempting Vayu Cloud authentication...');
      await window.puter.auth.signIn();
      const signedIn = await window.puter.auth.isSignedIn();
      setIsSignedIn(signedIn);
      if (signedIn) {
        addLog('SYSTEM', 'Authentication successful');
        initCDN();
      }
    } catch (error) {
      addLog('ERROR', 'Authentication failed', (error as Error).message);
      addToast("Failed to sign in to Vayu Cloud", "error");
    }
  };

  const handleSignOut = async () => {
    if (!window.puter) return;
    try {
      addLog('SYSTEM', 'Signing out from Vayu Cloud...');
      await window.puter.auth.signOut();
      setIsSignedIn(false);
      setFiles([]);
      setCdnDomain("");
      addToast("Signed out successfully", "success");
    } catch (error) {
      addLog('ERROR', 'Sign out failed', (error as Error).message);
      addToast("Failed to sign out", "error");
    }
  };

  const refreshFiles = async () => {
    try {
      if (!window.puter) return;
      addLog('NETWORK', 'Fetching asset list from edge storage...');
      const items = await window.puter.fs.readdir("cdn");
      const cdnFiles: CDNFile[] = items.map((item: any) => ({
        name: item.name,
        size: item.size || 0,
        modified: new Date(item.modified),
        type: item.name.split('.').pop() || 'file',
        url: `https://${cdnDomain}/${item.name}`
      }));
      setFiles(cdnFiles);
      addLog('SYSTEM', `Asset list updated: ${cdnFiles.length} files found`);
      
      const totalSize = cdnFiles.reduce((acc, f) => acc + f.size, 0);
      setStats(prev => ({
        ...prev,
        totalAssets: cdnFiles.length,
        storageUsed: totalSize
      }));
    } catch (error) {
      addLog('ERROR', 'Failed to refresh asset list', (error as Error).message);
      console.error("Refresh error:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width > 1024) {
        setIsSidebarOpen(true);
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds

    const checkPuter = setInterval(() => {
      attempts++;
      if (window.puter) {
        clearInterval(checkPuter);
        initCDN();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkPuter);
        setInitError("Vayu Edge engine failed to load. Some features may be unavailable.");
        setIsLoaded(true);
        setLoading(false);
      }
    }, 100);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          addLog('SYSTEM', 'Edge Service Worker registered', registration.scope);
        })
        .catch((error) => {
          addLog('ERROR', 'Edge Service Worker registration failed', error.message);
        });

      // Listen for messages from Service Worker
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'EDGE_EVENT') {
          const { event: edgeEvent, url, status } = event.data;
          addLog(edgeEvent as LogEntry['type'], `${edgeEvent}: ${url}`, `Status: ${status}`);
          
          // Update stats if it's a hit/miss
          if (edgeEvent === 'CACHE_HIT') {
            setStats(prev => ({ ...prev, requestsServed: prev.requestsServed + 1 }));
          } else if (edgeEvent === 'CACHE_MISS') {
            setStats(prev => ({ ...prev, requestsServed: prev.requestsServed + 1 }));
          }
        } else if (event.data && event.data.type === 'CACHE_LIST') {
          setCachedUrls(event.data.urls);
        } else if (event.data && event.data.type === 'CACHE_ITEM_DELETED') {
          addLog('SYSTEM', 'Cache item deleted', event.data.url);
          refreshCacheList();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        clearInterval(checkPuter);
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }

    return () => clearInterval(checkPuter);
  }, [initCDN, addLog]);

  const refreshCacheList = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'LIST_CACHE' });
    }
  };

  const deleteCacheItem = (url: string) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'DELETE_CACHE_ITEM', url });
    }
  };

  useEffect(() => {
    if (activeTab === 'cache') {
      refreshCacheList();
    }
  }, [activeTab]);

  // --- Handlers ---

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    if (!window.puter) {
      addToast("Vayu engine not ready. Please wait.", "error");
      return;
    }
    const filesArray = Array.from(fileList);
    
    for (const file of filesArray) {
      // Validation
      if (file.size > 20 * 1024 * 1024) {
        addToast(`${file.name} exceeds 20MB limit`, "error");
        continue;
      }

      const allowedTypes = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'js', 'css', 'json', 'woff', 'woff2'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedTypes.includes(ext)) {
        addToast(`File type .${ext} not allowed`, "error");
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        addLog('NETWORK', `Uploading ${file.name} to edge...`, `Size: ${formatSize(file.size)}`);
        
        // Puter.js upload
        await window.puter.fs.upload(file, "cdn");
        
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
        
        addLog('SYSTEM', `Upload complete: ${file.name}`);
        addToast(`${file.name} uploaded successfully`, "success");
      } catch (error) {
        addLog('ERROR', `Upload failed: ${file.name}`, (error as Error).message);
        console.error("Upload error:", error);
        addToast(`Failed to upload ${file.name}`, "error");
      }
    }
    await refreshFiles();
  };

  const handleDelete = async (filename: string) => {
    if (!window.puter) {
      addToast("Vayu engine not ready", "error");
      return;
    }
    try {
      addLog('NETWORK', `Deleting ${filename} from edge storage...`);
      await window.puter.fs.delete(`cdn/${filename}`);
      addLog('SYSTEM', `File deleted: ${filename}`);
      addToast("File deleted", "success");
      await refreshFiles();
    } catch (error) {
      addLog('ERROR', `Delete failed: ${filename}`, (error as Error).message);
      addToast("Failed to delete file", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("URL copied to clipboard", "success");
  };

  const clearCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      addToast("Edge cache cleared", "success");
    }
  };

  // --- Render Helpers ---

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => {
    const isCollapsed = !isSidebarOpen && windowWidth > 1024;
    return (
      <button
        onClick={() => {
          setActiveTab(id);
          if (windowWidth < 1024) setIsMobileMenuOpen(false);
        }}
        className={cn(
          "w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden py-3",
          isCollapsed ? "justify-center px-0" : "justify-start px-4 gap-3",
          activeTab === id 
            ? "bg-accent text-white shadow-[0_0_20px_rgba(79,140,255,0.3)]" 
            : "text-white/50 hover:text-white hover:bg-white/5"
        )}
        title={isCollapsed ? label : undefined}
      >
        {activeTab === id && (
          <motion.div 
            layoutId="active-pill"
            className="absolute inset-0 bg-gradient-to-r from-accent to-indigo-600 -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Icon size={20} className={cn("flex-shrink-0 transition-transform duration-300", activeTab === id ? "scale-110" : "group-hover:scale-110")} />
        {!isCollapsed && (
          <span className="font-medium whitespace-nowrap">{label}</span>
        )}
      </button>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-white/60 font-medium animate-pulse">Initializing Vayu Edge...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <IntroPage onSignIn={handleSignIn} />;
  }


  return (
    <div className="flex h-screen overflow-hidden bg-bg-dark selection:bg-accent/30 text-white relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: windowWidth > 1024 ? (isSidebarOpen ? 260 : 80) : 260,
          x: windowWidth > 1024 ? 0 : (isMobileMenuOpen ? 0 : -260)
        }}
        className="fixed lg:relative z-50 flex flex-col h-full border-r border-white/5 bg-bg-dark/80 backdrop-blur-2xl transition-all duration-300 ease-in-out"
      >
        <div className={cn("p-6 flex items-center", (!isSidebarOpen && windowWidth > 1024) ? "justify-center" : "gap-3")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,140,255,0.4)] flex-shrink-0">
            <Zap className="text-white fill-white" size={24} />
          </div>
          {(isSidebarOpen || windowWidth <= 1024) && (
            <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
              VAYU EDGE
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="assets" icon={Files} label="Assets" />
          <SidebarItem id="upload" icon={Upload} label="Upload" />
          <SidebarItem id="analytics" icon={BarChart3} label="Analytics" />
          <SidebarItem id="dns" icon={Globe} label="DNS" />
          <SidebarItem id="security" icon={Shield} label="Security" />
          <SidebarItem id="network" icon={Network} label="Network" />
          <SidebarItem id="cache" icon={Database} label="Cache Explorer" />
          <SidebarItem id="logs" icon={Activity} label="Live Logs" />
          <SidebarItem id="settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group py-3",
              (!isSidebarOpen && windowWidth > 1024) ? "justify-center px-0" : "justify-start px-4 gap-3"
            )}
            title={(!isSidebarOpen && windowWidth > 1024) ? "Sign Out" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
            {(isSidebarOpen || windowWidth <= 1024) && (
              <span className="font-medium">Sign Out</span>
            )}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-full p-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all duration-300 justify-center"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="lg:hidden flex items-center gap-3 p-3">
             <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Activity size={16} className="text-accent" />
             </div>
             <div className="flex-1">
                <p className="text-xs font-bold">Edge Status</p>
                <p className="text-[10px] text-emerald-400">Operational</p>
             </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Top Nav */}
        <header className="sticky top-0 z-20 h-16 border-b border-white/5 bg-bg-dark/40 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold capitalize tracking-tight hidden sm:block">{activeTab}</h2>
            <div className="hidden sm:block h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 max-w-[150px] sm:max-w-none">
              <Globe size={12} className="text-accent shrink-0" />
              <span className="truncate">{cdnDomain || 'initializing...'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Cloudflare 1.1.1.1 DNS Active</span>
            </div>
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="glass-input pl-9 w-48 lg:w-64 text-xs py-2"
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-indigo-500 border border-white/20 shadow-lg shadow-accent/20" />
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {initError && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-500">
              <AlertCircle size={20} />
              <div className="text-sm font-medium">
                {initError}
              </div>
              <button 
                onClick={() => { 
                  if (window.puter) {
                    setInitError(null); 
                    initCDN(); 
                  } else {
                    addToast("Engine still not found. Please refresh the page.", "error");
                  }
                }}
                className="ml-auto text-xs font-bold uppercase tracking-wider hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={Files} label="Total Assets" value={stats.totalAssets} trend="+12% this week" />
                  <StatCard icon={Database} label="Storage Used" value={formatSize(stats.storageUsed)} trend="2.4% of quota" />
                  <StatCard icon={Zap} label="Cache Hit Rate" value={`${stats.cacheHitRate}%`} trend="Optimized" color="text-emerald-400" />
                  <StatCard icon={Activity} label="Requests Served" value={stats.requestsServed.toLocaleString()} trend="+420 today" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Network Activity</h3>
                      <select className="bg-white/5 border border-white/10 rounded-lg text-xs px-2 py-1 outline-none">
                        <option>Last 24 hours</option>
                        <option>Last 7 days</option>
                      </select>
                    </div>
                    <div className="h-[300px]">
                      <Line 
                        data={{
                          labels: ['12am', '4am', '8am', '12pm', '4pm', '8pm'],
                          datasets: [{
                            label: 'Requests',
                            data: [120, 450, 320, 890, 1100, 750],
                            borderColor: '#4f8cff',
                            backgroundColor: 'rgba(79, 140, 255, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Live Traffic</h3>
                      <button onClick={() => setActiveTab('logs')} className="text-xs text-accent hover:underline">View All</button>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {logs.length === 0 ? (
                        <div className="text-center py-8 text-white/20 text-xs italic">Waiting for traffic...</div>
                      ) : (
                        logs.slice(0, 10).map(log => (
                          <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-1.5 shrink-0",
                              log.type === 'CACHE_HIT' ? 'bg-emerald-500' : 
                              log.type === 'CACHE_MISS' ? 'bg-amber-500' :
                              log.type === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'
                            )} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-0.5">
                                {log.type} • {format(log.timestamp, 'HH:mm:ss')}
                              </div>
                              <div className="text-xs text-white/80 truncate font-mono">{log.message}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6">Recent Uploads</h3>
                    <div className="space-y-4">
                      {files.slice(0, 5).map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                            <FileIcon type={file.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-white/40">{formatSize(file.size)} • {format(file.modified, 'MMM d, HH:mm')}</p>
                          </div>
                          <button onClick={() => copyToClipboard(file.url)} className="opacity-0 group-hover:opacity-100 p-2 hover:text-accent transition-all">
                            <Copy size={14} />
                          </button>
                        </div>
                      ))}
                      {files.length === 0 && (
                        <div className="text-center py-8 text-white/20">
                          <Upload className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No files yet</p>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setActiveTab('assets')}
                      className="w-full mt-6 py-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                      View all assets
                    </button>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-6">Global Edge Status</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-medium">North America</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">12ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-medium">Europe</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">18ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-medium">Asia Pacific</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">24ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-sm font-medium">South America</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">45ms</span>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Global Load</span>
                        <span className="text-xs font-bold text-accent">24%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '24%' }}
                          className="h-full bg-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assets' && (
              <motion.div
                key="assets"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-card overflow-hidden"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Asset Library</h3>
                  <div className="flex gap-2">
                    <button onClick={refreshFiles} className="glass-button glass-button-secondary text-xs">
                      Refresh
                    </button>
                    <button onClick={() => setActiveTab('upload')} className="glass-button glass-button-primary text-xs">
                      <Upload size={14} />
                      Upload New
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-white/40 border-b border-white/5">
                        <th className="px-6 py-4 font-medium">Filename</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Size</th>
                        <th className="px-6 py-4 font-medium">Modified</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {files.map((file, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="text-accent/60">
                                <FileIcon type={file.type} />
                              </div>
                              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">{file.type}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">{formatSize(file.size)}</td>
                          <td className="px-6 py-4 text-sm text-white/60">{format(file.modified, 'MMM d, yyyy')}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => copyToClipboard(file.url)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all" title="Copy CDN URL">
                                <Copy size={16} />
                              </button>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-accent transition-all" title="Open in new tab">
                                <ExternalLink size={16} />
                              </a>
                              <button onClick={() => handleDelete(file.name)} className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-500 transition-all" title="Delete asset">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {files.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-white/20">
                            <div className="flex flex-col items-center">
                              <Files size={48} className="mb-4 opacity-10" />
                              <p>No assets found in your CDN storage.</p>
                              <button onClick={() => setActiveTab('upload')} className="mt-4 text-accent hover:underline text-sm font-medium">
                                Upload your first file
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-accent', 'bg-accent/5'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-accent', 'bg-accent/5'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-accent', 'bg-accent/5');
                    handleUpload(e.dataTransfer.files);
                  }}
                  className="glass-card border-2 border-dashed border-white/10 p-8 sm:p-16 text-center transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
                    <Upload className="text-accent" size={48} />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tighter relative z-10 uppercase">Upload to Edge</h3>
                  <p className="text-white/40 mb-10 max-w-sm mx-auto text-sm leading-relaxed relative z-10">
                    Deploy your assets to the global edge network. 
                    Optimized for performance and low latency.
                  </p>
                  
                  <input 
                    type="file" 
                    id="file-upload" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="glass-button glass-button-primary px-10 py-4 mx-auto cursor-pointer inline-flex font-bold tracking-tight shadow-xl shadow-accent/20 hover:shadow-accent/40 relative z-10"
                  >
                    Select Files
                  </label>

                  <div className="mt-12 flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/10 relative z-10">
                    <span className="hover:text-accent transition-colors">PNG</span>
                    <span className="hover:text-accent transition-colors">JPG</span>
                    <span className="hover:text-accent transition-colors">SVG</span>
                    <span className="hover:text-accent transition-colors">JS</span>
                    <span className="hover:text-accent transition-colors">CSS</span>
                    <span className="hover:text-accent transition-colors">JSON</span>
                  </div>
                </motion.div>

                {/* Upload Progress */}
                <AnimatePresence>
                  {Object.keys(uploadProgress).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 space-y-4"
                    >
                      <h4 className="text-sm font-semibold text-white/60">Uploading...</h4>
                      {Object.entries(uploadProgress).map(([name, progress]) => (
                        <div key={name} className="glass-card p-4">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="truncate max-w-[200px]">{name}</span>
                            <span className="text-accent">Processing...</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 2 }}
                              className="h-full bg-accent shadow-[0_0_10px_rgba(79,140,255,0.5)]"
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-8">Storage Distribution</h3>
                    <div className="h-[300px] flex items-center justify-center">
                      <Doughnut 
                        data={{
                          labels: ['Images', 'Scripts', 'Styles', 'Fonts', 'Other'],
                          datasets: [{
                            data: [45, 20, 15, 12, 8],
                            backgroundColor: [
                              '#4f8cff',
                              '#818cf8',
                              '#c084fc',
                              '#fb7185',
                              '#34d399'
                            ],
                            borderWidth: 0,
                            hoverOffset: 10
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: '75%',
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: { color: 'rgba(255,255,255,0.6)', padding: 20, font: { size: 12 } }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-8">Cache Performance</h3>
                    <div className="h-[300px]">
                      <Bar 
                        data={{
                          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                          datasets: [
                            {
                              label: 'Cache Hits',
                              data: [650, 590, 800, 810, 560, 550, 400],
                              backgroundColor: '#4f8cff',
                              borderRadius: 6,
                            },
                            {
                              label: 'Cache Misses',
                              data: [120, 150, 100, 110, 140, 130, 90],
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              borderRadius: 6,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false }
                          },
                          scales: {
                            y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                            x: { stacked: true, grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-lg font-semibold mb-8">Global Edge Latency (ms)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <LatencyStat city="New York" ms={12} />
                    <LatencyStat city="London" ms={18} />
                    <LatencyStat city="Tokyo" ms={24} />
                    <LatencyStat city="Singapore" ms={15} />
                    <LatencyStat city="Sydney" ms={32} />
                    <LatencyStat city="Frankfurt" ms={14} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dns' && (
              <motion.div
                key="dns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter">DNS MANAGEMENT</h3>
                      <p className="text-white/40 text-sm">Configure your global routing and DNS records.</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Cloudflare 1.1.1.1 Active</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-black text-[10px] uppercase tracking-widest text-white/20">
                      <div>Type</div>
                      <div>Name</div>
                      <div>Value</div>
                      <div className="text-right">TTL</div>
                    </div>
                    {[
                      { type: 'A', name: '@', value: '1.1.1.1', ttl: 'Auto' },
                      { type: 'CNAME', name: 'cdn', value: cdnDomain || 'pending...', ttl: 'Auto' },
                      { type: 'TXT', name: '_vayu-verify', value: 'v=vayu1;id=829102', ttl: '3600' }
                    ].map((record, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all group">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-accent/10 text-accent font-bold text-xs">{record.type}</span>
                        </div>
                        <div className="font-mono text-sm flex items-center">{record.name}</div>
                        <div className="font-mono text-sm flex items-center text-white/60 truncate">{record.value}</div>
                        <div className="text-right text-white/40 text-sm flex items-center justify-end">{record.ttl}</div>
                      </div>
                    ))}
                  </div>

                  <button className="mt-8 glass-button glass-button-primary px-8 py-3 font-bold text-sm">
                    Add Record
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DnsLookupTool />
                  <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Wifi size={20} className="text-accent" />
                      DNS Propagation
                    </h3>
                    <div className="space-y-4">
                      {['North America', 'Europe', 'Asia Pacific', 'South America'].map(region => (
                        <div key={region} className="flex items-center justify-between">
                          <span className="text-sm text-white/60">{region}</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500">100%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Activity size={20} className="text-accent" />
                      Resolver Health
                    </h3>
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="text-4xl font-black text-emerald-500 mb-2">99.99%</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/20">Global Uptime</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <h3 className="text-2xl font-black tracking-tighter mb-8 uppercase">Edge Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Shield size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">WAF Protection</h4>
                            <p className="text-xs text-white/40">Web Application Firewall</p>
                          </div>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-accent/20 border border-accent/30 relative cursor-pointer">
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent" />
                        </div>
                      </div>
                      <p className="text-sm text-white/60 mb-6">Automatically block SQL injection, XSS, and other common attacks at the edge.</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">Active</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-white/40 text-[10px] font-bold uppercase">Managed Rules</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Lock size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">DDoS Mitigation</h4>
                            <p className="text-xs text-white/40">Layer 3/4/7 protection</p>
                          </div>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 relative cursor-pointer">
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500" />
                        </div>
                      </div>
                      <p className="text-sm text-white/60 mb-6">Always-on protection against volumetric and protocol-based DDoS attacks.</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">Active</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-white/40 text-[10px] font-bold uppercase">Global Shield</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-card p-8">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Activity size={20} className="text-accent" />
                      Threat Intelligence Feed
                    </h3>
                    <div className="space-y-4">
                      {[
                        { event: 'SQL Injection Attempt', origin: '103.21.244.12', action: 'Blocked', severity: 'High' },
                        { event: 'Cross-Site Scripting (XSS)', origin: '192.168.1.45', action: 'Blocked', severity: 'High' },
                        { event: 'Bot Scraping Detected', origin: '54.12.33.90', action: 'Challenged', severity: 'Medium' },
                        { event: 'Brute Force Attempt', origin: '185.10.22.11', action: 'Blocked', severity: 'High' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              item.severity === 'High' ? 'bg-red-500' : 'bg-amber-500'
                            )} />
                            <div>
                              <div className="text-sm font-bold">{item.event}</div>
                              <div className="text-[10px] text-white/30 font-mono">Origin: {item.origin}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{item.action}</div>
                            <div className="text-[10px] text-white/20">Just now</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-8">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Shield size={20} className="text-accent" />
                      Security Score
                    </h3>
                    <div className="flex items-center justify-center h-48 relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={36.4} className="text-accent" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black">92</span>
                        <span className="text-[10px] uppercase tracking-widest text-white/20">A+ Grade</span>
                      </div>
                    </div>
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">WAF Rules</span>
                        <span className="text-emerald-500">Optimal</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">SSL/TLS</span>
                        <span className="text-emerald-500">Strict</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">DDoS Shield</span>
                        <span className="text-emerald-500">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'network' && (
              <motion.div
                key="network"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <h3 className="text-2xl font-black tracking-tighter mb-8 uppercase">Global Edge Network</h3>
                  <NetworkMap />
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Active Nodes</div>
                      <div className="text-2xl font-black">284</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Total Throughput</div>
                      <div className="text-2xl font-black">1.2 TB/s</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Avg. Latency</div>
                      <div className="text-2xl font-black">14ms</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Network Health</div>
                      <div className="text-2xl font-black text-emerald-500">OPTIMAL</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-lg font-semibold mb-6">Node Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
                          <th className="pb-4 font-black">Node ID</th>
                          <th className="pb-4 font-black">Location</th>
                          <th className="pb-4 font-black">Status</th>
                          <th className="pb-4 font-black">Load</th>
                          <th className="pb-4 font-black">Uptime</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { id: 'NY-1', loc: 'New York, US', status: 'Online', load: '42%', uptime: '99.99%' },
                          { id: 'LDN-1', loc: 'London, UK', status: 'Online', load: '28%', uptime: '100%' },
                          { id: 'TKY-1', loc: 'Tokyo, JP', status: 'Online', load: '65%', uptime: '99.98%' },
                          { id: 'SGP-1', loc: 'Singapore, SG', status: 'Online', load: '12%', uptime: '100%' }
                        ].map((node, i) => (
                          <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 font-mono text-sm">{node.id}</td>
                            <td className="py-4 text-sm text-white/60">{node.loc}</td>
                            <td className="py-4">
                              <span className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {node.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-accent" style={{ width: node.load }} />
                              </div>
                            </td>
                            <td className="py-4 text-sm text-white/40">{node.uptime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'cache' && (
              <motion.div
                key="cache"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter uppercase">Cache Explorer</h3>
                      <p className="text-white/40 text-sm">Inspect and manage assets currently stored in the Edge Cache.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={refreshCacheList} className="glass-button glass-button-secondary px-4 py-2 text-xs flex items-center gap-2">
                        <Activity size={14} /> Refresh
                      </button>
                      <button onClick={clearCache} className="glass-button glass-button-primary px-4 py-2 text-xs flex items-center gap-2">
                        <Trash2 size={14} /> Purge All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {cachedUrls.length === 0 ? (
                      <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                        <Database className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/40 font-medium">No assets currently cached at the edge.</p>
                        <p className="text-xs text-white/20 mt-2">Access your hosted files to populate the cache.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {cachedUrls.map((url, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all group">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                <Zap size={18} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold truncate text-white/80">{url.split('/').pop()}</div>
                                <div className="text-[10px] text-white/30 truncate font-mono">{url}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => window.open(url, '_blank')}
                                className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                              >
                                <ExternalLink size={16} />
                              </button>
                              <button 
                                onClick={() => deleteCacheItem(url)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter uppercase">Live Edge Logs</h3>
                      <p className="text-white/40 text-sm">Real-time stream of network requests and edge events.</p>
                    </div>
                    <button onClick={() => setLogs([])} className="glass-button glass-button-secondary px-4 py-2 text-xs">
                      Clear Logs
                    </button>
                  </div>

                  <div className="space-y-2 font-mono">
                    {logs.length === 0 ? (
                      <div className="text-center py-20 text-white/10 italic">Waiting for traffic...</div>
                    ) : (
                      logs.map(log => (
                        <div key={log.id} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors group">
                          <div className="flex items-center gap-4 mb-1">
                            <span className={cn(
                              "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                              log.type === 'CACHE_HIT' ? 'bg-emerald-500/10 text-emerald-500' : 
                              log.type === 'CACHE_MISS' ? 'bg-amber-500/10 text-amber-500' :
                              log.type === 'ERROR' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            )}>
                              {log.type}
                            </span>
                            <span className="text-[10px] text-white/20">{format(log.timestamp, 'HH:mm:ss.SSS')}</span>
                          </div>
                          <div className="text-xs text-white/60 break-all">{log.message}</div>
                          {log.details && (
                            <div className="mt-2 text-[10px] text-white/30 pl-4 border-l border-white/10">{log.details}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-8"
              >
                <div className="glass-card p-8">
                  <h3 className="text-lg font-semibold mb-6">CDN Configuration</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">CDN Subdomain</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={cdnDomain.split('.')[0]} 
                          readOnly
                          className="glass-input flex-1 opacity-50 cursor-not-allowed"
                        />
                        <button className="glass-button glass-button-secondary text-xs" disabled>
                          Change
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-white/30">Subdomain changes are currently locked to prevent link breakage.</p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-sm font-semibold mb-4">Development & Simulation</h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <p className="text-sm font-medium">Traffic Simulation</p>
                          <p className="text-xs text-white/40">Simulate global edge traffic to test dashboard responsiveness.</p>
                        </div>
                        <button 
                          onClick={() => setIsSimulating(!isSimulating)}
                          className={cn(
                            "glass-button text-xs px-4 py-2",
                            isSimulating ? "glass-button-primary" : "glass-button-secondary"
                          )}
                        >
                          {isSimulating ? "Stop Simulation" : "Start Simulation"}
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-sm font-semibold mb-4">Edge Cache</h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <p className="text-sm font-medium">Purge Cache</p>
                          <p className="text-xs text-white/40">Clear all cached assets from the service worker edge layer.</p>
                        </div>
                        <button onClick={clearCache} className="glass-button glass-button-secondary text-xs">
                          Purge All
                        </button>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-sm font-semibold mb-4">Account</h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <p className="text-sm font-medium">Sign Out</p>
                          <p className="text-xs text-white/40">Disconnect your Vayu account from this session.</p>
                        </div>
                        <button 
                          onClick={handleSignOut}
                          className="glass-button glass-button-secondary text-xs flex items-center gap-2 text-red-400 hover:text-red-500"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-500 mb-6">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div>
                        <p className="text-sm font-medium">Delete All Assets</p>
                        <p className="text-xs text-white/40">Permanently remove all files from your Vayu Edge storage.</p>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!window.puter) {
                            addToast("Vayu Edge engine not loaded yet.", "error");
                            return;
                          }
                          if (confirm("Are you sure you want to delete ALL assets? This cannot be undone.")) {
                            for (const file of files) {
                              await window.puter.fs.delete(`cdn/${file.name}`);
                            }
                            addToast("All assets deleted", "success");
                            await refreshFiles();
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-medium transition-colors"
                      >
                        Delete All
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Toasts */}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ icon: Icon, label, value, trend, color = "text-white" }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card p-6 group relative overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-accent group-hover:bg-accent/10 transition-all duration-300">
          <Icon size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
            {trend}
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">{label}</p>
        <h4 className={cn("text-3xl font-black tracking-tighter", color)}>{value}</h4>
      </div>
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          className="h-full bg-gradient-to-r from-accent to-indigo-600"
        />
      </div>
    </motion.div>
  );
}

function NetworkMap() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = [
      { id: "Core", group: 1, x: width / 2, y: height / 2 },
      { id: "NY-1", group: 2 },
      { id: "LDN-1", group: 2 },
      { id: "TKY-1", group: 2 },
      { id: "SGP-1", group: 2 },
      { id: "FRA-1", group: 2 },
      { id: "SYD-1", group: 2 },
    ];

    const links = [
      { source: "Core", target: "NY-1" },
      { source: "Core", target: "LDN-1" },
      { source: "Core", target: "TKY-1" },
      { source: "Core", target: "SGP-1" },
      { source: "Core", target: "FRA-1" },
      { source: "Core", target: "SYD-1" },
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "rgba(79, 140, 255, 0.2)")
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("circle")
      .attr("r", (d: any) => d.id === "Core" ? 12 : 8)
      .attr("fill", (d: any) => d.id === "Core" ? "#4f8cff" : "#818cf8")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d: any) => d.id)
      .attr("x", 12)
      .attr("y", 4)
      .attr("fill", "rgba(255,255,255,0.6)")
      .attr("font-size", "10px")
      .attr("font-weight", "bold");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, []);

  return (
    <div className="w-full h-[400px] flex items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
      <svg ref={svgRef} width="800" height="400" className="max-w-full h-auto" />
    </div>
  );
}
function DnsLookupTool() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!domain) return;
    setLoading(true);
    // Simulate a DNS lookup via Cloudflare 1.1.1.1
    setTimeout(() => {
      setResult({
        status: 'Success',
        resolver: '1.1.1.1 (Cloudflare)',
        records: [
          { type: 'A', value: '104.21.45.12', ttl: 300 },
          { type: 'AAAA', value: '2606:4700:3031::6815:2d0c', ttl: 300 }
        ],
        latency: '12ms'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="glass-card p-8">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Search size={20} className="text-accent" />
        DNS Lookup Tool (via 1.1.1.1)
      </h3>
      <div className="flex gap-3 mb-6">
        <input 
          type="text" 
          placeholder="Enter domain (e.g. google.com)" 
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="glass-input flex-1"
        />
        <button 
          onClick={handleLookup}
          disabled={loading}
          className="glass-button glass-button-primary px-6 py-2 flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          Lookup
        </button>
      </div>
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3"
        >
          <div className="flex justify-between text-xs">
            <span className="text-white/40 uppercase tracking-widest">Status</span>
            <span className="text-emerald-500 font-bold">{result.status}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40 uppercase tracking-widest">Resolver</span>
            <span className="text-accent font-bold">{result.resolver}</span>
          </div>
          <div className="pt-3 border-t border-white/5 space-y-2">
            {result.records.map((r: any, i: number) => (
              <div key={i} className="flex justify-between font-mono text-[10px]">
                <span className="text-accent">{r.type}</span>
                <span className="text-white/60">{r.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function LatencyStat({ city, ms }: { city: string, ms: number }) {
  return (
    <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all group">
      <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3 group-hover:text-accent transition-colors">{city}</div>
      <div className="text-2xl font-black tracking-tighter text-white mb-1">{ms}<span className="text-xs text-accent ml-0.5">ms</span></div>
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(100 - ms, 10)}%` }}
          className={cn(
            "h-full transition-all duration-1000",
            ms < 20 ? "bg-emerald-500" : ms < 40 ? "bg-amber-500" : "bg-red-500"
          )}
        />
      </div>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(t)) return <Files size={18} />;
  if (['js', 'json'].includes(t)) return <Zap size={18} />;
  if (['css'].includes(t)) return <LayoutDashboard size={18} />;
  return <Files size={18} />;
}
