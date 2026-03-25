import React, { useState, useEffect } from 'react';
import { Trash2, Download, ExternalLink, QrCode, Barcode as BarcodeIcon } from 'lucide-react';
import { GeneratedCode } from '../types';
import axios from 'axios';

interface Props {
  refreshTrigger: number;
}

export default function History({ refreshTrigger }: Props) {
  const [codes, setCodes] = useState<GeneratedCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/codes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCodes(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [refreshTrigger]);

  const deleteCode = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCodes(codes.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (isLoading) return <div className="text-center py-12 text-white/60">Loading history...</div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-cyan-accent uppercase text-xs tracking-widest">
            <tr>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Format</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {codes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                  No generated codes yet.
                </td>
              </tr>
            ) : (
              codes.map((code) => (
                <tr key={code.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {code.type === 'qr' ? <QrCode size={16} /> : <BarcodeIcon size={16} />}
                      <span className="capitalize">{code.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{code.format}</td>
                  <td className="px-6 py-4 max-w-xs truncate font-mono text-sm">{code.value}</td>
                  <td className="px-6 py-4 text-sm text-white/60">
                    {new Date(code.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => deleteCode(code.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
