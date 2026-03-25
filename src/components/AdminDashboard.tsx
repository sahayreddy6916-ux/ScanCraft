import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, List, Activity, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Log, AppMode } from '../types';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [modes, setModes] = useState<AppMode[]>([]);
  const [newMode, setNewMode] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [logsRes, modesRes] = await Promise.all([
        fetch('/api/admin/logs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/modes', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!logsRes.ok || !modesRes.ok) throw new Error('Failed to fetch admin data');

      const logsData = await logsRes.json();
      const modesData = await modesRes.json();
      setLogs(logsData);
      setModes(modesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/modes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMode)
      });

      if (!res.ok) throw new Error('Failed to create mode');
      
      setNewMode({ name: '', description: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteMode = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/modes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete mode');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="text-center py-12 text-white/60">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logs Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white mb-4">
            <Activity className="text-cyan-accent" size={20} />
            <h3 className="text-xl font-bold">User Activity Logs</h3>
          </div>
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/40 uppercase text-xs font-bold sticky top-0">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white/80">{log.User?.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-accent/10 text-cyan-accent text-[10px] font-bold">
                          {log.action}
                        </span>
                        <p className="text-white/40 text-[11px] mt-1">{log.details}</p>
                      </td>
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Modes Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white mb-4">
            <Shield className="text-cyan-accent" size={20} />
            <h3 className="text-xl font-bold">Application Modes</h3>
          </div>

          <form onSubmit={handleCreateMode} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Plus size={16} className="text-cyan-accent" /> Create New Mode
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Mode Name (e.g. Beta, Maintenance)"
                className="input-field"
                value={newMode.name}
                onChange={(e) => setNewMode({ ...newMode, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="input-field min-h-[80px]"
                value={newMode.description}
                onChange={(e) => setNewMode({ ...newMode, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary w-full">Create Mode</button>
          </form>

          <div className="space-y-3">
            {modes.map((mode) => (
              <div key={mode.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-accent" />
                    <span className="text-white font-bold">{mode.name}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-1">{mode.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteMode(mode.id)}
                  className="p-2 text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {modes.length === 0 && (
              <div className="text-center py-8 text-white/20 border-2 border-dashed border-white/5 rounded-2xl">
                No custom modes active
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
