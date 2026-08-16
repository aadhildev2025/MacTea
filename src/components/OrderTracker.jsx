import React, { useState } from 'react';
import { CheckCircle2, Clock, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function OrderTracker({ order, onReturnMenu }) {
  const { activeOrder, setActiveOrder, checkOrderStatus, setSelectedTable } = useOrder();
  const currentOrder = activeOrder || order;

  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (!currentOrder?.id) return;
    setRefreshing(true);
    await checkOrderStatus(currentOrder.id);
    setRefreshing(false);
  };

  if (!currentOrder) return null;

  const statusSteps = [
    { status: 'New', label: 'Pending', icon: Clock, desc: 'Order received by MacTea kitchen' },
    { status: 'Accepted', label: 'Accepted', icon: CheckCircle2, desc: 'Order confirmed & being prepared by staff' },
    { status: 'Completed', label: 'Completed', icon: Sparkles, desc: 'Order served to your table!' }
  ];

  const getStepIndex = (statusStr) => {
    switch (statusStr) {
      case 'New': return 0;
      case 'Accepted': return 1;
      case 'Completed': return 2;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentOrder.status);

  return (
    <section id="order-tracker-section" className="py-8 bg-gradient-to-b from-[#F5ECE1] to-[#EAD9C6]">
      <div className="mactea-container max-w-2xl mx-auto">
        
        <div className="bg-white rounded-3xl border border-[#E2D2C0] shadow-xl overflow-hidden animate-fade-in">
          
          {/* Top Banner */}
          <div className="bg-[#5C3E2E] text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C89445]/10 rounded-full blur-2xl" />
            
            <img src="/images/logo.jpg" alt="MacTea Logo" className="w-16 h-16 rounded-full object-cover border-2 border-[#C89445] mx-auto mb-3 shadow-lg" />

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
              Order Received!
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF6EE]/80 font-medium">
              Thank you for ordering from MacTea.
            </p>

            <div className="inline-flex items-center gap-2 bg-[#C89445]/20 border border-[#C89445]/40 px-4 py-1 rounded-full text-xs font-bold text-[#C89445] mt-3">
              <span>Order Number:</span>
              <span className="text-white text-sm font-mono tracking-wider">{currentOrder.id}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Live Order Status Stepper */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#5C3E2E] uppercase tracking-wider">
                  Live Order Status
                </h3>
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="text-xs font-semibold text-[#8C5E14] hover:text-[#5C3E2E] flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="relative flex items-center justify-between mb-6 px-4">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-[#E2D2C0] z-0 rounded-full" />
                <div 
                  className={`absolute left-6 top-1/2 -translate-y-1/2 h-1.5 z-0 transition-all duration-500 rounded-full ${
                    currentIndex === 2 ? 'bg-[#2B8A61]' : 'bg-[#C89445]'
                  }`} 
                  style={{ width: `${Math.min((currentIndex / 2) * 100, 100)}%` }}
                />

                {statusSteps.map((step, idx) => {
                  const isDone = idx <= currentIndex;
                  const isCurrent = idx === currentIndex;
                  const isCompletedOrder = currentIndex === 2;
                  const StepIcon = step.icon;

                  let circleStyle = 'bg-[#F5ECE1] text-[#6E5B52] border border-[#E2D2C0]';
                  if (isDone) {
                    if (isCompletedOrder) {
                      circleStyle = 'bg-[#2B8A61] text-white ring-4 ring-[#2B8A61]/30 scale-110 shadow-md';
                    } else if (isCurrent) {
                      circleStyle = 'bg-[#5C3E2E] text-[#C89445] ring-4 ring-[#C89445]/40 scale-110 shadow-md';
                    } else {
                      circleStyle = 'bg-[#C89445] text-white';
                    }
                  }

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${circleStyle}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-extrabold mt-2 ${
                        isCompletedOrder ? 'text-[#2B8A61]' : (isCurrent ? 'text-[#5C3E2E]' : 'text-[#6E5B52]')
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Current Status Message Box */}
              <div className={`p-4 rounded-2xl border text-center transition-all ${
                currentIndex === 2 
                  ? 'bg-[#DCFCE7] border-[#2B8A61]/40 text-[#15803D]' 
                  : 'bg-[#F5ECE1] border-[#E2D2C0] text-[#5C3E2E]'
              }`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${currentIndex === 2 ? 'text-[#15803D]' : 'text-[#8C5E14]'}`}>
                  Status Update
                </p>
                <p className="text-base font-bold mt-0.5">
                  {statusSteps[currentIndex]?.desc}
                </p>
              </div>
            </div>

            {/* Customer & Table Details */}
            <div className="grid grid-cols-2 gap-4 bg-[#EAD9C6]/60 p-4 rounded-2xl border border-[#E2D2C0]">
              <div>
                <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block">Customer Name</span>
                <span className="text-base font-bold text-[#5C3E2E]">{currentOrder.customerName}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block">Table Number</span>
                <span className="text-base font-extrabold text-[#C89445] font-serif bg-[#5C3E2E] px-2.5 py-0.5 rounded-md inline-block">
                  {currentOrder.tableNo}
                </span>
              </div>
            </div>

            {/* Ordered Items List */}
            <div>
              <h4 className="text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-2">
                Ordered Items
              </h4>
              <div className="space-y-2 divide-y divide-[#F5ECE1]">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#5C3E2E] text-[#C89445] font-extrabold text-[10px] flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <span className="font-bold text-[#5C3E2E]">{item.name}</span>
                    </div>
                    <span className="font-serif font-bold text-[#C89445]">
                      Rs. {item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E2D2C0] mt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-[#5C3E2E]">Total Amount</span>
                <span className="font-serif text-xl text-[#C89445]">Rs. {currentOrder.total}</span>
              </div>
            </div>

            {/* Return / Close Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveOrder(null);
                  localStorage.removeItem('mactea_active_order');
                  localStorage.removeItem('mactea_active_order_id');
                  if (setSelectedTable) setSelectedTable('');
                  localStorage.removeItem('mactea_selected_table');
                  if (onReturnMenu) onReturnMenu();
                }}
                className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-[#C89445]" />
                <span>Return to Menu / Place Another Order</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
