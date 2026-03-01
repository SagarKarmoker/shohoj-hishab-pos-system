import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductModalProduct | null;
  onAddToCart: (product: ProductModalProduct, quantity: number, displayQuantity: string) => void;
}

export interface ProductModalProduct {
  id: string | number;
  name: string;
  nameEn?: string;
  price: number;
  stock: number;
  unit: string;
  category?: string | null;
  image?: string;
  baseUnit?: string;
  conversionRate?: number;
}

export function ProductModal({ isOpen, onClose, product, onAddToCart }: ProductModalProps) {
  const { t, i18n } = useTranslation();
  const [quantity, setQuantity] = useState<string>('1');
  const [unit, setUnit] = useState<string>('কেজি');
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity('1');
      setUnit(product.unit);
      setCustomMode(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Calculate actual quantity in base units
  const getActualQuantity = (): number => {
    const qty = parseFloat(quantity) || 0;
    
    // Convert to base unit (kg or liter)
    if (unit === 'গ্রাম' || unit === 'g' || unit === 'gram') {
      return qty / 1000;
    } else if (unit === 'মিলি' || unit === 'ml' || unit === 'milli') {
      return qty / 1000;
    }
    return qty;
  };

  const actualQuantity = getActualQuantity();
  const totalPrice = Math.round(product.price * actualQuantity);

  // Quick select quantities based on unit type
  const getQuickQuantities = () => {
    const unit = product.unit?.toLowerCase() ?? '';
    if (unit === 'কেজি' || unit === 'kg') {
      return [
        { label: '100g', value: '100', unit: 'গ্রাম' },
        { label: '250g', value: '250', unit: 'গ্রাম' },
        { label: '500g', value: '500', unit: 'গ্রাম' },
        { label: '1kg', value: '1', unit: 'কেজি' },
        { label: '2kg', value: '2', unit: 'কেজি' },
        { label: '5kg', value: '5', unit: 'কেজি' },
      ];
    } else if (unit === 'লি' || unit === 'l' || unit === 'liter') {
      return [
        { label: '250ml', value: '250', unit: 'মিলি' },
        { label: '500ml', value: '500', unit: 'মিলি' },
        { label: '1L', value: '1', unit: 'লি' },
        { label: '2L', value: '2', unit: 'লি' },
        { label: '5L', value: '5', unit: 'লি' },
      ];
    } else if (unit === 'ডজন' || unit === 'dozen') {
      return [
        { label: '1pc', value: '0.083', unit: 'ডজন' },
        { label: '3pc', value: '0.25', unit: 'ডজন' },
        { label: '6pc', value: '0.5', unit: 'ডজন' },
        { label: '12pc', value: '1', unit: 'ডজন' },
        { label: '2dz', value: '2', unit: 'ডজন' },
      ];
    } else {
      return [
        { label: '1pc', value: '1', unit: product.unit },
        { label: '2pc', value: '2', unit: product.unit },
        { label: '3pc', value: '3', unit: product.unit },
        { label: '5pc', value: '5', unit: product.unit },
        { label: '10pc', value: '10', unit: product.unit },
        { label: '20pc', value: '20', unit: product.unit },
      ];
    }
  };

  const quickQuantities = getQuickQuantities();

  const handleQuickSelect = (value: string, selectedUnit: string) => {
    setQuantity(value);
    setUnit(selectedUnit);
    setCustomMode(false);
  };

  const handleCustomQuantity = (value: string) => {
    // Allow only numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    const final = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    setQuantity(final);
    setCustomMode(true);
  };

  const handleAddToCart = () => {
    const qty = getActualQuantity();
    if (qty > 0) {
      const displayQty = customMode ? `${quantity} ${unit}` : quantity;
      onAddToCart(product, qty, displayQty);
      onClose();
    }
  };

  const isValidQuantity = actualQuantity > 0 && actualQuantity <= product.stock;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
      
      {/* Modal Content */}
      <div 
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <Icon name="close" className="text-white" />
        </button>

        {/* Product Image */}
        <div className="relative h-48 bg-slate-100 dark:bg-slate-700">
          {product.image ? (
          <img
            src={product.image}
            alt={i18n.language === 'bn' ? product.name : (product.nameEn ?? product.name)}
            className="w-full h-full object-cover"
          />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="inventory_2" className="text-6xl text-slate-400" />
            </div>
          )}
          <div className="absolute bottom-4 left-4">
            {product.category && (
            <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
              {product.category}
            </span>
          )}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {i18n.language === 'bn' ? product.name : (product.nameEn ?? product.name)}
          </h2>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-primary">
              ৳{product.price}
            </span>
            <span className="text-slate-500 text-sm">/ {product.unit}</span>
          </div>

          {/* Quick Select Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('pos.selectQuantity') || 'পরিমাণ নির্বাচন করুন'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickQuantities.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSelect(item.value, item.unit)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    quantity === item.value && unit === item.unit && !customMode
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Quantity Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('pos.customQuantity') || 'কাস্টম পরিমাণ'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => handleCustomQuantity(e.target.value)}
                placeholder="0"
                className={`flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 rounded-xl text-lg font-bold text-center focus:outline-none transition-colors ${
                  customMode 
                    ? 'border-primary' 
                    : 'border-transparent'
                }`}
              />
              <select
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  setCustomMode(true);
                }}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-xl font-medium focus:border-primary focus:outline-none cursor-pointer"
              >
                {unit === 'কেজি' || unit === 'kg' ? (
                  <>
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                  </>
                ) : unit === 'লি' || unit === 'l' || unit === 'liter' ? (
                  <>
                    <option value="liter">liter</option>
                    <option value="ml">ml</option>
                  </>
                ) : (
                  <option value={product.unit}>{product.unit || 'piece'}</option>
                )}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('pos.stock')}: {product.stock} {product.unit} {t('pos.available') || 'উপলব্ধ'}
            </p>
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center p-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-4">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {t('pos.grandTotal')}
            </span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                ৳{totalPrice}
              </span>
              <p className="text-xs text-slate-500">
                {quantity} {unit} × ৳{product.price}/{product.unit}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {!isValidQuantity && quantity && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
              <Icon name="error" className="text-sm" />
              {actualQuantity > product.stock 
                ? (t('pos.exceedsStock') || 'স্টকের চেয়ে বেশি') 
                : (t('pos.enterValidQuantity') || 'সঠিক পরিমাণ দিন')}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!isValidQuantity}
              className="flex-1 py-3 bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon name="add_shopping_cart" />
              {t('pos.addToCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
