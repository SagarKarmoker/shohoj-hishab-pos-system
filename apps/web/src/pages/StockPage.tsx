import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';

interface StockPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

interface Product {
  id: number;
  name: string;
  nameEn: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
  lastUpdated: string;
}

const initialProducts: Product[] = [
  { id: 1, name: 'মিনিকেট চাল', nameEn: 'Miniket Rice', price: 70, stock: 50, minStock: 10, unit: 'কেজি', category: 'মুদি', lastUpdated: '2024-01-15' },
  { id: 2, name: 'সয়াবিন তেল', nameEn: 'Soybean Oil', price: 180, stock: 20, minStock: 5, unit: 'লি', category: 'মুদি', lastUpdated: '2024-01-14' },
  { id: 3, name: 'দেশি মসুর ডাল', nameEn: 'Local Lentils', price: 140, stock: 30, minStock: 8, unit: 'কেজি', category: 'মুদি', lastUpdated: '2024-01-13' },
  { id: 4, name: 'চিনি', nameEn: 'Sugar', price: 130, stock: 40, minStock: 10, unit: 'কেজি', category: 'মুদি', lastUpdated: '2024-01-15' },
  { id: 5, name: 'লাক্স সাবান', nameEn: 'Lux Soap', price: 55, stock: 100, minStock: 20, unit: 'পিস', category: 'মুদি', lastUpdated: '2024-01-12' },
  { id: 6, name: 'ইস্পাহানি চা', nameEn: 'Ispahani Tea', price: 120, stock: 25, minStock: 5, unit: 'প্যাক', category: 'মুদি', lastUpdated: '2024-01-14' },
  { id: 7, name: 'ফার্মের ডিম', nameEn: 'Farm Eggs', price: 150, stock: 200, minStock: 50, unit: 'ডজন', category: 'সবজি', lastUpdated: '2024-01-15' },
  { id: 8, name: 'লিকুইড দুধ', nameEn: 'Liquid Milk', price: 90, stock: 15, minStock: 5, unit: 'লি', category: 'পানীয়', lastUpdated: '2024-01-15' },
  { id: 9, name: 'প্রাণ চানাচুর', nameEn: 'Pran Chanachur', price: 45, stock: 5, minStock: 10, unit: 'প্যাক', category: 'স্ন্যাকস', lastUpdated: '2024-01-10' },
  { id: 10, name: 'তীর তেল', nameEn: 'Teer Oil', price: 175, stock: 3, minStock: 5, unit: 'লি', category: 'মুদি', lastUpdated: '2024-01-08' },
];

export function StockPage({ isDark, onToggleTheme, onBackToDashboard }: StockPageProps) {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setShowAddModal] = useState(false);
  const [, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'low'>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || product.stock <= product.minStock;
    return matchesSearch && matchesTab;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const handleAddStock = (productId: number, amount: number) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, stock: p.stock + amount, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    ));
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return { label: t('stock.critical'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (stock <= minStock * 1.5) return { label: t('stock.low'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: t('stock.good'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToDashboard}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Icon name="arrow_back" />
            </button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <Icon name="inventory_2" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{t('stock.title')}</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('stock.manageInventory')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isDark ? <Icon name="light_mode" className="text-slate-400" /> : <Icon name="dark_mode" className="text-slate-500" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Icon name="inventory_2" className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('stock.totalProducts')}</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Icon name="warning" className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('stock.lowStockItems')}</p>
                <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Icon name="check_circle" className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('stock.inStock')}</p>
                <p className="text-2xl font-bold text-green-600">{products.length - lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="attach_money" className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('stock.totalValue')}</p>
                <p className="text-2xl font-bold">৳{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {t('stock.allProducts')}
            </button>
            <button
              onClick={() => setActiveTab('low')}
              className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'low' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {t('stock.lowStock')}
              {lowStockCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{lowStockCount}</span>
              )}
            </button>
          </div>
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('stock.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-green-500/20"
          >
            <Icon name="add" />
            {t('stock.addProduct')}
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('stock.product')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('stock.category')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('stock.price')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('stock.stock')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('stock.status')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">{t('stock.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock, product.minStock);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {i18n.language === 'bn' ? product.name : product.nameEn}
                          </p>
                          <p className="text-sm text-slate-500">{t('stock.updated')}: {product.lastUpdated}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">৳{product.price}/{product.unit}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{product.stock}</span>
                          <span className="text-sm text-slate-500">{product.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddStock(product.id, 10)}
                            className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer"
                            title={t('stock.add10')}
                          >
                            <Icon name="add" className="text-sm" />
                          </button>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                            title={t('stock.edit')}
                          >
                            <Icon name="edit" className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Icon name="inventory_2" className="text-6xl mb-4 mx-auto opacity-30" />
              <p className="text-lg">{t('stock.noProducts')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
