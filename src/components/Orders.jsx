import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../api/api';

export default function Orders({ selectedOrderFromDash, onSelectOrder }) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const data = await getOrders({
        status: statusFilter !== 'all' ? statusFilter : '',
        page,
        limit: 10
      });

      if (data) {
        const items = data.items || data;
        setOrders(Array.isArray(items) ? items : []);
        setTotal(data.total || items.length || 0);
        setPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, [page, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      fetchOrdersList();
    } catch (err) {
      alert(err.message || 'Statusni o\'zgartirishda xatolik');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm";

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const orderNum = (o.orderNumber || o._id || '').toLowerCase();
    const custName = (o.customer?.name || o.user?.name || o.address?.title || '').toLowerCase();
    const custPhone = (o.customer?.phone || o.user?.phone || o.address?.phone || '').toLowerCase();
    return orderNum.includes(s) || custName.includes(s) || custPhone.includes(s);
  });

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Buyurtmalar</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Web-saytdan tushgan buyurtmalarni ko'rish va boshqarish
        </p>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Pills */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'new', label: 'Yangi' },
            { id: 'confirmed', label: 'Tasdiqlangan' },
            { id: 'cancelled', label: 'Bekor qilingan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyurtma # yoki mijoz nomi..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white font-medium"
          />
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Buyurtmalar yuklanmoqda...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShoppingCart className="w-8 h-8 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">Buyurtmalar topilmadi</div>
            <div className="text-xs">Berilgan status bo'yicha hech qanday buyurtma mavjud emas</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">BUYURTMA RAQAMI</th>
                  <th className="py-4 px-6">MIJOZ</th>
                  <th className="py-4 px-6">MAHSULOTLAR</th>
                  <th className="py-4 px-6">JAMI SUMMA</th>
                  <th className="py-4 px-6">CHEK</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((item) => {
                  const itemCount = Array.isArray(item.items) ? item.items.length : 1;
                  const firstProdName = item.items?.[0]?.name || item.items?.[0]?.product?.name || 'Mahsulot';

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* BUYURTMA RAQAMI */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{item.orderNumber || `XB-${item._id.slice(-6)}`}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.createdAt || Date.now()).toLocaleDateString('uz-UZ')}
                        </div>
                      </td>

                      {/* MIJOZ */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{item.customer?.name || item.user?.name || item.address?.title || 'Mijoz'}</div>
                        <div className="text-[11px] text-slate-400">{item.customer?.phone || item.user?.phone || item.address?.phone || '-'}</div>
                      </td>

                      {/* MAHSULOTLAR */}
                      <td className="py-4 px-6">
                        <div className="text-slate-800 font-semibold truncate max-w-[200px]">{firstProdName}</div>
                        {itemCount > 1 && (
                          <div className="text-[10px] text-slate-400">+{itemCount - 1} ta boshqa mahsulot</div>
                        )}
                      </td>

                      {/* JAMI SUMMA */}
                      <td className="py-4 px-6 font-black text-slate-900 text-sm">
                        {formatMoney(item.total)}
                      </td>

                      {/* CHEK */}
                      <td className="py-4 px-6">
                        {(item.receipt || item.receiptData) ? (
                          <button
                            onClick={() => onSelectOrder(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Chekni ko'rish</span>
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* STATUS SELECTOR */}
                      <td className="py-4 px-6">
                        <select
                          value={item.status || 'new'}
                          disabled={updatingId === item._id}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-2xs ${
                            item.status === 'confirmed' || item.status === 'Tasdiqlangan'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : item.status === 'cancelled' || item.status === 'Bekor qilingan'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                        >
                          <option value="new">● Yangi</option>
                          <option value="confirmed">✓ Tasdiqlangan</option>
                          <option value="cancelled">✕ Bekor qilingan</option>
                        </select>
                      </td>

                      {/* AMALLAR */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onSelectOrder(item)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Batafsil ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            Jami <span className="text-slate-900 font-bold">{total}</span> ta buyurtma
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>
            <span className="px-3 py-1.5 bg-black text-white rounded-xl font-bold">{page}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, pages))}
              disabled={page >= pages}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              <span>Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

