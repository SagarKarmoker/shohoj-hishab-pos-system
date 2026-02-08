import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, quantity: number) => void;
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

export function ProductModal({ isOpen, onClose, product, onAddToCart }: ProductModalProps) {
  const { t, i18n } = useTranslation();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
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
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

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
        <div className="relative h-64 bg-slate-100 dark:bg-slate-700">
          <img
            src={product.image}
            alt={i18n.language === 'bn' ? product.name : product.nameEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {i18n.language === 'bn' ? product.name : product.nameEn}
          </h2>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">
              ৳{product.price}
            </span>
            <span className="text-slate-500">/ {product.unit}</span>
          </div>

          {/* Stock Info */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <Icon name="inventory_2" className="text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300">
              {t('pos.stock')}: <span className="font-bold">{product.stock}</span> {product.unit}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              পরিমাণ / Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                disabled={quantity <= 1}
              >
                <Icon name="remove" className="text-xl" />
              </button>
              <span className="text-3xl font-bold w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                disabled={quantity >= product.stock}
              >
                <Icon name="add" className="text-xl" />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center p-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-6">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {t('pos.grandTotal')}
            </span>
            <span className="text-2xl font-bold text-primary">
              ৳{totalPrice}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
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
