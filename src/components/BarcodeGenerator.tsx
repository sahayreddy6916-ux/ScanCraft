import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Save, RefreshCw } from 'lucide-react';
import { CodeOptions } from '../types';
import axios from 'axios';

interface Props {
  onSave?: (code: any) => void;
  isLoggedIn: boolean;
}

export default function BarcodeGenerator({ onSave, isLoggedIn }: Props) {
  const [value, setValue] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [options, setOptions] = useState<CodeOptions>({
    width: 2,
    height: 100,
    margin: 10,
    displayValue: true,
    background: '#ffffff',
    lineColor: '#000000',
  });
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: format,
          width: options.width,
          height: options.height,
          margin: options.margin,
          displayValue: options.displayValue,
          background: options.background,
          lineColor: options.lineColor,
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [value, format, options]);

  const downloadBarcode = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `barcode-${value}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const saveBarcode = async () => {
    if (!isLoggedIn) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/codes', {
        type: 'barcode',
        format,
        value,
        options
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
            <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Data Value</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="glass-input w-full py-2 text-sm"
              placeholder="Enter text or numbers..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="glass-input w-full bg-[#121212] text-[#121212] py-2 text-sm"
            >
              <option value="CODE128" className="text-white">Code 128</option>
              <option value="EAN13" className="text-white">EAN-13</option>
              <option value="UPC" className="text-white">UPC-A</option>
              <option value="CODE39" className="text-white">Code 39</option>
              <option value="ITF14" className="text-white">ITF-14</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Width</label>
              <input
                type="number"
                value={options.width}
                onChange={(e) => setOptions({ ...options, width: Number(e.target.value) })}
                className="glass-input w-full py-2 text-sm"
                min="1"
                max="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Height</label>
              <input
                type="number"
                value={options.height}
                onChange={(e) => setOptions({ ...options, height: Number(e.target.value) })}
                className="glass-input w-full py-2 text-sm"
                min="10"
                max="200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-accent mb-1 uppercase tracking-wider">Margin</label>
            <input
              type="number"
              value={options.margin}
              onChange={(e) => setOptions({ ...options, margin: Number(e.target.value) })}
              className="glass-input w-full py-2 text-sm"
              min="0"
              max="50"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center glass-card p-4 min-h-[250px]">
          <div className="bg-white p-4 rounded-lg shadow-inner overflow-hidden max-w-full">
            <canvas ref={canvasRef}></canvas>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={downloadBarcode} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Download size={16} /> Download
            </button>
            {isLoggedIn && (
              <button 
                onClick={saveBarcode} 
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
