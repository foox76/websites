
import React, { useState } from 'react';
import { Lead, LeadStatus, Doctor } from '../types';
import LeadCard from './LeadCard';
import { Inbox, MessageSquare, CalendarCheck, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LeadListProps {
  leads: Lead[];
  doctors?: Doctor[]; // Made optional to prevent breakage if parent not ready, but should be passed
  onUpdateStatus: (id: string, status: LeadStatus, data?: Partial<Lead>) => void;
  onAddNote: (id: string, note: string) => void;
  onOpenDetail: (lead: Lead) => void;
}

const LeadList: React.FC<LeadListProps> = ({ leads, doctors = [], onUpdateStatus, onAddNote, onOpenDetail }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filterLeads = (status: LeadStatus) => {
    return leads
      .filter(l => l.status === status)
      .filter(l => 
        !searchTerm || 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.phone.includes(searchTerm)
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  const newLeads = filterLeads(LeadStatus.NEW);
  const contactedLeads = filterLeads(LeadStatus.CONTACTED);
  const bookedLeads = filterLeads(LeadStatus.BOOKED);

  const ColumnHeader = ({ title, count, icon: Icon, color, totalValue }: any) => (
    <div className={`flex items-center justify-between p-4 rounded-t-xl bg-white border-b-2 ${color} shadow-sm`}>
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg bg-gray-50`}>
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-400">{count} {t('patient')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-gray-500">{t('potential')}</p>
        <p className="text-sm font-bold text-gray-900">{totalValue} OMR</p>
      </div>
    </div>
  );

  const calculateTotal = (list: Lead[]) => list.reduce((acc, curr) => acc + curr.potentialValue, 0);

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-xl font-bold text-gray-800">{t('pipeline')}</h2>
        <div className="relative">
          <Search className="absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rtl:pl-4 rtl:pr-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm w-64"
          />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-[1000px] h-full items-start">
          
          {/* New Leads Column */}
          <div className="flex-1 bg-gray-100/50 rounded-xl flex flex-col h-full max-h-[calc(100vh-200px)]">
            <ColumnHeader 
              title={t('newRequests')} 
              count={newLeads.length} 
              icon={Inbox} 
              color="border-red-500" 
              totalValue={calculateTotal(newLeads)}
            />
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {newLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  allLeads={leads} // Pass full list for conflict checks
                  doctors={doctors}
                  onUpdateStatus={onUpdateStatus} 
                  onAddNote={onAddNote} 
                  onOpenDetail={onOpenDetail} 
                />
              ))}
              {newLeads.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  {t('noNewLeads')}
                </div>
              )}
            </div>
          </div>

          {/* Contacted Column */}
          <div className="flex-1 bg-gray-100/50 rounded-xl flex flex-col h-full max-h-[calc(100vh-200px)]">
            <ColumnHeader 
              title={t('inDiscussion')}
              count={contactedLeads.length} 
              icon={MessageSquare} 
              color="border-blue-500" 
              totalValue={calculateTotal(contactedLeads)}
            />
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {contactedLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  allLeads={leads}
                  doctors={doctors}
                  onUpdateStatus={onUpdateStatus} 
                  onAddNote={onAddNote} 
                  onOpenDetail={onOpenDetail} 
                />
              ))}
               {contactedLeads.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  {t('noActiveDiscussions')}
                </div>
              )}
            </div>
          </div>

          {/* Booked Column */}
          <div className="flex-1 bg-gray-100/50 rounded-xl flex flex-col h-full max-h-[calc(100vh-200px)]">
            <ColumnHeader 
              title={t('booked')}
              count={bookedLeads.length} 
              icon={CalendarCheck} 
              color="border-emerald-500" 
              totalValue={calculateTotal(bookedLeads)}
            />
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {bookedLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  allLeads={leads}
                  doctors={doctors}
                  onUpdateStatus={onUpdateStatus} 
                  onAddNote={onAddNote} 
                  onOpenDetail={onOpenDetail} 
                />
              ))}
               {bookedLeads.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  {t('noBookingsYet')}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadList;
