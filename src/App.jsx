import React, { useState } from 'react';
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

function AdminContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Order receipt modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  const tabTitles = {
    dashboard: 'Boshqaruv paneli',
    products: 'Mahsulotlar',
    orders: 'Buyurtmalar',
    customers: 'Mijozlar',
    'site-editor': 'Saytni tahrirlash (Live CMS)'
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
    <div className="flex min-h-screen bg-[#f4f5f8] text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddProduct={handleOpenAddProduct}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          title={tabTitles[activeTab] || 'Boshqaruv paneli'}
          search={globalSearch}
          setSearch={setGlobalSearch}
        />

        {/* Tab Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              onSelectOrder={handleSelectOrder}
            />
          )}

          {activeTab === 'products' && (
            <Products
              onOpenAddProduct={handleOpenAddProduct}
              onEditProduct={handleEditProduct}
            />
          )}

          {activeTab === 'orders' && (
            <Orders
              onSelectOrder={handleSelectOrder}
            />
          )}

          {activeTab === 'customers' && (
            <Customers />
          )}

          {activeTab === 'site-editor' && (
            <SiteEditor />
          )}
        </main>
      </div>

      {/* Global Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onRefresh={() => {
          // Triggers refresh in subcomponents if needed
        }}
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
        onStatusUpdated={() => {
          // Refreshes order data
        }}
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
