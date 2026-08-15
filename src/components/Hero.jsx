import React from 'react';
import { Coffee, ArrowDown, Sparkles, Phone, QrCode } from 'lucide-react';

export default function Hero({ onScrollToMenu }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6EE] via-[#F3ECE0]/50 to-[#FAF6EE] pt-8 pb-12">
      <div className="mactea-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 bg-[#D29F43]/15 border border-[#D29F43]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#8C5E14]">
            <Sparkles className="w-4 h-4 text-[#D29F43]" />
            <span>Digital Table Ordering • No App Download Required</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#1C3F3A] leading-[1.15]">
            Fresh Tea. Good Food. <br className="hidden sm:inline" />
            <span className="text-[#D29F43] italic font-normal">Great Moments.</span>
          </h1>

          <p className="text-[#6B5E55] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium">
            Welcome to <span className="font-semibold text-[#1C3F3A]">MacTea</span>. Select your table, explore our hand-crafted Ceylon teas, artisanal coffees, and crispy Sri Lankan short eats, and place your order directly from your mobile.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onScrollToMenu}
              className="btn-primary text-base py-3.5 px-7 shadow-lg hover:shadow-xl group"
            >
              <span>View Menu & Order</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform text-[#D29F43]" />
            </button>

            <a
              href="tel:+94769955518"
              className="btn-outline flex items-center gap-2 py-3 px-5 text-sm"
            >
              <Phone className="w-4 h-4 text-[#D29F43]" />
              <span>+94 76 995 5518</span>
            </a>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="pt-6 border-t border-[#E6DCCE] grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <p className="text-2xl font-bold text-[#1C3F3A] font-serif">100%</p>
              <p className="text-xs text-[#6B5E55] font-semibold">Pure Ceylon Tea</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C3F3A] font-serif">&lt; 1 Min</p>
              <p className="text-xs text-[#6B5E55] font-semibold">Instant Mobile Order</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C3F3A] font-serif">T1 – T6</p>
              <p className="text-xs text-[#6B5E55] font-semibold">Table Side Service</p>
            </div>
          </div>

        </div>

        {/* Right Column: Hero Visual Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
            <img 
              src="/images/hero.jpg" 
              alt="MacTea Cozy Tea Cafe" 
              className="w-full h-[340px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C3F3A]/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#D29F43] font-bold text-xs uppercase tracking-wider">Authentic Tea Lounge</span>
                  <h3 className="text-xl font-bold font-serif text-white">MacTea Experience</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#D29F43] text-[#2D231E] flex items-center justify-center font-bold text-sm shadow-md">
                  🍵
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute -bottom-4 -left-2 sm:left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E6DCCE] flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-[#1C3F3A] flex items-center justify-center text-[#D29F43]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C3F3A]">Scan & Order</p>
              <p className="text-[11px] text-[#6B5E55]">At your table in seconds</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
