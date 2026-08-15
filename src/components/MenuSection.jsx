import React, { useState } from 'react';
import { Search, Plus, Minus, Coffee } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function MenuSection() {
  const { menuItems, categories, cart, addToCart, updateQuantity, loading } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items by category and search query
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu-section" className="py-8 bg-[#F5ECE1]">
      <div className="mactea-container">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[#8C5E14] font-extrabold text-xs uppercase tracking-widest">MacTea Menu</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#5C3E2E] mt-1">
              Food & Drink Menu
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5B52] mt-1">
              Select items to order directly to your table. Prices in Sri Lankan Rupees (Rs.).
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E5B52]" />
            <input
              type="text"
              placeholder="Search tea, rolls, coffee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-[#E2D2C0] rounded-full text-xs font-semibold focus:outline-none focus:border-[#C89445] shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6E5B52] hover:text-[#5C3E2E]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            <span>All Items</span>
            <span className="text-xs opacity-75">({menuItems.length})</span>
          </button>
          
          {categories.map((cat) => {
            const count = menuItems.filter(i => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                <span>{cat.name}</span>
                <span className="text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E2D2C0]">
            <Coffee className="w-10 h-10 text-[#C89445] animate-spin mx-auto mb-3" />
            <p className="text-base font-bold text-[#5C3E2E]">Brewing Menu...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E2D2C0] max-w-md mx-auto">
            <img src="/images/logo.jpg" alt="MacTea Logo" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-[#5C3E2E]" />
            <h3 className="text-xl font-bold font-serif text-[#5C3E2E] mb-1">No items found</h3>
            <p className="text-xs text-[#6E5B52]">Try clearing your search or picking another category.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="btn-outline mt-4 text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Text-Only Menu Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const cartItem = cart.find(c => c.id === item.id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isUnavailable = !item.isAvailable;

            return (
              <div 
                key={item.id}
                className={`menu-card-text ${isUnavailable ? 'unavailable' : ''}`}
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-extrabold text-[#8C5E14] bg-[#C89445]/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.category.replace('_', ' ')}
                    </span>
                    {isUnavailable && (
                      <span className="text-[10px] font-extrabold text-[#C85A32] bg-[#C85A32]/10 px-2 py-0.5 rounded-md uppercase">
                        Unavailable
                      </span>
                    )}
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-base text-[#5C3E2E] leading-snug">
                      {item.name}
                    </h3>
                    <span className="text-base font-extrabold font-serif text-[#C89445] whitespace-nowrap">
                      Rs. {item.price}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#6E5B52] line-clamp-3 mb-4 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Add to Cart / Quantity Controls */}
                <div className="pt-3 border-t border-[#F5ECE1]">
                  {isUnavailable ? (
                    <button 
                      disabled
                      className="w-full py-2 bg-gray-200 text-gray-500 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                    >
                      Currently Unavailable
                    </button>
                  ) : inCartQty > 0 ? (
                    <div className="w-full flex items-center justify-between bg-[#5C3E2E] text-white p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-[#452B1E] hover:bg-[#341F15] flex items-center justify-center text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-extrabold text-xs text-[#C89445] px-2">
                        {inCartQty} in Cart
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-[#452B1E] hover:bg-[#341F15] flex items-center justify-center text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full btn-primary py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-[#C89445]" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
