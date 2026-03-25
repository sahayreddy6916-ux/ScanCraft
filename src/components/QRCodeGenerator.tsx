import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface Props {
  onSave?: (code: any) => void;
  isLoggedIn: boolean;
}

export default function QRCodeGenerator({ onSave, isLoggedIn }: Props) {
  const [value, setValue] = useState('https://google.com');
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const saveQR = async () => {
    if (!isLoggedIn) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/codes', {
        type: 'qr',
        format: 'QR',
        value,
        options: { size, margin }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onSave) onSave(res.data);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">QR Content</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="glass-input w-full h-32 resize-none text-sm"
              placeholder="Enter URL or text..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Size (px)</label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="glass-input w-full py-2 text-sm"
                min="128"
                max="1024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Margin</label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="glass-input w-full py-2 text-sm"
                min="0"
                max="10"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center glass-card p-4 min-h-[250px]">
          <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-inner">
            <QRCodeSVG
              value={value}
              size={size > 256 ? 256 : size} // Visual preview limit
              marginSize={margin}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={downloadQR} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Download size={16} /> Download
            </button>
            {isLoggedIn && (
              <button 
                onClick={saveQR} 
                disabled={isSaving}
                className="btn-primary bg-white/10 text-white hover:bg-white/20 flex items-center gap-2 py-2 px-4 text-sm"
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
