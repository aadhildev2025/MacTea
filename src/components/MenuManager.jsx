import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, X, AlertTriangle } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function MenuManager() {
  const { menuItems, categories, fetchMenu } = useOrder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'tea',
    price: '',
    description: '',
    isAvailable: true,
    tags: ''
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = menuItems.filter(item => {
    const matchCat = selectedCat === 'all' || item.category === selectedCat;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'tea',
      price: '',
      description: '',
      isAvailable: true,
      tags: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      isAvailable: item.isAvailable,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await fetch(`/api/menu/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      if (res.ok) {
        fetchMenu();
      }
    } catch (e) {
      console.error('Error toggling availability:', e);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMenu();
      }
    } catch (e) {
      console.error('Error deleting item:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.price || !formData.category) {
      setErrorMsg('Name, Category, and Price are required.');
      return;
    }

    try {
      setSaving(true);
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        price: Number(formData.price),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save menu item.');
      }

      await fetchMenu();
      setIsModalOpen(false);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#5C3E2E]">
            Menu Management
          </h2>
          <p className="text-xs text-[#6E5B52]">
            Add, edit, change prices, and toggle stock availability for café items.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4 text-[#C89445]" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E5B52]" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCat === 'all' ? 'bg-[#5C3E2E] text-white' : 'bg-white border border-[#E2D2C0] text-[#6E5B52]'
            }`}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCat === c.id ? 'bg-[#5C3E2E] text-white' : 'bg-white border border-[#E2D2C0] text-[#6E5B52]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div 
            key={item.id}
            className={`bg-white p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              item.isAvailable ? 'border-[#E2D2C0]' : 'border-gray-300 bg-gray-50/80 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C5E14] bg-[#C89445]/20 px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
                <span className="font-serif font-extrabold text-[#C89445] text-sm">
                  Rs. {item.price}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#5C3E2E] truncate">
                {item.name}
              </h3>

              <p className="text-xs text-[#6E5B52] line-clamp-2 mt-1 mb-3">
                {item.description}
              </p>
            </div>

            {/* Actions & Availability Toggle */}
            <div className="pt-3 border-t border-[#F5ECE1] flex items-center justify-between">
              <button
                onClick={() => handleToggleAvailability(item)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                  item.isAvailable 
                    ? 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]' 
                    : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FCA5A5]'
                }`}
              >
                {item.isAvailable ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-[#15803D]" />
                    <span>In Stock</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-[#991B1B]" />
                    <span>Unavailable</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 text-gray-600 hover:text-[#5C3E2E] hover:bg-[#F5ECE1] rounded-lg transition-colors"
                  title="Edit item"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-[#C85A32] hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#E2D2C0] animate-fade-in">
            
            <div className="bg-[#5C3E2E] text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-[#C89445]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ceylon Spiced Chai"
                  className="w-full px-3.5 py-2.5 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="280"
                    className="w-full px-3.5 py-2.5 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe flavors, ingredients, serving style..."
                  className="w-full px-3.5 py-2 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-[#5C3E2E]"
                />
                <label htmlFor="availCheck" className="text-xs font-bold text-[#5C3E2E]">
                  Item is Available for Ordering
                </label>
              </div>

              <div className="pt-3 border-t border-[#E2D2C0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-5 py-2 font-bold"
                >
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
