import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanQrCode, ScanBarcode, Clock, Power, User as UserIcon, Box, Fingerprint, UserPlus } from 'lucide-react';
import BarcodeGenerator from './components/BarcodeGenerator';
import QRCodeGenerator from './components/QRCodeGenerator';
import AuthForm from './components/AuthForm';
import History from './components/History';
import AdminDashboard from './components/AdminDashboard';
import BackgroundAnimation from './components/BackgroundAnimation';
import AddUserModal from './components/AddUserModal';
import { User } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'barcode' | 'qr' | 'history' | 'admin'>('barcode');
  const [user, setUser] = useState<User | null>(null);
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'signup'>('login');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleAuthSuccess = (userData: User, token: string) => {
    if (!userData || !token) return;
    setUser(userData);
    setInitialAuthMode('login'); // Reset for next time
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    setInitialAuthMode('login');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (activeTab === 'history') setActiveTab('barcode');
  };

  const handleNewUser = () => {
    setIsAddUserModalOpen(true);
  };

  const onCodeSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#121212] overflow-x-hidden">
      <BackgroundAnimation />

      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="bg-cyan-accent p-2 rounded-lg">
                <Box className="text-navy" size={24} fill="currentColor" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white">
                ScanCraft
              </h1>
            </div>
            <AuthForm onSuccess={handleAuthSuccess} initialMode={initialAuthMode} />
          </motion.div>
        </div>
      ) : (
        <>
          {/* Navigation */}
          <nav className="sticky top-0 z-50 px-6 lg:px-12 py-5 backdrop-blur-xl border-b border-white/10 bg-[#121212]/80">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-accent p-2.5 rounded-xl shadow-[0_0_20px_rgba(0,255,242,0.2)]">
                  <Box className="text-navy" size={26} fill="currentColor" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-white flex items-baseline gap-2">
                  ScanCraft <span className="text-xs font-medium text-white/30 tracking-widest uppercase hidden sm:inline">By-Sahay</span>
                </h1>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                  <button
                    onClick={() => setActiveTab('barcode')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === 'barcode' ? 'bg-cyan-accent text-navy font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ScanBarcode size={16} /> Barcode
                  </button>
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === 'qr' ? 'bg-cyan-accent text-navy font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ScanQrCode size={16} /> QR Code
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === 'history' ? 'bg-cyan-accent text-navy font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Clock size={16} /> History
                  </button>
                  {(user.role === 'admin' || user.role === 'super-user') && (
                      <button
                        onClick={() => setActiveTab('admin')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                          activeTab === 'admin' ? 'bg-cyan-accent text-navy font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Fingerprint size={16} /> Admin
                      </button>
                  )}
                </div>

                <div className="flex items-center gap-5">
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <UserIcon size={14} className="text-cyan-accent" />
                      {user.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono uppercase tracking-tighter">
                      {user.role} Account
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                  <button
                    onClick={handleNewUser}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-accent/10 hover:bg-cyan-accent/20 text-cyan-accent transition-all text-xs font-bold border border-cyan-accent/20 group shadow-inner"
                    title="Add New User"
                  >
                    <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden lg:inline">New User</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-400 transition-all group border border-transparent hover:border-red-500/20"
                    title="Logout"
                  >
                    <Power size={22} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-12 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-12 text-center">
                  <h2 className="text-2xl md:text-5xl font-bold text-white mb-4">
                    {activeTab === 'barcode' && 'Barcode Engine'}
                    {activeTab === 'qr' && 'Create QR Codes'}
                    {activeTab === 'history' && 'Your Workspace History'}
                    {activeTab === 'admin' && 'Admin Control Center'}
                  </h2>
                  <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-lg">
                    {activeTab === 'barcode' && 'Streamline inventory and product identification with reliable, standards-compliant barcode generation (Code 128, EAN-13, UPC-A)'}
                    {activeTab === 'qr' && 'Fast, reliable QR code generation for URLs, text, and contact information with custom sizing.'}
                    {activeTab === 'history' && 'Manage and re-download your previously generated codes. All your data is synced across devices.'}
                    {activeTab === 'admin' && 'Monitor user activity, manage application modes, and oversee system health.'}
                  </p>
                </div>

                <div className="glass-card pl-[39px] pr-[24px] pt-[30px] pb-[21px] text-[#fffefe]">
                  {activeTab === 'barcode' && <BarcodeGenerator isLoggedIn={!!user} onSave={onCodeSaved} />}
                  {activeTab === 'qr' && <QRCodeGenerator isLoggedIn={!!user} onSave={onCodeSaved} />}
                  {activeTab === 'history' && <History refreshTrigger={refreshTrigger} />}
                  {activeTab === 'admin' && <AdminDashboard />}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </>
      )}

      <AddUserModal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
        currentUserRole={user?.role}
      />

      <footer className="py-12 text-center text-white/20 text-sm border-t border-white/5 mt-12">
        <p>© 2026 ScanCraft By-Sahay. Crafting digital bridges between the physical and virtual worlds.</p>
        <p className="mt-2 font-mono tracking-widest uppercase text-[10px] opacity-50">Precision • Reliability • Innovation</p>
      </footer>
    </div>
  );
}
