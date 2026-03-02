import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useShop } from '../contexts/ShopContext';
import { getProducts, createProduct, updateProduct, type Product } from '../api/product';
import { uploadImage, uploadImageFromUrl } from '../api/upload';

interface StockPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

export function StockPage({ isDark, onToggleTheme, onBackToDashboard }: StockPageProps) {
  const { t } = useTranslation();
  const { currentShop } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'low'>('all');
  const [addForm, setAddForm] = useState({ name: '', category: '', unit: 'piece', price: '', minStock: '0', stock: '0', imageUrl: '' });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', unit: 'piece', price: '', minStock: '0', stock: '0', imageUrl: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [addImageUploading, setAddImageUploading] = useState(false);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    if (!currentShop) return;
    setLoading(true);
    try {
      const data = await getProducts(currentShop.id);
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentShop]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesTab = activeTab === 'all' || product.stock <= product.minStock;
    return matchesSearch && matchesTab;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const handleAddStock = async (product: Product, amount: number) => {
    if (!currentShop) return;
    try {
      const updated = await updateProduct(currentShop.id, product.id, { stock: product.stock + amount });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    } catch {
      // Could show toast
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop || !addForm.name.trim()) return;
    setAddSubmitting(true);
    setAddError(null);
    try {
      const created = await createProduct(currentShop.id, {
        name: addForm.name.trim(),
        category: addForm.category.trim() || undefined,
        unit: addForm.unit,
        price: parseFloat(addForm.price) || 0,
        minStock: parseInt(addForm.minStock, 10) || 0,
        stock: parseInt(addForm.stock, 10) || 0,
        imageUrl: addForm.imageUrl.trim() || undefined,
      });
      setProducts((prev) => [created, ...prev]);
      setShowAddModal(false);
      setAddForm({ name: '', category: '', unit: 'piece', price: '', minStock: '0', stock: '0', imageUrl: '' });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setAddSubmitting(false);
    }
  };

  useEffect(() => {
    if (editingProduct) {
      setEditForm({
        name: editingProduct.name,
        category: editingProduct.category ?? '',
        unit: editingProduct.unit,
        price: String(editingProduct.price),
        minStock: String(editingProduct.minStock),
        stock: String(editingProduct.stock),
        imageUrl: (editingProduct as any).imageUrl ?? '',
      });
      setEditError(null);
    }
  }, [editingProduct]);

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop || !editingProduct) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const updated = await updateProduct(currentShop.id, editingProduct.id, {
        name: editForm.name.trim(),
        category: editForm.category.trim() || undefined,
        unit: editForm.unit,
        imageUrl: editForm.imageUrl.trim() || undefined,
        price: parseFloat(editForm.price) || 0,
        minStock: parseInt(editForm.minStock, 10) || 0,
        stock: parseInt(editForm.stock, 10) || 0,
      });
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      setEditingProduct(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) {
      setEditImageUploading(true);
    } else {
      setAddImageUploading(true);
    }

    try {
      const result = await uploadImage(file);
      if (isEdit) {
        setEditForm((f) => ({ ...f, imageUrl: result.url }));
      } else {
        setAddForm((f) => ({ ...f, imageUrl: result.url }));
      }
    } catch (err) {
      if (isEdit) {
        setEditError(err instanceof Error ? err.message : 'Failed to upload image');
      } else {
        setAddError(err instanceof Error ? err.message : 'Failed to upload image');
      }
    } finally {
      if (isEdit) {
        setEditImageUploading(false);
      } else {
        setAddImageUploading(false);
      }
    }
  };

  const handleImageUrlSubmit = async (isEdit: boolean) => {
    const url = isEdit ? editForm.imageUrl : addForm.imageUrl;
    if (!url) return;

    if (isEdit) {
      setEditImageUploading(true);
    } else {
      setAddImageUploading(true);
    }

    try {
      const result = await uploadImageFromUrl(url);
      if (isEdit) {
        setEditForm((f) => ({ ...f, imageUrl: result.url }));
      } else {
        setAddForm((f) => ({ ...f, imageUrl: result.url }));
      }
    } catch (err) {
      if (isEdit) {
        setEditError(err instanceof Error ? err.message : 'Failed to fetch image from URL');
      } else {
        setAddError(err instanceof Error ? err.message : 'Failed to fetch image from URL');
      }
    } finally {
      if (isEdit) {
        setEditImageUploading(false);
      } else {
        setAddImageUploading(false);
      }
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return { label: t('stock.critical'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (stock <= minStock * 1.5) return { label: t('stock.low'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: t('stock.good'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <Icon name="inventory_2" className="text-6xl mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg">{t('stock.noShop')}</p>
          <p className="text-sm mt-2">{t('stock.noShopHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBackToDashboard} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <Icon name="arrow_back" />
            </button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Icon name="inventory_2" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{t('stock.title')}</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('stock.manageInventory')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer inline-flex items-center justify-center"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
                <p className="text-2xl font-bold">{loading ? '...' : products.length}</p>
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
                <p className="text-2xl font-bold text-red-600">{loading ? '...' : lowStockCount}</p>
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
                <p className="text-2xl font-bold text-green-600">{loading ? '...' : products.length - lowStockCount}</p>
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
                <p className="text-2xl font-bold">
                  {loading ? '...' : `৳${products.reduce((sum, p) => sum + p.price * p.stock, 0).toLocaleString()}`}
                </p>
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
                activeTab === 'all' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {t('stock.allProducts')}
            </button>
            <button
              onClick={() => setActiveTab('low')}
              className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'low' ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {t('stock.lowStock')}
              {lowStockCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{lowStockCount}</span>}
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStockStatus(product.stock, product.minStock);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{product.name}</p>
                            <p className="text-sm text-slate-500">
                              {t('stock.updated')}: {formatDate(product.updatedAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm">{product.category ?? '-'}</span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ৳{product.price}/{product.unit}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">{product.stock}</span>
                            <span className="text-sm text-slate-500">{product.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddStock(product, 10)}
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
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredProducts.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Icon name="inventory_2" className="text-6xl mb-4 mx-auto opacity-30" />
              <p className="text-lg">{t('stock.noProducts')}</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90 cursor-pointer"
              >
                {t('stock.addProduct')}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">{t('stock.createProduct')}</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.productName')}</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.category')}</label>
                <input
                  type="text"
                  value={addForm.category}
                  onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('stock.image') || 'Product Image'}
                </label>
                <input
                  type="file"
                  ref={addFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
                {addForm.imageUrl ? (
                  <div className="relative mb-2">
                    <img
                      src={addForm.imageUrl}
                      alt="Product"
                      className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setAddForm((f) => ({ ...f, imageUrl: '' }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    disabled={addImageUploading}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Icon name="upload" className="text-lg" />
                    {addImageUploading ? t('common.uploading') : t('stock.uploadImage')}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={addForm.imageUrl}
                      onChange={(e) => setAddForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="Or paste image URL"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageUrlSubmit(false)}
                      disabled={!addForm.imageUrl || addImageUploading}
                      className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.add')}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.price')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addForm.price}
                    onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.unit')}</label>
                  <select
                    value={addForm.unit}
                    onChange={(e) => setAddForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="piece">{t('stock.unitPiece')}</option>
                    <option value="kg">{t('stock.unitKg')}</option>
                    <option value="liter">{t('stock.unitLiter')}</option>
                    <option value="pack">{t('stock.unitPack')}</option>
                    <option value="dozen">{t('stock.unitDozen')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.stock')}</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.stock}
                    onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.minStock')}</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.minStock}
                    onChange={(e) => setAddForm((f) => ({ ...f, minStock: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              {addError && <p className="text-red-600 text-sm">{addError}</p>}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={addSubmitting} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-60">
                  {addSubmitting ? t('common.loading') : t('stock.createProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-6">{t('stock.edit')}</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.productName')}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.category')}</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('stock.image') || 'Product Image'}
                </label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                {editForm.imageUrl ? (
                  <div className="relative mb-2">
                    <img
                      src={editForm.imageUrl}
                      alt="Product"
                      className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, imageUrl: '' }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={editImageUploading}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Icon name="upload" className="text-lg" />
                    {editImageUploading ? t('common.uploading') : t('stock.uploadImage')}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="Or paste image URL"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageUrlSubmit(true)}
                      disabled={!editForm.imageUrl || editImageUploading}
                      className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.add')}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.price')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.unit')}</label>
                  <select
                    value={editForm.unit}
                    onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="piece">{t('stock.unitPiece')}</option>
                    <option value="kg">{t('stock.unitKg')}</option>
                    <option value="liter">{t('stock.unitLiter')}</option>
                    <option value="pack">{t('stock.unitPack')}</option>
                    <option value="dozen">{t('stock.unitDozen')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.stock')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock.minStock')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm((f) => ({ ...f, minStock: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              {editError && <p className="text-red-600 text-sm">{editError}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={editSubmitting} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-60">
                  {editSubmitting ? t('common.loading') : t('settings.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
