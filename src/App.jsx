import React, { useState, useEffect } from 'react';
import { OrderProvider, useOrder } from './context/OrderContext';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function MacTeaApp() {
  const { activeOrder } = useOrder();
  
  // Navigation & Modals State
  const [currentView, setCurrentView] = useState('customer'); // 'customer' or 'admin'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // URL Path & Query Routing Support: /admin or ?admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (pathname.includes('/admin') || search.includes('admin') || hash.includes('admin')) {
        if (!isAdminLoggedIn) {
          setIsAdminModalOpen(true);
        } else {
          setCurrentView('admin');
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    return () => window.removeEventListener('popstate', checkAdminRoute);
  }, [isAdminLoggedIn]);

  const handleScrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setCurrentView('admin');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin');
  };

  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <AdminDashboard 
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setCurrentView('customer');
          if (window.location.pathname.includes('/admin')) {
            window.history.pushState({}, '', '/');
          }
        }}
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
          if (window.location.pathname.includes('/admin')) {
            window.history.pushState({}, '', '/');
          }
        }}
        onLoginSuccess={handleAdminSuccess}
      />

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
