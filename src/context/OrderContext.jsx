import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mactea_cached_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.menuItems && parsed.menuItems.length > 0) {
          return parsed.menuItems;
        }
      }
    } catch (e) {}
    return [];
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('mactea_cached_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories && parsed.categories.length > 0) {
          return parsed.categories;
        }
      }
    } catch (e) {}
    return [];
  });

  const [cart, setCart] = useState([]);
  
  const [selectedTable, setSelectedTable] = useState(() => {
    try {
      const saved = localStorage.getItem('mactea_selected_table');
      if (saved) return saved;
    } catch (e) {}
    return '';
  });

  const [customerName, setCustomerName] = useState(() => {
    try {
      const saved = localStorage.getItem('mactea_customer_name');
      if (saved) return saved;
    } catch (e) {}
    return '';
  });

  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const savedOrder = localStorage.getItem('mactea_active_order');
      if (savedOrder) return JSON.parse(savedOrder);
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(() => menuItems.length === 0);

  // Check URL query parameters for table auto-selection (?table=T3)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam && /^T[1-6]$/i.test(tableParam)) {
      const formatted = tableParam.toUpperCase();
      setSelectedTable(formatted);
      localStorage.setItem('mactea_selected_table', formatted);
    }
  }, []);

  // Fetch menu data from API without blocking UI if cached items exist
  const fetchMenu = async (forceShowLoading = false) => {
    try {
      if (forceShowLoading || menuItems.length === 0) {
        setLoading(true);
      }
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.menuItems || []);
        setCategories(data.categories || []);
        localStorage.setItem('mactea_cached_menu', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Persistent Live Order Tracking across page refreshes
  useEffect(() => {
    const savedOrderId = localStorage.getItem('mactea_active_order_id');
    if (savedOrderId) {
      checkOrderStatus(savedOrderId);
    }
  }, []);

  const checkOrderStatus = async (orderId) => {
    const targetId = orderId || localStorage.getItem('mactea_active_order_id');
    if (!targetId) return;

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(targetId)}`);
      if (res.ok) {
        const updated = await res.json();
        setActiveOrder(updated);
        localStorage.setItem('mactea_active_order', JSON.stringify(updated));
        if (updated.tableNo) {
          setSelectedTable(updated.tableNo);
          localStorage.setItem('mactea_selected_table', updated.tableNo);
        }
      } else if (res.status === 404) {
        // Order was removed by admin from Live Orders! Clear active order tracking & table selection
        localStorage.removeItem('mactea_active_order_id');
        localStorage.removeItem('mactea_active_order');
        localStorage.removeItem('mactea_selected_table');
        setSelectedTable('');
        setActiveOrder(null);
      }
    } catch (err) {
      console.error('Error checking active order status:', err);
    }
  };

  // Poll active order status every 4s to reflect staff updates or order removal
  useEffect(() => {
    if (!activeOrder?.id) return;
    const interval = setInterval(() => {
      checkOrderStatus(activeOrder.id);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeOrder?.id]);

  // Set new active order and save to localStorage
  const setAndSaveActiveOrder = (order) => {
    if (order && order.id) {
      localStorage.setItem('mactea_active_order_id', order.id);
      localStorage.setItem('mactea_active_order', JSON.stringify(order));
      if (order.tableNo) {
        setSelectedTable(order.tableNo);
        localStorage.setItem('mactea_selected_table', order.tableNo);
      }
      if (order.customerName) {
        setCustomerName(order.customerName);
        localStorage.setItem('mactea_customer_name', order.customerName);
      }
      setActiveOrder(order);
    } else {
      localStorage.removeItem('mactea_active_order_id');
      localStorage.removeItem('mactea_active_order');
      localStorage.removeItem('mactea_selected_table');
      setSelectedTable('');
      setActiveOrder(null);
    }
  };

  // Cart Operations
  const addToCart = (item) => {
    if (!item.isAvailable) return;
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prevCart => {
      return prevCart.map(i => {
        if (i.id === itemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Sound Synthesizer via Web Audio API
  const playNotificationSound = (type = 'new_order') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'new_order') {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.4);
        });
      }
    } catch (e) {
      console.log('Audio playback error:', e);
    }
  };

  return (
    <OrderContext.Provider value={{
      menuItems,
      categories,
      cart,
      selectedTable,
      setSelectedTable,
      customerName,
      setCustomerName,
      activeOrder,
      setActiveOrder: setAndSaveActiveOrder,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      fetchMenu,
      playNotificationSound,
      checkOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
