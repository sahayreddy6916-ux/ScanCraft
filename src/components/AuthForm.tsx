import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface Props {
  onSuccess: (user: any, token: string) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthForm({ onSuccess, initialMode = 'login' }: Props) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'super-user'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await axios.post(endpoint, { email, password, role });
      onSuccess(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-white/60">
          {isLogin ? 'Login to access your saved codes' : 'Sign up to start saving your history'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="glass-input w-full"
            >
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
              <option value="super-user">Super User</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full pl-10"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : isLogin ? (
            <>
              <LogIn size={18} /> Login
            </>
          ) : (
            <>
              <UserPlus size={18} /> Sign Up
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-cyan-accent hover:underline text-sm font-medium"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
