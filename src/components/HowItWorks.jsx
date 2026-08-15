import React from 'react';
import { MapPin, Utensils, Send, Smile } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: MapPin,
      title: 'Choose Table',
      desc: 'Select T1 – T6 below or scan your table QR code.'
    },
    {
      step: '02',
      icon: Utensils,
      title: 'Select Food & Drinks',
      desc: 'Browse Ceylon tea, coffees, snacks & short eats.'
    },
    {
      step: '03',
      icon: Send,
      title: 'Place Order',
      desc: 'Enter customer name & confirm cart items.'
    },
    {
      step: '04',
      icon: Smile,
      title: 'Relax & Enjoy',
      desc: 'Our staff will serve fresh food directly to your table!'
    }
  ];

  return (
    <section className="py-10 bg-[#FAF6EE] border-y border-[#E6DCCE]">
      <div className="mactea-container">
        
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[#D29F43] font-bold text-xs uppercase tracking-widest">Easy Ordering Process</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C3F3A] mt-1">
            How Table Ordering Works
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white p-5 rounded-2xl border border-[#E6DCCE] shadow-sm relative flex flex-col items-center text-center group hover:border-[#D29F43] transition-all"
              >
                <span className="absolute top-3 right-3 text-xs font-black text-[#D29F43]/40 group-hover:text-[#D29F43] transition-colors">
                  {item.step}
                </span>

                <div className="w-12 h-12 rounded-2xl bg-[#F3ECE0] group-hover:bg-[#1C3F3A] group-hover:text-[#D29F43] text-[#1C3F3A] flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-[#1C3F3A] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B5E55] leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
