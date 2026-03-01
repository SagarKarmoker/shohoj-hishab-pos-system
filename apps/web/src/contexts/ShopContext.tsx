import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getShops, createShop, updateShop, type Shop } from '../api/shop';

interface ShopContextType {
  currentShop: Shop | null;
  shops: Shop[];
  isLoading: boolean;
  error: string | null;
  loadShops: () => Promise<void>;
  createShopAndSet: (name: string, address?: string, phone?: string) => Promise<Shop>;
  updateShopAndRefresh: (shopId: string, dto: { name?: string; address?: string; phone?: string }) => Promise<Shop>;
  setCurrentShop: (shop: Shop | null) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [currentShop, setCurrentShopState] = useState<Shop | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getShops();
      setShops(data);
      setCurrentShopState((prev) => (data.length > 0 ? (prev && data.some((s) => s.id === prev.id) ? prev : data[0]) : null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load shops');
      setShops([]);
      setCurrentShopState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createShopAndSet = useCallback(
    async (name: string, address?: string, phone?: string) => {
      const shop = await createShop({ name, address, phone });
      setShops((prev) => [shop, ...prev]);
      setCurrentShopState(shop);
      return shop;
    },
    [],
  );

  const updateShopAndRefresh = useCallback(
    async (shopId: string, dto: { name?: string; address?: string; phone?: string }) => {
      const shop = await updateShop(shopId, dto);
      setShops((prev) => prev.map((s) => (s.id === shopId ? shop : s)));
      setCurrentShopState((prev) => (prev?.id === shopId ? shop : prev));
      return shop;
    },
    [],
  );

  const setCurrentShop = useCallback((shop: Shop | null) => {
    setCurrentShopState(shop);
  }, []);

  return (
    <ShopContext.Provider
      value={{
        currentShop,
        shops,
        isLoading,
        error,
        loadShops,
        createShopAndSet,
        updateShopAndRefresh,
        setCurrentShop,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
