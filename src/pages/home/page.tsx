
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../../components/base/TopNavigation';
import BottomNavigation from '../../components/base/BottomNavigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { uaeHolidays } from '../../mocks/holidays';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [currentDate] = useState(new Date());
  const [settings] = useLocalStorage('appSettings', {
    country: 'uae',
    weekendDays: [5, 6], // Friday, Saturday
    workSystem: 'official'
  });

  // Check if user has configured work settings
  const hasWorkSettings = settings.country && settings.weekendDays && settings.workSystem;

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    if (isRTL) {
      return date.toLocaleDateString('ar-AE', options);
    }
    return date.toLocaleDateString('en-US', options);
  };

  const getDayStatus = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    
    // Check if it's a weekend
    if (settings.weekendDays.includes(dayOfWeek)) {
      return { type: 'weekend', color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' };
    }
    
    // Check if it's an official holiday
    const isHoliday = uaeHolidays.some(holiday => holiday.date === dateString);
    if (isHoliday) {
      return { type: 'holiday', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' };
    }
    
    return { type: 'work', color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' };
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const status = getDayStatus(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push({
        day,
        date,
        status,
        isToday
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const todayStatus = getDayStatus(new Date());

  const languageToggle = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  // Quick actions data
  const quickActions = [
    {
      icon: 'ri-calendar-check-line',
      title: isRTL ? 'عرض التقويم' : 'View Calendar',
      subtitle: isRTL ? 'تصفح الأشهر والإحصائيات' : 'Browse months & statistics',
      color: 'bg-blue-500',
      action: () => navigate('/calendar')
    },
    {
      icon: 'ri-time-line',
      title: isRTL ? 'نظام الشفتات' : 'Shift System',
      subtitle: isRTL ? 'حساب أنماط العمل المرنة' : 'Calculate flexible work patterns',
      color: 'bg-purple-500',
      action: () => navigate('/shift-system')
    },
    {
      icon: 'ri-pie-chart-line',
      title: isRTL ? 'الإحصائيات' : 'Statistics',
      subtitle: isRTL ? 'رسوم بيانية وتحليلات' : 'Charts & analytics',
      color: 'bg-green-500',
      action: () => navigate('/charts')
    },
    {
      icon: 'ri-sticky-note-line',
      title: isRTL ? 'المذكرات' : 'Notes',
      subtitle: isRTL ? 'مذكرات شخصية وتذكيرات' : 'Personal notes & reminders',
      color: 'bg-orange-500',
      action: () => navigate('/notes')
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopNavigation 
        title={isRTL ? 'تنظيم الإجازات' : 'Holiday Organizer'}
        actions={
          <button
            onClick={languageToggle}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <i className="ri-translate-2 text-xl"></i>
          </button>
        }
      />
      
      <div className="pt-14 pb-20 px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold mb-2">
                {isRTL ? 'مرحباً بك!' : 'Welcome!'}
              </h1>
              <p className="text-teal-100 text-sm">
                {isRTL ? 'نظم وقتك وإجازاتك بذكاء' : 'Organize your time and holidays smartly'}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <i className="ri-calendar-check-line text-2xl"></i>
            </div>
          </div>
        </div>

        {/* Current Date Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {formatDate(currentDate)}
            </h2>
            
            {/* Show day status only if work settings are configured */}
            {hasWorkSettings ? (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${todayStatus.color}`}>
                <div className="w-2 h-2 rounded-full bg-current mr-2 rtl:mr-0 rtl:ml-2"></div>
                {isRTL ? (
                  todayStatus.type === 'work' ? 'يوم عمل' :
                  todayStatus.type === 'weekend' ? 'عطلة نهاية الأسبوع' : 'إجازة رسمية'
                ) : (
                  todayStatus.type === 'work' ? 'Work Day' :
                  todayStatus.type === 'weekend' ? 'Weekend' : 'Official Holiday'
                )}
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mt-2">
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400 mb-2">
                  <i className="ri-settings-3-line text-xl mr-2 rtl:mr-0 rtl:ml-2"></i>
                  <span className="text-sm">
                    {isRTL ? 'قم بإعداد نظام العمل أولاً' : 'Configure work system first'}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  {isRTL ? 'إعداد نظام العمل' : 'Setup Work System'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 text-left rtl:text-right"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <i className={`${action.icon} text-white text-xl`}></i>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {action.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Calendar Preview - Only show if work settings are configured */}
        {hasWorkSettings && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isRTL ? 'التقويم الشهري' : 'Monthly Calendar'}
              </h3>
              <button
                onClick={() => navigate('/calendar')}
                className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium"
              >
                {isRTL ? 'عرض الكل' : 'View All'}
              </button>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                  {isRTL ? day : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.slice(0, 14).map((dayData, index) => (
                <div key={index} className="aspect-square">
                  {dayData ? (
                    <div className={`w-full h-full flex items-center justify-center text-sm rounded-lg relative ${
                      dayData.isToday ? 'ring-2 ring-teal-500 dark:ring-teal-400' : ''
                    } ${dayData.status.color}`}>
                      <span className="font-medium">{dayData.day}</span>
                      {dayData.status.type !== 'work' && (
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                      )}
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              ))}
            </div>
            
            {calendarDays.length > 14 && (
              <div className="text-center mt-3">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {isRTL ? '...' : '...'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Legend - Only show if work settings are configured */}
        {hasWorkSettings && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {isRTL ? 'دليل الألوان' : 'Legend'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/20 mr-3 rtl:mr-0 rtl:ml-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {isRTL ? 'أيام العمل' : 'Work Days'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/20 mr-3 rtl:mr-0 rtl:ml-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {isRTL ? 'عطلة نهاية الأسبوع' : 'Weekend'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/20 mr-3 rtl:mr-0 rtl:ml-3"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {isRTL ? 'الإجازات الرسمية' : 'Official Holidays'}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;