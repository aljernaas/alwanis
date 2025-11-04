
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TopNavigation from '../../components/base/TopNavigation';
import BottomNavigation from '../../components/base/BottomNavigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTheme } from '../../hooks/useTheme';
import { countries } from '../../mocks/holidays';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useLocalStorage('appSettings', {
    country: '',
    weekendDays: [5, 6],
    workSystem: 'official',
    language: 'ar',
    notifications: true,
    countryDetected: false
  });

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showWeekendModal, setShowWeekendModal] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Country code to country mapping for geolocation
  const countryCodeMap: { [key: string]: string } = {
    'AE': 'ae', 'SA': 'sa', 'EG': 'eg', 'JO': 'jo', 'KW': 'kw', 'QA': 'qa',
    'BH': 'bh', 'OM': 'om', 'IQ': 'iq', 'SY': 'sy', 'LB': 'lb', 'PS': 'ps',
    'YE': 'ye', 'IR': 'ir', 'TR': 'tr', 'IL': 'il', 'MA': 'ma', 'DZ': 'dz',
    'TN': 'tn', 'LY': 'ly', 'SD': 'sd', 'AF': 'af', 'PK': 'pk', 'IN': 'in',
    'BD': 'bd', 'LK': 'lk', 'MV': 'mv', 'NP': 'np', 'BT': 'bt', 'CN': 'cn',
    'JP': 'jp', 'KR': 'kr', 'KP': 'kp', 'MN': 'mn', 'TH': 'th', 'VN': 'vn',
    'LA': 'la', 'KH': 'kh', 'MM': 'mm', 'MY': 'my', 'SG': 'sg', 'ID': 'id',
    'BN': 'bn', 'PH': 'ph', 'TL': 'tl', 'TW': 'tw', 'HK': 'hk', 'MO': 'mo',
    'UZ': 'uz', 'KZ': 'kz', 'KG': 'kg', 'TJ': 'tj', 'TM': 'tm', 'AZ': 'az',
    'AM': 'am', 'GE': 'ge', 'CY': 'cy', 'RU': 'ru', 'DE': 'de', 'FR': 'fr',
    'GB': 'gb', 'IT': 'it', 'ES': 'es', 'PT': 'pt', 'NL': 'nl', 'BE': 'be',
    'CH': 'ch', 'AT': 'at', 'SE': 'se', 'NO': 'no', 'DK': 'dk', 'FI': 'fi',
    'IS': 'is', 'IE': 'ie', 'PL': 'pl', 'CZ': 'cz', 'SK': 'sk', 'HU': 'hu',
    'RO': 'ro', 'BG': 'bg', 'HR': 'hr', 'SI': 'si', 'RS': 'rs', 'BA': 'ba',
    'ME': 'me', 'MK': 'mk', 'AL': 'al', 'GR': 'gr', 'LT': 'lt', 'LV': 'lv',
    'EE': 'ee', 'BY': 'by', 'UA': 'ua', 'MD': 'md', 'LU': 'lu', 'MT': 'mt',
    'MC': 'mc', 'AD': 'ad', 'SM': 'sm', 'VA': 'va', 'LI': 'li', 'ZA': 'za',
    'NG': 'ng', 'KE': 'ke', 'ET': 'et', 'UG': 'ug', 'TZ': 'tz', 'RW': 'rw',
    'BI': 'bi', 'DJ': 'dj', 'SO': 'so', 'ER': 'er', 'SS': 'ss', 'CD': 'cd',
    'CG': 'cg', 'CF': 'cf', 'CM': 'cm', 'TD': 'td', 'NE': 'ne', 'ML': 'ml',
    'BF': 'bf', 'CI': 'ci', 'GH': 'gh', 'TG': 'tg', 'BJ': 'bj', 'SN': 'sn',
    'GM': 'gm', 'GW': 'gw', 'GN': 'gn', 'SL': 'sl', 'LR': 'lr', 'MR': 'mr',
    'CV': 'cv', 'ST': 'st', 'GQ': 'gq', 'GA': 'ga', 'AO': 'ao', 'NA': 'na',
    'BW': 'bw', 'ZW': 'zw', 'ZM': 'zm', 'MW': 'mw', 'MZ': 'mz', 'MG': 'mg',
    'MU': 'mu', 'SC': 'sc', 'KM': 'km', 'SZ': 'sz', 'LS': 'ls', 'US': 'us',
    'CA': 'ca', 'MX': 'mx', 'GT': 'gt', 'BZ': 'bz', 'SV': 'sv', 'HN': 'hn',
    'NI': 'ni', 'CR': 'cr', 'PA': 'pa', 'CU': 'cu', 'JM': 'jm', 'HT': 'ht',
    'DO': 'do', 'PR': 'pr', 'TT': 'tt', 'BB': 'bb', 'GD': 'gd', 'LC': 'lc',
    'VC': 'vc', 'AG': 'ag', 'DM': 'dm', 'KN': 'kn', 'BS': 'bs', 'BR': 'br',
    'AR': 'ar', 'CL': 'cl', 'PE': 'pe', 'CO': 'co', 'VE': 've', 'EC': 'ec',
    'BO': 'bo', 'PY': 'py', 'UY': 'uy', 'GY': 'gy', 'SR': 'sr', 'GF': 'gf',
    'AU': 'au', 'NZ': 'nz', 'PG': 'pg', 'FJ': 'fj', 'SB': 'sb', 'VU': 'vu',
    'NC': 'nc', 'PF': 'pf', 'WS': 'ws', 'TO': 'to', 'KI': 'ki', 'TV': 'tv',
    'NR': 'nr', 'PW': 'pw', 'FM': 'fm', 'MH': 'mh'
  };

  const weekDays = [
    { value: 0, label: isRTL ? 'الأحد' : 'Sunday', labelShort: isRTL ? 'أحد' : 'Sun' },
    { value: 1, label: isRTL ? 'الاثنين' : 'Monday', labelShort: isRTL ? 'اثنين' : 'Mon' },
    { value: 2, label: isRTL ? 'الثلاثاء' : 'Tuesday', labelShort: isRTL ? 'ثلاثاء' : 'Tue' },
    { value: 3, label: isRTL ? 'الأربعاء' : 'Wednesday', labelShort: isRTL ? 'أربعاء' : 'Wed' },
    { value: 4, label: isRTL ? 'الخميس' : 'Thursday', labelShort: isRTL ? 'خميس' : 'Thu' },
    { value: 5, label: isRTL ? 'الجمعة' : 'Friday', labelShort: isRTL ? 'جمعة' : 'Fri' },
    { value: 6, label: isRTL ? 'السبت' : 'Saturday', labelShort: isRTL ? 'سبت' : 'Sat' }
  ];

  // Auto-detect country on first load
  useEffect(() => {
    if (!settings.countryDetected && !settings.country) {
      detectUserCountry();
    }
  }, []);

  const detectUserCountry = async () => {
    setIsDetectingLocation(true);
    try {
      // Try to get country from IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_code) {
        const detectedCountryCode = countryCodeMap[data.country_code.toUpperCase()];
        if (detectedCountryCode) {
          const country = countries.find(c => c.code === detectedCountryCode);
          if (country) {
            updateSettings({ 
              country: detectedCountryCode,
              weekendDays: country.defaultWeekends,
              countryDetected: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to detect country:', error);
      // Fallback to UAE if detection fails
      updateSettings({ 
        country: 'ae',
        weekendDays: [5, 6],
        countryDetected: true
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const selectedCountry = countries.find(c => c.code === settings.country);

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    updateSettings({ language: newLang });
  };

  const selectCountry = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      updateSettings({ 
        country: countryCode,
        weekendDays: country.defaultWeekends 
      });
    }
    setShowCountryModal(false);
  };

  const toggleWeekendDay = (dayValue: number) => {
    const newWeekendDays = settings.weekendDays.includes(dayValue)
      ? settings.weekendDays.filter(d => d !== dayValue)
      : [...settings.weekendDays, dayValue].sort();
    
    updateSettings({ weekendDays: newWeekendDays });
  };

  const getSelectedWeekendDaysText = () => {
    return settings.weekendDays
      .map(day => weekDays.find(wd => wd.value === day)?.labelShort)
      .join(' - ');
  };

  const redetectCountry = () => {
    updateSettings({ countryDetected: false, country: '' });
    detectUserCountry();
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopNavigation title={isRTL ? 'الإعدادات' : 'Settings'} />
      
      <div className="pt-14 pb-20 px-4">
        {/* Language Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL ? 'إعدادات اللغة' : 'Language Settings'}
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <i className="ri-translate-2 text-blue-600 dark:text-blue-400 text-xl"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {isRTL ? 'اللغة' : 'Language'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isRTL ? 'العربية' : 'English'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {isRTL ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL ? 'إعدادات المظهر' : 'Theme Settings'}
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <i className={`${theme === 'dark' ? 'ri-moon-line' : 'ri-sun-line'} text-purple-600 dark:text-purple-400 text-xl`}></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {isRTL ? 'المظهر' : 'Theme'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {theme === 'dark' ? (isRTL ? 'داكن' : 'Dark') : (isRTL ? 'فاتح' : 'Light')}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Country Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isRTL ? 'إعدادات الدولة' : 'Country Settings'}
              </h3>
              {settings.countryDetected && (
                <button
                  onClick={redetectCountry}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1 rtl:space-x-reverse"
                  disabled={isDetectingLocation}
                >
                  <i className={`ri-refresh-line ${isDetectingLocation ? 'animate-spin' : ''}`}></i>
                  <span>{isRTL ? 'إعادة الكشف' : 'Re-detect'}</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {isDetectingLocation ? (
              <div className="flex items-center justify-center p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {isRTL ? 'جاري كشف موقعك...' : 'Detecting your location...'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowCountryModal(true)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <i className="ri-map-pin-line text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                    <div className="text-left rtl:text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {isRTL ? 'الدولة' : 'Country'}
                        {settings.countryDetected && (
                          <span className="text-xs text-teal-600 dark:text-teal-400 mr-2 rtl:mr-0 rtl:ml-2">
                            {isRTL ? '(تم الكشف تلقائياً)' : '(Auto-detected)'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedCountry ? (isRTL ? selectedCountry.nameAr : selectedCountry.name) : (isRTL ? 'اختر دولة' : 'Select country')}
                      </div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-400 dark:text-gray-500 rtl:rotate-180"></i>
                </button>
                
                {settings.countryDetected && selectedCountry && (
                  <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <i className="ri-information-line text-teal-600 dark:text-teal-400"></i>
                      <span className="text-sm text-teal-700 dark:text-teal-300">
                        {isRTL 
                          ? `تم كشف موقعك في ${selectedCountry.nameAr} وتطبيق إعدادات العطل المناسبة`
                          : `Detected your location in ${selectedCountry.name} and applied appropriate weekend settings`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Work System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL ? 'نظام العمل' : 'Work System'}
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {isRTL ? 'نوع نظام العمل' : 'Work System Type'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateSettings({ workSystem: 'official' })}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    settings.workSystem === 'official'
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <i className="ri-briefcase-line text-xl mb-2"></i>
                  <div className="text-sm font-medium">
                    {isRTL ? 'نظام رسمي' : 'Official System'}
                  </div>
                </button>
                <button
                  onClick={() => updateSettings({ workSystem: 'shift' })}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    settings.workSystem === 'shift'
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <i className="ri-time-line text-xl mb-2"></i>
                  <div className="text-sm font-medium">
                    {isRTL ? 'نظام شفتات' : 'Shift System'}
                  </div>
                </button>
              </div>
            </div>

            {settings.workSystem === 'official' && (
              <div>
                <button
                  onClick={() => setShowWeekendModal(true)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <i className="ri-calendar-2-line text-orange-600 dark:text-orange-400"></i>
                    </div>
                    <div className="text-left rtl:text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {isRTL ? 'أيام نهاية الأسبوع' : 'Weekend Days'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getSelectedWeekendDaysText()}
                      </div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-400 dark:text-gray-500 rtl:rotate-180"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL ? 'إعدادات التطبيق' : 'App Settings'}
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <i className="ri-notification-line text-indigo-600 dark:text-indigo-400 text-xl"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {isRTL ? 'الإشعارات' : 'Notifications'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isRTL ? 'تفعيل التنبيهات والتذكيرات' : 'Enable alerts and reminders'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ notifications: !settings.notifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL ? 'حول التطبيق' : 'About App'}
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-calendar-check-line text-teal-600 dark:text-teal-400 text-2xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isRTL ? 'تنظيم الإجازات' : 'Holiday Organizer'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isRTL 
                  ? 'تطبيق ذكي لتنظيم الإجازات والوقت مع دعم كامل للغة العربية'
                  : 'Smart app for organizing holidays and time with full Arabic support'
                }
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {isRTL ? 'الإصدار 1.0.0' : 'Version 1.0.0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Country Selection Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-[70vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isRTL ? 'اختر الدولة' : 'Select Country'}
                </h2>
                <button
                  onClick={() => setShowCountryModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => selectCountry(country.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
                    settings.country === country.code
                      ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-left rtl:text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {isRTL ? country.nameAr : country.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {isRTL ? 'عطلة نهاية الأسبوع: ' : 'Weekend: '}
                      {country.defaultWeekends.map(day => 
                        weekDays.find(wd => wd.value === day)?.labelShort
                      ).join(' - ')}
                    </div>
                  </div>
                  {settings.country === country.code && (
                    <i className="ri-check-line text-teal-600 dark:text-teal-400 text-xl"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekend Days Selection Modal */}
      {showWeekendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isRTL ? 'اختر أيام نهاية الأسبوع' : 'Select Weekend Days'}
                </h2>
                <button
                  onClick={() => setShowWeekendModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2 mb-4">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleWeekendDay(day.value)}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      settings.weekendDays.includes(day.value)
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{day.label}</span>
                    {settings.weekendDays.includes(day.value) && (
                      <i className="ri-check-line text-orange-600 dark:text-orange-400 text-xl"></i>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowWeekendModal(false)}
                className="w-full px-4 py-3 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
              >
                {isRTL ? 'تم' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;
