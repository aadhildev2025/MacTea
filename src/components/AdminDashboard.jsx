import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, 
  Search, Printer, ShieldCheck, 
  BookOpen, BarChart3, LogOut, Trash2, Key, X, AlertTriangle, Check
} from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import MenuManager from './MenuManager';
import Analytics from './Analytics';

export default function AdminDashboard({ onLogout, onExit }) {
  const { playNotificationSound } = useOrder();
  
  // Persist active tab across browser page refreshes
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const savedTab = localStorage.getItem('mactea_admin_active_tab');

      if (['orders', 'menu', 'analytics'].includes(tabFromUrl)) return tabFromUrl;
      if (['orders', 'menu', 'analytics'].includes(hash)) return hash;
      if (['orders', 'menu', 'analytics'].includes(savedTab)) return savedTab;
    } catch (e) {}
    return 'orders';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('mactea_admin_active_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Change Passcode Modal State
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeData, setPasscodeData] = useState({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
  const [passcodeMsg, setPasscodeMsg] = useState({ type: '', text: '' });
  const [savingPasscode, setSavingPasscode] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [lastOrderId, setLastOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        
        if (data.length > 0) {
          const newest = data[0];
          if (lastOrderId && newest.id !== lastOrderId && newest.status === 'New') {
            playNotificationSound('new_order');
          }
          setLastOrderId(newest.id);
        }

        setOrders(data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [lastOrderId]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleRemoveOrder = async (orderId) => {
    // 1. Instantly filter out from UI
    setOrders(prev => prev.filter(o => o.id !== orderId));

    try {
      // 2. Call POST /api/orders/delete payload for 100% reliable serverless deletion
      const res = await fetch('/api/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId })
      });

      if (!res.ok) {
        // Fallback to DELETE endpoint if needed
        await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' });
      }
      
      // Re-sync with server
      setTimeout(fetchOrders, 500);
    } catch (e) {
      console.error('Error deleting order:', e);
      fetchOrders();
    }
  };

  const handleChangePasscode = async (e) => {
    e.preventDefault();
    setPasscodeMsg({ type: '', text: '' });

    if (!passcodeData.currentPasscode) {
      setPasscodeMsg({ type: 'error', text: 'Please enter your current passcode.' });
      return;
    }
    if (!passcodeData.newPasscode || passcodeData.newPasscode.length < 3) {
      setPasscodeMsg({ type: 'error', text: 'New passcode must be at least 3 characters long.' });
      return;
    }
    if (passcodeData.newPasscode !== passcodeData.confirmPasscode) {
      setPasscodeMsg({ type: 'error', text: 'New passcode and confirm passcode do not match.' });
      return;
    }

    try {
      setSavingPasscode(true);
      const res = await fetch('/api/admin/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode: passcodeData.currentPasscode.trim(),
          newPasscode: passcodeData.newPasscode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update passcode.');
      }

      setPasscodeMsg({ type: 'success', text: 'Passcode updated successfully!' });
      setTimeout(() => {
        setIsPasscodeModalOpen(false);
        setPasscodeData({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
        setPasscodeMsg({ type: '', text: '' });
      }, 1500);

    } catch (err) {
      setPasscodeMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPasscode(false);
    }
  };

  const handlePrintTicket = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kitchen Ticket ${order.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; width: 300px; }
            h2 { text-align: center; margin-bottom: 5px; }
            .meta { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { border-top: 1px dashed #000; pt: 10px; margin-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>MacTea Kitchen</h2>
          <div class="meta">
            <div>Order: ${order.id}</div>
            <div>Table: ${order.tableNo}</div>
            <div>Customer: ${order.customerName}</div>
            <div>Time: ${new Date(order.createdAt).toLocaleTimeString()}</div>
          </div>
          ${order.items.map(i => `<div class="item"><span>${i.quantity}x ${i.name}</span><span>Rs.${i.price * i.quantity}</span></div>`).join('')}
          <div class="total">Total: Rs. ${order.total}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchTable = tableFilter === 'all' || o.tableNo.toLowerCase() === tableFilter.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchTable && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return <span className="badge badge-new alert-highlight">🔥 New Order</span>;
      case 'Accepted': return <span className="badge badge-accepted">👍 Accepted</span>;
      case 'Completed': return <span className="badge badge-completed">✨ Completed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5ECE1] text-[#2C1A14] antialiased">
      
      {/* Top Staff Navigation Header */}
      <header className="bg-[#452B1E] text-white sticky top-0 z-30 shadow-lg border-b border-[#C89445]/30 backdrop-blur-md">
        <div className="mactea-container flex items-center justify-between h-16 sm:h-18 px-3 sm:px-4">
          
          <div className="flex items-center gap-3">
            <img src="/images/logo.jpg" alt="MacTea Logo" className="w-10 h-10 rounded-full object-cover border-2 border-[#C89445] shadow-md shadow-[#C89445]/20" />
            <div>
              <h1 className="font-serif font-extrabold text-base sm:text-lg text-white leading-none tracking-wide">
                MACTEA Staff Admin
              </h1>
              <span className="text-[10px] text-[#C89445] font-extrabold uppercase tracking-widest block mt-0.5">
                Real-Time Order Control Center
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#341F15] p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => handleTabChange('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'orders' ? 'bg-[#C89445] text-[#2C1A14] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Live Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('menu')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'menu' ? 'bg-[#C89445] text-[#2C1A14] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Menu Management</span>
            </button>

            <button
              onClick={() => handleTabChange('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'analytics' ? 'bg-[#C89445] text-[#2C1A14] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Sales & Analytics</span>
            </button>
          </div>

          {/* Header Actions: Change Passcode & Exit */}
          <div className="flex items-center gap-2">
            
            <button
              onClick={() => setIsPasscodeModalOpen(true)}
              className="bg-[#341F15] hover:bg-[#25150E] text-[#C89445] px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-[#C89445]/30 shadow-sm"
              title="Change Staff Passcode"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Passcode</span>
            </button>

            <button
              onClick={onExit || onLogout}
              className="bg-[#341F15] hover:bg-[#C85A32] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-white/10 shadow-sm"
              title="Return to Menu"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden bg-[#341F15] p-2 gap-1.5 text-xs font-bold text-white border-b border-[#5C3E2E]">
        <button
          onClick={() => handleTabChange('orders')}
          className={`flex-1 py-2 rounded-xl text-center transition-colors flex items-center justify-center gap-1 ${activeTab === 'orders' ? 'bg-[#C89445] text-[#2C1A14] font-black' : 'text-white/80'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => handleTabChange('menu')}
          className={`flex-1 py-2 rounded-xl text-center transition-colors flex items-center justify-center gap-1 ${activeTab === 'menu' ? 'bg-[#C89445] text-[#2C1A14] font-black' : 'text-white/80'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Menu</span>
        </button>
        <button
          onClick={() => handleTabChange('analytics')}
          className={`flex-1 py-2 rounded-xl text-center transition-colors flex items-center justify-center gap-1 ${activeTab === 'analytics' ? 'bg-[#C89445] text-[#2C1A14] font-black' : 'text-white/80'}`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="mactea-container pt-8 sm:pt-10 pb-8 px-3 sm:px-4">
        
        {/* VIEW 1: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2D2C0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E5B52]" />
                <input
                  type="text"
                  placeholder="Search order ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-[11px] font-bold text-[#8C5E14] uppercase tracking-wider whitespace-nowrap mr-1">
                  Status:
                </span>
                {['all', 'New', 'Accepted', 'Completed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors capitalize whitespace-nowrap ${
                      statusFilter === s 
                        ? 'bg-[#5C3E2E] text-[#C89445]' 
                        : 'bg-[#F5ECE1] text-[#6E5B52] hover:bg-[#E2D2C0]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Table Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-[11px] font-bold text-[#8C5E14] uppercase tracking-wider">
                  Table:
                </span>
                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F5ECE1] border border-[#E2D2C0] rounded-lg text-xs font-bold text-[#5C3E2E] flex-1 md:flex-initial"
                >
                  <option value="all">All Tables</option>
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                  <option value="T3">T3</option>
                  <option value="T4">T4</option>
                  <option value="T5">T5</option>
                  <option value="T6">T6</option>
                </select>
              </div>

            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="bg-white p-10 sm:p-12 rounded-3xl border border-[#E2D2C0] text-center max-w-md mx-auto">
                <img src="/images/logo.jpg" alt="MacTea Logo" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-[#5C3E2E]" />
                <h3 className="text-lg font-bold font-serif text-[#5C3E2E]">No active orders found</h3>
                <p className="text-xs text-[#6E5B52] mt-1">
                  New incoming table orders will appear here automatically.
                </p>
              </div>
            )}

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredOrders.map((order) => {
                const isNew = order.status === 'New';

                return (
                  <div 
                    key={order.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-md ${
                      isNew 
                        ? 'border-[#C85A32] ring-4 ring-[#C85A32]/20 alert-highlight' 
                        : 'border-[#E2D2C0]'
                    }`}
                  >
                    {/* Header info */}
                    <div className="p-4 sm:p-5 bg-[#F5ECE1] border-b border-[#E2D2C0]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-base font-extrabold text-[#5C3E2E]">
                          {order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#6E5B52]">
                        <span className="font-bold text-[#5C3E2E] text-sm">
                          👤 {order.customerName}
                        </span>
                        <span className="font-extrabold text-sm font-serif bg-[#5C3E2E] text-[#C89445] px-2.5 py-0.5 rounded-md">
                          {order.tableNo}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#6E5B52] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C89445]" />
                        <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="p-4 sm:p-5 flex-1 space-y-2">
                      <h4 className="text-[11px] font-bold text-[#8C5E14] uppercase tracking-wider mb-2">
                        Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
                      </h4>
                      <div className="space-y-1.5 divide-y divide-[#F7EFE5]">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="pt-1.5 first:pt-0 flex justify-between items-center text-xs">
                            <span className="font-bold text-[#5C3E2E]">
                              <span className="text-[#C89445] font-extrabold mr-1.5">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="font-serif font-bold text-[#6E5B52]">
                              Rs. {item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#E2D2C0] mt-3 flex justify-between items-center text-sm font-bold">
                        <span className="text-[#5C3E2E]">Total Amount</span>
                        <span className="font-serif text-lg text-[#C89445]">Rs. {order.total}</span>
                      </div>
                    </div>

                    {/* Action & Removal Controls */}
                    <div className="p-3.5 sm:p-4 bg-[#F5ECE1] border-t border-[#E2D2C0] space-y-2">
                      
                      <div className="space-y-2">
                        {order.status === 'New' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Accepted')}
                            className="w-full btn-primary py-2.5 text-xs font-bold shadow-sm"
                          >
                            Accept Order 👍
                          </button>
                        )}

                        {order.status === 'Accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Completed')}
                            className="w-full bg-[#2B8A61] hover:bg-[#206849] text-white py-2.5 rounded-full text-xs font-bold shadow-sm flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark Completed
                          </button>
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveOrder(order.id)}
                          className="w-full bg-red-50 hover:bg-red-100 text-[#C85A32] border border-[#C85A32]/30 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove from Live Orders</span>
                        </button>
                      </div>

                      {/* Print Ticket Button */}
                      <button
                        onClick={() => handlePrintTicket(order)}
                        className="w-full btn-outline py-1.5 text-[11px] flex items-center justify-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Kitchen Ticket</span>
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* VIEW 2: MENU MANAGER */}
        {activeTab === 'menu' && <MenuManager />}

        {/* VIEW 3: SALES & ANALYTICS */}
        {activeTab === 'analytics' && <Analytics />}

      </main>

      {/* CHANGE PASSCODE MODAL */}
      {isPasscodeModalOpen && (
        <div className="modal-backdrop">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#E2D2C0] animate-fade-in">
            
            <div className="bg-[#5C3E2E] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#C89445]" />
                <h3 className="text-lg font-bold font-serif">Change Staff Passcode</h3>
              </div>
              <button 
                onClick={() => setIsPasscodeModalOpen(false)}
                className="text-white hover:text-[#C89445]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasscode} className="p-6 space-y-4">
              
              {passcodeMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passcodeMsg.type === 'success' 
                    ? 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]' 
                    : 'bg-red-50 text-[#C85A32] border border-red-200'
                }`}>
                  {passcodeMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{passcodeMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1">
                  Current Passcode *
                </label>
                <input
                  type="password"
                  required
                  value={passcodeData.currentPasscode}
                  onChange={(e) => setPasscodeData({ ...passcodeData, currentPasscode: e.target.value })}
                  placeholder="Enter current passcode"
                  className="w-full px-3.5 py-2.5 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1">
                  New Passcode *
                </label>
                <input
                  type="password"
                  required
                  value={passcodeData.newPasscode}
                  onChange={(e) => setPasscodeData({ ...passcodeData, newPasscode: e.target.value })}
                  placeholder="Enter new passcode"
                  className="w-full px-3.5 py-2.5 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3E2E] uppercase tracking-wider mb-1">
                  Confirm New Passcode *
                </label>
                <input
                  type="password"
                  required
                  value={passcodeData.confirmPasscode}
                  onChange={(e) => setPasscodeData({ ...passcodeData, confirmPasscode: e.target.value })}
                  placeholder="Re-enter new passcode"
                  className="w-full px-3.5 py-2.5 bg-[#F5ECE1] border border-[#E2D2C0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89445]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasscodeModalOpen(false)}
                  className="btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPasscode}
                  className="btn-primary text-xs px-5 py-2 font-bold"
                >
                  {savingPasscode ? 'Updating...' : 'Update Passcode'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
