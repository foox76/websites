
import React, { useState, useEffect, useRef } from 'react';
import { Lead, LeadStatus, VisitStatus, Payment, LabStatus, Doctor, ClinicSettings } from '../types';
import { Clock, User, CheckCircle, CreditCard, AlertCircle, Banknote, ArrowUpRight, Plus, FlaskConical, AlertTriangle, ChevronLeft, ChevronRight, Calendar, Users, LayoutGrid, List, CheckSquare, XCircle, MessageCircle, Minimize2, Maximize2, Rows, Fingerprint, Baby, Ban, DollarSign, Kanban } from 'lucide-react';
import ManualBookingModal from './ManualBookingModal';
import GoogleDateRangePicker from './GoogleDateRangePicker';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import RescheduleModal from './RescheduleModal';

interface ScheduleViewProps {
  leads: Lead[];
  doctors: Doctor[];
  settings: ClinicSettings;
  onLeadClick: (lead: Lead) => void;
  onAddLead: (lead: Lead) => void;
  onUpdateLead: (id: string, data: Partial<Lead>) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ leads, doctors, settings, onLeadClick, onAddLead, onUpdateLead }) => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [viewMode, setViewMode] = useState<'DAY_BOARD' | 'DAY_LIST' | 'WEEK'>('DAY_BOARD');
  const [isCompact, setIsCompact] = useState(false);
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [bookingDefaults, setBookingDefaults] = useState<{date?: string, time?: string, doctor?: string}>({});
  
  // Dynamic Hours Generation
  const generateHours = () => {
    const startH = parseInt(settings.startHour.split(':')[0]);
    const endH = parseInt(settings.endHour.split(':')[0]);
    const hours = [];
    for (let i = startH; i < endH; i++) {
        hours.push(`${i.toString().padStart(2, '0')}:00`);
        hours.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return hours;
  }
  const HOURS = generateHours();

  const [selectedDate, setSelectedDate] = useState(() => {
     const d = new Date();
     d.setHours(0,0,0,0);
     return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timelineDays, setTimelineDays] = useState<Date[]>([]);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; lead: Lead | null }>({
    visible: false,
    x: 0,
    y: 0,
    lead: null
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || showManualBooking) return;
      if (e.key === 'ArrowLeft') {
        changeDay(language === 'ar' ? 1 : -1);
      } else if (e.key === 'ArrowRight') {
        changeDay(language === 'ar' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, language, showManualBooking]);

  useEffect(() => {
    const days = [];
    for (let i = -4; i <= 4; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      d.setHours(0,0,0,0);
      days.push(d);
    }
    setTimelineDays(days);
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    newDate.setHours(0,0,0,0);
    setSelectedDate(newDate);
  };

  const isSameDay = (d1: Date | number, d2: Date | number) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = isSameDay(selectedDate, new Date());

  const getDayStats = (date: Date) => {
    const isPast = date.getTime() < new Date().setHours(0,0,0,0);
    if (isPast) {
       let revenue = 0;
       leads.forEach(l => l.payments.forEach(p => {
         if (isSameDay(p.date, date)) revenue += p.amount;
       }));
       return { label: `${revenue} ${settings.currency}`, type: 'revenue' };
    } else {
       const count = leads.filter(l => l.status === LeadStatus.BOOKED && l.appointmentDate && isSameDay(l.appointmentDate, date)).length;
       return { label: `${count}`, type: 'booking' };
    }
  };

  const bookedLeads = leads.filter(l => l.status === LeadStatus.BOOKED && l.appointmentTime && l.appointmentDate && isSameDay(l.appointmentDate, selectedDate));

  const getLeadsForSlot = (time: string) => {
    return bookedLeads.filter(l => l.appointmentTime === time);
  };

  let dailyCash = 0;
  let dailyTransfer = 0;

  leads.forEach(lead => {
    lead.payments.forEach(p => {
      if (isSameDay(new Date(p.date), selectedDate)) {
        if (p.method === 'CASH') dailyCash += p.amount;
        if (p.method === 'TRANSFER') dailyTransfer += p.amount;
      }
    });
  });

  const getRowColor = (status?: VisitStatus) => {
    switch (status) {
      case VisitStatus.COMPLETED: return 'bg-green-50/50 border-l-4 border-l-green-500';
      case VisitStatus.ARRIVED: return 'bg-blue-50/50 border-l-4 border-l-blue-500';
      case VisitStatus.IN_CHAIR: return 'bg-purple-50/50 border-l-4 border-l-purple-500';
      case VisitStatus.CANCELLED: return 'bg-gray-100 opacity-60 border-l-4 border-l-gray-400 grayscale';
      case VisitStatus.NO_SHOW: return 'bg-red-50/50 border-l-4 border-l-red-500';
      default: return 'hover:bg-gray-50 border-l-4 border-l-transparent';
    }
  };

  const getLabAlert = (lead: Lead) => {
    if (!lead.labOrders || lead.labOrders.length === 0) return null;
    const pendingWork = lead.labOrders.find(o => o.status !== LabStatus.RECEIVED && o.status !== LabStatus.FITTED);
    const readyWork = lead.labOrders.find(o => o.status === LabStatus.RECEIVED);

    if (pendingWork) {
      return (
        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-[10px] font-bold border border-amber-200" title="Lab work not ready!">
          <AlertTriangle className="w-3 h-3" />
          <span>{t('labPending')}</span>
        </div>
      );
    }
    if (readyWork) {
      return (
         <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold border border-emerald-200" title="Lab work is ready">
          <FlaskConical className="w-3 h-3" />
          <span>{t('ready')}</span>
        </div>
      );
    }
    return null;
  };

  const handleSlotClick = (date: Date, time: string, doctor?: string) => {
    setBookingDefaults({
      date: date.toISOString().split('T')[0],
      time: time,
      doctor: doctor
    });
    setShowManualBooking(true);
  };
  
  const handleContextMenu = (e: React.MouseEvent, lead: Lead) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      lead: lead
    });
  };

  const handleContextMenuAction = (action: 'ARRIVED' | 'COMPLETED' | 'NOSHOW' | 'WHATSAPP' | 'RESCHEDULE' | 'CANCEL') => {
    if (!contextMenu.lead) return;
    switch (action) {
      case 'ARRIVED':
        onUpdateLead(contextMenu.lead.id, { visitStatus: VisitStatus.ARRIVED });
        toast.success(t('statusUpdated'));
        break;
      case 'COMPLETED':
        onUpdateLead(contextMenu.lead.id, { visitStatus: VisitStatus.COMPLETED });
        toast.success(t('statusUpdated'));
        break;
      case 'NOSHOW':
         onUpdateLead(contextMenu.lead.id, { visitStatus: VisitStatus.NO_SHOW });
         toast.success(t('statusUpdated'));
         break;
      case 'CANCEL':
         onUpdateLead(contextMenu.lead.id, { visitStatus: VisitStatus.CANCELLED });
         toast.success(t('statusUpdated'));
         break;
      case 'WHATSAPP':
        window.open(`https://wa.me/${contextMenu.lead.phone}`, '_blank');
        toast.success(t('whatsAppOpened'));
        break;
      case 'RESCHEDULE':
        setShowRescheduleModal(true);
        break;
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date, time: string, doctor?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedLeadId) {
      const targetDateTimestamp = date.setHours(0,0,0,0);
      const updates: any = {
        appointmentDate: targetDateTimestamp,
        appointmentTime: time
      };
      if (doctor) {
          updates.assignedDoctor = doctor;
      }
      onUpdateLead(draggedLeadId, updates);
      setDraggedLeadId(null);
      toast.success(t('rescheduledMsg'));
    }
  };

  // Helper to convert "09:00" -> minutes
  const timeToMins = (t: string) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
  // Helper to convert minutes -> "09:00"
  const minsToTime = (m: number) => `${Math.floor(m/60).toString().padStart(2,'0')}:${(m%60).toString().padStart(2,'0')}`;

  // Calculate which slots are "covered" by previous long appointments for TABLE VIEW
  const skippedSlots = new Set<string>();
  // Note: This logic is tricky for Multi-Row views. We only skip if ALL doctors are full? 
  // No, for List View, we need to render multiple rows. 
  // Spanning only works if we know which "Column" we are in.
  // In a list view, spanning vertical time is visually confusing if there are multiple items.
  // For simplicity in List View with multiple items, we will disable RowSpan visual merging 
  // OR we handle it strictly per patient. 
  // We'll disable RowSpan in List View for multi-doctor support to avoid complex geometry.

  // --- DOCTOR GRID (SWIMLANES) ---
  const renderDoctorGrid = () => {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
         {/* Header: Doctors */}
         <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: `80px repeat(${doctors.length}, 1fr)` }}>
            <div className="p-4 border-r border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 uppercase">{t('time')}</div>
            {doctors.map(doc => (
                <div key={doc.id} className={`p-4 border-r border-gray-200 last:border-0 text-center`}>
                    <div className="font-bold text-gray-800 text-sm">{doc.name}</div>
                    <div className={`h-1 w-8 mx-auto mt-1 rounded-full bg-${doc.color}-500`}></div>
                </div>
            ))}
         </div>

         {/* Body: Time Slots */}
         <div className="divide-y divide-gray-100">
            {HOURS.map(time => {
                const now = new Date();
                const [h, m] = time.split(':').map(Number);
                const isCurrentSlot = isToday && now.getHours() === h && ((m === 0 && now.getMinutes() < 30) || (m === 30 && now.getMinutes() >= 30));

                return (
                    <div key={time} className="grid min-h-[80px] group relative" style={{ gridTemplateColumns: `80px repeat(${doctors.length}, 1fr)` }}>
                        {/* Time Column */}
                        <div className={`p-2 flex items-start justify-center border-r border-gray-100 text-xs font-mono text-gray-400 font-bold bg-gray-50/30 ${isCurrentSlot ? 'text-blue-600' : ''}`}>
                            {time}
                            {isCurrentSlot && <div className="ml-1 w-2 h-2 bg-blue-500 rounded-full mt-1 animate-pulse"></div>}
                        </div>

                        {/* Doctor Slots */}
                        {doctors.map(doc => {
                            const slotLead = bookedLeads.find(l => 
                                l.appointmentTime === time && 
                                l.assignedDoctor === doc.name
                            );
                            
                            // Check if this slot is covered by a previous booking duration
                            const coveredBy = bookedLeads.find(l => {
                                if (l.assignedDoctor !== doc.name) return false;
                                if (!l.duration || l.duration <= 30) return false;
                                const start = timeToMins(l.appointmentTime!);
                                const end = start + l.duration;
                                const current = timeToMins(time);
                                return current > start && current < end;
                            });

                            if (coveredBy) return <div key={doc.id} className="border-r border-gray-100 last:border-0 bg-gray-50/20"></div>;

                            return (
                                <div 
                                    key={doc.id}
                                    className={`relative p-1 border-r border-gray-100 last:border-0 transition-colors
                                        ${!slotLead ? 'hover:bg-gray-50 cursor-pointer group/cell' : ''}
                                        ${isCurrentSlot && !slotLead ? 'bg-blue-50/10' : ''}
                                    `}
                                    onClick={() => !slotLead && handleSlotClick(selectedDate, time, doc.name)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, selectedDate, time, doc.name)}
                                >
                                    {!slotLead && (
                                        <div className="hidden group-hover/cell:flex items-center justify-center h-full w-full absolute inset-0 pointer-events-none">
                                            <Plus className="w-4 h-4 text-gray-300" />
                                        </div>
                                    )}

                                    {slotLead && (
                                        <div 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, slotLead.id)}
                                            onClick={(e) => { e.stopPropagation(); onLeadClick(slotLead); }}
                                            onContextMenu={(e) => handleContextMenu(e, slotLead)}
                                            style={{ 
                                                height: `${((slotLead.duration || 30) / 30) * 100}%`,
                                                zIndex: 10
                                            }}
                                            className={`absolute top-0 left-0 right-0 m-1 p-2 rounded-lg border-l-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all flex flex-col overflow-hidden bg-white
                                                ${slotLead.visitStatus === VisitStatus.COMPLETED ? 'border-green-500 bg-green-50' : 
                                                  slotLead.visitStatus === VisitStatus.ARRIVED ? 'border-blue-500 bg-blue-50' :
                                                  slotLead.visitStatus === VisitStatus.NO_SHOW ? 'border-red-500 bg-red-50 opacity-70' :
                                                  slotLead.visitStatus === VisitStatus.CANCELLED ? 'border-gray-400 bg-gray-100 opacity-50 grayscale' :
                                                  `border-${doc.color}-500`
                                                }
                                            `}
                                        >
                                            <div className="font-bold text-xs truncate text-gray-900">{slotLead.name}</div>
                                            <div className="text-[10px] truncate text-gray-500">{slotLead.treatmentInterest}</div>
                                            <div className="mt-auto flex justify-between items-end">
                                                {slotLead.duration && slotLead.duration > 30 && (
                                                    <span className="text-[9px] bg-white/50 px-1 rounded flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {slotLead.duration}m
                                                    </span>
                                                )}
                                                {slotLead.visitStatus === VisitStatus.ARRIVED && <CheckCircle className="w-3 h-3 text-blue-600" />}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            })}
         </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    startOfWeek.setHours(0,0,0,0);

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const currentTime = new Date();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startH = parseInt(settings.startHour.split(':')[0]);
    const endH = parseInt(settings.endHour.split(':')[0]);
    const totalMinutes = (endH * 60) - (startH * 60);
    const progress = ((currentMinutes - (startH * 60)) / totalMinutes) * 100;
    const showTimeLine = progress >= 0 && progress <= 100;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-x-auto relative">
        <div className="min-w-[1200px] p-4 relative">
          {/* Header Row */}
          <div className="grid grid-cols-8 gap-0 mb-0 border-b border-gray-200">
             <div className="font-bold text-xs text-gray-400 uppercase tracking-wider text-center py-3 border-r border-gray-100">{t('time')}</div>
             {weekDays.map((d, i) => {
               const isToday = isSameDay(d, new Date());
               return (
                 <div key={i} className={`text-center p-2 border-r border-gray-100 last:border-0 ${isToday ? 'bg-blue-50/30' : ''}`}>
                   <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                     {d.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', { weekday: 'short' })}
                   </div>
                   <div className={`font-bold text-sm ${isToday ? 'text-blue-900' : 'text-gray-800'}`}>
                     {d.getDate()}
                   </div>
                 </div>
               )
             })}
          </div>

          {/* Time Rows */}
          <div className="relative"> 
            {showTimeLine && (
               <div 
                 className="absolute left-[12.5%] right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                 style={{ top: `${progress}%` }}
               >
                 <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
               </div>
            )}

            {HOURS.map(time => (
              <div key={time} className="grid grid-cols-8 gap-0 min-h-[60px] border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-center pt-2 text-xs font-mono text-gray-400 font-bold border-r border-gray-100 bg-gray-50/30">
                  {time}
                </div>
                
                {weekDays.map((d, i) => {
                   const slotLeads = leads.filter(l => 
                     l.status === LeadStatus.BOOKED && 
                     l.appointmentTime === time && 
                     l.appointmentDate && 
                     isSameDay(l.appointmentDate, d)
                   );

                   return (
                     <div 
                       key={`${i}-${time}`} 
                       className={`relative transition-all p-1 border-r border-gray-100 last:border-0
                         ${slotLeads.length > 0 ? 'bg-white' : 'hover:bg-gray-50 cursor-pointer group'}
                       `}
                       onClick={() => slotLeads.length === 0 && handleSlotClick(d, time)}
                       onDragOver={handleDragOver}
                       onDrop={(e) => handleDrop(e, d, time)}
                     >
                        {slotLeads.length === 0 && (
                           <div className="hidden group-hover:flex items-center justify-center h-full w-full absolute inset-0 pointer-events-none">
                             <Plus className="w-4 h-4 text-gray-300" />
                           </div>
                        )}

                        {/* Relative wrapper for overlapping/stacking in week view */}
                        <div className="relative w-full h-full">
                          {slotLeads.map(lead => {
                            const heightPercent = ((lead.duration || 30) / 30) * 100;
                            
                            return (
                            <div 
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead.id)}
                              onClick={(e) => { e.stopPropagation(); onLeadClick(lead); }}
                              onContextMenu={(e) => handleContextMenu(e, lead)}
                              style={{ height: `${heightPercent}%`, zIndex: 10, position: 'absolute', width: '100%' }}
                              className={`top-0 left-0 right-0 p-1.5 rounded text-[10px] shadow-sm cursor-grab active:cursor-grabbing border-l-4 hover:opacity-90 transition-all flex flex-col overflow-hidden mb-1
                                ${lead.visitStatus === VisitStatus.COMPLETED ? 'bg-green-50 border-green-500 text-green-900' : 
                                  lead.visitStatus === VisitStatus.ARRIVED ? 'bg-blue-50 border-blue-500 text-blue-900' :
                                  lead.visitStatus === VisitStatus.NO_SHOW ? 'bg-red-50 border-red-500 text-red-900 opacity-60' :
                                  lead.visitStatus === VisitStatus.CANCELLED ? 'bg-gray-100 border-gray-400 text-gray-500 grayscale opacity-60 line-through' :
                                  'bg-white border-indigo-500 text-gray-900 border border-gray-200 shadow-sm'
                                }`}
                            >
                              <div className="font-bold truncate">{lead.name}</div>
                              <div className="text-[9px] opacity-75 truncate flex justify-between">
                                 <span>{lead.assignedDoctor}</span>
                              </div>
                            </div>
                          )})}
                        </div>
                     </div>
                   )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20 space-y-6 animate-fade-in relative">
      
      {contextMenu.visible && (
        <div 
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 min-w-[180px] overflow-hidden animate-fade-in py-1"
        >
           <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase">{t('quickActions')}</p>
              <p className="text-xs font-bold text-gray-800 truncate">{contextMenu.lead?.name}</p>
           </div>
           <button onClick={() => handleContextMenuAction('ARRIVED')} className="w-full text-left rtl:text-right px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {t('checkIn')}
           </button>
           <button onClick={() => handleContextMenuAction('COMPLETED')} className="w-full text-left rtl:text-right px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> {t('markCompleted')}
           </button>
           <button onClick={() => handleContextMenuAction('NOSHOW')} className="w-full text-left rtl:text-right px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> {t('markNoShow')}
           </button>
           <button onClick={() => handleContextMenuAction('CANCEL')} className="w-full text-left rtl:text-right px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2">
              <Ban className="w-4 h-4" /> {t('cancelAppointment')}
           </button>
           <div className="border-t border-gray-100 my-1"></div>
           <button onClick={() => handleContextMenuAction('RESCHEDULE')} className="w-full text-left rtl:text-right px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {t('reschedule')}
           </button>
           <button onClick={() => handleContextMenuAction('WHATSAPP')} className="w-full text-left rtl:text-right px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> {t('whatsapp')}
           </button>
        </div>
      )}

      {showRescheduleModal && contextMenu.lead && (
        <RescheduleModal 
           lead={contextMenu.lead}
           allLeads={leads}
           onClose={() => setShowRescheduleModal(false)}
           onConfirm={(date, time) => {
             if (contextMenu.lead) {
                onUpdateLead(contextMenu.lead.id, { appointmentDate: date, appointmentTime: time });
                toast.success(t('rescheduledMsg'));
             }
           }}
        />
      )}

      <GoogleDateRangePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialStartDate={selectedDate}
        initialEndDate={selectedDate}
        singleDateMode={true}
        onApply={(range) => {
          setSelectedDate(range.startDate);
        }}
      />

      {showManualBooking && (
        <ManualBookingModal 
          allLeads={leads}
          doctors={doctors}
          onClose={() => { setShowManualBooking(false); setBookingDefaults({}); }}
          onConfirm={(newLead) => {
            onAddLead(newLead);
            setShowManualBooking(false);
            setBookingDefaults({});
            toast.success("Booking added successfully");
          }}
          initialDate={bookingDefaults.date}
          initialTime={bookingDefaults.time}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-lg border border-gray-200">
                  <button onClick={() => changeDay(viewMode === 'WEEK' ? -7 : -1)} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-gray-600">
                      <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                  </button>
                  <div className="flex items-center gap-2 px-4 font-bold text-gray-700 min-w-[180px] justify-center group cursor-pointer" onClick={() => setShowDatePicker(true)}>
                      <Calendar className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700 transition-colors" />
                      <span className="group-hover:text-indigo-700 transition-colors">
                        {viewMode === 'WEEK' ? (
                           `${t('week')} ${(() => {
                             const start = new Date(selectedDate);
                             start.setDate(selectedDate.getDate() - selectedDate.getDay());
                             return start.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric' });
                           })()}`
                        ) : (
                          selectedDate.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', { weekday: 'short', day: 'numeric', month: 'long' })
                        )}
                      </span>
                  </div>
                  <button onClick={() => changeDay(viewMode === 'WEEK' ? 7 : 1)} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-gray-600">
                      <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                  </button>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button 
                    onClick={() => setViewMode('DAY_BOARD')}
                    className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'DAY_BOARD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Kanban className="w-4 h-4" /> {t('board')}
                  </button>
                  <button 
                    onClick={() => setViewMode('DAY_LIST')}
                    className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'DAY_LIST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="w-4 h-4" /> {t('list')}
                  </button>
                  <button 
                    onClick={() => setViewMode('WEEK')}
                    className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'WEEK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <LayoutGrid className="w-4 h-4" /> {t('week')}
                  </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                   onClick={() => setIsCompact(!isCompact)}
                   className={`p-2.5 rounded-lg border transition-colors ${isCompact ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                   title={isCompact ? t('comfortable') : t('compact')}
                >
                   <Rows className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => { setBookingDefaults({}); setShowManualBooking(true); }}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
                >
                  <Plus className="w-4 h-4" /> {t('addWalkIn')}
                </button>
            </div>
         </div>
         
         {viewMode !== 'WEEK' && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 overflow-x-auto no-scrollbar gap-2">
              {timelineDays.map((date, idx) => {
                const isSelected = isSameDay(date, selectedDate);
                const isCurrentDay = isSameDay(date, new Date());
                const stats = getDayStats(date);
                
                return (
                  <button 
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center min-w-[70px] p-2 rounded-lg transition-all border ${
                      isSelected ? 'bg-white border-indigo-200 shadow-md scale-105 z-10' : 
                      isCurrentDay ? 'bg-blue-50 border-blue-100' : 'bg-transparent border-transparent hover:bg-gray-200/50'
                    }`}
                  >
                      <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {date.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', { weekday: 'short' })}
                      </span>
                      <span className={`text-lg font-bold leading-none mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                        {date.getDate()}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        stats.type === 'revenue' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {stats.label}
                      </span>
                  </button>
                )
              })}
            </div>
         )}
      </div>

      {viewMode !== 'WEEK' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-colors ${isToday ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white'}`}>
             <div>
               <h3 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-1">
                   {isToday ? t('todayCollection') : `${t('closingBalance')} (${selectedDate.toLocaleDateString()})`}
               </h3>
               <p className="text-3xl font-bold">{dailyCash + dailyTransfer} <span className="text-sm font-normal text-gray-400">{settings.currency}</span></p>
             </div>
             <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
               <Clock className="w-3 h-3" /> {isToday ? t('liveClosing') : t('historicalRecord')}
             </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('cashDrawer')}</h3>
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dailyCash} {settings.currency}</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(dailyCash / (dailyCash + dailyTransfer || 1)) * 100}%` }}></div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('bankTransfers')}</h3>
                <ArrowUpRight className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{dailyTransfer} {settings.currency}</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${(dailyTransfer / (dailyCash + dailyTransfer || 1)) * 100}%` }}></div>
              </div>
           </div>
        </div>
      )}

      {viewMode === 'WEEK' && renderWeeklyView()}
      {viewMode === 'DAY_BOARD' && renderDoctorGrid()}
      {viewMode === 'DAY_LIST' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
               <List className="w-4 h-4 text-indigo-600" /> 
               {t('schedule')} - {selectedDate.toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US')}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left rtl:text-right border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={`py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-20 ${isCompact ? 'py-2' : ''}`}>{t('time')}</th>
                  {/* Grid for content */}
                  <th className="w-full p-0 border-none">
                     <div className="grid grid-cols-12 gap-4 px-6">
                        <div className={`col-span-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${isCompact ? 'py-2' : ''}`}>{t('patientName')}</div>
                        <div className={`col-span-1 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center ${isCompact ? 'py-2' : ''}`}>ID</div>
                        <div className={`col-span-1 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center ${isCompact ? 'py-2' : ''}`}>{t('birthYear')}</div>
                        <div className={`col-span-2 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${isCompact ? 'py-2' : ''}`}>{t('treatment')}</div>
                        <div className={`col-span-2 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${isCompact ? 'py-2' : ''}`}>{t('doctor')}</div>
                        <div className={`col-span-2 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${isCompact ? 'py-2' : ''}`}>{t('financials')}</div>
                        <div className={`col-span-1 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right rtl:text-left ${isCompact ? 'py-2' : ''}`}>{t('visitStatus')}</div>
                     </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {HOURS.map((time) => {
                  const slotLeads = getLeadsForSlot(time);
                  
                  // Calculate Time Slot Status
                  const now = new Date();
                  const [slotHourStr, slotMinuteStr] = time.split(':');
                  const slotHour = parseInt(slotHourStr);
                  const slotMinute = parseInt(slotMinuteStr);
                  const isCurrentSlot = isToday && 
                                        now.getHours() === slotHour && 
                                        ((slotMinute === 0 && now.getMinutes() < 30) || (slotMinute === 30 && now.getMinutes() >= 30));

                  if (slotLeads.length === 0) {
                      return (
                        <tr 
                          key={time} 
                          onClick={() => handleSlotClick(selectedDate, time)}
                          className={`group transition-all cursor-pointer hover:bg-gray-50 ${isCurrentSlot ? 'bg-blue-50/50 ring-1 ring-inset ring-blue-200 z-10' : ''}`}
                        >
                          <td className={`px-6 border-r rtl:border-r-0 rtl:border-l border-gray-50 ${isCompact ? 'py-1' : 'py-3'}`}>
                            <div className="flex items-center gap-2">
                                <span className={`font-mono text-sm text-gray-400 ${isCurrentSlot ? 'text-blue-600 font-extrabold text-base' : ''}`}>
                                {time}
                                </span>
                                {isCurrentSlot && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                )}
                            </div>
                          </td>
                          <td className={`w-full px-6 relative ${isCompact ? 'py-1' : 'py-3'}`}>
                               {isToday && (
                                  <div className="absolute inset-0 flex items-center pl-6 rtl:pl-0 rtl:pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1"><Plus className="w-3 h-3" /> {t('addWalkIn')}</span>
                                  </div>
                               )}
                               <div className="h-5"></div>
                          </td>
                        </tr>
                      )
                  }

                  return slotLeads.map((lead, index) => {
                      const totalPaid = lead.payments.reduce((a, b) => a + b.amount, 0);
                      const remaining = lead.priceQuoted - totalPaid;
                      
                      // Only show time label on the first row of the group
                      const showTime = index === 0;

                      return (
                        <tr 
                          key={lead.id} 
                          onClick={() => onLeadClick(lead)}
                          onContextMenu={(e) => handleContextMenu(e, lead)}
                          className={`group transition-all cursor-pointer relative ${getRowColor(lead.visitStatus)} ${isCurrentSlot ? 'bg-blue-50/50 ring-1 ring-inset ring-blue-200 z-10' : ''}`}
                        >
                          <td className={`px-6 border-r rtl:border-r-0 rtl:border-l border-gray-50 ${isCompact ? 'py-1' : 'py-3'}`}>
                            {showTime && (
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono text-sm font-bold text-indigo-600 ${isCurrentSlot ? 'text-blue-600 font-extrabold text-base' : ''}`}>
                                    {time}
                                    </span>
                                    {isCurrentSlot && (
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </span>
                                    )}
                                </div>
                            )}
                          </td>

                          <td className="p-0">
                           <div className={`grid grid-cols-12 gap-4 px-6 items-center h-full ${isCompact ? 'py-1' : 'py-3'}`}>
                              {/* Name */}
                              <div className="col-span-3 flex items-center gap-3 overflow-hidden">
                                <div className={`rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${lead.visitStatus === VisitStatus.COMPLETED ? 'bg-green-100 text-green-700' : lead.visitStatus === VisitStatus.CANCELLED ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-700'} ${isCompact ? 'w-6 h-6 text-[10px]' : 'w-8 h-8'}`}>
                                    {lead.name.charAt(0)}
                                </div>
                                <div className={`truncate ${lead.visitStatus === VisitStatus.CANCELLED ? 'opacity-50 line-through' : ''}`}>
                                    <p className={`font-bold text-gray-900 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>{lead.name}</p>
                                </div>
                              </div>
                              
                              {/* ID */}
                              <div className="col-span-1 text-center">
                                 <span className={`text-gray-600 font-mono ${isCompact ? 'text-[10px]' : 'text-xs'} ${lead.visitStatus === VisitStatus.CANCELLED ? 'opacity-50' : ''}`}>
                                   {lead.nationalId || '-'}
                                 </span>
                              </div>

                              {/* Year */}
                              <div className="col-span-1 text-center">
                                 <span className={`text-gray-600 ${isCompact ? 'text-[10px]' : 'text-xs'} ${lead.visitStatus === VisitStatus.CANCELLED ? 'opacity-50' : ''}`}>
                                   {lead.birthYear || '-'}
                                 </span>
                              </div>

                              {/* Treatment */}
                              <div className="col-span-2 truncate">
                                <div className={`flex flex-col items-start gap-1 ${lead.visitStatus === VisitStatus.CANCELLED ? 'opacity-50' : ''}`}>
                                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-medium bg-white/80 border border-gray-200 text-gray-600 truncate max-w-full ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                                     {lead.treatmentInterest}
                                   </span>
                                   {!isCompact && getLabAlert(lead)}
                                </div>
                              </div>

                              {/* Doctor */}
                              <div className="col-span-2 truncate">
                                <div className={`flex items-center gap-2 text-gray-600 truncate ${isCompact ? 'text-xs' : 'text-sm'} ${lead.visitStatus === VisitStatus.CANCELLED ? 'opacity-50' : ''}`}>
                                  <div className={`w-2 h-2 rounded-full bg-${doctors.find(d=>d.name===lead.assignedDoctor)?.color || 'gray'}-500 flex-shrink-0`}></div>
                                  <span className="truncate">{lead.assignedDoctor || t('unassigned')}</span>
                                </div>
                              </div>

                              {/* Financials */}
                              <div className="col-span-2">
                                <div className={`flex flex-col ${isCompact ? 'text-[10px]' : 'text-xs'} ${lead.visitStatus === VisitStatus.CANCELLED ? 'opacity-50' : ''}`}>
                                   <div className="flex justify-between w-full max-w-[140px]">
                                      <span className="text-gray-400">{t('expected')}:</span>
                                      <span className="font-bold text-gray-700">{lead.priceQuoted}</span>
                                   </div>
                                   <div className="flex justify-between w-full max-w-[140px]">
                                      <span className="text-gray-400">{t('paid')}:</span>
                                      <span className="font-bold text-emerald-600">{totalPaid}</span>
                                   </div>
                                   {remaining > 0 && (
                                      <div className="flex justify-between w-full max-w-[140px] border-t border-gray-100 mt-0.5 pt-0.5">
                                         <span className="text-gray-400">{t('due')}:</span>
                                         <span className="font-bold text-red-500">{remaining}</span>
                                      </div>
                                   )}
                                </div>
                              </div>

                              {/* Status */}
                              <div className="col-span-1 flex justify-end items-start">
                                 <div className={`flex flex-col items-end gap-1`}>
                                    <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border 
                                      ${lead.visitStatus === VisitStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-200' : 
                                        lead.visitStatus === VisitStatus.ARRIVED ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                        lead.visitStatus === VisitStatus.NO_SHOW ? 'bg-red-100 text-red-700 border-red-200' :
                                        lead.visitStatus === VisitStatus.CANCELLED ? 'bg-gray-200 text-gray-600 border-gray-300' :
                                        'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                      {lead.visitStatus === VisitStatus.COMPLETED ? t('completed') : 
                                        lead.visitStatus === VisitStatus.ARRIVED ? t('arrived') : 
                                        lead.visitStatus === VisitStatus.NO_SHOW ? t('noShow') : 
                                        lead.visitStatus === VisitStatus.CANCELLED ? t('cancelled') : t('scheduled')}
                                    </div>
                                 </div>
                              </div>
                           </div>
                      </td>
                    </tr>
                  );
                  })
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
