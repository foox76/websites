
import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';
import { X, Calendar, Clock, Save, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RescheduleModalProps {
  lead: Lead;
  allLeads: Lead[];
  onClose: () => void;
  onConfirm: (dateTimestamp: number, timeSlot: string) => void;
}

const HOURS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

const RescheduleModal: React.FC<RescheduleModalProps> = ({ lead, allLeads, onClose, onConfirm }) => {
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(
    lead.appointmentDate ? new Date(lead.appointmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState(lead.appointmentTime || '');

  // Determine occupied slots for the selected doctor AND date
  const getOccupiedSlots = (doctor: string, dateStr: string) => {
    const dateTimestamp = new Date(dateStr).setHours(0,0,0,0);
    return allLeads
      .filter(l => 
        l.status === LeadStatus.BOOKED && 
        l.assignedDoctor === doctor && 
        l.appointmentTime &&
        l.appointmentDate === dateTimestamp &&
        l.id !== lead.id // Exclude self
      )
      .map(l => l.appointmentTime);
  };

  const occupiedSlots = lead.assignedDoctor ? getOccupiedSlots(lead.assignedDoctor, selectedDate) : [];

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const dateTimestamp = new Date(selectedDate).setHours(0,0,0,0);
    onConfirm(dateTimestamp, selectedTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" /> {t('reschedule')}
          </h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('currentAppointment')}</p>
             <div className="flex items-center justify-between">
                <div>
                   <p className="font-bold text-gray-800">{lead.appointmentTime || 'N/A'}</p>
                   <p className="text-xs text-gray-500">
                     {lead.appointmentDate 
                       ? new Date(lead.appointmentDate).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US')
                       : 'Not Scheduled'}
                   </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 rtl:rotate-180" />
                <div className="text-right rtl:text-left">
                   <p className="font-bold text-indigo-600">{selectedTime || '...'}</p>
                   <p className="text-xs text-indigo-400">
                     {selectedDate 
                       ? new Date(selectedDate).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US') 
                       : '...'}
                   </p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">{t('selectNewDate')}</label>
                <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-indigo-400" />
                    <input 
                    required
                    type="date"
                    value={selectedDate}
                    onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                    className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">{t('selectNewTime')}</label>
                <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-indigo-400" />
                    <select 
                    required
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className={`w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ${!selectedTime ? 'border-gray-200' : 'border-indigo-300'}`}
                    >
                    <option value="">{t('selectTime')}</option>
                    {HOURS.map(time => {
                        const isTaken = occupiedSlots.includes(time);
                        return (
                        <option key={time} value={time} disabled={isTaken} className={isTaken ? 'text-gray-300 bg-gray-50' : ''}>
                            {time} {isTaken ? `(${t('busy')})` : ''}
                        </option>
                        );
                    })}
                    </select>
                </div>
             </div>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {t('confirm')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RescheduleModal;
