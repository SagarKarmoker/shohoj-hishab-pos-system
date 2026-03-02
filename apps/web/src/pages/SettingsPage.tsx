import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { useSettings } from '../contexts/SettingsContext';
import { useShop } from '../contexts/ShopContext';
import type { Shop } from '../api/shop';
import type { TFunction } from 'i18next';

function GeneralShopForm({
    shop,
    onSave,
    isSaving,
    saveError,
    t,
}: {
    shop: Shop;
    onSave: (dto: { name?: string; address?: string; phone?: string }) => Promise<void>;
    isSaving: boolean;
    saveError: string | null;
    t: TFunction;
}) {
    const [name, setName] = useState(shop.name);
    const [address, setAddress] = useState(shop.address ?? '');
    const [phone, setPhone] = useState(shop.phone ?? '');

    useEffect(() => {
        setName(shop.name);
        setAddress(shop.address ?? '');
        setPhone(shop.phone ?? '');
    }, [shop.id, shop.name, shop.address, shop.phone]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({ name, address: address || undefined, phone: phone || undefined });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('settings.shopName')}
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('settings.shopAddress')}
                </label>
                <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('settings.phone')}
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
            {saveError && (
                <p className="text-red-600 dark:text-red-400 text-sm">{saveError}</p>
            )}
            <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
                {isSaving ? t('common.loading') : t('settings.save')}
            </button>
        </form>
    );
}

interface SettingsPageProps {
    isDark: boolean;
    onToggleTheme: () => void;
    onBackToDashboard: () => void;
}

export function SettingsPage({ isDark, onToggleTheme, onBackToDashboard }: SettingsPageProps) {
    const { t, i18n } = useTranslation();
    const {
        paymentSettings,
        updatePaymentSettings
    } = useSettings();
    const { currentShop, updateShopAndRefresh, isLoading: shopsLoading } = useShop();

    const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'preferences'>('general');
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSaveGeneral = async (dto: { name?: string; address?: string; phone?: string }) => {
        if (!currentShop) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            await updateShopAndRefresh(currentShop.id, dto);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePayment = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBackToDashboard}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <Icon name="arrow_back" />
                        </button>
                        <h1 className="font-bold text-xl">{t('settings.title')}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {isSaved && (
                            <span className="text-green-600 font-medium text-sm flex items-center gap-1 animate-fadeIn">
                                <Icon name="check_circle" size="sm" />
                                {t('common.saved')}
                            </span>
                        )}
                        <button
                            onClick={onToggleTheme}
                            className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center justify-center"
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === 'general'
                                ? 'bg-primary text-white shadow-lg shadow-orange-500/20'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <Icon name="store" />
                            <span className="font-medium">{t('settings.general')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === 'payment'
                                ? 'bg-primary text-white shadow-lg shadow-orange-500/20'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <Icon name="payments" />
                            <span className="font-medium">{t('settings.payment')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === 'preferences'
                                ? 'bg-primary text-white shadow-lg shadow-orange-500/20'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <Icon name="tune" />
                            <span className="font-medium">{t('settings.preferences')}</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3 space-y-6">
                        {activeTab === 'general' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm animate-fadeIn">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Icon name="store" className="text-primary" />
                                    {t('settings.shopInfo')}
                                </h2>
                                {shopsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                                    </div>
                                ) : !currentShop ? (
                                    <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                                        <Icon name="store" className="text-4xl mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">{t('settings.noShop')}</p>
                                        <p className="text-sm mt-1">{t('settings.noShopHint')}</p>
                                    </div>
                                ) : (
                                    <GeneralShopForm
                                        shop={currentShop}
                                        onSave={handleSaveGeneral}
                                        isSaving={isSaving}
                                        saveError={saveError}
                                        t={t}
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm animate-fadeIn">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Icon name="account_balance_wallet" className="text-primary" />
                                    {t('settings.paymentMethods')}
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            {t('settings.bkashNumber')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={paymentSettings.bkashNumber}
                                                onChange={(e) => {
                                                    updatePaymentSettings({ bkashNumber: e.target.value });
                                                    handleSavePayment();
                                                }}
                                                placeholder="017..."
                                                className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e2136e]/20 focus:border-[#e2136e] transition-all"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#e2136e] rounded flex items-center justify-center text-[10px] text-white font-bold">
                                                b
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            {t('settings.nagadNumber')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={paymentSettings.nagadNumber}
                                                onChange={(e) => {
                                                    updatePaymentSettings({ nagadNumber: e.target.value });
                                                    handleSavePayment();
                                                }}
                                                placeholder="017..."
                                                className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#ec1d24]/20 focus:border-[#ec1d24] transition-all"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#ec1d24] rounded flex items-center justify-center text-[10px] text-white font-bold">
                                                ন
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            {t('settings.rocketNumber')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={paymentSettings.rocketNumber}
                                                onChange={(e) => {
                                                    updatePaymentSettings({ rocketNumber: e.target.value });
                                                    handleSavePayment();
                                                }}
                                                placeholder="017..."
                                                className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8c3494]/20 focus:border-[#8c3494] transition-all"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#8c3494] rounded flex items-center justify-center text-[10px] text-white font-bold">
                                                R
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm animate-fadeIn">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Icon name="tune" className="text-primary" />
                                    {t('settings.appPreferences')}
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            {t('common.language')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => changeLanguage('bn')}
                                                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 cursor-pointer ${i18n.language === 'bn'
                                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                    }`}
                                            >
                                                <Icon name="translate" className="text-xl" />
                                                <span className="font-bold">বাংলা</span>
                                            </button>
                                            <button
                                                onClick={() => changeLanguage('en')}
                                                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 cursor-pointer ${i18n.language === 'en'
                                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                    }`}
                                            >
                                                <Icon name="translate" className="text-xl" />
                                                <span className="font-bold">English</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            {t('settings.theme')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => !isDark && onToggleTheme()} // Only toggle if not already match
                                                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${!isDark
                                                    ? 'border-primary bg-orange-50 dark:bg-orange-900/20 text-primary'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60'
                                                    }`}
                                            >
                                                <Icon name="light_mode" />
                                                <span className="font-bold">Light</span>
                                            </button>
                                            <button
                                                onClick={() => isDark && onToggleTheme()} // Only toggle if not already match
                                                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${isDark
                                                    ? 'border-primary bg-orange-50 dark:bg-orange-900/20 text-primary'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60'
                                                    }`}
                                            >
                                                <Icon name="dark_mode" />
                                                <span className="font-bold">Dark</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
