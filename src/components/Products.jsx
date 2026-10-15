import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, ChevronLeft, ChevronRight, Package, Image as ImageIcon } from 'lucide-react';
import { getProducts, deleteProduct, getImageUrl } from '../api/api';

export default function Products({ onOpenAddProduct, onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [brand, setBrand] = useState('Barchasi');
  const [sort, setSort] = useState('Yangi');

  const [deletingId, setDeletingId] = useState(null);

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        category: category !== 'Barchasi' ? category : '',
        brand: brand !== 'Barchasi' ? brand : '',
        search,
        page,
        limit: 10
      });

      if (data) {
        const items = data.items || data;
        setProducts(Array.isArray(items) ? items : []);
        setTotal(data.total || items.length || 0);
        setPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, [page, category, brand, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Haqiqatdan ham ushbu mahsulotni o\'chirmoqchimisiz?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      try {
        fetch('https://xonbozoruz.vercel.app/api/revalidate', { method: 'POST', mode: 'no-cors' }).catch(() => {});
      } catch (_) {}
      fetchProductsList();
    } catch (err) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi');
    } finally {
      setDeletingId(null);
    }
  };

  // Format money helper
  const formatMoney = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  // Render product image thumbnail helper
  const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string' && images) return images;
    return null;
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mahsulotlar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Do'kondagi barcha mobil qurilmalar va aksessuarlar
          </p>
        </div>
        <button
          onClick={onOpenAddProduct}
          className="px-5 py-3 bg-black hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Mahsulot qo'shish</span>
        </button>
      </div>

      {/* Filters Bar Card (Matches Image 3) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot nomi yoki artikul..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span>Kategoriya:</span>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="Phones">Phones</option>
              <option value="Used Phones">Used Phones</option>
              <option value="Elektronika">Elektronika</option>
              <option value="Aksessuarlar">Aksessuarlar</option>
              <option value="Home appliances">Home appliances</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span>Brend:</span>
            <select
              value={brand}
              onChange={(e) => { setBrand(e.target.value); setPage(1); }}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Honor">Honor</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span>Saralash:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Yangi">Yangi</option>
              <option value="Arzonroq">Arzonroq</option>
              <option value="Qimmatroq">Qimmatroq</option>
              <option value="Omborda kam">Omborda kam</option>
            </select>
          </div>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Mahsulotlar yuklanmoqda...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">Mahsulotlar topilmadi</div>
            <div className="text-xs">Qidiruv yoki filtr mezonlarini o'zgartirib ko'ring</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-16">RASM</th>
                  <th className="py-4 px-6">NOMI</th>
                  <th className="py-4 px-6">KATEGORIYA</th>
                  <th className="py-4 px-6">BREND</th>
                  <th className="py-4 px-6">NARX</th>
                  <th className="py-4 px-6">ESKI NARX</th>
                  <th className="py-4 px-6">CHEGIRMA %</th>
                  <th className="py-4 px-6">OMBOR</th>
                  <th className="py-4 px-6 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((item) => {
                  const imgUrl = getProductImage(item.images);
                  const isLowStock = (item.stock || 0) <= 5;
                  const skuCode = `ART-${(item._id || '').slice(-5).toUpperCase()}-UZ`;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* RASM */}
                      <td className="py-4 px-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {imgUrl ? (
                            <img
                              src={getImageUrl(imgUrl)}
                              alt={item.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full items-center justify-center text-slate-300 ${imgUrl ? 'hidden' : 'flex'}`}>
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        </div>
                      </td>

                      {/* NOMI & SKU */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm leading-snug">{item.name}</div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{skuCode}</div>
                      </td>

                      {/* KATEGORIYA */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {item.category || 'Phones'}
                      </td>

                      {/* BREND */}
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {item.brand || 'Apple'}
                        </span>
                      </td>

                      {/* NARX */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {formatMoney(item.price)}
                      </td>

                      {/* ESKI NARX */}
                      <td className="py-4 px-6 text-slate-400 line-through">
                        {item.oldPrice ? formatMoney(item.oldPrice) : '-'}
                      </td>

                      {/* CHEGIRMA % */}
                      <td className="py-4 px-6">
                        {item.discount ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            -{item.discount}%
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* OMBOR */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span>{item.stock || 0} dona</span>
                        </div>
                      </td>

                      {/* AMALLAR */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditProduct(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            Ko'rsatilmoqda <span className="text-slate-900 font-bold">{products.length > 0 ? (page - 1) * 10 + 1 : 0}-{Math.min(page * 10, total)}</span> dan <span className="text-slate-900 font-bold">{new Intl.NumberFormat('uz-UZ').format(total)}</span> ta
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>

            <span className="px-3 py-1.5 bg-black text-white rounded-xl font-bold">
              {page}
            </span>

            <button
              onClick={() => setPage(p => Math.min(p + 1, pages))}
              disabled={page >= pages}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
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

