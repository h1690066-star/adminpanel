import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import ProductModal from './components/ProductModal';
import Orders from './components/Orders';
import OrderReceiptModal from './components/OrderReceiptModal';
import Customers from './components/Customers';
import SiteEditor from './components/SiteEditor';
import { getDashboardStats } from './api/api';

class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Tab render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="text-lg font-bold text-slate-900">Ushbu sahifani yuklashda xatolik yuz berdi</h3>
          <p className="text-xs text-rose-600 font-mono bg-rose-50 p-3 rounded-xl max-h-32 overflow-y-auto text-left">
            {this.state.error?.message || 'Noma\'lum xatolik'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Sahifani qayta yuklash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [navCounts, setNavCounts] = useState({
    products: 0,
    orders: 0,
    newOrders: 0,
    customers: 0,
  });

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    getDashboardStats()
      .then((data) => {
        if (data?.summary) {
          setNavCounts({
            products: data.summary.totalProducts || 0,
            orders: data.summary.totalOrders || 0,
            newOrders: data.summary.newOrders || 0,
            customers: data.summary.totalCustomers || 0,
          });
        }
      })
      .catch(() => { });
  }, [isAuthenticated, refreshKey]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const tabTitles = {
    dashboard: 'Boshqaruv va Analitika Markazi',
    products: 'Mahsulotlar va Ombor Boshqaruvi',
    orders: 'Buyurtmalar va To\'lov Nazorati',
    customers: 'Mijozlar Bazasi (CRM)',
    'site-editor': 'Saytni Tahrirlash (Live CMS)',
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f1f4f9] text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        onOpenAddProduct={handleOpenAddProduct}
        counts={navCounts}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar */}
        <Topbar
          title={tabTitles[activeTab] || 'Boshqaruv paneli'}
          activeTab={activeTab}
          search={globalSearch}
          setSearch={setGlobalSearch}
          onRefresh={triggerRefresh}
          onOpenAddProduct={handleOpenAddProduct}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Tab Views */}
        <main className="flex-1 overflow-y-auto">
          <TabErrorBoundary key={activeTab}>
            {activeTab === 'dashboard' && (
              <Dashboard
                key={`dash-${refreshKey}`}
                setActiveTab={setActiveTab}
                onSelectOrder={handleSelectOrder}
                onOpenAddProduct={handleOpenAddProduct}
              />
            )}

            {activeTab === 'products' && (
              <Products
                key={`prod-${refreshKey}`}
                onOpenAddProduct={handleOpenAddProduct}
                onEditProduct={handleEditProduct}
                globalSearch={globalSearch}
              />
            )}

            {activeTab === 'orders' && (
              <Orders
                key={`ord-${refreshKey}`}
                onSelectOrder={handleSelectOrder}
                globalSearch={globalSearch}
              />
            )}

            {activeTab === 'customers' && (
              <Customers
                key={`cust-${refreshKey}`}
                globalSearch={globalSearch}
              />
            )}

            {activeTab === 'site-editor' && (
              <SiteEditor key={`cms-${refreshKey}`} />
            )}
          </TabErrorBoundary>
        </main>
      </div>

      {/* Global Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onRefresh={triggerRefresh}
        editingProduct={editingProduct}
      />

      {/* Global Order Detail & Receipt Modal */}
      <OrderReceiptModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        onStatusUpdated={triggerRefresh}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
