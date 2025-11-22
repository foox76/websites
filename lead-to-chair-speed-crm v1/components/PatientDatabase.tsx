
import React, { useState } from 'react';
import { Lead, LeadStatus, VisitStatus } from '../types';
import { Search, Filter, User, CheckSquare, Square, MessageCircle, Sparkles, Download, Calendar, CreditCard, X, Copy, Send, Star, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateMarketingCampaign } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import GoogleDateRangePicker from './GoogleDateRangePicker';

interface PatientDatabaseProps {
  leads: Lead[];
  onOpenDetail: (lead: Lead) => void;
}

type Segment = 'ALL' | 'VIP' | 'COMPLETED' | 'NEEDS_FOLLOWUP';

const PatientDatabase: React.FC<PatientDatabaseProps> = ({ leads, onOpenDetail }) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<Segment>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Date Filter State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateLabel, setDateLabel] = useState(t('last30Days'));
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    d.setHours(0,0,0,0);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(23,59,59,999);
    return d;
  });

  // Campaign Modal State
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignGoal, setCampaignGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');

  // Filtering Logic
  const filteredLeads = leads.filter(lead => {
    // 1. Search Filter
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.phone.includes(searchTerm) ||
      (lead.nationalId && lead.nationalId.includes(searchTerm));
    
    if (!matchesSearch) return false;

    // 2. Date Filter (Based on CreatedAt)
    const leadDate = new Date(lead.createdAt).getTime();
    const start = startDate.getTime();
    const end = endDate.getTime();
    const matchesDate = leadDate >= start && leadDate <= end;

    if (!matchesDate) return false;

    // 3. Segment Filter
    switch (selectedSegment) {
      case 'VIP':
        return lead.isVip || lead.priceQuoted >= 500;
      case 'COMPLETED':
        return lead.visitStatus === VisitStatus.COMPLETED;
      case 'NEEDS_FOLLOWUP':
        const threeDaysAgo = Date.now() - (1000 * 60 * 60 * 24 * 3);
        const wasContactedLongAgo = lead.lastContacted ? lead.lastContacted < threeDaysAgo : false;
        return lead.status === LeadStatus.CONTACTED && wasContactedLongAgo;
      default:
        return true;
    }
  }).sort((a, b) => b.createdAt - a.createdAt);

  // Selection Logic
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  // Campaign Logic
  const handleGenerateCampaign = async () => {
    if (!campaignGoal) return;
    setIsGenerating(true);
    const selectedPatients = leads.filter(l => selectedIds.has(l.id));
    const script = await generateMarketingCampaign(selectedPatients, campaignGoal);
    setGeneratedScript(script);
    setIsGenerating(false);
  };

  const sendIndividualMessage = (lead: Lead) => {
    const text = encodeURIComponent(generatedScript);
    window.open(`https://wa.me/${lead.phone}?text=${text}`, '_blank');
  };

  const selectedPatientsList = leads.filter(l => selectedIds.has(l.id));

  // Calc Total Revenue for Display
  const totalShownRevenue = filteredLeads.reduce((acc, l) => acc + l.priceQuoted, 0);
  const totalCollected = filteredLeads.reduce((acc, l) => acc + l.payments.reduce((sum, p) => sum + p.amount, 0), 0);

  return (
    <div className="flex h-full gap-6 pb-2 animate-fade-in relative">
      
      <GoogleDateRangePicker 
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialStartDate={startDate}
        initialEndDate={endDate}
        onApply={(range) => {
          setStartDate(range.startDate);
          setEndDate(range.endDate);
          setDateLabel(range.label || 'Custom Range');
        }}
      />

      {/* Sidebar Filters */}
      <div className="w-64 flex-shrink-0 hidden md:flex flex-col h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-0 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 px-2">{t('smartSegments')}</h3>
          <nav className="space-y-1 flex-1">
            <button 
              onClick={() => setSelectedSegment('ALL')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSegment === 'ALL' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{t('allPatients')}</span>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">{leads.length}</span>
            </button>
            <button 
              onClick={() => setSelectedSegment('VIP')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSegment === 'VIP' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="flex items-center gap-2">{t('vip')} <Star className="w-3 h-3 fill-amber-500 text-amber-500" /></span>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">{leads.filter(l => l.isVip || l.priceQuoted >= 500).length}</span>
            </button>
            <button 
              onClick={() => setSelectedSegment('COMPLETED')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSegment === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{t('completed')}</span>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">{leads.filter(l => l.visitStatus === VisitStatus.COMPLETED).length}</span>
            </button>
            <button 
              onClick={() => setSelectedSegment('NEEDS_FOLLOWUP')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSegment === 'NEEDS_FOLLOWUP' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="flex flex-col items-start text-left rtl:text-right">
                <span>{t('needsFollowUp')}</span>
                <span className="text-[10px] font-normal opacity-75">No contact &gt; 3 days</span>
              </span>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">
                {leads.filter(l => {
                   const threeDaysAgo = Date.now() - (1000 * 60 * 60 * 24 * 3);
                   const wasContactedLongAgo = l.lastContacted ? l.lastContacted < threeDaysAgo : false;
                   return l.status === LeadStatus.CONTACTED && wasContactedLongAgo;
                }).length}
              </span>
            </button>
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6 mb-2 text-yellow-300" />
              <h4 className="font-bold text-sm mb-1">{t('aiMarketingHub')}</h4>
              <p className="text-xs text-indigo-100 mb-3 leading-relaxed">
                {t('generateCampaigns')}
              </p>
              <button 
                disabled={selectedIds.size === 0}
                onClick={() => setShowCampaignModal(true)}
                className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {selectedIds.size > 0 ? `${t('messagePatients')} (${selectedIds.size})` : t('selectPatientsFirst')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Toolbar */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rtl:pl-4 rtl:pr-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full bg-gray-50/50"
              />
            </div>
            
            {/* Date Picker Trigger */}
            <button 
              onClick={() => setShowDatePicker(true)}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-all whitespace-nowrap w-full sm:w-auto"
            >
                <Calendar className="w-4 h-4 text-indigo-500" />
                {dateLabel}
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <div className="hidden sm:block h-8 w-[1px] bg-gray-200 mx-2"></div>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {t('showingRecords')} <span className="font-bold text-gray-800">{filteredLeads.length}</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> {t('exportCsv')}
          </button>
        </div>

        {/* Table Wrapper */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left rtl:text-right border-collapse min-w-[1000px]">
              <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="p-4 border-b border-gray-200 w-12">
                    <button onClick={toggleAll} className="text-gray-400 hover:text-indigo-600">
                      {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                    </button>
                  </th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase w-1/5">{t('patient')}</th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase w-24 text-center">{t('nationalId')}</th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase w-32">{t('date')}</th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">{t('treatment')}</th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">{t('doctor')}</th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase w-40">{t('financials')}</th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase w-32">{t('status')}</th>
                  <th className="p-4 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase text-right rtl:text-left w-32">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map(lead => {
                   const isSelected = selectedIds.has(lead.id);
                   const totalPaid = lead.payments.reduce((s, p) => s + p.amount, 0);
                   const remaining = lead.priceQuoted - totalPaid;
                   const isVip = lead.isVip || lead.priceQuoted >= 500;
                   
                   return (
                    <tr key={lead.id} className={`hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                      <td className="p-4">
                        <button onClick={() => toggleSelection(lead.id)} className="text-gray-400 hover:text-indigo-600">
                          {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isVip ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                            {lead.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-1 truncate">
                              {lead.name}
                              {isVip && <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                           <span className="text-sm text-gray-600 font-mono">{lead.nationalId || '-'}</span>
                           {lead.birthYear && <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded">{lead.birthYear}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600 block">
                          {new Date(lead.createdAt).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US')}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(lead.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block whitespace-nowrap truncate max-w-[150px]">{lead.treatmentInterest}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                           <User className="w-3 h-3 text-gray-400" />
                           {lead.assignedDoctor || <span className="text-gray-400 italic">{t('unassigned')}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                           <div className="flex justify-between w-32 text-xs">
                              <span className="text-gray-500">{t('expected')}:</span>
                              <span className="font-bold text-gray-800">{lead.priceQuoted}</span>
                           </div>
                           <div className="flex justify-between w-32 text-xs">
                              <span className="text-gray-500">{t('paid')}:</span>
                              <span className="font-bold text-emerald-600">{totalPaid}</span>
                           </div>
                           {remaining > 0 && (
                             <div className="flex justify-between w-32 text-xs border-t border-gray-100 mt-1 pt-1">
                                <span className="text-gray-500">{t('due')}:</span>
                                <span className="font-bold text-red-500">{remaining}</span>
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border inline-block ${
                          lead.visitStatus === VisitStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-200' :
                          lead.status === LeadStatus.BOOKED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                          lead.status === LeadStatus.CONTACTED ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {lead.visitStatus === VisitStatus.COMPLETED ? t('completed') : 
                           lead.status === LeadStatus.BOOKED ? t('booked') :
                           lead.status === LeadStatus.CONTACTED ? t('contacted') : t('new')}
                        </span>
                      </td>
                      <td className="p-4 text-right rtl:text-left">
                        <button 
                          onClick={() => onOpenDetail(lead)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {t('viewProfile')}
                        </button>
                      </td>
                    </tr>
                   );
                })}
                {filteredLeads.length === 0 && (
                   <tr>
                     <td colSpan={9} className="p-8 text-center text-gray-400 h-64">
                       <div className="flex flex-col items-center justify-center h-full">
                          <Search className="w-8 h-8 text-gray-300 mb-2" />
                          <p>{t('noResults')}</p>
                       </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 flex-shrink-0 gap-2">
             <div className="flex items-center gap-6">
                <span>Total Patients: <span className="font-bold text-gray-900">{filteredLeads.length}</span></span>
                <span className="hidden sm:inline w-[1px] h-3 bg-gray-300"></span>
                <span>Total Potential: <span className="font-bold text-gray-900">{totalShownRevenue} OMR</span></span>
                <span className="hidden sm:inline w-[1px] h-3 bg-gray-300"></span>
                <span>Collected (Range): <span className="font-bold text-emerald-600">{totalCollected} OMR</span></span>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 disabled:opacity-50" disabled>
                   <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2">Page 1</span>
                <button className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 disabled:opacity-50" disabled>
                   <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* AI Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative flex-shrink-0 rounded-t-2xl">
              <button onClick={() => setShowCampaignModal(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" /> {t('campaignGenerator')}
              </h2>
              <p className="text-indigo-100 text-sm mt-1">{t('targeting')} {selectedIds.size} {t('patient')}</p>
            </div>

            <div className="p-6 overflow-y-auto">
              {!generatedScript ? (
                <>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('campaignGoal')}</label>
                  <textarea 
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none mb-4"
                    placeholder="..."
                  />
                  
                  <div className="bg-indigo-50 p-3 rounded-lg mb-6 border border-indigo-100">
                    <p className="text-xs text-indigo-700 font-medium flex items-start gap-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      The AI will analyze the selected patients' treatments to write a personalized, high-converting message.
                    </p>
                  </div>

                  <button 
                    onClick={handleGenerateCampaign}
                    disabled={!campaignGoal || isGenerating}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('writingMagic')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> {t('generateScript')}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="animate-fade-in">
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="text-sm font-bold text-gray-700">{t('generatedMessage')}</h3>
                     <button onClick={() => setGeneratedScript('')} className="text-xs text-indigo-600 font-medium hover:underline">{t('tryAgain')}</button>
                   </div>
                   
                   {/* Script Preview */}
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-6 max-h-40 overflow-y-auto shadow-inner text-left" dir="ltr">
                     {generatedScript}
                   </div>

                   <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" /> {t('rapidFireQueue')}
                   </h3>
                   
                   <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {selectedPatientsList.map(patient => (
                           <div key={patient.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                              <div>
                                <p className="text-sm font-bold text-gray-800">{patient.name}</p>
                                <p className="text-xs text-gray-400">{patient.phone}</p>
                              </div>
                              <button 
                                onClick={() => sendIndividualMessage(patient)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                              >
                                <Send className="w-3 h-3 rtl:rotate-180" /> {t('send')}
                              </button>
                           </div>
                        ))}
                      </div>
                   </div>
                   
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDatabase;
