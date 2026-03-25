import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Mail, Lock, RefreshCw, Shield } from 'lucide-react';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: string;
}

export default function AddUserModal({ isOpen, onClose, currentUserRole }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'super-user'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('/api/auth/signup', { email, password, role });
      setSuccess(true);
      setEmail('');
      setPassword('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while creating the user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass-card p-8 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="bg-cyan-accent/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-cyan-accent" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Add New User</h2>
              <p className="text-white/60 text-sm mt-1">Create a new account in the system</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-lg text-sm">
                  User created successfully!
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-cyan-accent mb-1.5 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full pl-10 text-sm"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-accent mb-1.5 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full pl-10 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {(currentUserRole === 'admin' || currentUserRole === 'super-user') && (
                <div>
                  <label className="block text-xs font-bold text-cyan-accent mb-1.5 uppercase tracking-widest">Assign Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="glass-input w-full pl-10 text-sm bg-[#121212]"
                    >
                      <option value="user" className="bg-[#121212]">Standard User</option>
                      <option value="admin" className="bg-[#121212]">Administrator</option>
                      <option value="super-user" className="bg-[#121212]">Super User</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || success}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
              >
                {isLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} /> Create Account
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
