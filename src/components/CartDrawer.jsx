import React from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, MapPin, AlertCircle } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function CartDrawer({ isOpen, onClose, onProceedCheckout }) {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, selectedTable } = useOrder();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="drawer-slide flex flex-col">
        
        {/* Drawer Header */}
        <div className="p-5 bg-[#5C3E2E] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C89445]" />
            <h2 className="text-xl font-bold font-serif">Your Cart</h2>
            {cart.length > 0 && (
              <span className="bg-[#C89445] text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Table Indicator Banner */}
        <div className="bg-[#EAD9C6] px-5 py-3 border-b border-[#E2D2C0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C89445]" />
            <span className="font-bold text-[#5C3E2E]">Table:</span>
            {selectedTable ? (
              <span className="font-extrabold bg-[#5C3E2E] text-white px-2 py-0.5 rounded-md">
                {selectedTable}
              </span>
            ) : (
              <span className="text-[#C85A32] font-extrabold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Select Table (T1-T6)
              </span>
            )}
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <img src="/images/logo.jpg" alt="MacTea Logo" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-[#5C3E2E]" />
              <h3 className="text-lg font-bold font-serif text-[#5C3E2E] mb-1">Your cart is empty</h3>
              <p className="text-xs text-[#6E5B52] max-w-xs mx-auto mb-6">
                Explore our food & drink menu to add items to your table order.
              </p>
              <button
                onClick={onClose}
                className="btn-primary text-xs py-2.5 px-6"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-[#E2D2C0] shadow-sm flex items-center gap-3"
              >
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#5C3E2E] truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs font-serif font-bold text-[#C89445]">
                    Rs. {item.price} <span className="text-[10px] text-[#6E5B52] font-normal">each</span>
                  </p>
                  <p className="text-xs font-semibold text-[#5C3E2E] mt-0.5">
                    Subtotal: Rs. {item.price * item.quantity}
                  </p>
                </div>

                {/* Quantity Adjustment Controls */}
                <div className="flex items-center gap-1.5 bg-[#F5ECE1] p-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-[#5C3E2E] font-bold transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center font-extrabold text-xs text-[#5C3E2E]">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[#5C3E2E] text-white flex items-center justify-center font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-[#C85A32] p-1 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-[#E2D2C0] shadow-lg space-y-4">
            
            <div className="space-y-1.5 text-xs text-[#6E5B52]">
              <div className="flex justify-between">
                <span>Items Total ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-bold text-[#5C3E2E]">Rs. {cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Table Service Charge</span>
                <span className="font-bold text-[#2B8A61]">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#5C3E2E] pt-2 border-t border-[#F5ECE1]">
                <span>Total Amount</span>
                <span className="font-serif text-[#C89445] text-xl">Rs. {cartTotal}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="btn-outline text-xs px-3"
              >
                Clear
              </button>

              <button
                onClick={onProceedCheckout}
                className="flex-1 btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#C89445]" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
