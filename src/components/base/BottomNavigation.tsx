
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const navItems = [
    {
      path: '/',
      icon: 'ri-home-line',
      activeIcon: 'ri-home-fill',
      label: isRTL ? 'الرئيسية' : 'Home'
    },
    {
      path: '/calendar',
      icon: 'ri-calendar-line',
      activeIcon: 'ri-calendar-fill',
      label: isRTL ? 'التقويم' : 'Calendar'
    },
    {
      path: '/shift-system',
      icon: 'ri-time-line',
      activeIcon: 'ri-time-fill',
      label: isRTL ? 'الشفتات' : 'Shifts'
    },
    {
      path: '/charts',
      icon: 'ri-pie-chart-line',
      activeIcon: 'ri-pie-chart-fill',
      label: isRTL ? 'الإحصائيات' : 'Charts'
    },
    {
      path: '/notes',
      icon: 'ri-sticky-note-line',
      activeIcon: 'ri-sticky-note-fill',
      label: isRTL ? 'المذكرات' : 'Notes'
    },
    {
      path: '/settings',
      icon: 'ri-settings-line',
      activeIcon: 'ri-settings-fill',
      label: isRTL ? 'الإعدادات' : 'Settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-0 py-2 z-50">
      <div className="grid grid-cols-6 h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
                isActive 
                  ? 'text-teal-600 dark:text-teal-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-teal-600 dark:bg-teal-400 rounded-b-full"></div>
              )}
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`${isActive ? item.activeIcon : item.icon} text-xl`}></i>
              </div>
              <span className={`text-xs leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
