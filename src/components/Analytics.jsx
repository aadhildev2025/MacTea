import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E2D2C0] text-center">
        <RefreshCw className="w-6 h-6 text-[#C89445] animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold text-[#5C3E2E]">Loading Analytics...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      
      {/* Metric Cards Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold text-xl">
            Rs.
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block">Today's Sales</span>
            <span className="text-2xl font-bold font-serif text-[#5C3E2E]">Rs. {stats.todaySales}</span>
            <span className="text-[10px] text-[#6E5B52] block">Total: Rs. {stats.totalSales}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block">Today's Orders</span>
            <span className="text-2xl font-bold font-serif text-[#5C3E2E]">{stats.todayOrdersCount}</span>
            <span className="text-[10px] text-[#6E5B52] block">Lifetime: {stats.totalOrders}</span>
          </div>
        </div>

        {/* Active / Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block">Active Pending</span>
            <span className="text-2xl font-bold font-serif text-[#5C3E2E]">
              {stats.pendingCount}
            </span>
            <span className="text-[10px] text-[#6E5B52] block">
              In Kitchen Queue
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#6B21A8] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block">Total Lifetime</span>
            <span className="text-2xl font-bold font-serif text-[#5C3E2E]">{stats.totalOrders}</span>
            <span className="text-[10px] text-[#6E5B52] block">Orders Logged</span>
          </div>
        </div>

      </div>

      {/* Table-Wise Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2D2C0] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#5C3E2E]">
              Table-Wise Performance (T1 – T6)
            </h3>
            <p className="text-xs text-[#6E5B52]">
              Order volume and revenue generated per table.
            </p>
          </div>

          <button onClick={fetchStats} className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(stats.tableStats || {}).map(([tableId, tData]) => (
            <div 
              key={tableId}
              className="bg-[#F5ECE1] p-4 rounded-xl border border-[#E2D2C0] text-center space-y-1"
            >
              <span className="bg-[#5C3E2E] text-[#C89445] text-sm font-black font-serif px-2.5 py-0.5 rounded-md inline-block">
                {tableId}
              </span>
              <p className="text-xs font-bold text-[#5C3E2E] pt-1">{tData.orderCount} Orders</p>
              <p className="text-xs font-serif font-bold text-[#C89445]">Rs. {tData.revenue}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
