
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, View, LeadSource, VisitStatus, LabStatus, Doctor, ClinicSettings } from './types';
import LeadList from './components/LeadList';
import Dashboard from './components/Dashboard';
import ScheduleView from './components/ScheduleView';
import PatientDetailModal from './components/PatientDetailModal';
import PatientDatabase from './components/PatientDatabase';
import LabManager from './components/LabManager';
import SettingsView from './components/SettingsView';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { 
  LayoutDashboard, 
  Users, 
  Plus, 
  Zap, 
  Settings, 
  Globe, 
  Database, 
  Copy, 
  Check, 
  Code, 
  LogOut,
  Search,
  Bell,
  Calendar,
  Package,
  UserPlus,
  Trash2,
  Languages,
  Clock,
  Armchair
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper to get today's date at midnight
const getToday = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d.getTime();
};

// Helper to get future/past days
const getDaysFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0,0,0,0);
  return d.getTime();
};

const INITIAL_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah', color: 'blue', active: true },
  { id: 'd2', name: 'Dr. Mohammed', color: 'emerald', active: true },
  { id: 'd3', name: 'Dr. Ali', color: 'indigo', active: true },
];

const INITIAL_SETTINGS: ClinicSettings = {
    clinicName: "Muscat Dental Clinic",
    currency: "OMR",
    startHour: "09:00",
    endHour: "21:00",
    commissionRate: 40
};

const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Ahmed Al-Balushi',
    phone: '96812345678',
    treatmentInterest: 'Dental Implants',
    status: LeadStatus.NEW,
    source: LeadSource.WEBSITE,
    initialMessage: 'I have a missing tooth and want to know the cost of an implant.',
    createdAt: Date.now() - 1000 * 60 * 5, 
    notes: [],
    potentialValue: 350,
    priceQuoted: 350,
    payments: [],
    labOrders: []
  },
  {
    id: '2',
    name: 'Sara Al-Harthi',
    phone: '96887654321',
    treatmentInterest: 'Teeth Whitening',
    status: LeadStatus.CONTACTED,
    source: LeadSource.GOOGLE_ADS,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, 
    lastContacted: Date.now() - 1000 * 60 * 60 * 24 * 5, 
    notes: [
      { id: 'n1', text: 'Called, no answer. Sent WhatsApp.', timestamp: Date.now() - 1000 * 60 * 30 }
    ],
    potentialValue: 80,
    priceQuoted: 80,
    payments: [],
    labOrders: []
  }
];

