import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ShopSettings {
    shopName: string;
    shopAddress: string;
    phone: string;
    currency: string;
    vatRate: number;
}

export interface PaymentSettings {
    bkashNumber: string;
    nagadNumber: string;
    rocketNumber: string;
    bankDetails: string;
}

export interface SettingsContextType {
    shopSettings: ShopSettings;
    paymentSettings: PaymentSettings;
    updateShopSettings: (settings: Partial<ShopSettings>) => void;
    updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
}

const defaultShopSettings: ShopSettings = {
    shopName: 'My Shop',
    shopAddress: '',
    phone: '',
    currency: '৳',
    vatRate: 0,
};

const defaultPaymentSettings: PaymentSettings = {
    bkashNumber: '',
    nagadNumber: '',
    rocketNumber: '',
    bankDetails: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
        const saved = localStorage.getItem('shopSettings');
        return saved ? JSON.parse(saved) : defaultShopSettings;
    });

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
        const saved = localStorage.getItem('paymentSettings');
        return saved ? JSON.parse(saved) : defaultPaymentSettings;
    });

    useEffect(() => {
        localStorage.setItem('shopSettings', JSON.stringify(shopSettings));
    }, [shopSettings]);

    useEffect(() => {
        localStorage.setItem('paymentSettings', JSON.stringify(paymentSettings));
    }, [paymentSettings]);

    const updateShopSettings = (newSettings: Partial<ShopSettings>) => {
        setShopSettings(prev => ({ ...prev, ...newSettings }));
    };

    const updatePaymentSettings = (newSettings: Partial<PaymentSettings>) => {
        setPaymentSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{
            shopSettings,
            paymentSettings,
            updateShopSettings,
            updatePaymentSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
}
