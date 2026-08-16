import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, RefreshCw, TrendingUp, Layers } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mactea_cached_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      todaySales: 0,
      totalSales: 0,
      todayOrdersCount: 0,
      pendingCount: 0,
      totalOrders: 0,
      tableStats: {
        T1: { orderCount: 0, revenue: 0 },
        T2: { orderCount: 0, revenue: 0 },
        T3: { orderCount: 0, revenue: 0 },
        T4: { orderCount: 0, revenue: 0 },
        T5: { orderCount: 0, revenue: 0 },
        T6: { orderCount: 0, revenue: 0 }
      }
    };
  });

  const [fetching, setFetching] = useState(false);

  const fetchStats = async () => {
    try {
      setFetching(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        localStorage.setItem('mactea_cached_stats', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) return null;

  // Calculate highest table revenue for percentage bars
  const tableEntries = Object.entries(stats.tableStats || {});
  const maxTableRevenue = Math.max(...tableEntries.map(([_, d]) => d.revenue || 0), 1);

  return (
    <div className="space-y-6 pt-2 sm:pt-4 animate-fade-in">
      
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-[#6E5B52] uppercase tracking-wider block">Today's Sales</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C1A14] tracking-tight block">
              Rs. {Number(stats.todaySales || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-[#6E5B52] font-semibold block truncate">
              Lifetime: Rs. {Number(stats.totalSales || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-[#6E5B52] uppercase tracking-wider block">Today's Orders</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C1A14] tracking-tight block">
              {stats.todayOrdersCount || 0}
            </span>
            <span className="text-[11px] text-[#6E5B52] font-semibold block truncate">
              Lifetime: {stats.totalOrders || 0} orders
            </span>
          </div>
        </div>

        {/* Active Pending */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-[#6E5B52] uppercase tracking-wider block">Active Pending</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C1A14] tracking-tight block">
              {stats.pendingCount || 0}
            </span>
            <span className="text-[11px] text-[#C85A32] font-bold block truncate">
              In Kitchen Queue
            </span>
          </div>
        </div>

        {/* Total Lifetime */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D2C0] shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-[#6E5B52] uppercase tracking-wider block">Total Lifetime</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C1A14] tracking-tight block">
              {stats.totalOrders || 0}
            </span>
            <span className="text-[11px] text-[#6E5B52] font-semibold block truncate">
              Completed & Logged
            </span>
          </div>
        </div>

      </div>

      {/* Table-Wise Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2D2C0] shadow-sm space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2D2C0]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C89445]" />
              <h3 className="text-lg font-extrabold font-serif text-[#5C3E2E]">
                Table-Wise Performance (T1 – T6)
              </h3>
            </div>
            <p className="text-xs text-[#6E5B52] mt-0.5 font-medium">
              Real-time order volume & sales revenue distribution per table.
            </p>
          </div>

          <button 
            onClick={fetchStats} 
            disabled={fetching}
            className="btn-outline text-xs px-4 py-2 flex items-center justify-center gap-1.5 self-start sm:self-auto hover:border-[#C89445]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin text-[#C89445]' : ''}`} />
            <span>{fetching ? 'Updating...' : 'Refresh Data'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-3.5">
          {tableEntries.map(([tableId, tData]) => {
            const revenuePct = Math.min(Math.round(((tData.revenue || 0) / maxTableRevenue) * 100), 100);
            const hasActivity = (tData.orderCount || 0) > 0;

            return (
              <div 
                key={tableId}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  hasActivity 
                    ? 'bg-gradient-to-b from-white to-[#F5ECE1]/60 border-[#C89445]/40 shadow-sm' 
                    : 'bg-[#F9F5F0] border-[#E2D2C0]/80 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#5C3E2E] text-[#C89445] text-xs font-black font-serif px-3 py-1 rounded-lg shadow-sm tracking-wide">
                    {tableId}
                  </span>
                  {hasActivity && (
                    <span className="w-2 h-2 rounded-full bg-[#2B8A61] animate-pulse" title="Active revenue" />
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block">Orders</span>
                  <p className="text-base font-extrabold text-[#5C3E2E]">{tData.orderCount || 0}</p>
                  
                  <span className="text-[11px] font-bold text-[#6E5B52] uppercase tracking-wider block mt-1.5">Revenue</span>
                  <p className="text-sm font-extrabold text-[#8C5E14]">
                    Rs. {Number(tData.revenue || 0).toLocaleString()}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#E2D2C0]/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C89445] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${revenuePct}%` }}
                  />
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
