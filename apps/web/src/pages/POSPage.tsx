import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';

interface POSPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

interface CartItem {
  id: number;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

interface Product {
  id: number;
  name: string;
  nameEn: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'মিনিকেট চাল',
    nameEn: 'Miniket Rice',
    price: 70,
    stock: 50,
    unit: 'কেজি',
    category: 'মুদি',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop'
  },
  {
    id: 2,
    name: 'সয়াবিন তেল',
    nameEn: 'Soybean Oil',
    price: 180,
    stock: 20,
    unit: 'লি',
    category: 'মুদি',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop'
  },
  {
    id: 3,
    name: 'দেশি মসুর ডাল',
    nameEn: 'Local Lentils',
    price: 140,
    stock: 30,
    unit: 'কেজি',
    category: 'মুদি',
    image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?w=400&h=400&fit=crop'
  },
  {
    id: 4,
    name: 'চিনি',
    nameEn: 'Sugar',
    price: 130,
    stock: 40,
    unit: 'কেজি',
    category: 'মুদি',
    image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&h=400&fit=crop'
  },
  {
    id: 5,
    name: 'লাক্স সাবান',
    nameEn: 'Lux Soap',
    price: 55,
    stock: 100,
    unit: 'পিস',
    category: 'মুদি',
    image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400&h=400&fit=crop'
  },
  {
    id: 6,
    name: 'ইস্পাহানি চা',
    nameEn: 'Ispahani Tea',
    price: 120,
    stock: 25,
    unit: 'প্যাক',
    category: 'মুদি',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop'
  },
  {
    id: 7,
    name: 'ফার্মের ডিম',
    nameEn: 'Farm Eggs',
    price: 150,
    stock: 200,
    unit: 'ডজন',
    category: 'সবজি',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop'
  },
  {
    id: 8,
    name: 'লিকুইড দুধ',
    nameEn: 'Liquid Milk',
    price: 90,
    stock: 15,
    unit: 'লি',
    category: 'পানীয়',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop'
  }
];

const categories = ['সব', 'মুদি', 'সবজি', 'বেকারি', 'পানীয়'];

export function POSPage({ isDark, onToggleTheme, onBackToDashboard }: POSPageProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 1,
      name: 'মিনিকেট চাল',
      nameEn: 'Miniket Rice',
      price: 70,
      quantity: 2,
      image: products[0].image,
      unit: 'কেজি'
    },
    {
      id: 2,
      name: 'সয়াবিন তেল',
      nameEn: 'Soybean Oil',
      price: 180,
      quantity: 1,
      image: products[1].image,
      unit: 'লি'
    },
    {
      id: 5,
      name: 'লাক্স সাবান',
      nameEn: 'Lux Soap',
      price: 55,
      quantity: 4,
      image: products[4].image,
      unit: 'পিস'
    }
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash'>('cash');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'সব' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        id: product.id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        quantity: 1,
        image: product.image,
        unit: product.unit
      }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex-none z-20">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToDashboard}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Icon name="arrow_back" />
            </button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-500/30">
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
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isDark ? (
                <Icon name="light_mode" className="text-slate-400" />
              ) : (
                <Icon name="dark_mode" className="text-slate-500" />
              )}
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
              <button className="absolute inset-y-0 right-2 pr-2 flex items-center">
                <div className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-xl transition-colors cursor-pointer">
                  <Icon name="mic" className="text-3xl" />
                </div>
              </button>
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
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all duration-200 active:scale-95 text-left h-full flex flex-col cursor-pointer"
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
                    ৳{product.price}/{product.unit}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                    {i18n.language === 'bn' ? product.name : product.nameEn}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('pos.stock')}: {product.stock} {product.unit}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </main>

        {/* Cart Sidebar */}
        <aside className="w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl z-10 absolute right-0 top-0 bottom-0 md:relative">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="shopping_cart" className="text-primary" />
              {t('pos.cart')} ({cartItemCount})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-error hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors cursor-pointer"
                title={t('pos.clearCart')}
              >
                <Icon name="delete_sweep" />
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Icon name="shopping_cart" className="text-6xl mb-4" />
                <p className="text-lg">{t('pos.emptyCart')}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-start bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                >
                  <img
                    src={item.image}
                    alt={item.nameEn}
                    className="w-16 h-16 rounded-lg object-cover bg-white"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">
                      {i18n.language === 'bn' ? item.name : item.nameEn}
                    </h4>
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 px-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-primary cursor-pointer"
                        >
                          <Icon name="remove" className="text-sm" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-primary cursor-pointer"
                        >
                          <Icon name="add" className="text-sm" />
                        </button>
                      </div>
                      <p className="font-bold text-primary">৳{item.price * item.quantity}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-error cursor-pointer"
                  >
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>{t('pos.totalItems')}</span>
                <span>{cartItemCount}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>{t('pos.subtotal')}</span>
                <span>৳{cartTotal}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-slate-800 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                <span>{t('pos.grandTotal')}</span>
                <span className="text-primary">৳{cartTotal}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-center">
                  <Icon name="payments" className="text-slate-600 dark:text-slate-300 mb-1" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('pos.cash')}</p>
                </div>
              </label>
              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 peer-checked:border-[#ec4899] peer-checked:bg-[#ec4899]/5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-center">
                  <Icon name="qr_code_scanner" className="text-[#ec4899] mb-1" />
                  <p className="text-sm font-bold text-[#ec4899]">{t('pos.bkash')}</p>
                </div>
              </label>
            </div>

            {/* Checkout Button */}
            <button
              disabled={cart.length === 0}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xl font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 flex justify-between px-6 items-center group transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <span>{t('pos.collectMoney')}</span>
              <span className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                <Icon name="arrow_forward" />
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
