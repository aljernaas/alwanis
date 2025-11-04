
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TopNavigation from '../../components/base/TopNavigation';
import BottomNavigation from '../../components/base/BottomNavigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { uaeHolidays } from '../../mocks/holidays';

const ChartsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [settings] = useLocalStorage('appSettings', {
    country: 'uae',
    weekendDays: [5, 6],
    workSystem: 'official'
  });
  const [shiftSettings] = useLocalStorage('shiftSettings', null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const calculateWorkStats = (period: 'month' | 'quarter' | 'year') => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    let workDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    let vacationDays = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if it's a holiday
      const isHoliday = uaeHolidays.some(holiday => holiday.date === dateString);
      if (isHoliday) {
        holidayDays++;
      }
      // Check if it's a weekend
      else if (settings.weekendDays.includes(dayOfWeek)) {
        weekendDays++;
      }
      // Check if it's a vacation day (for shift system)
      else if (shiftSettings && isVacationDay(currentDate, shiftSettings)) {
        vacationDays++;
      }
      // Otherwise it's a work day
      else {
        workDays++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { workDays, weekendDays, holidayDays, vacationDays };
  };

  const isVacationDay = (date: Date, shiftSettings: any) => {
    if (!shiftSettings || settings.workSystem !== 'shift') return false;
    
    const startDate = new Date(shiftSettings.startDate);
    const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleLength = shiftSettings.workDays + shiftSettings.vacationDays;
    const positionInCycle = daysDiff % cycleLength;
    
    return positionInCycle >= shiftSettings.workDays;
  };

  const stats = calculateWorkStats(selectedPeriod);
  const totalDays = stats.workDays + stats.weekendDays + stats.holidayDays + stats.vacationDays;

  const chartData = [
    { label: isRTL ? 'أيام العمل' : 'Work Days', value: stats.workDays, color: '#10B981', percentage: (stats.workDays / totalDays) * 100 },
    { label: isRTL ? 'عطلة نهاية الأسبوع' : 'Weekend', value: stats.weekendDays, color: '#F59E0B', percentage: (stats.weekendDays / totalDays) * 100 },
    { label: isRTL ? 'إجازات رسمية' : 'Holidays', value: stats.holidayDays, color: '#EF4444', percentage: (stats.holidayDays / totalDays) * 100 },
    { label: isRTL ? 'إجازات شخصية' : 'Personal Leave', value: stats.vacationDays, color: '#8B5CF6', percentage: (stats.vacationDays / totalDays) * 100 }
  ].filter(item => item.value > 0);

  const getPeriodLabel = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'month':
        return now.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', { month: 'long', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return isRTL ? `الربع ${quarter} - ${now.getFullYear()}` : `Q${quarter} ${now.getFullYear()}`;
      case 'year':
        return now.getFullYear().toString();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopNavigation 
        title={isRTL ? 'الإحصائيات والرسوم البيانية' : 'Statistics & Charts'}
      />
      
      <div className="pt-14 pb-20 px-4">
        {/* Period Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {isRTL ? 'اختر الفترة الزمنية' : 'Select Time Period'}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'month', label: isRTL ? 'شهر' : 'Month' },
              { key: 'quarter', label: isRTL ? 'ربع سنة' : 'Quarter' },
              { key: 'year', label: isRTL ? 'سنة' : 'Year' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
            {getPeriodLabel()}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            {isRTL ? 'توزيع الأيام' : 'Days Distribution'}
          </h3>
          
          {/* Custom Pie Chart */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              {chartData.map((item, index) => {
                const radius = 80;
                const circumference = 2 * Math.PI * radius;
                const strokeDasharray = circumference;
                
                let cumulativePercentage = 0;
                for (let i = 0; i < index; i++) {
                  cumulativePercentage += chartData[i].percentage;
                }
                
                const strokeDashoffset = circumference - (circumference * item.percentage) / 100;
                const rotation = (cumulativePercentage * 360) / 100;
                
                return (
                  <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transformOrigin: '100px 100px',
                      transform: `rotate(${rotation}deg)`
                    }}
                  />
                );
              })}
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDays}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي الأيام' : 'Total Days'}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.value} ({item.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <i className="ri-briefcase-line text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.workDays}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'أيام العمل' : 'Work Days'}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-2-line text-orange-600 dark:text-orange-400 text-xl"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weekendDays}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'عطل نهاية الأسبوع' : 'Weekend Days'}</div>
              </div>
            </div>
          </div>
          
          {stats.holidayDays > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <i className="ri-flag-line text-red-600 dark:text-red-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.holidayDays}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجازات رسمية' : 'Official Holidays'}</div>
                </div>
              </div>
            </div>
          )}
          
          {stats.vacationDays > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <i className="ri-plane-line text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.vacationDays}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجازات شخصية' : 'Personal Leave'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Work Efficiency */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'كفاءة العمل' : 'Work Efficiency'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'نسبة أيام العمل' : 'Work Days Ratio'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{((stats.workDays / totalDays) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.workDays / totalDays) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'نسبة الإجازات' : 'Break Days Ratio'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{(((stats.weekendDays + stats.holidayDays + stats.vacationDays) / totalDays) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((stats.weekendDays + stats.holidayDays + stats.vacationDays) / totalDays) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ChartsPage;
