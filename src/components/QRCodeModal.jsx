import React, { useState } from 'react';
import { X, QrCode, Printer, ExternalLink, Copy, Check } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose }) {
  const [selectedT, setSelectedT] = useState('T1');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const qrUrl = `${origin}/?table=${selectedT}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}&color=5C3E2E&bgcolor=F5ECE1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#E2D2C0] animate-fade-in print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="bg-[#5C3E2E] text-white p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C89445]" />
            <h3 className="text-lg font-bold font-serif">Table QR Code Generator</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-[#C89445]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          
          {/* Table Selector Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap print:hidden">
            {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedT(t)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                  selectedT === t 
                    ? 'bg-[#5C3E2E] text-[#C89445] ring-2 ring-[#C89445]' 
                    : 'bg-[#EAD9C6] text-[#6E5B52] hover:bg-[#E2D2C0]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Printable QR Card */}
          <div className="bg-[#F5ECE1] p-6 rounded-3xl border-2 border-[#C89445] inline-block shadow-lg max-w-xs mx-auto">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <img src="/images/logo.jpg" alt="MacTea Logo" className="w-9 h-9 rounded-full object-cover border border-[#5C3E2E]" />
              <h2 className="font-serif font-bold text-xl text-[#5C3E2E]">MACTEA</h2>
            </div>
            
            <p className="text-[10px] text-[#8C5E14] font-bold uppercase tracking-wider mb-4">
              Scan to Order at Table
            </p>

            {/* QR Image */}
            <div className="bg-white p-3 rounded-2xl shadow-inner border border-[#E2D2C0] inline-block">
              <img 
                src={qrImageUrl} 
                alt={`QR Code for Table ${selectedT}`}
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2D2C0]">
              <span className="bg-[#5C3E2E] text-[#C89445] font-extrabold text-lg px-4 py-1 rounded-xl shadow-md font-serif inline-block">
                {selectedT}
              </span>
              <p className="text-[11px] text-[#6E5B52] mt-1 font-medium">
                📞 +94 76 995 5518
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-2 print:hidden">
            <button
              onClick={handleCopyLink}
              className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-[#2B8A61]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied URL!' : 'Copy Table Link'}</span>
            </button>

            <a
              href={qrUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Link</span>
            </a>

            <button
              onClick={handlePrint}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[#C89445]" />
              <span>Print Sticker</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
