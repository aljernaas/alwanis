
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../../components/base/TopNavigation';
import BottomNavigation from '../../components/base/BottomNavigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { uaeHolidays } from '../../mocks/holidays';

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [settings] = useLocalStorage('appSettings', {
    country: 'uae',
    weekendDays: [5, 6],
    workSystem: 'official'
  });

  const getDayStatus = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    
    if (settings.weekendDays.includes(dayOfWeek)) {
      return { type: 'weekend', color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', icon: 'ri-sun-line' };
    }
    
    const holiday = uaeHolidays.find(h => h.date === dateString);
    if (holiday) {
      return { 
        type: 'holiday', 
        color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300', 
        icon: 'ri-gift-line',
        name: isRTL ? holiday.name : holiday.nameEn
      };
    }
    
    return { type: 'work', color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300', icon: 'ri-briefcase-line' };
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const getMonthStats = () => {
    const workDays = calendarDays.filter(day => day && day.status.type === 'work').length;
    const weekends = calendarDays.filter(day => day && day.status.type === 'weekend').length;
    const holidays = calendarDays.filter(day => day && day.status.type === 'holiday').length;
    
    return { workDays, weekends, holidays };
  };

  const stats = getMonthStats();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopNavigation 
        title={isRTL ? 'التقويم' : 'Calendar'}
        showBack
        onBack={() => navigate('/')}
      />
      
      <div className="pt-14 pb-16 px-4">
        {/* Month Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i className={`ri-arrow-${isRTL ? 'right' : 'left'}-s-line text-xl`}></i>
            </button>
            
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthName}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i className={`ri-arrow-${isRTL ? 'left' : 'right'}-s-line text-xl`}></i>
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
            {calendarDays.map((dayData, index) => (
              <div key={index} className="aspect-square">
                {dayData ? (
                  <div className={`w-full h-full flex flex-col items-center justify-center text-sm rounded-lg relative ${
                    dayData.isToday ? 'ring-2 ring-teal-500 dark:ring-teal-400' : ''
                  } ${dayData.status.color} transition-all hover:scale-105`}>
                    <span className="font-medium">{dayData.day}</span>
                    <i className={`${dayData.status.icon} text-xs opacity-60`}></i>
                    {dayData.status.name && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full"></div>
                    )}
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Month Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'إحصائيات الشهر' : 'Month Statistics'}
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-briefcase-line text-red-600 dark:text-red-400 text-xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.workDays}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'أيام عمل' : 'Work Days'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-sun-line text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weekends}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'عطل أسبوعية' : 'Weekends'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-gift-line text-yellow-600 dark:text-yellow-400 text-xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.holidays}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'إجازات رسمية' : 'Holidays'}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'الإجازات القادمة' : 'Upcoming Holidays'}
          </h3>
          
          <div className="space-y-3">
            {uaeHolidays
              .filter(holiday => new Date(holiday.date) >= new Date())
              .slice(0, 3)
              .map((holiday, index) => {
                const date = new Date(holiday.date);
                return (
                  <div key={index} className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                      <i className="ri-gift-line text-yellow-600 dark:text-yellow-400"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {isRTL ? holiday.name : holiday.nameEn}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {date.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      {Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} {isRTL ? 'يوم' : 'days'}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CalendarPage;