const SpeedCRMContent: React.FC = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const [view, setView] = useState<View>('DASHBOARD');
  
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('speedcrm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });
  
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('speedcrm_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  const [settings, setSettings] = useState<ClinicSettings>(() => {
      const saved = localStorage.getItem('speedcrm_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [totalSpend, setTotalSpend] = useState(150);
  const [copied, setCopied] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);

  // Calculate Queue Stats
  const getQueueStats = () => {
    const now = new Date();
    const todayTimestamp = new Date().setHours(0,0,0,0);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todaysLeads = leads.filter(l => 
      l.status === LeadStatus.BOOKED && 
      l.appointmentDate === todayTimestamp
    );

    const waiting = todaysLeads.filter(l => l.visitStatus === VisitStatus.ARRIVED);
    
    // Find next upcoming
    const upcoming = todaysLeads
      .filter(l => l.visitStatus === VisitStatus.SCHEDULED && l.appointmentTime)
      .sort((a, b) => {
         const tA = parseInt(a.appointmentTime!.split(':')[0]) * 60 + parseInt(a.appointmentTime!.split(':')[1]);
         const tB = parseInt(b.appointmentTime!.split(':')[0]) * 60 + parseInt(b.appointmentTime!.split(':')[1]);
         return tA - tB;
      })
      .find(l => {
         const time = parseInt(l.appointmentTime!.split(':')[0]) * 60 + parseInt(l.appointmentTime!.split(':')[1]);
         return time >= currentMinutes;
      });
    
    let timeUntilNext = 0;
    if (upcoming && upcoming.appointmentTime) {
       const upTime = parseInt(upcoming.appointmentTime.split(':')[0]) * 60 + parseInt(upcoming.appointmentTime.split(':')[1]);
       timeUntilNext = upTime - currentMinutes;
    }

    return { waiting, upcoming, timeUntilNext };
  };

  const { waiting, upcoming, timeUntilNext } = getQueueStats();

  useEffect(() => {
    localStorage.setItem('speedcrm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('speedcrm_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('speedcrm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (globalSearch.trim()) {
       const term = globalSearch.toLowerCase();
       const results = leads.filter(l => 
         l.name.toLowerCase().includes(term) || 
         l.phone.includes(term)
       ).slice(0, 5); 
       setSearchResults(results);
    } else {
       setSearchResults([]);
    }
  }, [globalSearch, leads]);

  const simulateIncomingLead = () => {
    const names = ['Khalid Al-Maamari', 'Noor Al-Zadjali', 'Omar Al-Kindi', 'Layla Al-Hasni', 'Saif Al-Busaidi'];
    const treatments = [
      { name: 'Invisalign', val: 1200 }, 
      { name: 'Root Canal', val: 150 }, 
      { name: 'Veneers', val: 2000 }, 
      { name: 'Checkup', val: 30 }
    ];
    const sources = [LeadSource.WEBSITE, LeadSource.GOOGLE_ADS];
    const selectedSource = sources[Math.floor(Math.random() * sources.length)];
    const selectedTreatment = treatments[Math.floor(Math.random() * treatments.length)];
    
    let msg = undefined;
    if (selectedSource === LeadSource.WEBSITE) {
       const msgs = ["My tooth hurts when I drink cold water.", "Do you accept insurance?", "I want a hollywood smile."];
       msg = msgs[Math.floor(Math.random() * msgs.length)];
    }
    
    const isHistorical = Math.random() > 0.7;
    const historicalDate = getDaysFromToday(Math.floor(Math.random() * -30));
    const randomDuration = [30, 30, 60, 90][Math.floor(Math.random() * 4)]; 

    const newLead: Lead = {
      id: Date.now().toString(),
      name: names[Math.floor(Math.random() * names.length)],
      phone: '968' + Math.floor(Math.random() * 100000000),
      treatmentInterest: selectedTreatment.name,
      status: isHistorical ? LeadStatus.BOOKED : LeadStatus.NEW,
      source: selectedSource,
      initialMessage: msg,
      createdAt: isHistorical ? historicalDate : Date.now(), 
      notes: [],
      potentialValue: selectedTreatment.val,
      priceQuoted: selectedTreatment.val,
      payments: isHistorical ? [{ id: 'hp1', amount: selectedTreatment.val, method: 'CASH', date: historicalDate, note: 'Paid in full' }] : [],
      visitStatus: isHistorical ? VisitStatus.COMPLETED : undefined,
      appointmentDate: isHistorical ? historicalDate : undefined,
      appointmentTime: isHistorical ? '10:00' : undefined,
      duration: isHistorical ? randomDuration : 30,
      assignedDoctor: isHistorical ? 'Dr. Sarah' : undefined,
      isVip: selectedTreatment.val > 1500,
      labOrders: []
    };

    setLeads(prev => [newLead, ...prev]);
    if (navigator.vibrate) navigator.vibrate(200);
  };

  const addManualLead = (lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B']
    });
  };

  const updateLeadStatus = (id: string, status: LeadStatus, additionalData?: Partial<Lead>) => {
    setLeads(prev => {
      const newLeads = prev.map(lead => 
        lead.id === id ? { ...lead, status, lastContacted: Date.now(), ...additionalData } : lead
      );
      if (selectedLead && selectedLead.id === id) {
        const updated = newLeads.find(l => l.id === id);
        if (updated) setSelectedLead(updated);
      }
      return newLeads;
    });

    if (status === LeadStatus.BOOKED) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B']
      });
    }
  };
  
  const updateLeadData = (id: string, data: Partial<Lead>) => {
     setLeads(prev => {
      const newLeads = prev.map(lead => 
        lead.id === id ? { ...lead, ...data } : lead
      );
      if (selectedLead && selectedLead.id === id) {
        const updated = newLeads.find(l => l.id === id);
        if (updated) setSelectedLead(updated);
      }
      return newLeads;
    });
  };

  const updateLabStatus = (leadId: string, orderId: string, newStatus: LabStatus) => {
     setLeads(prev => prev.map(lead => {
       if (lead.id !== leadId) return lead;
       return {
         ...lead,
         labOrders: lead.labOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
       };
     }));
  };

  const addNoteToLead = (id: string, noteText: string) => {
    const newNote = {
      id: Date.now().toString(),
      text: noteText,
      timestamp: Date.now()
    };
    updateLeadData(id, { notes: [...(leads.find(l => l.id === id)?.notes || []), newNote] });
  };

  const addDoctor = (name: string) => {
    if (!name) return;
    const newDoc: Doctor = {
      id: Date.now().toString(),
      name,
      color: 'indigo',
      active: true
    };
    setDoctors([...doctors, newDoc]);
  };

  const removeDoctor = (id: string) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const SidebarItem = ({ id, icon: Icon, label, active }: any) => (
    <button 
      onClick={() => setView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className="font-medium">{label}</span>
      {id === 'LEADS' && leads.filter(l => l.status === LeadStatus.NEW).length > 0 && (
        <span className="ms-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {leads.filter(l => l.status === LeadStatus.NEW).length}
        </span>
      )}
    </button>
  );

  const isFullWidthView = view === 'DATABASE' || view === 'SCHEDULE' || view === 'LAB';

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      
      {selectedLead && (
        <PatientDetailModal 
          lead={selectedLead}
          leads={leads} // Pass full leads for conflict check
          onClose={() => setSelectedLead(null)} 
          onUpdateLead={updateLeadData}
        />
      )}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[90] flex flex-col gap-2" id="toast-container"></div>

      <aside className="hidden md:flex flex-col w-64 bg-white border-e border-gray-200 h-full fixed start-0 top-0 z-30">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600 fill-blue-600" />
            <span className="text-blue-600">Speed</span>CRM
          </h1>
          <p className="text-xs text-gray-400 mt-1 ms-8">{settings.clinicName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem id="DASHBOARD" icon={LayoutDashboard} label={t('stats')} active={view === 'DASHBOARD'} />
          <SidebarItem id="LEADS" icon={Users} label={t('pipeline')} active={view === 'LEADS'} />
          <SidebarItem id="SCHEDULE" icon={Calendar} label={t('schedule')} active={view === 'SCHEDULE'} />
          <SidebarItem id="LAB" icon={Package} label={t('lab')} active={view === 'LAB'} />
          <SidebarItem id="DATABASE" icon={Database} label={t('database')} active={view === 'DATABASE'} />
          <SidebarItem id="SETTINGS" icon={Settings} label={t('config')} active={view === 'SETTINGS'} />
        </nav>

        {/* FRONT DESK QUEUE WIDGET */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-4 shadow-sm">
             <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <Armchair className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-800">{t('todaysQueue')}</h4>
             </div>

             {/* Waiting List */}
             <div className="mb-3">
               <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                  <span>{t('waitingRoom')}</span>
                  <span className="bg-white px-1.5 rounded text-gray-600 border border-gray-100">{waiting.length}</span>
               </div>
               {waiting.length === 0 ? (
                  <p className="text-xs text-gray-400 italic pl-1">{t('noResults')}</p>
               ) : (
                  <div className="space-y-1">
                    {waiting.slice(0,3).map(l => (
                       <div key={l.id} className="bg-white border border-gray-100 p-2 rounded-lg flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 truncate max-w-[90px]">{l.name}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">{l.appointmentTime}</span>
                       </div>
                    ))}
                    {waiting.length > 3 && <p className="text-[10px] text-center text-gray-400">+{waiting.length - 3} more</p>}
                  </div>
               )}
             </div>

             {/* Next Up */}
             <div>
               <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                  <span>{t('nextUp')}</span>
               </div>
               {upcoming ? (
                 <div className="bg-white border border-indigo-100 p-2 rounded-lg">
                    <div className="flex justify-between items-start">
                       <span className="text-xs font-bold text-gray-800 truncate max-w-[100px]">{upcoming.name}</span>
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${timeUntilNext < 15 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                          {upcoming.appointmentTime}
                       </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                       <Clock className="w-3 h-3" /> 
                       {timeUntilNext > 0 ? `in ${timeUntilNext} ${t('mins')}` : t('now')}
                    </div>
                 </div>
               ) : (
                 <p className="text-xs text-gray-400 italic pl-1">{t('noBookingsYet')}</p>
               )}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
             <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold">{language === 'en' ? 'English' : 'العربية'}</span>
             </div>
             <span className="text-xs text-gray-400">{language === 'en' ? 'EN' : 'AR'}</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            <span className="font-medium">{t('signOut')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col md:ms-64 h-screen overflow-hidden relative bg-gray-50/50">
        
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm flex-shrink-0">
          <div className="md:hidden font-bold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" /> SpeedCRM
          </div>

          <div className="hidden md:block relative w-96 z-50">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-gray-700 placeholder-gray-400"
              />
              {globalSearch && <button onClick={() => setGlobalSearch('')}><Plus className="w-4 h-4 rotate-45 text-gray-400"/></button>}
            </div>
            
            {searchResults.length > 0 && (
               <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50">{t('results')}</p>
                  {searchResults.map(result => (
                    <div 
                      key={result.id} 
                      onClick={() => { setSelectedLead(result); setGlobalSearch(''); setSearchResults([]); }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                    >
                       <p className="text-sm font-bold text-gray-800">{result.name}</p>
                       <p className="text-xs text-gray-500 flex justify-between">
                          <span>{result.phone}</span>
                          <span className="font-medium text-blue-600">{result.status}</span>
                       </p>
                    </div>
                  ))}
               </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="md:hidden flex items-center justify-center p-2 bg-gray-100 rounded-lg text-gray-600"
            >
               <Languages className="w-5 h-5" />
            </button>

            <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <button 
              onClick={simulateIncomingLead}
              className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('simulateLead')}</span>
            </button>
            <button 
               onClick={simulateIncomingLead}
               className="md:hidden bg-indigo-600 text-white p-2 rounded-full shadow-lg"
            >
               <Plus className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer ring-2 ring-offset-2 ring-indigo-100">
              DR
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className={`mx-auto h-full flex flex-col ${isFullWidthView ? 'max-w-full' : 'max-w-[1600px]'}`}>
            {view === 'LEADS' && (
              <LeadList 
                leads={leads} 
                onUpdateStatus={updateLeadStatus} 
                onAddNote={addNoteToLead}
                onOpenDetail={setSelectedLead}
                doctors={doctors} 
              />
            )}
            {view === 'SCHEDULE' && (
              <ScheduleView 
                leads={leads} 
                doctors={doctors}
                settings={settings}
                onLeadClick={setSelectedLead} 
                onAddLead={addManualLead}
                onUpdateLead={updateLeadData}
              />
            )}
             {view === 'DATABASE' && (
              <PatientDatabase 
                leads={leads} 
                onOpenDetail={setSelectedLead} 
              />
            )}
            {view === 'LAB' && (
              <LabManager 
                leads={leads} 
                onUpdateStatus={updateLabStatus}
              />
            )}
            {view === 'DASHBOARD' && (
              <Dashboard leads={leads} totalSpend={totalSpend} settings={settings} />
            )}
            {view === 'SETTINGS' && (
              <SettingsView 
                 doctors={doctors}
                 settings={settings}
                 onAddDoctor={addDoctor}
                 onRemoveDoctor={removeDoctor}
                 onUpdateSettings={setSettings}
              />
            )}
          </div>
        </div>

        <div className="md:hidden bg-white/80 backdrop-blur-md border-t border-gray-200 pb-6 pt-2 px-6 sticky bottom-0 z-50 flex-shrink-0">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setView('LEADS')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'LEADS' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Users className="w-6 h-6" />
              <span className="text-[10px] font-medium">{t('pipeline')}</span>
            </button>

            <button 
              onClick={() => setView('SCHEDULE')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'SCHEDULE' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-[10px] font-medium">{t('schedule')}</span>
            </button>

             <button 
              onClick={() => setView('LAB')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'LAB' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Package className="w-6 h-6" />
              <span className="text-[10px] font-medium">{t('lab')}</span>
            </button>

            <button 
              onClick={() => setView('DASHBOARD')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'DASHBOARD' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px] font-medium">{t('stats')}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// App Wrapper to provide contexts
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <SpeedCRMContent />
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
