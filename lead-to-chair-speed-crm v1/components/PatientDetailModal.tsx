
import React, { useState } from 'react';
import { Lead, Payment, VisitStatus, LeadStatus, LabOrder, LabStatus } from '../types';
import { X, Phone, MessageCircle, Calendar, Clock, User, CreditCard, FileText, CheckCircle, Activity, History, Plus, Star, Package, Truck, AlertCircle, Edit2, Check, Pencil, Fingerprint, Baby, Trash2, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import RescheduleModal from './RescheduleModal';

interface PatientDetailModalProps {
  lead: Lead;
  leads?: Lead[]; // Need all leads for conflict check
  onClose: () => void;
  onUpdateLead: (id: string, data: Partial<Lead>) => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ lead, leads = [], onClose, onUpdateLead }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FINANCE' | 'NOTES' | 'LAB'>('OVERVIEW');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD' | 'CHEQUE'>('CASH');
  
  const [showReschedule, setShowReschedule] = useState(false);

  // Editing Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(lead.name);
  const [editPhone, setEditPhone] = useState(lead.phone);
  const [editNationalId, setEditNationalId] = useState(lead.nationalId || '');
  const [editBirthYear, setEditBirthYear] = useState(lead.birthYear || '');

  // Editing Treatment/Price State
  const [isEditingTreatment, setIsEditingTreatment] = useState(false);
  const [editTreatmentValue, setEditTreatmentValue] = useState(lead.treatmentInterest);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState(lead.priceQuoted.toString());

  // Lab Form State
  const [labItem, setLabItem] = useState('');
  const [labName, setLabName] = useState('Muscat Dental Lab');
  const [labDate, setLabDate] = useState('');

  const totalPaid = lead.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = lead.priceQuoted - totalPaid;

  const handleSaveProfile = () => {
    onUpdateLead(lead.id, {
      name: editName,
      phone: editPhone,
      nationalId: editNationalId,
      birthYear: editBirthYear
    });
    setIsEditingProfile(false);
    toast.success(t('statusUpdated'));
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentAmount) return;

    const payment: Payment = {
      id: Date.now().toString(),
      amount: parseFloat(newPaymentAmount),
      method: paymentMethod,
      date: Date.now(),
    };

    onUpdateLead(lead.id, {
      payments: [...lead.payments, payment]
    });
    setNewPaymentAmount('');
    toast.success(t('paymentRecorded'));
  };

  const handleDeletePayment = (paymentId: string) => {
    if(!window.confirm(t('confirmDelete'))) return;
    const updatedPayments = lead.payments.filter(p => p.id !== paymentId);
    onUpdateLead(lead.id, { payments: updatedPayments });
    toast.success(t('statusUpdated'));
  };

  const handleAddLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labItem || !labDate) return;
    
    const newOrder: LabOrder = {
      id: Date.now().toString(),
      itemName: labItem,
      labName: labName,
      sentDate: Date.now(),
      dueDate: new Date(labDate).getTime(),
      status: LabStatus.PENDING,
      cost: 0
    };

    onUpdateLead(lead.id, {
      labOrders: [...(lead.labOrders || []), newOrder]
    });
    setLabItem('');
    setLabDate('');
    toast.success(t('labOrderCreated'));
  };

  const handleDeleteLabOrder = (orderId: string) => {
    if(!window.confirm(t('confirmDelete'))) return;
    const updatedOrders = (lead.labOrders || []).filter(o => o.id !== orderId);
    onUpdateLead(lead.id, { labOrders: updatedOrders });
    toast.success(t('statusUpdated'));
  };

  const handleDeleteNote = (noteId: string) => {
    if(!window.confirm(t('confirmDelete'))) return;
    const updatedNotes = lead.notes.filter(n => n.id !== noteId);
    onUpdateLead(lead.id, { notes: updatedNotes });
    toast.success(t('statusUpdated'));
  };

  const handleStatusChange = (status: VisitStatus) => {
    onUpdateLead(lead.id, { visitStatus: status });
  };

  const toggleVip = () => {
    onUpdateLead(lead.id, { isVip: !lead.isVip });
  };

  const saveTreatment = () => {
    if (editTreatmentValue.trim()) {
      onUpdateLead(lead.id, { treatmentInterest: editTreatmentValue });
      const newNote = {
        id: Date.now().toString(),
        text: `Treatment plan updated from "${lead.treatmentInterest}" to "${editTreatmentValue}"`,
        timestamp: Date.now()
      };
      onUpdateLead(lead.id, { 
          treatmentInterest: editTreatmentValue,
          notes: [...lead.notes, newNote]
      });
      toast.success(t('noteAdded'));
    }
    setIsEditingTreatment(false);
  };

  const savePrice = () => {
    const val = parseFloat(editPriceValue);
    if (!isNaN(val)) {
      onUpdateLead(lead.id, { priceQuoted: val, potentialValue: val });
    }
    setIsEditingPrice(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        
        {showReschedule && (
          <RescheduleModal 
            lead={lead} 
            allLeads={leads} 
            onClose={() => setShowReschedule(false)}
            onConfirm={(date, time) => {
               onUpdateLead(lead.id, { appointmentDate: date, appointmentTime: time });
               toast.success(t('rescheduledMsg'));
            }}
          />
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-start z-10">
          <div className="flex items-start gap-4 w-full">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all flex-shrink-0 mt-1 ${lead.isVip ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'}`}>
              {lead.name.charAt(0)}
              {lead.isVip && <Star className="w-4 h-4 absolute bottom-0 right-0 rtl:left-0 rtl:right-auto fill-white text-white drop-shadow-md" />}
            </div>
            
            <div className="flex-1">
              {isEditingProfile ? (
                <div className="animate-fade-in space-y-3 max-w-md">
                   {/* Name Field */}
                   <div className="relative">
                     <User className="w-5 h-5 absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input 
                       value={editName} 
                       onChange={e => setEditName(e.target.value)}
                       className="w-full pl-10 rtl:pl-3 rtl:pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                       placeholder={t('fullName')}
                     />
                   </div>

                   {/* Details Grid */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                          value={editPhone} 
                          onChange={e => setEditPhone(e.target.value)}
                          className="w-full pl-9 rtl:pl-3 rtl:pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                          placeholder={t('phoneNumber')}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                           <Fingerprint className="w-4 h-4 absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                           <input 
                             value={editNationalId} 
                             onChange={e => setEditNationalId(e.target.value)}
                             className="w-full pl-9 rtl:pl-3 rtl:pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                             placeholder={t('nationalId')}
                           />
                        </div>
                        <div className="relative">
                           <Baby className="w-4 h-4 absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                           <input 
                             value={editBirthYear} 
                             onChange={e => setEditBirthYear(e.target.value)}
                             className="w-full pl-9 rtl:pl-3 rtl:pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                             placeholder={t('birthYear')}
                           />
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-2 justify-end mt-2">
                      <button onClick={() => setIsEditingProfile(false)} className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors">{t('cancel')}</button>
                      <button onClick={handleSaveProfile} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"><Save size={14}/> {t('saveChanges')}</button>
                   </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
                    <button 
                      onClick={toggleVip}
                      className={`p-1 rounded-full transition-colors ${lead.isVip ? 'text-amber-400 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-gray-50'}`}
                      title="Toggle VIP Status"
                    >
                      <Star className={`w-5 h-5 ${lead.isVip ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                      title={t('editProfile')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        
                        {/* Editable Treatment */}
                        {isEditingTreatment ? (
                        <div className="flex items-center gap-1 animate-fade-in">
                            <input 
                                className="border border-indigo-300 rounded px-2 py-0.5 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50 w-40"
                                value={editTreatmentValue}
                                onChange={e => setEditTreatmentValue(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && saveTreatment()}
                            />
                            <button onClick={saveTreatment} className="p-1 bg-indigo-100 rounded hover:bg-indigo-200 text-indigo-700"><Check size={14}/></button>
                            <button onClick={() => { setIsEditingTreatment(false); setEditTreatmentValue(lead.treatmentInterest); }} className="p-1 hover:bg-gray-100 rounded text-gray-500"><X size={14}/></button>
                        </div>
                        ) : (
                        <div 
                            className="group flex items-center gap-2 cursor-pointer" 
                            onClick={() => setIsEditingTreatment(true)}
                            title="Click to change treatment"
                        >
                            <span className="text-indigo-600 font-medium border-b border-dashed border-transparent group-hover:border-indigo-300 transition-all">
                            {lead.treatmentInterest}
                            </span>
                            <Pencil className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        )}
                    </div>
                    
                    {(lead.nationalId || lead.birthYear) && (
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            {lead.nationalId && <span className="flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5" /> <span className="font-mono">{lead.nationalId}</span></span>}
                            {lead.birthYear && <span className="flex items-center gap-1.5"><Baby className="w-3.5 h-3.5" /> {lead.birthYear}</span>}
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-gray-50 px-6 py-3 flex gap-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
           <button 
            onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-sm whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" /> {t('whatsapp')}
          </button>
          <button 
            onClick={() => window.open(`tel:${lead.phone}`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            <Phone className="w-4 h-4" /> {t('call')}
          </button>
           
           {/* Visit Status Toggles */}
           {lead.status === LeadStatus.BOOKED && (
             <div className="ml-auto flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
               {[VisitStatus.SCHEDULED, VisitStatus.ARRIVED, VisitStatus.COMPLETED].map((s) => (
                 <button
                   key={s}
                   onClick={() => handleStatusChange(s)}
                   className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${lead.visitStatus === s ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {s === VisitStatus.SCHEDULED ? t('booked') : 
                    s === VisitStatus.ARRIVED ? t('arrived') : t('completed')}
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-48 bg-gray-50/50 p-4 border-r border-gray-100 flex flex-row md:flex-col gap-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('OVERVIEW')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'OVERVIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Activity className="w-4 h-4" /> {t('overview')}
            </button>
            <button 
              onClick={() => setActiveTab('FINANCE')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'FINANCE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <CreditCard className="w-4 h-4" /> {t('financials')}
            </button>
            <button 
              onClick={() => setActiveTab('LAB')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'LAB' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Package className="w-4 h-4" /> {t('labWork')}
              {(lead.labOrders || []).filter(o => o.status !== LabStatus.FITTED).length > 0 && (
                <span className="ml-auto bg-orange-500 w-2 h-2 rounded-full"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('NOTES')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'NOTES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <FileText className="w-4 h-4" /> {t('notes')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
            
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('nextAppointment')}</p>
                        {lead.appointmentTime && (
                           <button 
                             onClick={() => setShowReschedule(true)}
                             className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                             title={t('reschedule')}
                           >
                              <Calendar className="w-4 h-4" />
                           </button>
                        )}
                     </div>
                     <div className="flex items-center gap-2">
                       <Clock className="w-5 h-5 text-indigo-500" />
                       <span className="font-bold text-gray-800">
                          {lead.appointmentTime ? `${lead.appointmentTime} - ${new Date(lead.appointmentDate!).toLocaleDateString()}` : t('notScheduled')}
                       </span>
                     </div>
                     {lead.assignedDoctor && (
                       <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                         <User className="w-4 h-4" /> {lead.assignedDoctor}
                       </div>
                     )}
                   </div>
                   
                   <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                     <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('status')}</p>
                     <div className="flex items-center gap-2">
                       {lead.visitStatus === VisitStatus.COMPLETED ? (
                         <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t('completed')}</span>
                       ) : lead.visitStatus === VisitStatus.ARRIVED ? (
                         <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold">{t('arrived')}</span>
                       ) : (
                         <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-bold">{t('scheduled')}</span>
                       )}
                     </div>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" /> {t('activityTimeline')}
                  </h3>
                  <div className="border-l-2 border-gray-100 ml-2 rtl:ml-0 rtl:mr-2 space-y-6 pl-6 rtl:pl-0 rtl:pr-6 relative">
                    {/* Latest Item */}
                    <div className="relative">
                       <div className="absolute -left-[31px] rtl:left-auto rtl:-right-[31px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                       <p className="text-sm font-bold text-gray-800">{t('openedFile')}</p>
                       <p className="text-xs text-gray-400">Just now</p>
                    </div>
                     {/* Previous Items */}
                    {lead.notes.map((note) => (
                      <div key={note.id} className="relative">
                         <div className="absolute -left-[31px] rtl:left-auto rtl:-right-[31px] top-0 w-4 h-4 rounded-full bg-gray-300 border-2 border-white"></div>
                         <p className="text-sm text-gray-600">{note.text}</p>
                         <p className="text-xs text-gray-400">{new Date(note.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                     <div className="relative">
                       <div className="absolute -left-[31px] rtl:left-auto rtl:-right-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                       <p className="text-sm font-bold text-gray-800">{t('leadCreated')}</p>
                       <p className="text-xs text-gray-400">Via {lead.source}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'FINANCE' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-3 gap-4">
                  {/* Editable Price Card */}
                  {isEditingPrice ? (
                     <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 col-span-1">
                        <p className="text-xs opacity-80 mb-1">{t('totalTreatmentPlan')}</p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number"
                                className="w-full bg-indigo-700 border border-indigo-500 rounded px-2 py-1 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                value={editPriceValue}
                                onChange={e => setEditPriceValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && savePrice()}
                                autoFocus
                            />
                            <button onClick={savePrice} className="p-1.5 bg-white/20 rounded hover:bg-white/30"><Check size={16}/></button>
                        </div>
                     </div>
                  ) : (
                    <div 
                        className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 group relative cursor-pointer transition-transform hover:scale-[1.02]" 
                        onClick={() => setIsEditingPrice(true)}
                    >
                        <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="w-4 h-4 text-indigo-200" />
                        </div>
                        <p className="text-xs opacity-80 mb-1">{t('totalTreatmentPlan')}</p>
                        <p className="text-2xl font-bold">{lead.priceQuoted} OMR</p>
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">{t('totalPaid')}</p>
                    <p className="text-2xl font-bold text-emerald-600">{totalPaid} OMR</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">{t('remaining')}</p>
                    <p className="text-2xl font-bold text-red-500">{remaining} OMR</p>
                  </div>
                </div>

                {/* Add Payment Form */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">{t('recordPayment')}</h4>
                  <form onSubmit={handleAddPayment} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 mb-1 block">{t('amount')} (OMR)</label>
                      <input 
                        type="number" 
                        value={newPaymentAmount}
                        onChange={(e) => setNewPaymentAmount(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 mb-1 block">{t('method')}</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="CASH">{t('cash')}</option>
                        <option value="TRANSFER">{t('transfer')}</option>
                        <option value="CARD">{t('card')}</option>
                        <option value="CHEQUE">{t('cheque')}</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                      {t('addPayment')}
                    </button>
                  </form>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">{t('paymentHistory')}</div>
                  {lead.payments.length === 0 ? (
                     <div className="p-8 text-center text-gray-400 text-sm">{t('noPayments')}</div>
                  ) : (
                    <table className="w-full text-sm text-left rtl:text-right">
                      <tbody className="divide-y divide-gray-100">
                        {lead.payments.map(p => (
                          <tr key={p.id} className="group hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800 font-medium">{p.amount} OMR</td>
                            <td className="px-4 py-3 text-gray-500 capitalize">{t(p.method.toLowerCase() as any) || p.method}</td>
                            <td className="px-4 py-3 text-gray-400">{new Date(p.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right rtl:text-left">
                               <button onClick={() => handleDeletePayment(p.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

             {activeTab === 'NOTES' && (
              <div className="space-y-4 animate-fade-in h-full flex flex-col">
                 <div className="flex-1 bg-amber-50/50 rounded-xl border border-amber-100 p-4 overflow-y-auto">
                    {lead.notes.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-amber-300">
                         <FileText className="w-8 h-8 mb-2" />
                         <p className="text-sm">{t('noClinicalNotes')}</p>
                      </div>
                    )}
                    {lead.notes.map(note => (
                      <div key={note.id} className="bg-white p-3 rounded-lg shadow-sm border border-amber-100 mb-3 group relative">
                        <p className="text-gray-700 text-sm">{note.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1 text-right">{new Date(note.timestamp).toLocaleString()}</p>
                        <button 
                          onClick={() => handleDeleteNote(note.id)} 
                          className="absolute top-2 right-2 rtl:left-2 rtl:right-auto p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                           <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                 </div>
                 <div className="p-2 bg-gray-50 text-center text-xs text-gray-400 rounded-lg">
                   {t('useMainViewNotes')}
                 </div>
              </div>
            )}

            {activeTab === 'LAB' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Create Order */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" /> {t('newLabOrder')}
                  </h4>
                  <form onSubmit={handleAddLabOrder} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">{t('itemName')}</label>
                      <input 
                        required
                        type="text" 
                        value={labItem}
                        onChange={(e) => setLabItem(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Zirconia Crown (Upper Right 6)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                         <label className="text-xs font-bold text-gray-500 mb-1 block">{t('labName')}</label>
                         <select 
                           value={labName}
                           onChange={(e) => setLabName(e.target.value)}
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                         >
                           <option>Muscat Dental Lab</option>
                           <option>Oman Prosthetics</option>
                           <option>Elite Smiles Lab</option>
                         </select>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-500 mb-1 block">{t('dueDate')}</label>
                         <input 
                           required
                           type="date" 
                           value={labDate}
                           onChange={(e) => setLabDate(e.target.value)}
                           className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                         />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                      {t('createOrder')}
                    </button>
                  </form>
                </div>

                {/* Lab History */}
                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-gray-500 uppercase">{t('orderHistory')}</h4>
                   {(lead.labOrders || []).length === 0 ? (
                      <p className="text-sm text-gray-400 italic">{t('noPendingOrders')}</p>
                   ) : (
                      (lead.labOrders || []).map(order => (
                        <div key={order.id} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center group relative">
                          <div>
                             <p className="font-bold text-gray-800 text-sm">{order.itemName}</p>
                             <p className="text-xs text-gray-500">{order.labName}</p>
                          </div>
                          <div className="text-right">
                             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                order.status === LabStatus.RECEIVED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                order.status === LabStatus.AT_LAB ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-gray-100 text-gray-600 border-gray-200'
                             }`}>
                               {order.status}
                             </span>
                             <p className="text-[10px] text-gray-400 mt-1">{t('due')}: {new Date(order.dueDate).toLocaleDateString()}</p>
                          </div>
                           <button 
                              onClick={() => handleDeleteLabOrder(order.id)} 
                              className="absolute top-2 right-2 rtl:left-2 rtl:right-auto p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                      ))
                   )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;
