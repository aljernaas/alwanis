
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../../components/base/TopNavigation';
import BottomNavigation from '../../components/base/BottomNavigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface ShiftPattern {
  startDate: string;
  workDays: number;
  leaveDays: number;
  offset: number;
  startWithWork: boolean;
}

const ShiftSystemPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [shiftPattern, setShiftPattern] = useLocalStorage<ShiftPattern>('shiftPattern', {
    startDate: new Date().toISOString().split('T')[0],
    workDays: 4,
    leaveDays: 2,
    offset: 0,
    startWithWork: true
  });

  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const calculateShiftPattern = () => {
    const results = [];
    const startDate = new Date(shiftPattern.startDate);
    const cycleLength = shiftPattern.workDays + shiftPattern.leaveDays;
    
    // Apply offset
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + shiftPattern.offset);
    
    // Generate 60 days of pattern
    for (let i = 0; i < 60; i++) {
      const currentDate = new Date(adjustedStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayInCycle = i % cycleLength;
      let isWorkDay;
      
      if (shiftPattern.startWithWork) {
        isWorkDay = dayInCycle < shiftPattern.workDays;
      } else {
        isWorkDay = dayInCycle >= shiftPattern.leaveDays;
      }
      
      results.push({
        date: currentDate,
        isWorkDay,
        dayInCycle: dayInCycle + 1,
        cycleNumber: Math.floor(i / cycleLength) + 1
      });
    }
    
    setPreviewResults(results);
    setShowPreview(true);
  };

  const resetPattern = () => {
    setShiftPattern({
      startDate: new Date().toISOString().split('T')[0],
      workDays: 4,
      leaveDays: 2,
      offset: 0,
      startWithWork: true
    });
    setShowPreview(false);
    setPreviewResults([]);
  };

  const getPatternDescription = () => {
    if (isRTL) {
      return `${shiftPattern.workDays} أيام عمل، ${shiftPattern.leaveDays} أيام إجازة`;
    }
    return `${shiftPattern.workDays} work days, ${shiftPattern.leaveDays} leave days`;
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopNavigation 
        title={isRTL ? 'نظام الشفتات' : 'Shift System'}
        showBack
        onBack={() => navigate('/')}
      />
      
      <div className="pt-14 pb-16 px-4">
        {/* Pattern Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'إعداد نمط الشفتات' : 'Shift Pattern Configuration'}
          </h3>
          
          <div className="space-y-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'تاريخ البداية' : 'Start Date'}
              </label>
              <input
                type="date"
                value={shiftPattern.startDate}
                onChange={(e) => setShiftPattern({ ...shiftPattern, startDate: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Work Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'أيام العمل المتتالية' : 'Consecutive Work Days'}
              </label>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShiftPattern({ ...shiftPattern, workDays: Math.max(1, shiftPattern.workDays - 1) })}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <i className="ri-subtract-line"></i>
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{shiftPattern.workDays}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{isRTL ? 'أيام' : 'days'}</div>
                </div>
                <button
                  onClick={() => setShiftPattern({ ...shiftPattern, workDays: Math.min(14, shiftPattern.workDays + 1) })}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
            </div>

            {/* Leave Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'أيام الإجازة المتتالية' : 'Consecutive Leave Days'}
              </label>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShiftPattern({ ...shiftPattern, leaveDays: Math.max(1, shiftPattern.leaveDays - 1) })}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <i className="ri-subtract-line"></i>
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{shiftPattern.leaveDays}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{isRTL ? 'أيام' : 'days'}</div>
                </div>
                <button
                  onClick={() => setShiftPattern({ ...shiftPattern, leaveDays: Math.min(14, shiftPattern.leaveDays + 1) })}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
            </div>

            {/* Offset */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الإزاحة (أيام)' : 'Offset (days)'}
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={shiftPattern.offset}
                onChange={(e) => setShiftPattern({ ...shiftPattern, offset: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Start With Work Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'بداية النمط' : 'Pattern Start'}
              </label>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShiftPattern({ ...shiftPattern, startWithWork: true })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    shiftPattern.startWithWork 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <i className="ri-briefcase-line text-xl mb-1"></i>
                  <div className="text-sm font-medium">
                    {isRTL ? 'يبدأ بالعمل' : 'Start with Work'}
                  </div>
                </button>
                <button
                  onClick={() => setShiftPattern({ ...shiftPattern, startWithWork: false })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    !shiftPattern.startWithWork 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <i className="ri-sun-line text-xl mb-1"></i>
                  <div className="text-sm font-medium">
                    {isRTL ? 'يبدأ بالإجازة' : 'Start with Leave'}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 rtl:space-x-reverse mt-6">
            <button
              onClick={calculateShiftPattern}
              className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <i className="ri-eye-line mr-2 rtl:mr-0 rtl:ml-2"></i>
              {isRTL ? 'معاينة النمط' : 'Preview Pattern'}
            </button>
            <button
              onClick={resetPattern}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="ri-refresh-line"></i>
            </button>
          </div>
        </div>

        {/* Pattern Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {isRTL ? 'ملخص النمط' : 'Pattern Summary'}
          </h3>
          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
            <div className="text-teal-800 dark:text-teal-300 font-medium">{getPatternDescription()}</div>
            <div className="text-sm text-teal-600 dark:text-teal-400 mt-1">
              {isRTL 
                ? `دورة كاملة كل ${shiftPattern.workDays + shiftPattern.leaveDays} أيام`
                : `Complete cycle every ${shiftPattern.workDays + shiftPattern.leaveDays} days`
              }
            </div>
          </div>
        </div>

        {/* Preview Results */}
        {showPreview && previewResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isRTL ? 'معاينة النمط (60 يوم)' : 'Pattern Preview (60 days)'}
            </h3>

            {/* Color Legend */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'دليل الألوان:' : 'Color Legend:'}
              </h4>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 rounded mr-2 rtl:mr-0 rtl:ml-2 border border-red-200 dark:border-red-700"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL ? 'أيام العمل' : 'Work Days'}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 rounded mr-2 rtl:mr-0 rtl:ml-2 border border-green-200 dark:border-green-700"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL ? 'أيام الإجازة' : 'Leave Days'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Monthly Calendar View */}
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {(() => {
                const monthGroups: { [key: string]: any[] } = {};
                
                // Group results by month
                previewResults.forEach(result => {
                  const monthKey = `${result.date.getFullYear()}-${result.date.getMonth()}`;
                  if (!monthGroups[monthKey]) {
                    monthGroups[monthKey] = [];
                  }
                  monthGroups[monthKey].push(result);
                });

                return Object.entries(monthGroups).map(([monthKey, monthResults]) => {
                  const [year, month] = monthKey.split('-').map(Number);
                  const monthDate = new Date(year, month, 1);
                  const monthName = monthDate.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  });

                  // Generate complete month calendar
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const daysInMonth = lastDay.getDate();
                  const startingDayOfWeek = firstDay.getDay();
                  
                  const calendarDays = [];
                  
                  // Add empty cells for days before the first day of the month
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    calendarDays.push(null);
                  }
                  
                  // Add days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const resultForDay = monthResults.find(r => 
                      r.date.getDate() === day && 
                      r.date.getMonth() === month && 
                      r.date.getFullYear() === year
                    );
                    
                    calendarDays.push({
                      day,
                      date,
                      result: resultForDay,
                      isToday: date.toDateString() === new Date().toDateString()
                    });
                  }

                  return (
                    <div key={monthKey} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      {/* Month Header */}
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">
                        {monthName}
                      </h4>
                      
                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, index) => (
                          <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                            {isRTL ? day : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                          </div>
                        ))}
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dayData, index) => (
                          <div key={index} className="aspect-square">
                            {dayData ? (
                              <div className={`w-full h-full flex flex-col items-center justify-center text-xs rounded-lg border transition-all ${
                                dayData.isToday ? 'ring-2 ring-teal-500 dark:ring-teal-400' : ''
                              } ${
                                dayData.result 
                                  ? dayData.result.isWorkDay 
                                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700' 
                                    : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
                                  : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                              }`}>
                                <span className="font-medium">{dayData.day}</span>
                                {dayData.result && (
                                  <i className={`${dayData.result.isWorkDay ? 'ri-briefcase-line' : 'ri-sun-line'} text-xs opacity-60`}></i>
                                )}
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Month Statistics */}
                      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                          <div className="text-lg font-bold text-red-800 dark:text-red-300">
                            {monthResults.filter(r => r.isWorkDay).length}
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400">
                            {isRTL ? 'أيام عمل' : 'Work Days'}
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                          <div className="text-lg font-bold text-green-800 dark:text-green-300">
                            {monthResults.filter(r => !r.isWorkDay).length}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {isRTL ? 'أيام إجازة' : 'Leave Days'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'الأيام القادمة:' : 'Next few days:'}
              </div>
              <div className="mt-2 space-y-1">
                {previewResults.slice(0, 7).map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 dark:text-white">
                      {result.date.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.isWorkDay 
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' 
                        : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    }`}>
                      {result.isWorkDay 
                        ? (isRTL ? 'عمل' : 'Work')
                        : (isRTL ? 'إجازة' : 'Leave')
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ShiftSystemPage;
