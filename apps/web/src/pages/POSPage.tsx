import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { ProductModal, type ProductModalProduct } from '../components/ProductModal';
import { useShop } from '../contexts/ShopContext';
import { getProducts, type Product } from '../api/product';
import { createTransaction } from '../api/transaction';
import { getCustomers, type Customer } from '../api/customer';

interface POSPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  displayQuantity?: string;
  unit: string;
}

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%2394a3b8"%3E%3Cpath d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM6 6h2.5v2.5H6V6zm4 0h8v1.5h-8V6zm0 3h8v1.5h-8V9zm0 3h5.5v1.5H10V12z"/%3E%3C/svg%3E';

export function POSPage({ isDark, onToggleTheme, onBackToDashboard }: POSPageProps) {
  const { t } = useTranslation();
  const { currentShop } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash'>('cash');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [creditCustomerId, setCreditCustomerId] = useState<string | null>(null);
  const [paidAmountInput, setPaidAmountInput] = useState('');

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

  const loadCustomers = useCallback(async () => {
    if (!currentShop) return;
    try {
      const data = await getCustomers(currentShop.id);
      setCustomers(data);
    } catch {
      setCustomers([]);
    }
  }, [currentShop]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const categories = ['__all__', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === '__all__' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (product: ProductModalProduct, quantity: number, displayQuantity: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === String(product.id));
      if (existing) {
        return prevCart.map((item) =>
          item.productId === String(product.id)
            ? { ...item, quantity: item.quantity + quantity, displayQuantity }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: String(product.id),
          name: product.name,
          price: product.price,
          quantity,
          displayQuantity,
          unit: product.unit,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setLastInvoice(null);
    setCheckoutError(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!currentShop || cart.length === 0) return;
    const total = Math.round(cartTotal);
    const paid = creditCustomerId
      ? Math.min(total, Math.max(0, parseFloat(paidAmountInput) || 0))
      : total;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const result = await createTransaction(currentShop.id, {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        paymentMethod,
        customerId: creditCustomerId || undefined,
        paidAmount: creditCustomerId ? paid : undefined,
      });
      setLastInvoice(result.invoiceNumber);
      setCart([]);
      setIsCreditSale(false);
      setCreditCustomerId(null);
      setPaidAmountInput('');
      loadProducts();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <Icon name="storefront" className="text-6xl mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg">{t('pos.noShop')}</p>
          <p className="text-sm mt-2">{t('pos.noShopHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex-none z-20">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBackToDashboard} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <Icon name="arrow_back" />
            </button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Icon name="storefront" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{t('nav.brand')}</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('pos.quickBilling')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('pos.online')}</span>
            </div>
            <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              {isDark ? <Icon name="light_mode" className="text-slate-400" /> : <Icon name="dark_mode" className="text-slate-500" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Products Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-6">
          {/* Search Bar */}
          <div className="mb-8 relative max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="search" className="text-slate-400 text-3xl group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pos.searchPlaceholder')}
                className="block w-full pl-14 pr-16 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xl placeholder-slate-400 focus:border-primary focus:ring-primary shadow-sm transition-all text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-4 max-w-5xl mx-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-none px-6 py-3 rounded-xl font-medium text-lg transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg shadow-green-500/20'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200'
                }`}
              >
                {category === '__all__' ? t('pos.all') : category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {loading ? (
              <div className="col-span-full flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => openProductModal(product)}
                  disabled={product.stock <= 0}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all duration-200 active:scale-95 text-left h-full flex flex-col cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    <img
                      src={PLACEHOLDER_IMG}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
                      ৳{product.price}/{product.unit}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{product.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t('pos.stock')}: {product.stock} {product.unit}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Icon name="inventory_2" className="text-6xl mx-auto mb-4 opacity-30" />
              <p>{t('stock.noProducts')}</p>
            </div>
          )}
        </main>

        {/* Cart Sidebar */}
        <aside className="w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl z-10 absolute right-0 top-0 bottom-0 md:relative">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="shopping_cart" className="text-primary" />
              {t('pos.cart')} ({cartItemCount})
            </h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-error hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors cursor-pointer" title={t('pos.clearCart')}>
                <Icon name="delete_sweep" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {lastInvoice && cart.length === 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 text-center">
                <Icon name="check_circle" className="text-2xl mx-auto mb-2" />
                <p className="font-medium">{t('pos.checkoutSuccess')} {lastInvoice}</p>
              </div>
            )}
            {cart.length === 0 && !lastInvoice ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Icon name="shopping_cart" className="text-6xl mb-4" />
                <p className="text-lg">{t('pos.emptyCart')}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <img src={PLACEHOLDER_IMG} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-white" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.displayQuantity || `${item.quantity} ${item.unit}`}</p>
                    <div className="flex justify-between items-end mt-1">
                      <p className="font-bold text-primary">৳{Math.round(item.price * item.quantity)}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-xs text-error hover:text-red-700 cursor-pointer flex items-center gap-1">
                        <Icon name="delete" className="text-xs" />
                        {t('pos.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>{t('pos.totalItems')}</span>
                <span>{cartItemCount}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>{t('pos.subtotal')}</span>
                <span>৳{Math.round(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-slate-800 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                <span>{t('pos.grandTotal')}</span>
                <span className="text-primary">৳{Math.round(cartTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="cursor-pointer relative">
                <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="peer sr-only" />
                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-center">
                  <Icon name="payments" className="text-slate-600 dark:text-slate-300 mb-1" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('pos.cash')}</p>
                </div>
              </label>
              <label className="cursor-pointer relative">
                <input type="radio" name="payment" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="peer sr-only" />
                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 peer-checked:border-[#ec4899] peer-checked:bg-[#ec4899]/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-center">
                  <Icon name="qr_code_scanner" className="text-[#ec4899] mb-1" />
                  <p className="text-sm font-bold text-[#ec4899]">{t('pos.bkash')}</p>
                </div>
              </label>
            </div>

            {/* Credit sale */}
            {cart.length > 0 && (
              <div className="mb-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <input
                    type="checkbox"
                    checked={isCreditSale}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsCreditSale(checked);
                      if (!checked) {
                        setCreditCustomerId(null);
                        setPaidAmountInput('');
                      } else {
                        setPaidAmountInput(String(Math.round(cartTotal)));
                      }
                    }}
                    className="rounded border-slate-300"
                  />
                  {t('pos.sellOnCredit')}
                </label>
                {isCreditSale && (
                  <>
                    <select
                      value={creditCustomerId}
                      onChange={(e) => {
                        setCreditCustomerId(e.target.value || null);
                        setPaidAmountInput(String(Math.round(cartTotal)));
                      }}
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    >
                      <option value="">{t('pos.selectCustomer')}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>
                      ))}
                    </select>
                    {creditCustomerId && (
                      <div className="mt-2">
                        <label className="block text-xs text-slate-500 mb-1">{t('pos.amountPaid')}</label>
                        <input
                          type="number"
                          min="0"
                          max={cartTotal}
                          step="1"
                          value={paidAmountInput}
                          onChange={(e) => setPaidAmountInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        />
                        <p className="text-xs text-orange-600 mt-1">
                          {t('pos.dueAfter')}: ৳{Math.max(0, Math.round(cartTotal) - (parseFloat(paidAmountInput) || 0))}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {checkoutError && <p className="text-red-600 text-sm mb-4">{checkoutError}</p>}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutLoading || (isCreditSale && !creditCustomerId)}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xl font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 flex justify-between px-6 items-center group transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <span>{checkoutLoading ? t('common.loading') : t('pos.collectMoney')}</span>
              <span className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                <Icon name="arrow_forward" />
              </span>
            </button>
          </div>
        </aside>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={closeProductModal} product={selectedProduct} onAddToCart={addToCart} />
    </div>
  );
}
