import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Icon } from '../components/Icon';

interface PrivacyPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToLanding: () => void;
}

export function PrivacyPage({ isDark, onToggleTheme, onBackToLanding }: PrivacyPageProps) {
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
                <Icon name="shield" className="text-primary text-lg" />
                <span className="text-sm font-medium text-primary">{t('legal.privacyBadge')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                {t('privacy.title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {t('privacy.lastUpdated')}
              </p>
            </div>

            {/* Content Sections */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="visibility" className="text-primary text-2xl" />
                  {t('privacy.section1.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('privacy.section1.content1')}
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('privacy.section1.content2')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="folder_open" className="text-primary text-2xl" />
                  {t('privacy.section2.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('privacy.section2.intro')}
                </p>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="person" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{t('privacy.section2.personal.title')}: </span>
                      <span>{t('privacy.section2.personal.items')}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="business" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{t('privacy.section2.business.title')}: </span>
                      <span>{t('privacy.section2.business.items')}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="payments" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{t('privacy.section2.transaction.title')}: </span>
                      <span>{t('privacy.section2.transaction.items')}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="devices" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{t('privacy.section2.technical.title')}: </span>
                      <span>{t('privacy.section2.technical.items')}</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="build" className="text-primary text-2xl" />
                  {t('privacy.section3.title')}
                </h2>
                <ul className="space-y-4 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section3.use1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section3.use2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section3.use3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section3.use4')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="check_circle" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section3.use5')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="lock" className="text-primary text-2xl" />
                  {t('privacy.section4.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('privacy.section4.content1')}
                </p>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="vpn_key" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section4.measure1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="cloud_done" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section4.measure2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="verified_user" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section4.measure3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="admin_panel_settings" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section4.measure4')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="share" className="text-primary text-2xl" />
                  {t('privacy.section5.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('privacy.section5.content1')}
                </p>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="close" className="text-green-500 text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section5.no1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="close" className="text-green-500 text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section5.no2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="close" className="text-green-500 text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section5.no3')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="cookie" className="text-primary text-2xl" />
                  {t('privacy.section6.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('privacy.section6.content1')}
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('privacy.section6.content2')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="accessibility" className="text-primary text-2xl" />
                  {t('privacy.section7.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('privacy.section7.content1')}
                </p>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Icon name="edit" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section7.right1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="download" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section7.right2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="delete" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section7.right3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="block" className="text-primary text-xl mt-0.5 flex-shrink-0" />
                    <span>{t('privacy.section7.right4')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="update" className="text-primary text-2xl" />
                  {t('privacy.section8.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('privacy.section8.content1')}
                </p>
              </div>

              {/* Contact Section */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-orange-200 dark:border-slate-600">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <Icon name="contact_support" className="text-primary text-2xl" />
                  {t('privacy.contact.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {t('privacy.contact.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:privacy@shohojhishab.com"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-orange-600 transition-colors shadow-lg font-medium"
                  >
                    <Icon name="email" className="text-xl" />
                    <span>privacy@shohojhishab.com</span>
                  </a>
                  <a
                    href="mailto:support@shohojhishab.com"
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-lg font-medium border border-slate-200 dark:border-slate-600"
                  >
                    <Icon name="support" className="text-xl" />
                    <span>{t('footer.email')}</span>
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
