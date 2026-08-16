import React, { useState } from 'react';
import { X, MapPin, User, CheckCircle, AlertTriangle, Coffee, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrder } from '../context/OrderContext';

export default function CheckoutModal({ isOpen, onClose, onSuccessOrder }) {
  const { cart, selectedTable, setSelectedTable, customerName, setCustomerName, cartTotal, clearCart, setActiveOrder, playNotificationSound } = useOrder();
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const tables = [
    { id: 'T1', label: 'T1', desc: 'Table 1' },
    { id: 'T2', label: 'T2', desc: 'Table 2' },
    { id: 'T3', label: 'T3', desc: 'Table 3' },
    { id: 'T4', label: 'T4', desc: 'Table 4' },
    { id: 'T5', label: 'T5', desc: 'Table 5' },
    { id: 'T6', label: 'T6', desc: 'Table 6' }
  ];

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedTable) {
      setErrorMsg('Please select your Table Number (T1 – T6).');
      return;
    }

    if (!customerName || !customerName.trim()) {
      setErrorMsg('Please enter your Customer Name.');
      return;
    }

    if (!cart || cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerName: customerName.trim(),
        tableNo: selectedTable,
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingOrder) {
          setActiveOrder(data.existingOrder);
          playNotificationSound('new_order');
          clearCart();
          onSuccessOrder(data.existingOrder);
          onClose();
          return;
        }
        throw new Error(data.error || 'Failed to place order.');
      }

      // Success!
      setActiveOrder(data);
      playNotificationSound('new_order');
      
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      clearCart();
      onSuccessOrder(data);
      onClose();

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#E2D2C0] flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Modal Header */}
        <div className="bg-[#5C3E2E] text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <img src="/images/logo.jpg" alt="MacTea Logo" className="w-9 h-9 rounded-full object-cover border border-[#C89445]" />
            <div>
              <span className="text-[#C89445] text-xs font-extrabold uppercase tracking-wider">MacTea Checkout</span>
              <h2 className="text-xl font-bold font-serif">Table & Customer Details</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handlePlaceOrder} className="p-6 overflow-y-auto space-y-6">
          
          {errorMsg && (
            <div className="bg-[#C85A32]/10 border border-[#C85A32]/30 p-3.5 rounded-xl text-xs font-bold text-[#C85A32] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: TABLE SELECTION (T1 - T6) */}
          <div>
            <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C89445]" />
              Select Your Table Number <span className="text-[#C85A32]">*</span>
            </label>
            
            <div className="grid grid-cols-3 xs:grid-cols-6 gap-2">
              {tables.map((t) => {
                const isSelected = selectedTable === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTable(t.id)}
                    className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative ${
                      isSelected 
                        ? 'bg-[#5C3E2E] text-white border-[#C89445] ring-4 ring-[#C89445]/30 shadow-md scale-105' 
                        : 'bg-[#F5ECE1] text-[#5C3E2E] border-[#E2D2C0] hover:border-[#C89445]'
                    }`}
                  >
                    <span className={`text-lg font-black font-serif ${isSelected ? 'text-[#C89445]' : 'text-[#5C3E2E]'}`}>
                      {t.label}
                    </span>
                    <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/80' : 'text-[#6E5B52]'}`}>
                      {t.desc}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 text-[#C89445]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {!selectedTable && (
              <p className="text-[11px] text-[#C85A32] font-semibold mt-1">
                Please tap one of the table buttons above (T1 to T6).
              </p>
            )}
          </div>

          {/* STEP 2: CUSTOMER NAME */}
          <div>
            <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#C89445]" />
              Customer Name <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aadhil"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20"
            />
          </div>

          {/* STEP 3: ORDER SUMMARY PREVIEW BOX */}
          <div className="bg-[#F5ECE1] p-4 rounded-2xl border border-[#E2D2C0] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D2C0]">
              <span className="text-xs font-bold text-[#5C3E2E] uppercase tracking-wider">Order Summary</span>
              <span className="text-xs font-bold text-[#8C5E14] bg-[#C89445]/20 px-2.5 py-0.5 rounded-full">
                Table: {selectedTable ? selectedTable : 'Not Selected'}
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="font-bold text-[#5C3E2E]">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-serif font-bold text-[#6E5B52]">
                    Rs. {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E2D2C0] flex justify-between items-center text-sm font-bold">
              <span className="text-[#5C3E2E]">Total Amount to Pay</span>
              <span className="font-serif text-xl text-[#C89445]">Rs. {cartTotal}</span>
            </div>
          </div>

          <p className="text-[11px] text-[#6E5B52] text-center font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2B8A61]" />
            Pay at table when staff delivers your fresh order.
          </p>

          {/* STEP 4: PLACE ORDER BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2 shadow-xl"
          >
            {submitting ? (
              <>
                <Coffee className="w-5 h-5 text-[#C89445] animate-spin" />
                <span>Sending Order to Kitchen...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-[#C89445]" />
                <span>Place Order</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
