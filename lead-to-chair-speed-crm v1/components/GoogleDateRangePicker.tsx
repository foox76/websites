
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DateRange {
  startDate: Date;
  endDate: Date;
  label?: string;
}

interface GoogleDateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (range: DateRange) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  singleDateMode?: boolean;
}

type PresetOption = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'LAST_7_DAYS' | 'LAST_WEEK' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';

const GoogleDateRangePicker: React.FC<GoogleDateRangePickerProps> = ({
  isOpen,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
  singleDateMode = false
}) => {
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(initialStartDate || new Date());
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || new Date());
  const [endDate, setEndDate] = useState<Date | null>(singleDateMode ? (initialStartDate || new Date()) : (initialEndDate || new Date()));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>(singleDateMode ? 'TODAY' : 'THIS_WEEK');
  
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // --- Helpers ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const handleDateClick = (date: Date) => {
    if (singleDateMode) {
      setStartDate(date);
      setEndDate(date);
      setSelectedPreset('CUSTOM');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setSelectedPreset('CUSTOM');
    } else {
      // Completing the range
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setSelectedPreset('CUSTOM');
    }
  };

  const handlePresetClick = (preset: PresetOption) => {
    setSelectedPreset(preset);
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'TODAY':
        break;
      case 'YESTERDAY':
        start.setDate(now.getDate() - 1);
        end.setDate(now.getDate() - 1);
        break;
      case 'THIS_WEEK':
        const day = now.getDay() || 7; 
        if (day !== 1) start.setHours(-24 * (day - 1));
        start.setHours(0,0,0,0);
        break;
      case 'LAST_7_DAYS':
        start.setDate(now.getDate() - 6);
        break;
      case 'LAST_WEEK':
        const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const lastDay = lastWeek.getDay() || 7;
        start = new Date(lastWeek);
        if (lastDay !== 1) start.setDate(lastWeek.getDate() - (lastDay - 1));
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'LAST_30_DAYS':
        start.setDate(now.getDate() - 29);
        break;
      case 'THIS_MONTH':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'LAST_MONTH':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    
    setStartDate(start);
    setEndDate(end);
    setCurrentMonth(start);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      let label = 'Custom Range';
      if (selectedPreset !== 'CUSTOM') {
         // Convert preset constant to readable label or translated string
         // Simple mapping for demonstration
         label = selectedPreset.replace(/_/g, ' ');
      }
      onApply({ startDate, endDate, label });
      onClose();
    } else if (singleDateMode && startDate) {
      onApply({ startDate, endDate: startDate, label: 'Single Date' });
      onClose();
    }
  };

  // Determine the visual range (including hover state)
  let visualStart = startDate;
  let visualEnd = endDate;

  if (!singleDateMode && startDate && !endDate && hoverDate) {
    if (hoverDate < startDate) {
      visualStart = hoverDate;
      visualEnd = startDate;
    } else {
      visualEnd = hoverDate;
    }
  }

  const isWithinVisualRange = (date: Date) => {
    if (!visualStart || !visualEnd) return false;
    return date >= visualStart && date <= visualEnd;
  };

  const getPresetLabel = (preset: PresetOption) => {
    switch (preset) {
        case 'TODAY': return t('today');
        case 'YESTERDAY': return t('yesterday');
        case 'THIS_WEEK': return t('thisWeek');
        case 'LAST_7_DAYS': return t('last7Days');
        case 'LAST_WEEK': return t('lastWeek');
        case 'LAST_30_DAYS': return t('last30Days');
        case 'THIS_MONTH': return t('thisMonth');
        case 'LAST_MONTH': return t('lastMonth');
        case 'CUSTOM': return t('custom');
        default: return preset;
    }
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month); // 0 = Sun

    const days = [];
    // Empty slots
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
    }
    
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      date.setHours(0,0,0,0); // Normalize for comparison

      // Selection States
      const isSelectedStart = isSameDay(date, startDate);
      const isSelectedEnd = isSameDay(date, endDate);
      const isSelected = isSelectedStart || isSelectedEnd;
      const isToday = isSameDay(date, new Date());

      // Range States (Visual)
      const inRange = !singleDateMode && isWithinVisualRange(date);
      const isRangeStart = !singleDateMode && isSameDay(date, visualStart);
      const isRangeEnd = !singleDateMode && isSameDay(date, visualEnd);
      
      // Row edge detection for pill shape
      const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
      const isRowStart = dayOfWeek === 0;
      const isRowEnd = dayOfWeek === 6;

      // Background Logic - RTL aware
      // In RTL, left rounding applies to the visually right side if we don't swap logic, 
      // but standard CSS border-radius is physical unless using logical properties.
      // Tailwind rounded-l-full is physical left. 
      // For RTL, visual start is on right. 
      // However, the calendar grid renders 1,2,3... left-to-right or right-to-left based on direction.
      // If dir=rtl, grid flows right-to-left. 
      // So physical Left is the END of the row visually in RTL? No, start of row is Right.
      // Let's stick to logical start/end if possible, or swap based on context.
      // Simpler: Use direction agnostic logic or let CSS handle direction if configured correctly.
      // Since we use physical classes (rounded-l-full), we need to swap if RTL.
      
      const isRTL = language === 'ar';
      
      let roundStartClass = 'rounded-l-full';
      let roundEndClass = 'rounded-r-full';
      
      if (isRTL) {
          roundStartClass = 'rounded-r-full';
          roundEndClass = 'rounded-l-full';
      }

      const shouldRoundStart = isRangeStart || isRowStart;
      const shouldRoundEnd = isRangeEnd || isRowEnd;

      days.push(
        <div
          key={d}
          onMouseEnter={() => !singleDateMode && setHoverDate(date)}
          className="relative h-10 w-full p-0 flex items-center justify-center"
        >
          {/* Continuous Background Strip */}
          {inRange && (
             <div 
                className={`absolute inset-y-0 inset-x-0 bg-blue-50
                  ${shouldRoundStart ? roundStartClass : ''}
                  ${shouldRoundEnd ? roundEndClass : ''}
                `} 
             />
          )}

          {/* Number Circle */}
          <button
            onClick={() => handleDateClick(date)}
            className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
              ${isSelected ? 'bg-blue-600 text-white shadow-md font-bold' : ''}
              ${!isSelected && inRange ? 'text-blue-700' : ''}
              ${!isSelected && !inRange ? 'text-gray-700 hover:bg-gray-100' : ''}
              ${isToday && !isSelected ? 'ring-1 ring-blue-600 text-blue-600 font-bold' : ''}
            `}
          >
            {d}
          </button>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-24 px-4 bg-transparent">
       {/* Invisible Overlay for click outside */}
      <div className="fixed inset-0 bg-black/5 z-0" /> 
      
      <div ref={modalRef} className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-3xl z-10 flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        
        {/* Sidebar Presets */}
        <div className="w-full md:w-48 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-2 flex flex-col gap-1">
          {!singleDateMode && (
            <>
            {(['TODAY', 'YESTERDAY', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_WEEK', 'LAST_30_DAYS', 'THIS_MONTH', 'LAST_MONTH'] as PresetOption[]).map(preset => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`text-left rtl:text-right px-3 py-2 text-xs font-medium rounded-md transition-colors ${selectedPreset === preset ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {getPresetLabel(preset)}
              </button>
            ))}
            </>
          )}
           <button
                onClick={() => setSelectedPreset('CUSTOM')}
                className={`text-left rtl:text-right px-3 py-2 text-xs font-medium rounded-md transition-colors ${selectedPreset === 'CUSTOM' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {t('custom')}
            </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          
          {/* Top Inputs */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('startDate')}</label>
               <div className={`border rounded px-3 py-2 text-sm text-gray-700 font-mono bg-white ${!startDate ? 'border-red-300' : 'border-gray-300'}`}>
                 {startDate ? startDate.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US') : 'MM/DD/YYYY'}
               </div>
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex-1">
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('endDate')}</label>
               <div className={`border rounded px-3 py-2 text-sm text-gray-700 font-mono bg-white ${!endDate && !singleDateMode ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-300'}`}>
                 {endDate ? endDate.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US') : 'MM/DD/YYYY'}
               </div>
            </div>
          </div>

          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-4">
             <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
               {currentMonth.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', { month: 'long', year: 'numeric' })}
             </span>
             <div className="flex items-center gap-2">
               <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft className="w-5 h-5 rtl:rotate-180" /></button>
               <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight className="w-5 h-5 rtl:rotate-180" /></button>
             </div>
          </div>

          {/* Calendar Grid */}
          <div className="mb-6">
             <div className="grid grid-cols-7 mb-2">
               {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                 <div key={d} className="h-8 flex items-center justify-center text-xs font-bold text-gray-400">{d}</div>
               ))}
             </div>
             {/* Updated Grid: removed gap-x to ensure continuity, kept gap-y for row separation */}
             <div className="grid grid-cols-7 gap-y-1">
               {renderCalendar()}
             </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded">{t('cancel')}</button>
             <button onClick={handleApply} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm">{t('apply')}</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GoogleDateRangePicker;
