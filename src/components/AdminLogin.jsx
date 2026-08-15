import React, { useState } from 'react';
import { Lock, X, ArrowRight, AlertTriangle } from 'lucide-react';

export default function AdminLogin({ isOpen, onClose, onLoginSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid passcode.');
      }

      onLoginSuccess(data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#E2D2C0] animate-fade-in">
        
        {/* Modal Header */}
        <div className="bg-[#5C3E2E] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <img 
            src="/images/logo.jpg" 
            alt="MacTea Logo" 
            className="w-16 h-16 rounded-full object-cover border-2 border-[#C89445] mx-auto mb-3 shadow-lg"
          />

          <h2 className="text-2xl font-bold font-serif">Staff Admin Login</h2>
          <p className="text-xs text-[#FAF6EE]/80 mt-1">
            Access real-time order dashboard & menu controls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-[#C85A32]/10 border border-[#C85A32]/30 p-3 rounded-xl text-xs font-bold text-[#C85A32] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#C89445]" />
              Staff Passcode
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter staff passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Login to Dashboard</span>
            <ArrowRight className="w-4 h-4 text-[#C89445]" />
          </button>

        </form>

      </div>
    </div>
  );
}
