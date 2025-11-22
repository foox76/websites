
import React, { useState } from 'react';
import { Lead, LeadStatus, LeadSource, VisitStatus, Doctor } from '../types';
import { Phone, MessageCircle, CalendarCheck, Clock, ChevronDown, Sparkles, StickyNote, Send, Reply, ArrowRight, User, CreditCard, Calendar, Zap, Hourglass } from 'lucide-react';
import { generateWhatsAppScript } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface LeadCardProps {
  lead: Lead;
  allLeads: Lead[];
  doctors: Doctor[];
  onUpdateStatus: (id: string, status: LeadStatus, data?: Partial<Lead>) => void;
  onAddNote: (id: string, note: string) => void;
  onOpenDetail: (lead: Lead) => void;
}

const HOURS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

const LeadCard: React.FC<LeadCardProps> = ({ lead, allLeads, doctors, onUpdateStatus, onAddNote, onOpenDetail }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.name || '');
  const [deposit, setDeposit] = useState<string>('0');
  const [duration, setDuration] = useState(30);

  const getOccupiedSlots = (doctor: string, dateStr: string) => {
    const selectedTimestamp = new Date(dateStr).setHours(0,0,0,0);
    const dayBookings = allLeads.filter(l => 
      l.status === LeadStatus.BOOKED && 
      l.assignedDoctor === doctor && 
      l.appointmentTime && 
      l.appointmentDate === selectedTimestamp &&
      l.id !== lead.id
    );

    const occupied = new Set<string>();
    const timeToMins = (t: string) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
    const minsToTime = (m: number) => `${Math.floor(m/60).toString().padStart(2,'0')}:${(m%60).toString().padStart(2,'0')}`;

    dayBookings.forEach(booking => {
      const start = timeToMins(booking.appointmentTime!);
      const end = start + (booking.duration || 30);
      for(let t = start; t < end; t+=30) occupied.add(minsToTime(t));
    });
    return occupied;
  };

  const occupiedSlots = getOccupiedSlots(selectedDoctor, bookingDate);

  const isSlotValid = (startTime: string) => {
    if(occupiedSlots.has(startTime)) return false;
    const startMins = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const slotsNeeded = duration / 30;
    for(let i = 1; i < slotsNeeded; i++) {
       const nextSlotMins = startMins + (i*30);
       const h = Math.floor(nextSlotMins/60);
       const m = nextSlotMins%60;
       if(occupiedSlots.has(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`)) return false;
    }
    return true;
  }

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!aiMessage) {
      setLoadingAi(true);
      try {
        const script = await generateWhatsAppScript(lead);
        setAiMessage(script);
        setExpanded(true);
      } catch (e) {
        toast.error("AI generation failed");
      } finally {
        setLoadingAi(false);
      }
    } else {
      const encodedMessage = encodeURIComponent(aiMessage);
      window.open(`https://wa.me/${lead.phone}?text=${encodedMessage}`, '_blank');
      onUpdateStatus(lead.id, LeadStatus.CONTACTED);
      toast.success(t('whatsAppOpened'));
    }
  };

  const sendTemplate = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const encodedMessage = encodeURIComponent(text);
    window.open(`https://wa.me/${lead.phone}?text=${encodedMessage}`, '_blank');
    onUpdateStatus(lead.id, LeadStatus.CONTACTED);
    toast.success(t('whatsAppOpened'));
    setShowTemplates(false);
  };

  const handleConfirmBooking = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bookingTime || !bookingDate) return; 
    
    const depositAmount = parseInt(deposit) || 0;
    const dateTimestamp = new Date(bookingDate).setHours(0,0,0,0);

    onUpdateStatus(lead.id, LeadStatus.BOOKED, {
      appointmentTime: bookingTime,
      appointmentDate: dateTimestamp,
      duration: duration,
      assignedDoctor: selectedDoctor,
      payments: depositAmount > 0 ? [{
        id: Date.now().toString(),
        amount: depositAmount,
        method: 'TRANSFER', 
        date: Date.now(),
        note: 'Initial Deposit'
      }] : [],
      priceQuoted: lead.potentialValue,
      visitStatus: VisitStatus.SCHEDULED
    });
    setShowBooking(false);
    setExpanded(false);
    toast.success(t('statusUpdated'));
  };

  const getStatusBorder = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'border-s-4 border-s-red-500';
      case LeadStatus.CONTACTED: return 'border-s-4 border-s-blue-500';
      case LeadStatus.BOOKED: return 'border-s-4 border-s-emerald-500';
      default: return '';
    }
  };

  return (
    <div 
      onClick={() => onOpenDetail(lead)}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group ${getStatusBorder(lead.status)}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${lead.source === LeadSource.WEBSITE ? 'bg-blue-50 text-blue-600' : lead.source === LeadSource.MANUAL ? 'bg-gray-100 text-gray-600' : 'bg-purple-50 text-purple-600'}`}>
                  {lead.source === LeadSource.WEBSITE ? t('website') : lead.source === LeadSource.MANUAL ? t('walkIn') : t('adCampaign')}
               </span>
               <span className="text-[10px] text-gray-400 flex items-center gap-1">
                 <Clock className="w-3 h-3" /> {new Date(lead.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
               </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] flex items-center gap-1 text-gray-600 font-bold bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
               {lead.potentialValue} OMR
            </span>
          </div>
        </div>

        {lead.initialMessage && (
          <div className="relative mb-4">
             <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none text-xs text-gray-700 relative ml-2 rtl:ml-0 rtl:mr-2">
                <span className="block text-[9px] text-gray-400 font-bold uppercase mb-1">{t('incomingMessage')}</span>
                "{lead.initialMessage}"
             </div>
          </div>
        )}
        
        {!lead.initialMessage && (
           <p className="text-xs text-gray-500 mb-4">
             <span className="font-medium text-gray-900">{lead.treatmentInterest}</span>
           </p>
        )}

        <div className="grid grid-cols-5 gap-2 mb-2" onClick={e => e.stopPropagation()}>
          <button 
            onClick={handleWhatsAppClick}
            disabled={loadingAi}
            className={`col-span-3 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white font-semibold shadow-sm transition-all active:scale-95 text-xs ${loadingAi ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {loadingAi ? <Sparkles className="w-3 h-3 animate-spin" /> : (lead.initialMessage ? <Reply className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />)}
            {lead.initialMessage ? t('reply') : t('whatsapp')}
          </button>
          
          <div className="relative col-span-1">
            <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
            >
                <Zap className="w-4 h-4" />
            </button>
            {showTemplates && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                    <div className="p-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase">Quick Templates</div>
                    <button onClick={(e) => sendTemplate(e, `Hi ${lead.name}, here is our location: https://maps.google.com/?q=Muscat+Dental`)} className="w-full text-left rtl:text-right px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">📍 Location</button>
                    <button onClick={(e) => sendTemplate(e, `Hi ${lead.name}, please find our price list attached.`)} className="w-full text-left rtl:text-right px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">💰 Pricing</button>
                    <button onClick={(e) => sendTemplate(e, `Hi ${lead.name}, confirming your appointment for tomorrow.`)} className="w-full text-left rtl:text-right px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">✅ Confirm Appt</button>
                </div>
            )}
          </div>

          <button 
            onClick={() => window.open(`tel:${lead.phone}`)}
            className="col-span-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs"
          >
            <Phone className="w-3 h-3" />
          </button>
        </div>

        {(expanded || aiMessage) && (
          <div className="mt-3 space-y-3 animate-fade-in" onClick={e => e.stopPropagation()}>
             {aiMessage && (
              <div className="relative">
                <div className="p-3 bg-emerald-50 rounded-2xl rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none border border-emerald-100 mr-2 rtl:mr-0 rtl:ml-2">
                  <span className="block text-[9px] text-emerald-600 font-bold uppercase mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {t('suggestedReply')}</span>
                  <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{aiMessage}</p>
                </div>
                <button 
                  onClick={() => {
                    const encodedMessage = encodeURIComponent(aiMessage);
                    window.open(`https://wa.me/${lead.phone}?text=${encodedMessage}`, '_blank');
                    onUpdateStatus(lead.id, LeadStatus.CONTACTED);
                  }}
                  className="mt-2 w-full py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  {t('sendReply')} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </button>
              </div>
            )}
            
            {lead.status !== LeadStatus.BOOKED && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
                 <button 
                  onClick={() => setShowBooking(true)}
                  className="py-2 bg-indigo-600 text-white text-xs rounded-lg font-medium shadow-sm hover:bg-indigo-700"
                >
                  {t('bookAppointment')}
                </button>
                <button 
                  onClick={() => onUpdateStatus(lead.id, LeadStatus.LOST)}
                  className="py-2 bg-white border border-gray-200 text-gray-500 text-xs rounded-lg font-medium hover:bg-gray-50"
                >
                  {t('notInterested')}
                </button>
              </div>
            )}
          </div>
        )}
        
        {!expanded && !aiMessage && (
           <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            className="w-full text-[10px] text-gray-300 hover:text-gray-500 flex justify-center mt-1"
           >
             <ChevronDown className="w-3 h-3" />
           </button>
        )}

        {showBooking && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h4 className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-2">
              <CalendarCheck className="w-3 h-3" /> {t('bookAppointment')}
            </h4>
            
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-[10px] text-indigo-600 font-semibold block mb-1">{t('assignDoctor')}</label>
                <div className="relative">
                  <User className="w-3 h-3 absolute left-2 rtl:right-2 top-2 text-indigo-400" />
                  <select 
                    value={selectedDoctor} 
                    onChange={(e) => { setSelectedDoctor(e.target.value); setBookingTime(''); }}
                    className="w-full pl-7 rtl:pl-2 rtl:pr-7 py-1.5 text-xs border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-indigo-600 font-semibold block mb-1">Date</label>
                <div className="relative">
                  <Calendar className="w-3 h-3 absolute left-2 rtl:right-2 top-2 text-indigo-400" />
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => { setBookingDate(e.target.value); setBookingTime(''); }}
                    className="w-full pl-7 rtl:pl-2 rtl:pr-7 py-1.5 text-xs border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] text-indigo-600 font-semibold block mb-1">{t('duration')}</label>
                    <div className="relative">
                        <Hourglass className="w-3 h-3 absolute left-2 rtl:right-2 top-2 text-indigo-400" />
                        <select 
                            value={duration} 
                            onChange={(e) => { setDuration(parseInt(e.target.value)); setBookingTime(''); }}
                            className="w-full pl-7 rtl:pl-2 rtl:pr-7 py-1.5 text-xs border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value={30}>{t('min30')}</option>
                            <option value={60}>{t('min60')}</option>
                            <option value={90}>{t('min90')}</option>
                            <option value={120}>{t('min120')}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] text-indigo-600 font-semibold block mb-1">{t('selectTime')}</label>
                    <div className="relative">
                    <Clock className="w-3 h-3 absolute left-2 rtl:right-2 top-2 text-indigo-400" />
                    <select 
                        value={bookingTime} 
                        onChange={(e) => setBookingTime(e.target.value)}
                        className={`w-full pl-7 rtl:pl-2 rtl:pr-7 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white ${!bookingTime ? 'border-indigo-300' : 'border-indigo-200'}`}
                    >
                        <option value="">{t('selectTime')}</option>
                        {HOURS.map(t => {
                        const isValid = isSlotValid(t);
                        return (
                            <option key={t} value={t} disabled={!isValid} className={!isValid ? 'bg-gray-50 text-gray-300' : ''}>
                            {t} {!isValid ? '(Busy)' : ''}
                            </option>
                        );
                        })}
                    </select>
                    </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-indigo-600 font-semibold block mb-1">{t('deposit')} (OMR)</label>
                <div className="relative">
                  <CreditCard className="w-3 h-3 absolute left-2 rtl:right-2 top-2 text-indigo-400" />
                  <input 
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full pl-7 rtl:pl-2 rtl:pr-7 py-1.5 text-xs border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleConfirmBooking} 
                disabled={!bookingTime || !bookingDate}
                className={`flex-1 py-1.5 text-white text-xs rounded-lg font-bold ${!bookingTime ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {t('confirm')}
              </button>
              <button onClick={() => setShowBooking(false)} className="flex-1 py-1.5 bg-white text-indigo-600 border border-indigo-200 text-xs rounded-lg font-medium hover:bg-indigo-50">{t('cancel')}</button>
            </div>
          </div>
        )}

        {showNotes && (
          <div className="mt-3 bg-amber-50 p-2 rounded-lg border border-amber-100 animate-fade-in" onClick={e => e.stopPropagation()}>
             <div className="space-y-1 max-h-20 overflow-y-auto mb-2">
                {lead.notes.length === 0 && <p className="text-[10px] text-amber-400 italic">No notes yet.</p>}
                {lead.notes.map(note => (
                  <p key={note.id} className="text-[10px] text-amber-800 border-b border-amber-200 pb-1 last:border-0">
                    {note.text}
                  </p>
                ))}
             </div>
             <form onSubmit={(e) => { e.preventDefault(); if(noteInput) { onAddNote(lead.id, noteInput); setNoteInput(''); } }} className="flex gap-1">
               <input 
                type="text" 
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="flex-1 text-[10px] border border-amber-200 rounded px-2 py-1 focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                placeholder="Add note..."
               />
               <button type="submit" className="bg-amber-200 text-amber-700 p-1 rounded hover:bg-amber-300">
                 <Send className="w-3 h-3 rtl:rotate-180" />
               </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
