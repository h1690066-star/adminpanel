import React, { useState, useEffect } from 'react';
import {
  Globe,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Image as ImageIcon,
  Phone,
  Clock,
  MapPin,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { getSiteContent, updateSiteContent } from '../api/api';

const DEFAULT_DATA = {
  heroSlides: [
    {
      id: 'slide-1',
      badge: 'Eksklyuziv premyera',
      title: 'Yangi iPhone 18 Pro - Xon Bozorda!',
      text: "Kutilgan titan korpus, eng so'nggi A20 chip va maxsus muddatli to'lov shartlari bilan.",
      cta: 'Hozir xarid qiling',
      href: '/catalog/phones',
      image: '/images/hero/hero-1.png',
      align: 'center'
    },
    {
      id: 'slide-2',
      badge: 'Yangi ranglar',
      title: 'iPhone 18 - uchta yangi rang',
      text: "Binafsha, mis va to'q qizil. Original kafolat va 0% muddatli to'lov.",
      cta: 'Batafsil',
      href: '/catalog/iphone',
      image: '/images/hero/hero-2.png',
      align: 'center'
    },
    {
      id: 'slide-3',
      badge: 'Maxsus taklif',
      title: 'Uy uchun zamonaviy maishiy texnikalar',
      text: 'Muzlatgichlar, konditsionerlar va zamonaviy oshxona anjomlari qulay narxlarda.',
      cta: "Katalogga o'tish",
      href: '/catalog/appliances',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=600&fit=crop',
      align: 'center'
    }
  ],
  quickCards: [
    { id: 'q-1', title: 'Yangi telefonlar', sub: 'Kafolatli va yangi', href: '/catalog/phones' },
    { id: 'q-2', title: 'B/U telefonlar', sub: "Tekshirilgan a'lo holat", href: '/catalog/used' },
    { id: 'q-3', title: 'Aksessuarlar', sub: 'Chexol, oyna, quvvatlagich', href: '/catalog/accessories' },
    { id: 'q-4', title: 'Maishiy texnika', sub: 'Uy qulayligi uchun', href: '/catalog/appliances' }
  ],
  contact: {
    phone: '+998 95 081 38 09',
    workHours: '09:00 - 21:00',
    address: 'Toshkent sh., Chilonzor tumani',
    telegram: 'https://t.me/xonbozor',
    instagram: 'https://www.instagram.com/xon.bazzar?igsh=aHRhbXNpa3R6OTg4&utm_source=qr',
    youtube: 'https://www.youtube.com/@Xonbazar',
    email: 'info@xonbozor.uz'
  },
  perks: [
    { id: 'p-1', text: "0% muddatli to'lov" },
    { id: 'p-2', text: 'Rasmiy kafolat' },
    { id: 'p-3', text: "Toshkent bo'ylab 2 soatda" }
  ],
  promo: {
    tag: 'Eksklyuziv',
    title: 'iPhone 18 Pro',
    text: "Hoxlagan narsa Xon Bozorda — 0% muddatli to'lov",
    cta: 'Batafsil',
    href: '/catalog/iphone'
  },
  announcement: {
    enabled: true,
    text: "🔥 Xon Bozor do'koniga xush kelibsiz! Barcha mahsulotlarga kafolat beriladi."
  }
};

export default function SiteEditor() {
  const [content, setContent] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('banners'); // 'banners' | 'contact' | 'quick' | 'promo'
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Load site content from API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await getSiteContent();
        if (isMounted && data) {
          setContent({
            heroSlides: data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : DEFAULT_DATA.heroSlides,
            quickCards: data.quickCards && data.quickCards.length > 0 ? data.quickCards : DEFAULT_DATA.quickCards,
            contact: { ...DEFAULT_DATA.contact, ...(data.contact || {}) },
            perks: data.perks && data.perks.length > 0 ? data.perks : DEFAULT_DATA.perks,
            promo: { ...DEFAULT_DATA.promo, ...(data.promo || {}) },
            announcement: { ...DEFAULT_DATA.announcement, ...(data.announcement || {}) },
            lastPushedAt: data.lastPushedAt || null
          });
        }
      } catch (err) {
        console.warn('Site content load error, using default:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Save and Push Handler
  const handlePushToSite = async () => {
    try {
      setSaving(true);
      setStatusMessage({ type: 'info', text: 'Saytga chiqarilmoqda va Git serverga yuborilmoqda...' });
      
      const payload = {
        ...content,
        doGitPush: true
      };

      const res = await updateSiteContent(payload);
      
      setStatusMessage({
        type: 'success',
        text: '🚀 Muvaffaqiyatli saqlandi! Sayt va GitHub reposiga yangilanish chiqarildi.'
      });
      if (res.content?.lastPushedAt) {
        setContent(prev => ({ ...prev, lastPushedAt: res.content.lastPushedAt }));
      }
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err) {
      console.error('Push error:', err);
      setStatusMessage({
        type: 'error',
        text: `Xatolik: ${err.message || 'Saytga chiqarishda muammo yuz berdi'}`
      });
    } finally {
      setSaving(false);
    }
  };

  // Banner slide operations
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      badge: 'Yangi taklif',
      title: 'Yangi mahsulot sarlavhasi',
      text: 'Mahsulot haqida qisqacha ma\'lumot va afzalliklari.',
      cta: 'Xarid qilish',
      href: '/catalog',
      image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=1200&h=600&fit=crop',
      align: 'center'
    };
    setContent(prev => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide]
    }));
    setPreviewSlideIdx(content.heroSlides.length);
  };

  const handleUpdateSlide = (index, field, value) => {
    setContent(prev => {
      const updated = [...prev.heroSlides];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, heroSlides: updated };
    });
  };

  const handleDeleteSlide = (index) => {
    if (content.heroSlides.length <= 1) {
      alert("Kamida bitta banner slayd qolishi kerak!");
      return;
    }
    setContent(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index)
    }));
    if (previewSlideIdx >= content.heroSlides.length - 1) {
      setPreviewSlideIdx(Math.max(0, content.heroSlides.length - 2));
    }
  };

  // Image file picker helper
  const handleImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleUpdateSlide(index, 'image', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Quick card operations
  const handleUpdateQuick = (index, field, value) => {
    setContent(prev => {
      const updated = [...prev.quickCards];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, quickCards: updated };
    });
  };

  // Perk operations
  const handleUpdatePerk = (index, value) => {
    setContent(prev => {
      const updated = [...prev.perks];
      updated[index] = { ...updated[index], text: value };
      return { ...prev, perks: updated };
    });
  };

  const currentPreviewSlide = content.heroSlides[previewSlideIdx] || content.heroSlides[0] || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Saytni tahrirlash (Live CMS)
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Bosh sahifa bannerlari, sarlavhalar, telefon va ijtimoiy tarmoqlarni to'g'ridan-to'g'ri o'zgartiring
              </p>
            </div>
          </div>
          {content.lastPushedAt && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              So'nggi chiqarilgan vaqt: {new Date(content.lastPushedAt).toLocaleString('uz-UZ')}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://xonbozor.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Saytni ko'rish</span>
          </a>

          <button
            onClick={handlePushToSite}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{saving ? 'Saytga chiqarilmoqda...' : 'Saytga chiqarish (Push)'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-px">
        {[
          { id: 'banners', label: 'Bosh sahifa Karusel (Bannerlar)', icon: ImageIcon },
          { id: 'contact', label: "Aloqa & Do'kon Ma'lumotlari", icon: Phone },
          { id: 'quick', label: "Tezkor Bo'limlar (Quick Cards)", icon: Layers },
          { id: 'promo', label: "Aksiya & E'lonlar", icon: Megaphone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form Inputs (Left) and Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EDIT CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: BANNERS */}
          {activeSection === 'banners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">
                  Banner Slaydlari ({content.heroSlides.length} ta)
                </h2>
                <button
                  onClick={handleAddSlide}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yangi slayd qo'shish</span>
                </button>
              </div>

              {content.heroSlides.map((slide, index) => (
                <div
                  key={slide.id || index}
                  className={`bg-white rounded-xl border p-5 transition space-y-4 shadow-2xs ${
                    previewSlideIdx === index ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm text-slate-800">
                        {slide.title || `Slayd #${index + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewSlideIdx(index)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium flex items-center gap-1 transition cursor-pointer ${
                          previewSlideIdx === index
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Prevyu</span>
                      </button>

                      {content.heroSlides.length > 1 && (
                        <button
                          onClick={() => handleDeleteSlide(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                          title="Slaydni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slayd ma'lumotlari */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">
                        Nishon (Badge)
                      </label>
                      <input
                        type="text"
                        value={slide.badge || ''}
                        onChange={(e) => handleUpdateSlide(index, 'badge', e.target.value)}
                        placeholder="Masalan: Eksklyuziv premyera"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">
                        Tugma matni (CTA)
                      </label>
                      <input
                        type="text"
                        value={slide.cta || ''}
                        onChange={(e) => handleUpdateSlide(index, 'cta', e.target.value)}
                        placeholder="Masalan: Hozir xarid qiling"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-600 mb-1">
                        Asosiy Sarlavha (Katta matn)
                      </label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => handleUpdateSlide(index, 'title', e.target.value)}
                        placeholder="Masalan: Yangi iPhone 18 Pro - Xon Bozorda!"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-600 mb-1">
                        Tavsif (Kichik matn)
                      </label>
                      <textarea
                        rows={2}
                        value={slide.text || ''}
                        onChange={(e) => handleUpdateSlide(index, 'text', e.target.value)}
                        placeholder="Kutilgan titan korpus, eng so'nggi A20 chip va maxsus muddatli to'lov..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">
                        Tugma havolasi (Href)
                      </label>
                      <input
                        type="text"
                        value={slide.href || ''}
                        onChange={(e) => handleUpdateSlide(index, 'href', e.target.value)}
                        placeholder="/catalog/phones"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">
                        Banner Rasmi (URL yoki fayl)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={slide.image?.startsWith('data:') ? 'Yuklangan fayl (Base64)' : (slide.image || '')}
                          onChange={(e) => handleUpdateSlide(index, 'image', e.target.value)}
                          placeholder="/images/hero/hero-1.png yoki https://..."
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                        />
                        <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer flex items-center justify-center shrink-0" title="Rasm yuklash">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(index, e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ALOQA VA DO'KON */}
          {activeSection === 'contact' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                Aloqa va Ijtimoiy Tarmoqlar
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    Asosiy Telefon Raqam
                  </label>
                  <input
                    type="text"
                    value={content.contact.phone || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="+998 95 081 38 09"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Ish Vaqti
                  </label>
                  <input
                    type="text"
                    value={content.contact.workHours || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      contact: { ...prev.contact, workHours: e.target.value }
                    }))}
                    placeholder="09:00 - 21:00"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    Do'kon Manzili
                  </label>
                  <input
                    type="text"
                    value={content.contact.address || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value }
                    }))}
                    placeholder="Toshkent sh., Chilonzor tumani"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Telegram Kanal / Havola
                  </label>
                  <input
                    type="text"
                    value={content.contact.telegram || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      contact: { ...prev.contact, telegram: e.target.value }
                    }))}
                    placeholder="https://t.me/xonbozor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Instagram Sahifa Havolasi
                  </label>
                  <input
                    type="text"
                    value={content.contact.instagram || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      contact: { ...prev.contact, instagram: e.target.value }
                    }))}
                    placeholder="https://www.instagram.com/xon.bazzar..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    YouTube Kanal Havolasi
                  </label>
                  <input
                    type="text"
                    value={content.contact.youtube || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      contact: { ...prev.contact, youtube: e.target.value }
                    }))}
                    placeholder="https://www.youtube.com/@Xonbazar"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    E-mail Pochta
                  </label>
                  <input
                    type="email"
                    value={content.contact.email || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="info@xonbozor.uz"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEZKOR BO'LIMLAR (QUICK CARDS) */}
          {activeSection === 'quick' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                Bosh Sahifa Tezkor Kartochkalari (4 ta blok)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.quickCards.map((card, idx) => (
                  <div key={card.id || idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
                    <span className="text-xs font-bold text-indigo-600">
                      Kartochka #{idx + 1}
                    </span>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Sarlavha
                      </label>
                      <input
                        type="text"
                        value={card.title || ''}
                        onChange={(e) => handleUpdateQuick(idx, 'title', e.target.value)}
                        placeholder="Yangi telefonlar"
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Izoh / Subtitr
                      </label>
                      <input
                        type="text"
                        value={card.sub || ''}
                        onChange={(e) => handleUpdateQuick(idx, 'sub', e.target.value)}
                        placeholder="Kafolatli va yangi"
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Havola
                      </label>
                      <input
                        type="text"
                        value={card.href || ''}
                        onChange={(e) => handleUpdateQuick(idx, 'href', e.target.value)}
                        placeholder="/catalog/phones"
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AKSIYA VA E'LONLAR */}
          {activeSection === 'promo' && (
            <div className="space-y-5">
              {/* Yuqori qulayliklar / Afzalliklar */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                  Sayt Yuqorisidagi Afzalliklar (Header Perks)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {content.perks.map((perk, pIdx) => (
                    <div key={perk.id || pIdx}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Afzallik #{pIdx + 1}
                      </label>
                      <input
                        type="text"
                        value={perk.text || ''}
                        onChange={(e) => handleUpdatePerk(pIdx, e.target.value)}
                        placeholder="0% muddatli to'lov"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                  Mega Menyu Eksklyuziv Promo Blok
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      Nishon (Tag)
                    </label>
                    <input
                      type="text"
                      value={content.promo.tag || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        promo: { ...prev.promo, tag: e.target.value }
                      }))}
                      placeholder="Eksklyuziv"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      Sarlavha
                    </label>
                    <input
                      type="text"
                      value={content.promo.title || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        promo: { ...prev.promo, title: e.target.value }
                      }))}
                      placeholder="iPhone 18 Pro"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">
                      Matn
                    </label>
                    <input
                      type="text"
                      value={content.promo.text || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        promo: { ...prev.promo, text: e.target.value }
                      }))}
                      placeholder="Hoxlagan narsa Xon Bozorda — 0% muddatli to'lov"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: JONLI REAL-TIME PREVIEW MOCKUP */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800">
                  Jonli Ko'rinish (Real-time Mockup)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                O'zgarishlar darhol ko'rinadi
              </span>
            </div>

            {/* Mockup Frame */}
            <div className="bg-[#0b0f19] rounded-2xl p-4 shadow-xl border border-slate-800 text-white overflow-hidden space-y-4">
              {/* Mockup Header Bar */}
              <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-[10px]">
                    XB
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    Xon <span className="text-indigo-400">Bozor</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold">{content.contact.phone || '+998 95 081 38 09'}</span>
                </div>
              </div>

              {/* Mockup Perks Bar */}
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                {content.perks.map((p, idx) => (
                  <span key={idx} className="truncate">
                    ✓ {p.text}
                  </span>
                ))}
              </div>

              {/* Mockup Hero Banner Carousel Preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 h-48 border border-slate-800 shadow-inner group">
                {/* Background Banner Image */}
                <img
                  src={currentPreviewSlide.image || '/images/hero/hero-1.png'}
                  alt="Banner preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent p-4 flex flex-col justify-center gap-1.5">
                  {currentPreviewSlide.badge && (
                    <span className="w-fit text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                      {currentPreviewSlide.badge}
                    </span>
                  )}
                  <h4 className="text-sm sm:text-base font-extrabold leading-tight text-white line-clamp-2">
                    {currentPreviewSlide.title || 'Sarlavha'}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 max-w-[85%]">
                    {currentPreviewSlide.text || 'Tavsif'}
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 rounded-lg text-white font-semibold text-[10px] shadow-sm">
                      <span>{currentPreviewSlide.cta || 'Batafsil'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>

                {/* Carousel Navigation Dots */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  {content.heroSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setPreviewSlideIdx(dotIdx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        previewSlideIdx === dotIdx ? 'w-4 bg-indigo-500' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Mockup Quick Cards Preview */}
              <div className="grid grid-cols-2 gap-2">
                {content.quickCards.slice(0, 4).map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-center"
                  >
                    <span className="text-[11px] font-bold text-slate-200 truncate">
                      {q.title || 'Bo\'lim'}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate">
                      {q.sub || 'Izoh'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mockup Footer Info Preview */}
              <div className="border-t border-slate-800/80 pt-3 text-[10px] text-slate-400 flex items-center justify-between">
                <span className="truncate">{content.contact.address || 'Toshkent sh.'}</span>
                <span className="text-indigo-400">{content.contact.workHours || '09:00 - 21:00'}</span>
              </div>
            </div>

            {/* Quick reminder box */}
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Eslatma:</span> Tahrirlash tugagach, yuqoridagi <strong>"Saytga chiqarish (Push)"</strong> tugmasini bosing. O'zgarishlar darhol saytga yuklanadi!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
