import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { Navbar } from '../components/Navbar';
import { VideoModal } from '../components/VideoModal';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

interface LandingPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingPage({ isDark, onToggleTheme }: LandingPageProps) {
  const { t } = useTranslation();
  const { handleNavClick } = useSmoothScroll();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />
      
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute inset-0 bg-pattern pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-slate-800 rounded-full border border-orange-100 dark:border-slate-700">
                  <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                  <span className="text-sm font-medium text-primary">{t('hero.badge')}</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 dark:text-white">
                  {t('hero.title')} <br/>
                  <span className="text-primary relative inline-block">
                    {t('hero.highlight')}
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-200 -z-10" preserveAspectRatio="none" viewBox="0 0 100 10">
                      <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
                    </svg>
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {t('hero.description')}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-xl shadow-orange-500/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                    <Icon name="rocket_launch" />
                    {t('hero.ctaPrimary')}
                  </button>
                  <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-lg font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Icon name="play_circle" />
                    {t('hero.ctaSecondary')}
                  </button>
                </div>
                
                <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-success" />
                    <span>{t('hero.feature1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-success" />
                    <span>{t('hero.feature2')}</span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Phone Mockup */}
              <div className="relative lg:h-[600px] flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 flex flex-col">
                    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6">
                      <span className="font-bold text-lg">ড্যাশবোর্ড</span>
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-slate-500">আজকের বিক্রি</div>
                          <div className="text-xl font-bold text-primary">৳ ৪,৫০০</div>
                        </div>
                        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-slate-500">মোট অর্ডার</div>
                          <div className="text-xl font-bold text-slate-800 dark:text-white">১২টি</div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-sm">সাম্প্রতিক লেনদেন</span>
                          <span className="text-xs text-primary cursor-pointer">সব দেখুন</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                <Icon name="shopping_bag" className="text-sm" />
                              </div>
                              <div>
                                <div className="font-medium">অর্ডার #১০২</div>
                                <div className="text-xs text-slate-400">মিনু রহমান</div>
                              </div>
                            </div>
                            <span className="font-bold">৳ ৫২০</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <Icon name="shopping_bag" className="text-sm" />
                              </div>
                              <div>
                                <div className="font-medium">অর্ডার #১০১</div>
                                <div className="text-xs text-slate-400">করিম শেখ</div>
                              </div>
                            </div>
                            <span className="font-bold">৳ ১,২০০</span>
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
                <div className="absolute bottom-10 -left-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce" style={{animationDuration: '3s'}}>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-primary text-white text-[10px] flex items-center justify-center border-2 border-white font-bold">5k+</div>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold block text-slate-900 dark:text-white">৫০০০+</span>
                      <span className="text-slate-500 text-xs">সন্তুষ্ট ব্যবসায়ী</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🇧🇩</span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t('stats.madeIn')}</p>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">Made in Bangladesh</p>
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="storefront" className="text-blue-600 text-2xl" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t('stats.trusted')}</p>
                  <p className="font-bold text-lg text-slate-800 dark:text-white">10,000+ Shop Owners</p>
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="verified_user" className="text-green-600 text-2xl" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t('stats.secure')}</p>
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
                <a href="#" className="cursor-pointer w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400">
                  <span className="font-bold">f</span>
                </a>
                <a href="#" className="cursor-pointer w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400">
                  <span className="font-bold">in</span>
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
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">{t('footer.terms')}</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">{t('footer.privacy')}</a>
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