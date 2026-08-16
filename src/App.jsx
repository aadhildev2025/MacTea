import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { OrderProvider, useOrder } from './context/OrderContext';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function MacTeaApp() {
  const { activeOrder, cartItemCount } = useOrder();
  
  // Check if admin has already logged in once on this browser
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('mactea_admin_logged_in') === 'true';
  });

  const [currentView, setCurrentView] = useState(() => {
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const isPathAdmin = pathname.includes('/admin') || search.includes('admin') || hash.includes('admin');
    const isLogged = localStorage.getItem('mactea_admin_logged_in') === 'true';
    
    // Only show admin view if URL specifically contains /admin AND user is authenticated
    if (isPathAdmin && isLogged) return 'admin';
    return 'customer';
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // URL Path & Query Routing Support: strictly show admin view when URL is /admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isPathAdmin = pathname.includes('/admin') || search.includes('admin') || hash.includes('admin');
      const isLogged = localStorage.getItem('mactea_admin_logged_in') === 'true';

      if (isPathAdmin) {
        if (isLogged) {
          setIsAdminLoggedIn(true);
          setCurrentView('admin');
          setIsAdminModalOpen(false);
        } else {
          setIsAdminModalOpen(true);
        }
      } else {
        // Default home route: ALWAYS show customer menu
        setCurrentView('customer');
        setIsAdminModalOpen(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    return () => window.removeEventListener('popstate', checkAdminRoute);
  }, []);

  const handleScrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    const isLogged = localStorage.getItem('mactea_admin_logged_in') === 'true';
    if (isLogged || isAdminLoggedIn) {
      setIsAdminLoggedIn(true);
      setCurrentView('admin');
      if (!window.location.pathname.includes('/admin')) {
        window.history.pushState({}, '', '/admin');
      }
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminSuccess = (token) => {
    // Save authentication permanently in localStorage
    localStorage.setItem('mactea_admin_logged_in', 'true');
    if (token) localStorage.setItem('mactea_admin_token', token);
    setIsAdminLoggedIn(true);
    setIsAdminModalOpen(false);
    setCurrentView('admin');
    if (!window.location.pathname.includes('/admin')) {
      window.history.pushState({}, '', '/admin');
    }
  };

  // Exit back to customer menu without clearing admin authentication
  const handleAdminExit = () => {
    setCurrentView('customer');
    if (window.location.pathname.includes('/admin')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Explicit logout (clears session and requires password again)
  const handleAdminLogout = () => {
    localStorage.removeItem('mactea_admin_logged_in');
    localStorage.removeItem('mactea_admin_token');
    setIsAdminLoggedIn(false);
    setCurrentView('customer');
    if (window.location.pathname.includes('/admin')) {
      window.history.pushState({}, '', '/');
    }
  };

  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <AdminDashboard 
        onExit={handleAdminExit}
        onLogout={handleAdminLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EFE3D3]">
      
      {/* Clean Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onScrollToMenu={handleScrollToMenu}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content: 100% Focused on Menu */}
      <main className="flex-1">
        
        {/* Active Order Live Tracker Banner */}
        {activeOrder && (
          <OrderTracker 
            order={activeOrder} 
            onReturnMenu={() => {
              const el = document.getElementById('menu-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* MacTea Text-Based Food & Drink Menu */}
        <MenuSection />

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal (Includes Table T1-T6 Selection & Customer Name) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccessOrder={(placedOrder) => {
          setIsCheckoutOpen(false);
          const el = document.getElementById('order-tracker-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Admin Login Modal (Triggered by /admin URL or direct navigation) */}
      <AdminLogin
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          const isLogged = localStorage.getItem('mactea_admin_logged_in') === 'true';
          if (window.location.pathname.includes('/admin') && !isLogged) {
            window.history.pushState({}, '', '/');
          }
        }}
        onLoginSuccess={handleAdminSuccess}
      />
      {currentView === 'customer' && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="md:hidden fixed bottom-6 right-5 z-40 bg-[#5C3E2E] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#C89445] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[#5C3E2E]/40"
          aria-label="Open Cart"
        >
          <ShoppingBag className="w-5 h-5 text-[#C89445]" />
          <span className="text-xs font-extrabold tracking-wide">Cart</span>
          {cartItemCount > 0 && (
            <span className="bg-[#C89445] text-white font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce -ml-0.5 shadow-sm">
              {cartItemCount}
            </span>
          )}
        </button>
      )}

    </div>
  );
}

export default function App() {
  return (
    <OrderProvider>
      <MacTeaApp />
    </OrderProvider>
  );
}
