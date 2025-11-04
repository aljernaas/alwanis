
import { useTranslation } from 'react-i18next';

interface TopNavigationProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const TopNavigation = ({ title, showBack, onBack, actions }: TopNavigationProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const openTalkWithUs = () => {
    const widget = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
    if (widget) {
      widget.click();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {showBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              <i className={`ri-arrow-${isRTL ? 'right' : 'left'}-line text-xl`}></i>
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title || t('common.appName')}
          </h1>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={openTalkWithUs}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <i className="ri-customer-service-2-line text-xl"></i>
          </button>
          {actions && actions}
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
