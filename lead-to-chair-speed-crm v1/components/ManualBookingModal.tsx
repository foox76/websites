
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, VisitStatus, LeadSource, Doctor } from '../types';
import { X, User, Phone, Clock, Calendar, CreditCard, Stethoscope, Save, AlertCircle, Fingerprint, Baby, Hourglass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ManualBookingModalProps {
  allLeads: Lead[];
  doctors: Doctor[];
  onClose: () => void;
  onConfirm: (lead: Lead) => void;
  initialDate?: string;
  initialTime?: string;
}

const ManualBookingModal: React.FC<ManualBookingModalProps> = ({ allLeads, doctors, onClose, onConfirm, initialDate, initialTime }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [treatment, setTreatment] = useState('General Checkup');
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.name || '');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr);
  
  const [selectedTime, setSelectedTime] = useState(initialTime || '');
  const [duration, setDuration] = useState<number>(30);
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD' | 'CHEQUE'>('CASH');

  // Generate HOURS dynamically or use static list. Using standard 30min blocks here for simplicity.
  // In a real app, this should match ScheduleView's dynamic hours.
  const HOURS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  // Calculate all occupied slots based on existing bookings and their durations
  const getOccupiedSlots = (doctor: string, dateStr: string) => {
    const dateTimestamp = new Date(dateStr).setHours(0,0,0,0);
    
    // Get all bookings for this doctor on this day
    const dayBookings = allLeads.filter(l => 
      l.status === LeadStatus.BOOKED && 
      l.assignedDoctor === doctor && 
      l.appointmentTime &&
      l.appointmentDate === dateTimestamp
    );

    const occupied = new Set<string>();

    // Helper to convert time "09:30" to minutes "570"
    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    // Helper to convert minutes back to time "09:30"
    const minsToTime = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    };

    // Mark slots occupied by EXISTING bookings
    dayBookings.forEach(booking => {
      const startMins = timeToMins(booking.appointmentTime!);
      const endMins = startMins + (booking.duration || 30);
      
      // Mark every 30 min block in this range as occupied
      for (let t = startMins; t < endMins; t += 30) {
        occupied.add(minsToTime(t));
      }
    });

    return occupied;
  };

  // Check if a specific start time is valid given the SELECTED duration
  const isSlotValid = (startTime: string, durationMins: number, occupiedSet: Set<string>) => {
    if (occupiedSet.has(startTime)) return false;
    
    const startMins = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const slotsNeeded = durationMins / 30;
    
    // Check if subsequent slots are free
    for (let i = 1; i < slotsNeeded; i++) {
       const nextSlotMins = startMins + (i * 30);
       const h = Math.floor(nextSlotMins / 60);
       const m = nextSlotMins % 60;
       const nextSlotTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
       
       // If next slot is occupied, then this start time is invalid for this duration
       if (occupiedSet.has(nextSlotTime)) return false;
    }
    return true;
  };

  const occupiedSlots = getOccupiedSlots(selectedDoctor, selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedTime || !selectedDate) return;

    const priceVal = parseFloat(price) || 0;
    const depositVal = parseFloat(deposit) || 0;
    const dateTimestamp = new Date(selectedDate).setHours(0,0,0,0);

    const newLead: Lead = {
      id: Date.now().toString(),
      name,
      phone,
      nationalId: nationalId || undefined,
      birthYear: birthYear || undefined,
      treatmentInterest: treatment,
      status: LeadStatus.BOOKED,
      source: LeadSource.MANUAL, // Mark as manual/walk-in
      createdAt: Date.now(),
      notes: [{ id: 'init', text: 'Walk-in Appointment booked manually', timestamp: Date.now() }],
      potentialValue: priceVal,
      priceQuoted: priceVal,
      appointmentTime: selectedTime,
      appointmentDate: dateTimestamp,
      duration: duration,
      assignedDoctor: selectedDoctor,
      visitStatus: VisitStatus.SCHEDULED,
      labOrders: [],
      payments: depositVal > 0 ? [{
        id: Date.now().toString(),
        amount: depositVal,
        method: paymentMethod,
        date: Date.now(),
        note: 'Initial Deposit (Walk-in)'
      }] : []
    };

    onConfirm(newLead);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" /> {t('newWalkIn')}
          </h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('patientName')}</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-gray-400" />
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={t('fullName')}
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('phoneNumber')}</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-gray-400" />
                <input 
                  required
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="968..."
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('nationalId')}</label>
              <div className="relative">
                <Fingerprint className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-gray-400" />
                <input 
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ID Number"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('birthYear')}</label>
              <div className="relative">
                <Baby className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-gray-400" />
                <input 
                  type="text"
                  value={birthYear}
                  onChange={e => setBirthYear(e.target.value)}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="YYYY"
                />
              </div>
            </div>
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('treatmentType')}</label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-gray-400" />
              <input 
                required
                type="text"
                value={treatment}
                onChange={e => setTreatment(e.target.value)}
                className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Consultation, Extraction..."
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Scheduling Logic */}
          <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">{t('date')}</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-gray-400" />
                <input 
                  required
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">{t('doctor')}</label>
              <select 
                value={selectedDoctor}
                onChange={e => { setSelectedDoctor(e.target.value); setSelectedTime(''); }} // Reset time when doctor changes
                className="w-full py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">{t('duration')}</label>
              <div className="relative">
                <Hourglass className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-indigo-400" />
                <select 
                  value={duration}
                  onChange={e => { setDuration(parseInt(e.target.value)); setSelectedTime(''); }}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value={30}>{t('min30')}</option>
                  <option value={60}>{t('min60')}</option>
                  <option value={90}>{t('min90')}</option>
                  <option value={120}>{t('min120')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">{t('timeSlot')}</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 rtl:right-3 top-2.5 text-indigo-400" />
                <select 
                  required
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className={`w-full pl-9 rtl:pl-4 rtl:pr-9 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ${!selectedTime ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <option value="">{t('selectTime')}</option>
                  {HOURS.map(time => {
                    // Check if this slot is already taken OR if booking here would overlap into a future taken slot
                    const isValid = isSlotValid(time, duration, occupiedSlots);
                    
                    return (
                      <option key={time} value={time} disabled={!isValid} className={!isValid ? 'text-gray-300 bg-gray-50' : ''}>
                        {time} {!isValid ? `(${t('busy')})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('expectedPrice')} (OMR)</label>
                <input 
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full py-1.5 px-2 border border-gray-200 rounded-md text-sm"
                    placeholder="0.00"
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('depositPaid')} (OMR)</label>
                <div className="relative">
                    <CreditCard className="w-3 h-3 absolute left-2 rtl:right-2 top-2.5 text-gray-400" />
                    <input 
                    type="number"
                    value={deposit}
                    onChange={e => setDeposit(e.target.value)}
                    className="w-full pl-7 rtl:pl-2 rtl:pr-7 py-1.5 border border-gray-200 rounded-md text-sm"
                    placeholder="0.00"
                    />
                </div>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('paymentMethod')}</label>
                <select 
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full py-1.5 px-2 border border-gray-200 rounded-md text-sm bg-white"
                >
                    <option value="CASH">{t('cash')}</option>
                    <option value="TRANSFER">{t('transfer')}</option>
                    <option value="CARD">{t('card')}</option>
                    <option value="CHEQUE">{t('cheque')}</option>
                </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {t('confirmBooking')}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ManualBookingModal;
