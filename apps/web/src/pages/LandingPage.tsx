import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Icon } from '../components/Icon';
import { Navbar } from '../components/Navbar';
import { VideoModal } from '../components/VideoModal';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

interface LandingPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateToLogin: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToTerms: () => void;
  onNavigateToPrivacy: () => void;
  isAuthenticated?: boolean;
}

export function LandingPage({ isDark, onToggleTheme, onNavigateToLogin, onNavigateToDashboard, onNavigateToTerms, onNavigateToPrivacy, isAuthenticated }: LandingPageProps) {
  const { t } = useTranslation();
  const { handleNavClick } = useSmoothScroll();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar isDark={isDark} onToggleTheme={onToggleTheme} onNavigateToLogin={onNavigateToLogin} onNavigateToDashboard={onNavigateToDashboard} isAuthenticated={isAuthenticated} />
      
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute inset-0 bg-pattern pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-slate-800 rounded-full border border-orange-100 dark:border-slate-700"
                >
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-sm font-medium text-primary">{t('hero.badge')}</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 dark:text-white"
                >
                  {isAuthenticated ? (
                    t('hero.titleLoggedIn')
                  ) : (
                    <>
                      {t('hero.title')} <br/>
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
                        className="text-primary relative inline-block"
                      >
                        {t('hero.highlight')}
                        <motion.svg 
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                          className="absolute w-full h-3 -bottom-1 left-0 text-orange-200 -z-10" 
                          preserveAspectRatio="none" 
                          viewBox="0 0 100 10"
                        >
                          <motion.path 
                            d="M0 5 Q 50 10 100 5" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="8"
                          />
                        </motion.svg>
                      </motion.span>
                    </>
                  )}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  {isAuthenticated ? t('hero.subtitleLoggedIn') : t('hero.description')}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                >
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isAuthenticated ? onNavigateToDashboard : undefined}
                    className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    <Icon name={isAuthenticated ? "dashboard" : "rocket_launch"} />
                    {isAuthenticated ? t('hero.ctaPrimaryLoggedIn') : t('hero.ctaPrimary')}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsVideoModalOpen(true)}
                    className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-lg font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Icon name="play_circle" />
                    {t('hero.ctaSecondary')}
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Icon name="check_circle" className="text-success" />
                    <span>{t('hero.feature1')}</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="flex items-center gap-2"
                  >
                    <Icon name="check_circle" className="text-success" />
                    <span>{t('hero.feature2')}</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Hero Image/Phone Mockup */}
              <motion.div 
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative lg:h-[600px] flex items-center justify-center"
              >
                <div className="relative w-full max-w-md aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 flex flex-col">
                    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6">
                      <span className="font-bold text-lg">ড্যাশবোর্ড</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-md">
                        <Icon name="person" className="text-white text-lg" />
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-slate-500 dark:text-slate-400">আজকের বিক্রি</div>
                          <div className="text-xl font-bold text-primary">৳ ৪,৫০০</div>
                        </div>
                        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-slate-500 dark:text-slate-400">মোট অর্ডার</div>
                          <div className="text-xl font-bold text-slate-800 dark:text-white">১২টি</div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">সাম্প্রতিক লেনদেন</span>
                          <span className="text-xs text-primary cursor-pointer">সব দেখুন</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                <Icon name="shopping_bag" className="text-sm" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800 dark:text-slate-100">অর্ডার #১০২</div>
                                <div className="text-xs text-slate-400 dark:text-slate-500">মিনু রহমান</div>
                              </div>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-100">৳ ৫২০</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <Icon name="shopping_bag" className="text-sm" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800 dark:text-slate-100">অর্ডার #১০১</div>
                                <div className="text-xs text-slate-400 dark:text-slate-500">করিম শেখ</div>
                              </div>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-100">৳ ১,২০০</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center text-white cursor-pointer">
                        <Icon name="add" className="text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    opacity: { duration: 0.8, delay: 1 },
                    y: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.8
                    }
                  }}
                  className="absolute bottom-10 -left-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform" 
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        রহ
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        ক
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        স
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        5k+
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold block text-slate-900 dark:text-white text-lg">৫০০০+</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">সন্তুষ্ট ব্যবসায়ী</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🇧🇩</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">{t('stats.madeIn')}</p>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">Made in Bangladesh</p>
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Icon name="storefront" className="text-blue-600 dark:text-blue-400 text-2xl" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">{t('stats.trusted')}</p>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">10,000+ Shop Owners</p>
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Icon name="verified_user" className="text-green-600 dark:text-green-400 text-2xl" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">{t('stats.secure')}</p>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">Cloud Backup</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">
                {t('features.title')} <span className="text-primary">{t('features.titleHighlight')}</span>?
              </h2>
              <p className="text-slate-600 dark:text-slate-400">{t('features.subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="cursor-pointer group p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="receipt_long" className="text-primary text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{t('features.billing.title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('features.billing.description')}
                </p>
              </div>
              
              <div className="cursor-pointer group p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="inventory_2" className="text-blue-600 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{t('features.stock.title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('features.stock.description')}
                </p>
              </div>
              
              <div className="cursor-pointer group p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="payments" className="text-pink-600 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{t('features.payment.title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('features.payment.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-bold tracking-wider uppercase text-sm">{t('howItWorks.badge')}</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">{t('howItWorks.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400">{t('howItWorks.subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30">
                    <Icon name="person_add" className="text-white text-3xl" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl border-4 border-white dark:border-slate-900">১</div>
                </div>
                <h3 className="text-xl font-bold mb-3">{t('howItWorks.step1.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('howItWorks.step1.description')}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                    <Icon name="inventory_2" className="text-white text-3xl" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl border-4 border-white dark:border-slate-900">২</div>
                </div>
                <h3 className="text-xl font-bold mb-3">{t('howItWorks.step2.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('howItWorks.step2.description')}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30">
                    <Icon name="receipt_long" className="text-white text-3xl" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl border-4 border-white dark:border-slate-900">৩</div>
                </div>
                <h3 className="text-xl font-bold mb-3">{t('howItWorks.step3.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('howItWorks.step3.description')}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
                    <Icon name="analytics" className="text-white text-3xl" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl border-4 border-white dark:border-slate-900">৪</div>
                </div>
                <h3 className="text-xl font-bold mb-3">{t('howItWorks.step4.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('howItWorks.step4.description')}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Complete Features Grid */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">{t('allFeatures.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400">{t('allFeatures.subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                  <Icon name="account_balance_wallet" className="text-orange-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature1.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature1.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Icon name="assessment" className="text-blue-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature2.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature2.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Icon name="group" className="text-green-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature3.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature3.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Icon name="wifi_off" className="text-purple-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature4.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature4.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <Icon name="sms" className="text-pink-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature5.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature5.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Icon name="qr_code_scanner" className="text-indigo-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature6.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature6.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                  <Icon name="contacts" className="text-teal-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature7.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature7.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Icon name="request_quote" className="text-red-600 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature8.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature8.desc')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">{t('allFeatures.feature9.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{t('allFeatures.feature9.desc')}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t('comparison.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400">{t('comparison.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Icon name="close" className="text-red-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold">{t('comparison.before.title')}</h3>
                </div>
                <ul className="space-y-4">
                  {(t('comparison.before.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Icon name="close" className="text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* After */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 border-2 border-primary shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <Icon name="check" className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">{t('comparison.after.title')}</h3>
                </div>
                <ul className="space-y-4">
                  {(t('comparison.after.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Icon name="check_circle" className="text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-bold tracking-wider uppercase text-sm">{t('testimonials.badge')}</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">{t('testimonials.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400">{t('testimonials.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: t('testimonials.customer1.name'),
                  business: t('testimonials.customer1.business'),
                  quote: t('testimonials.customer1.quote'),
                  metric: t('testimonials.customer1.metric'),
                  avatar: 'র'
                },
                {
                  name: t('testimonials.customer2.name'),
                  business: t('testimonials.customer2.business'),
                  quote: t('testimonials.customer2.quote'),
                  metric: t('testimonials.customer2.metric'),
                  avatar: 'ক'
                },
                {
                  name: t('testimonials.customer3.name'),
                  business: t('testimonials.customer3.business'),
                  quote: t('testimonials.customer3.quote'),
                  metric: t('testimonials.customer3.metric'),
                  avatar: 'স'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.business}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Icon name="format_quote" className="text-primary text-3xl opacity-50" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Icon name="trending_up" className="text-xl" />
                      <span>{testimonial.metric}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t('faq.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400">{t('faq.subtitle')}</p>
            </div>

            <div className="space-y-4">
              {[
                { q: t('faq.q1.question'), a: t('faq.q1.answer') },
                { q: t('faq.q2.question'), a: t('faq.q2.answer') },
                { q: t('faq.q3.question'), a: t('faq.q3.answer') },
                { q: t('faq.q4.question'), a: t('faq.q4.answer') },
                { q: t('faq.q5.question'), a: t('faq.q5.answer') },
                { q: t('faq.q6.question'), a: t('faq.q6.answer') },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="help" className="text-primary text-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-3">{faq.q}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="pricing">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-bold tracking-wider uppercase text-sm">{t('pricing.badge')}</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">{t('pricing.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400">{t('pricing.subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg relative overflow-hidden">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{t('pricing.free.name')}</h3>
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {t('pricing.free.price')} <span className="text-lg font-normal text-slate-500">{t('pricing.free.period')}</span>
                  </div>
                  <p className="text-slate-500 mt-4">{t('pricing.free.description')}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {(t('pricing.free.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <Icon name="check" className="text-success" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-3">
                    <Icon name="check" className="text-slate-300" />
                    <span className="text-slate-400">{(t('pricing.pro.features', { returnObjects: true }) as string[])[3]}</span>
                  </li>
                </ul>
                <button className="cursor-pointer w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold hover:border-primary hover:text-primary transition-all">
                  {t('pricing.free.cta')}
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 border-primary shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  {t('pricing.pro.badge')}
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-primary">{t('pricing.pro.name')}</h3>
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {t('pricing.pro.price')} <span className="text-lg font-normal text-slate-500">{t('pricing.pro.period')}</span>
                  </div>
                  <p className="text-slate-500 mt-4">{t('pricing.pro.description')}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {(t('pricing.pro.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <Icon name="check" className="text-success" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="cursor-pointer w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-orange-500/30 transition-all">
                  {t('pricing.pro.cta')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-primary rounded-[2.5rem] p-12 text-center text-white shadow-2xl shadow-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
                <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                  {t('cta.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="cursor-pointer px-8 py-3 bg-white text-primary font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-lg">
                    {t('cta.primary')}
                  </button>
                  <button className="cursor-pointer px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                    {t('cta.secondary')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="storefront" className="text-white text-lg" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
                  {t('nav.brand')}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                {t('footer.description')}
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com/shohojhishab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cursor-pointer w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#0C63D4] flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:scale-105"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/company/shohojhishab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cursor-pointer w-10 h-10 rounded-full bg-[#0A66C2] hover:bg-[#004182] flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:scale-105"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">{t('footer.links')}</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-primary transition-colors cursor-pointer">{t('footer.home')}</a></li>
                <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-primary transition-colors cursor-pointer">{t('nav.features')}</a></li>
                <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-primary transition-colors cursor-pointer">{t('nav.pricing')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors cursor-pointer">{t('footer.blog')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">{t('footer.contact')}</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-3">
                  <Icon name="phone" className="text-primary text-sm" />
                  <span>{t('footer.phone')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="email" className="text-primary text-sm" />
                  <span>{t('footer.email')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="location_on" className="text-primary text-sm" />
                  <span>{t('footer.address')}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">{t('footer.copyright')}</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <button onClick={onNavigateToTerms} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">{t('footer.terms')}</button>
              <button onClick={onNavigateToPrivacy} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">{t('footer.privacy')}</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc="/Shohoj_Hishab_Promotional_Vi.mp4"
      />
    </div>
  );
}