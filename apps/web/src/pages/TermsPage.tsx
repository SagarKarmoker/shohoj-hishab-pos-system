import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Icon } from '../components/Icon';

interface TermsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToLanding: () => void;
}

export function TermsPage({ isDark, onToggleTheme, onBackToLanding }: TermsPageProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
          >
            <Icon name="arrow_back" className="text-xl" />
            <span className="font-medium">{t('common.backToHome')}</span>
          </button>
          
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            <Icon name={isDark ? 'light_mode' : 'dark_mode'} className="text-xl" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Title */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-slate-800 rounded-full border border-orange-100 dark:border-slate-700 mb-6">
                <Icon name="description" className="text-primary text-lg" />
                <span className="text-sm font-medium text-primary">{t('legal.document')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                {t('terms.title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {t('terms.lastUpdated')}
              </p>
            </div>

            {/* Content Sections */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="handshake" className="text-primary text-2xl" />
                  {t('terms.section1.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('terms.section1.content1')}
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('terms.section1.content2')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="account_circle" className="text-primary text-2xl" />
                  {t('terms.section2.title')}
                </h2>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section2.item1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section2.item2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section2.item3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section2.item4')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="shopping_cart" className="text-primary text-2xl" />
                  {t('terms.section3.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('terms.section3.content1')}
                </p>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="fiber_manual_record" className="text-primary text-sm mt-2 flex-shrink-0" />
                    <span>{t('terms.section3.item1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="fiber_manual_record" className="text-primary text-sm mt-2 flex-shrink-0" />
                    <span>{t('terms.section3.item2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="fiber_manual_record" className="text-primary text-sm mt-2 flex-shrink-0" />
                    <span>{t('terms.section3.item3')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="security" className="text-primary text-2xl" />
                  {t('terms.section4.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('terms.section4.content1')}
                </p>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="close" className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section4.prohibited1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="close" className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section4.prohibited2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="close" className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section4.prohibited3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="close" className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('terms.section4.prohibited4')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="gavel" className="text-primary text-2xl" />
                  {t('terms.section5.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('terms.section5.content1')}
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('terms.section5.content2')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="info" className="text-primary text-2xl" />
                  {t('terms.section6.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('terms.section6.content1')}
                </p>
              </div>

              {/* Contact Section */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-orange-200 dark:border-slate-600">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="contact_support" className="text-primary text-2xl" />
                  {t('terms.contact.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('terms.contact.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:support@shohojhishab.com"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-orange-600 transition-colors shadow-lg font-medium"
                  >
                    <Icon name="email" className="text-xl" />
                    <span>{t('footer.email')}</span>
                  </a>
                  <a
                    href="tel:+8801234567890"
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-lg font-medium border border-slate-200 dark:border-slate-600"
                  >
                    <Icon name="phone" className="text-xl" />
                    <span>{t('footer.phone')}</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
