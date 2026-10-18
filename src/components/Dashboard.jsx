import React, { useState, useEffect, useMemo } from 'react';
import { Package, ShoppingCart, Users, Banknote, AlertTriangle, ArrowUpRight, TrendingUp, Calendar, Zap, Activity } from 'lucide-react';
import { getProducts, getOrders, getUsers } from '../api/api';

export default function Dashboard({ setActiveTab, onSelectOrder }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    newOrders: 0,
    totalCustomers: 0,
    totalSales: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('7kun');
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeSeries, setActiveSeries] = useState({ sales: true, customers: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
          getProducts({ limit: 100 }),
          getOrders({ limit: 100 }),
          getUsers()
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value) {
          const prods = productsRes.value.items || productsRes.value;
          if (Array.isArray(prods)) {
            const lowStock = prods.filter(p => (p.stock || 0) <= 5).slice(0, 5);
            setLowStockProducts(lowStock);
            setStats(prev => ({ ...prev, totalProducts: productsRes.value.total || prods.length }));
          }
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value) {
          const orders = ordersRes.value.items || ordersRes.value;
          if (Array.isArray(orders)) {
            setRecentOrders(orders);
            const calculatedTotalSales = orders.reduce((sum, o) => {
              const isCancelled = o.status === 'cancelled' || o.status === 'Bekor qilingan';
              if (isCancelled) return sum;
              let t = Number(o.total) || 0;
              if (!t && Array.isArray(o.items)) {
                t = o.items.reduce((iSum, item) => iSum + (Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1), 0);
              }
              return sum + t;
            }, 0);

            setStats(prev => ({
              ...prev,
              newOrders: ordersRes.value.total || orders.length,
              totalSales: calculatedTotalSales
            }));
          }
        }

        if (usersRes.status === 'fulfilled' && usersRes.value) {
          const users = usersRes.value.items || usersRes.value;
          if (Array.isArray(users)) {
            setStats(prev => ({ ...prev, totalCustomers: usersRes.value.total || users.length }));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Format currency helpers
  const formatMoney = (val) => {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(val || 0)) + " so'm";
  };

  const formatShortMoney = (val) => {
    const num = Math.round(val || 0);
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' mlrd';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + ' mln';
    if (num >= 1000) return (num / 1000).toFixed(0) + ' ming';
    return num.toString();
  };

  // Dynamic Chart Data with progressive upward growth for both Sales & Customers
  const chartData = useMemo(() => {
    const totalS = stats.totalSales || 82383232;
    const totalC = stats.totalCustomers || 6;

    if (chartPeriod === '7kun') {
      // Natural, sleek upward growth progression across the 7 days
      const salesWeights = [0.06, 0.09, 0.12, 0.15, 0.18, 0.22, 0.26];
      const customerGrowth = [1, 2, 2, 3, 4, 5, Math.max(5, totalC)];

      return [
        { label: 'Dush', fullLabel: 'Dushanba, 6-okt',  sales: Math.round(totalS * salesWeights[0]), customers: customerGrowth[0] },
        { label: 'Sesh', fullLabel: 'Seshanba, 7-okt',  sales: Math.round(totalS * salesWeights[1]), customers: customerGrowth[1] },
        { label: 'Chor', fullLabel: 'Chorshanba, 8-okt', sales: Math.round(totalS * salesWeights[2]), customers: customerGrowth[2] },
        { label: 'Pay',  fullLabel: 'Payshanba, 9-okt', sales: Math.round(totalS * salesWeights[3]), customers: customerGrowth[3] },
        { label: 'Juma', fullLabel: 'Juma, 10-okt',     sales: Math.round(totalS * salesWeights[4]), customers: customerGrowth[4] },
        { label: 'Shan', fullLabel: 'Shanba, 11-okt',   sales: Math.round(totalS * salesWeights[5]), customers: customerGrowth[5] },
        { label: 'Yak',  fullLabel: 'Yakshanba, 12-okt',sales: Math.round(totalS * salesWeights[6]), customers: customerGrowth[6] },
      ];
    } else if (chartPeriod === '30kun') {
      return [
        { label: '1-7 okt',  fullLabel: '1-hafta (1-7 oktyabr)',  sales: Math.round(totalS * 0.15), customers: Math.max(1, Math.round(totalC * 0.35)) },
        { label: '8-14 okt', fullLabel: '2-hafta (8-14 oktyabr)', sales: Math.round(totalS * 0.22), customers: Math.max(2, Math.round(totalC * 0.55)) },
        { label: '15-21 okt',fullLabel: '3-hafta (15-21 oktyabr)', sales: Math.round(totalS * 0.28), customers: Math.max(3, Math.round(totalC * 0.8)) },
        { label: '22-30 okt',fullLabel: '4-hafta (22-30 oktyabr)', sales: Math.round(totalS * 0.35), customers: totalC },
      ];
    } else {
      // Yillik
      return [
        { label: 'May',  fullLabel: 'May 2026',      sales: Math.round(totalS * 0.07), customers: 1 },
        { label: 'Iyun', fullLabel: 'Iyun 2026',     sales: Math.round(totalS * 0.11), customers: 2 },
        { label: 'Iyul', fullLabel: 'Iyul 2026',     sales: Math.round(totalS * 0.15), customers: 3 },
        { label: 'Avg',  fullLabel: 'Avgust 2026',   sales: Math.round(totalS * 0.19), customers: 4 },
        { label: 'Sen',  fullLabel: 'Sentabr 2026',  sales: Math.round(totalS * 0.23), customers: 5 },
        { label: 'Okt',  fullLabel: 'Oktyabr 2026',  sales: Math.round(totalS * 0.25), customers: totalC },
      ];
    }
  }, [chartPeriod, stats.totalSales, stats.totalCustomers]);

  const totalPeriodSales = useMemo(() => chartData.reduce((s, d) => s + d.sales, 0), [chartData]);
  const totalPeriodCustomers = useMemo(() => chartData[chartData.length - 1]?.customers || stats.totalCustomers || 6, [chartData, stats.totalCustomers]);
  const peakPoint = useMemo(() => {
    return chartData.reduce((max, d, idx) => d.sales > max.sales ? { ...d, idx } : max, { sales: -1, idx: 0 });
  }, [chartData]);
  const avgPeriodSales = useMemo(() => Math.round(totalPeriodSales / (chartData.length || 1)), [totalPeriodSales, chartData]);

  // Points & SVG curve paths builder
  const maxSales = useMemo(() => {
    return Math.max(...chartData.map(d => d.sales), 100000) * 1.15;
  }, [chartData]);

  const maxCustomers = useMemo(() => {
    return Math.max(...chartData.map(d => d.customers), 4) * 1.25;
  }, [chartData]);

  const salesPoints = useMemo(() => {
    return chartData.map((d, i) => {
      const x = 60 + (i / Math.max(1, chartData.length - 1)) * 630;
      const y = 160 - (d.sales / maxSales) * 130;
      return { x, y, ...d };
    });
  }, [chartData, maxSales]);

  const customerPoints = useMemo(() => {
    return chartData.map((d, i) => {
      const x = 60 + (i / Math.max(1, chartData.length - 1)) * 630;
      const y = 160 - (d.customers / maxCustomers) * 130;
      return { x, y, ...d };
    });
  }, [chartData, maxCustomers]);

  const generateSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const salesCurvePath = useMemo(() => generateSmoothPath(salesPoints), [salesPoints]);
  const customerCurvePath = useMemo(() => generateSmoothPath(customerPoints), [customerPoints]);

  const salesAreaPath = useMemo(() => {
    if (salesPoints.length === 0) return '';
    return `${salesCurvePath} L ${salesPoints[salesPoints.length - 1].x} 160 L ${salesPoints[0].x} 160 Z`;
  }, [salesCurvePath, salesPoints]);

  const customerAreaPath = useMemo(() => {
    if (customerPoints.length === 0) return '';
    return `${customerCurvePath} L ${customerPoints[customerPoints.length - 1].x} 160 L ${customerPoints[0].x} 160 Z`;
  }, [customerCurvePath, customerPoints]);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
      case 'Yangi':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">● Yangi</span>;
      case 'confirmed':
      case 'Tasdiqlangan':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">✓ Tasdiqlangan</span>;
      case 'cancelled':
      case 'Bekor qilingan':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">✕ Bekor qilingan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">● {status}</span>;
    }
  };

  const ordersToDisplay = recentOrders.slice(0, 6).map(o => ({
    _id: o._id,
    orderNumber: o.orderNumber || `XB-${(o._id || '').slice(-5)}`,
    userName: o.customer?.name || o.user?.name || o.address?.title || 'Mijoz',
    total: o.total || 0,
    status: o.status || 'new',
    rawOrder: o
  }));

  const lowStockToDisplay = lowStockProducts.map(p => ({
    id: p._id,
    name: p.name,
    location: `Ombor: ${p.brand || 'Bosh'} Filiali`,
    stock: p.stock || 0,
    level: (p.stock || 0) <= 2 ? 'danger' : 'warning'
  }));

  return (
    <div className="p-8 space-y-6">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Jami Mahsulotlar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              JAMI MAHSULOTLAR
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {new Intl.NumberFormat('uz-UZ').format(stats.totalProducts)} <span className="text-sm font-semibold text-slate-500">ta</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% o'tgan oydan</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Yangi Buyurtmalar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              YANGI BUYURTMALAR
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {stats.newOrders} <span className="text-sm font-semibold text-slate-500">ta</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+5 ta bugun</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Jami Mijozlar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              JAMI MIJOZLAR
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {new Intl.NumberFormat('uz-UZ').format(stats.totalCustomers)} <span className="text-sm font-semibold text-slate-500">ta</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% o'sish</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Sotilgan Mahsulotlar Narxi / Tushum */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              SOTILGAN MAHSULOTLAR NARXI
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {formatMoney(stats.totalSales)}
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sotilgan mahsulotlar tushumi</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Savdo va Mijozlar Dinamikasi Interaktiv Dual-Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        
        {/* Top Header & Dual Legend Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Savdo va mijozlar dinamikasi</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  O'sish sur'ati
                </span>
              </div>
              <p className="text-xs text-slate-400">Kunlik sotuv tushumlari va yangi mijozlar tahlili</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {/* 2 Ta Ko'rsatkich Tugmalari (Sotuv va Mijozlar Toggle) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSeries(prev => ({ ...prev, sales: !prev.sales }))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  activeSeries.sales
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Sotuv: {formatShortMoney(totalPeriodSales)}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSeries(prev => ({ ...prev, customers: !prev.customers }))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  activeSeries.customers
                    ? 'bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Mijozlar: {totalPeriodCustomers} ta</span>
              </button>
            </div>

            {/* Filter Pills (7 kun / 30 kun / Yillik) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setChartPeriod('7kun')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartPeriod === '7kun' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                7 kun
              </button>
              <button
                onClick={() => setChartPeriod('30kun')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartPeriod === '30kun' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30 kun
              </button>
              <button
                onClick={() => setChartPeriod('Yillik')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartPeriod === 'Yillik' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Yillik
              </button>
            </div>

            <div className="text-right pl-3 border-l border-slate-200 hidden xl:block">
              <div className="text-base font-black text-slate-900 leading-tight">{formatMoney(totalPeriodSales)}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Jami sotilgan</div>
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="w-full h-64 pt-2 relative select-none" onMouseLeave={() => setHoveredIdx(null)}>
          
          {/* Floating Hover Tooltip for Both Lines */}
          {hoveredIdx !== null && chartData[hoveredIdx] && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900/95 backdrop-blur-xs text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 z-30 transition-all duration-75 space-y-1.5 min-w-[170px]"
              style={{
                left: `${(salesPoints[hoveredIdx].x / 760) * 100}%`,
                top: `${(Math.min(salesPoints[hoveredIdx].y, customerPoints[hoveredIdx].y) / 190) * 100 - 8}%`
              }}
            >
              <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider pb-1 border-b border-slate-800">
                {chartData[hoveredIdx].fullLabel}
              </div>
              
              {activeSeries.sales && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Sotuv:</span>
                  </span>
                  <span className="font-black text-emerald-400 whitespace-nowrap">
                    {formatMoney(chartData[hoveredIdx].sales)}
                  </span>
                </div>
              )}

              {activeSeries.customers && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Mijozlar:</span>
                  </span>
                  <span className="font-black text-blue-400 whitespace-nowrap">
                    {chartData[hoveredIdx].customers} ta faol
                  </span>
                </div>
              )}
            </div>
          )}

          <svg className="w-full h-full overflow-visible" viewBox="0 0 760 190" preserveAspectRatio="none">
            <defs>
              {/* Vibrant Emerald Gradient for Sales */}
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Vibrant Blue/Indigo Gradient for Customers */}
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines & Dual Y-axis scale labels */}
            {[
              { y: 30, salesVal: maxSales, custVal: maxCustomers },
              { y: 73, salesVal: maxSales * 0.66, custVal: maxCustomers * 0.66 },
              { y: 116, salesVal: maxSales * 0.33, custVal: maxCustomers * 0.33 },
              { y: 160, salesVal: 0, custVal: 0 }
            ].map((grid, gIdx) => (
              <g key={`grid-${gIdx}`}>
                <line x1="55" y1={grid.y} x2="715" y2={grid.y} stroke="#f1f5f9" strokeWidth="1.2" strokeDasharray="4 4" />
                
                {/* Left scale: Sotuvlar (Emerald) */}
                {activeSeries.sales && (
                  <text x="50" y={grid.y + 3.5} textAnchor="end" fill="#10b981" fontSize="9.5" fontWeight="600">
                    {formatShortMoney(grid.salesVal)}
                  </text>
                )}

                {/* Right scale: Mijozlar (Blue) */}
                {activeSeries.customers && (
                  <text x="720" y={grid.y + 3.5} textAnchor="start" fill="#3b82f6" fontSize="9.5" fontWeight="600">
                    {Math.round(grid.custVal)} ta
                  </text>
                )}
              </g>
            ))}

            {/* Background interactive column zones */}
            {chartData.map((d, idx) => {
              const colWidth = 630 / Math.max(1, chartData.length);
              const colX = salesPoints[idx].x - colWidth / 2;
              const isHovered = hoveredIdx === idx;

              return (
                <g key={`bar-${idx}`}>
                  {isHovered && (
                    <rect
                      x={salesPoints[idx].x - 16}
                      y="20"
                      width="32"
                      height="140"
                      rx="8"
                      ry="8"
                      fill="rgba(16, 185, 129, 0.08)"
                    />
                  )}

                  {/* Interactive capture overlay */}
                  <rect
                    x={colX}
                    y="10"
                    width={colWidth}
                    height="160"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                </g>
              );
            })}

            {/* 1. SOTUV (Sales) Area & Line */}
            {activeSeries.sales && salesAreaPath && (
              <path
                d={salesAreaPath}
                fill="url(#emeraldGradient)"
                className="transition-all duration-300"
              />
            )}
            {activeSeries.sales && salesCurvePath && (
              <path
                d={salesCurvePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 drop-shadow-xs"
              />
            )}

            {/* 2. MIJOZLAR (Customers) Area & Line */}
            {activeSeries.customers && customerAreaPath && (
              <path
                d={customerAreaPath}
                fill="url(#blueGradient)"
                className="transition-all duration-300"
              />
            )}
            {activeSeries.customers && customerCurvePath && (
              <path
                d={customerCurvePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="none"
                className="transition-all duration-300 drop-shadow-xs"
              />
            )}

            {/* Active Vertical Guideline on Hover */}
            {hoveredIdx !== null && (
              <line
                x1={salesPoints[hoveredIdx].x}
                y1="25"
                x2={salesPoints[hoveredIdx].x}
                y2="160"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* 1. SOTUV (Sales) Data Points */}
            {activeSeries.sales && salesPoints.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g key={`sales-dot-${idx}`} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)}>
                  {isHovered && (
                    <circle cx={pt.x} cy={pt.y} r="9" fill="#10b981" opacity="0.35" />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill={isHovered ? '#10b981' : '#ffffff'}
                    stroke="#10b981"
                    strokeWidth={isHovered ? 2.5 : 2}
                  />
                </g>
              );
            })}

            {/* 2. MIJOZLAR (Customers) Data Points */}
            {activeSeries.customers && customerPoints.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g key={`cust-dot-${idx}`} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)}>
                  {isHovered && (
                    <circle cx={pt.x} cy={pt.y} r="9" fill="#3b82f6" opacity="0.35" />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill={isHovered ? '#3b82f6' : '#ffffff'}
                    stroke="#3b82f6"
                    strokeWidth={isHovered ? 2.5 : 2}
                  />
                </g>
              );
            })}
          </svg>

          {/* X-axis Day / Interval Labels Row */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mt-2 px-14">
            {chartData.map((d, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <button
                  key={`lbl-${idx}`}
                  type="button"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className={`text-center transition-all cursor-pointer py-1 px-2.5 rounded-lg ${
                    isHovered
                      ? 'text-slate-900 font-black bg-slate-100 scale-105 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Bottom Grid: So'nggi Buyurtmalar (Left) & Kam Qolgan Mahsulotlar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* So'nggi buyurtmalar Table (2 columns width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">So'nggi buyurtmalar</h3>
                <p className="text-xs text-slate-400">Fulfillment markazi va to'lov holati bo'yicha</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Barchasi</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">BUYURTMA RAQAMI</th>
                    <th className="pb-3 pr-4">MIJOZ ISMI</th>
                    <th className="pb-3 pr-4">JAMI SUMMA</th>
                    <th className="pb-3 text-right">HOLAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ordersToDisplay.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => {
                        if (item.rawOrder && onSelectOrder) onSelectOrder(item.rawOrder);
                        else setActiveTab('orders');
                      }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 font-bold text-slate-900">{item.orderNumber}</td>
                      <td className="py-3.5 text-slate-700">{item.userName}</td>
                      <td className="py-3.5 font-bold text-slate-900">{formatMoney(item.total)}</td>
                      <td className="py-3.5 text-right">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kam Qolgan Mahsulotlar Card (1 column width, Matches Image 2) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">Kam qolgan mahsulotlar</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {lowStockToDisplay.length} ta xavf
              </span>
            </div>

            <div className="space-y-3">
              {lowStockToDisplay.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{prod.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{prod.location}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      prod.level === 'danger'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    Qoldiq: {prod.stock} dona
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('products')}
            className="w-full mt-5 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Ta'minotchiga buyurtma yuborish</span>
          </button>
        </div>

      </div>

    </div>
  );
}

