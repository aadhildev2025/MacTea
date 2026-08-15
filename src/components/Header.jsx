import React from 'react';
import { ShoppingBag, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function Header({ onOpenCart, onOpenAdmin, onScrollToMenu, currentView, setCurrentView }) {
  const { cartItemCount, selectedTable, activeOrder } = useOrder();

  return (
    <header className="sticky top-0 z-40 bg-[#F5ECE1]/95 backdrop-blur-md border-b border-[#E2D2C0] transition-all shadow-sm">
      <div className="mactea-container flex items-center justify-between h-16 sm:h-20 px-3 sm:px-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentView('customer')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
        >
          <img 
            src="/images/logo.jpg" 
            alt="MacTea by Malhars Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform border-2 border-[#5C3E2E]"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#5C3E2E]">
                MACTEA
              </span>
              <span className="bg-[#C89445]/20 text-[#8C5E14] text-[9px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                by Malhars
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6E5B52] flex items-center gap-1 font-medium">
              <Phone className="w-3 h-3 text-[#C89445]" /> +94 76 995 5518
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Table Indicator Pill */}
          {selectedTable && (
            <div className="bg-[#5C3E2E] text-white px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-sm">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C89445]" />
              <span>{selectedTable}</span>
            </div>
          )}

          {/* Active Order Tracker Shortcut */}
          {activeOrder && currentView === 'customer' && (
            <button
              onClick={() => {
                const el = document.getElementById('order-tracker-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#C89445]/15 text-[#8C5E14] hover:bg-[#C89445]/25 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all border border-[#C89445]/30"
            >
              <span className="w-2 h-2 rounded-full bg-[#2B8A61] animate-ping" />
              <span className="hidden xs:inline">Track Order</span>
            </button>
          )}

          {/* Staff Admin Button */}
          {currentView === 'customer' ? (
            <button
              onClick={onOpenAdmin}
              className="bg-[#5C3E2E]/10 hover:bg-[#5C3E2E]/20 text-[#5C3E2E] px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all border border-[#5C3E2E]/20"
              title="Staff Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-[#C89445]" />
              <span className="hidden sm:inline">Staff Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('customer')}
              className="btn-outline text-xs px-3 py-1.5"
            >
              Customer Menu
            </button>
          )}

          {/* Cart Button */}
          {currentView === 'customer' && (
            <button
              onClick={onOpenCart}
              className="btn-primary py-2 sm:py-2.5 px-3 sm:px-4 rounded-full flex items-center gap-1.5 sm:gap-2 relative shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-[#C89445]" />
              <span className="hidden xs:inline text-xs sm:text-sm font-semibold">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-[#C89445] text-white font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
