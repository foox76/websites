
import React, { useState } from 'react';
import { Doctor, ClinicSettings } from '../types';
import { UserPlus, Trash2, Globe, Copy, Check, Building2, Clock, Wallet, AlertTriangle, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface SettingsViewProps {
  doctors: Doctor[];
  settings: ClinicSettings;
  onAddDoctor: (name: string) => void;
  onRemoveDoctor: (id: string) => void;
  onUpdateSettings: (settings: ClinicSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ doctors, settings, onAddDoctor, onRemoveDoctor, onUpdateSettings }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'STAFF' | 'SCHEDULE' | 'SYSTEM'>('GENERAL');

  // Local state for settings form to allow editing before saving
  const [localSettings, setLocalSettings] = useState<ClinicSettings>(settings);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    toast.success(t('statusUpdated'));
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText("https://api.speedcrm.com/v1/hooks/catch/12345");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
      if(window.confirm("WARNING: This will delete ALL patients, bookings and revenue data. Are you sure?")) {
          localStorage.removeItem('speedcrm_leads');
          window.location.reload();
      }
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{t('config')}</h2>
        <p className="text-gray-500">{t('manageConfig')}</p>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
         <button 
            onClick={() => setActiveTab('GENERAL')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'GENERAL' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
         >
            {t('generalConfig')}
         </button>
         <button 
            onClick={() => setActiveTab('STAFF')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'STAFF' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
         >
            {t('staffManagement')}
         </button>
         <button 
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'SCHEDULE' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
         >
            {t('scheduleSettings')}
         </button>
         <button 
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'SYSTEM' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
         >
            {t('systemConfig')}
         </button>
      </div>

      {activeTab === 'GENERAL' && (
         <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg"><Building2 className="w-6 h-6 text-gray-600" /></div>
                <div>
                    <h4 className="font-bold text-lg text-gray-800">{t('clinicIdentity')}</h4>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('clinicName')}</label>
                  <input 
                     value={localSettings.clinicName}
                     onChange={(e) => setLocalSettings({...localSettings, clinicName: e.target.value})}
                     className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('currency')}</label>
                  <input 
                     value={localSettings.currency}
                     onChange={(e) => setLocalSettings({...localSettings, currency: e.target.value})}
                     className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
               </div>
               <div className="col-span-2 border-t border-gray-100 pt-4 flex justify-end">
                  <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                     <Save className="w-4 h-4" /> {t('saveChanges')}
                  </button>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'STAFF' && (
         <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg"><UserPlus className="w-6 h-6 text-indigo-600" /></div>
                <div>
                    <h4 className="font-bold text-lg text-gray-800">{t('staffManagement')}</h4>
                    <p className="text-sm text-gray-500">{t('manageStaffDesc')}</p>
                </div>
            </div>

            <div className="mb-8">
               <div className="grid grid-cols-1 gap-3 mb-6">
                  {doctors.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-${doc.color}-400 to-${doc.color}-600`}>
                        {doc.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-700">{doc.name}</span>
                     </div>
                     <button onClick={() => onRemoveDoctor(doc.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                  ))}
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('docName') as string;
                  if(name) {
                  onAddDoctor(name);
                  e.currentTarget.reset();
                  }
               }} className="flex gap-2">
                  <input name="docName" type="text" placeholder={t('newDoctorName')} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">{t('addStaff')}</button>
               </form>
            </div>
            
            {/* Financial Config for Doctors */}
            <div className="border-t border-gray-100 pt-6">
                 <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-gray-400"/> {t('financialConfig')}</h5>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('commissionRate')} (%)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={localSettings.commissionRate}
                            onChange={(e) => setLocalSettings({...localSettings, commissionRate: parseInt(e.target.value)})}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="font-bold text-indigo-600 w-12">{localSettings.commissionRate}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t('commissionDesc')}</p>
                 </div>
                 <div className="mt-4 flex justify-end">
                     <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
                        <Save className="w-4 h-4" /> {t('saveChanges')}
                     </button>
                 </div>
            </div>
         </div>
      )}

      {activeTab === 'SCHEDULE' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg"><Clock className="w-6 h-6 text-blue-600" /></div>
                <div>
                    <h4 className="font-bold text-lg text-gray-800">{t('scheduleSettings')}</h4>
                    <p className="text-sm text-gray-500">{t('scheduleDesc')}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('startHour')}</label>
                  <select 
                     value={localSettings.startHour}
                     onChange={(e) => setLocalSettings({...localSettings, startHour: e.target.value})}
                     className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white"
                  >
                     {Array.from({length: 24}).map((_, i) => {
                         const h = i.toString().padStart(2, '0') + ":00";
                         return <option key={h} value={h}>{h}</option>
                     })}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('endHour')}</label>
                  <select 
                     value={localSettings.endHour}
                     onChange={(e) => setLocalSettings({...localSettings, endHour: e.target.value})}
                     className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white"
                  >
                     {Array.from({length: 24}).map((_, i) => {
                         const h = i.toString().padStart(2, '0') + ":00";
                         return <option key={h} value={h}>{h}</option>
                     })}
                  </select>
               </div>
               <div className="col-span-2 border-t border-gray-100 pt-4 flex justify-end">
                  <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                     <Save className="w-4 h-4" /> {t('saveChanges')}
                  </button>
               </div>
            </div>
          </div>
      )}

      {activeTab === 'SYSTEM' && (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800">{t('websiteWebhook')}</h4>
                        <p className="text-sm text-gray-500">{t('connectForms')}</p>
                    </div>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-6 relative group mb-6">
                    <p className="text-gray-400 text-xs uppercase font-semibold mb-2">{t('endpointUrl')}</p>
                    <div className="flex items-center justify-between gap-4">
                        <code className="text-green-400 font-mono text-sm break-all">
                        https://api.speedcrm.com/v1/hooks/catch/12345
                        </code>
                        <button 
                        onClick={copyWebhook}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors text-xs font-medium"
                        >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? t('copied') : t('copy')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 p-8 rounded-xl shadow-sm border border-red-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-red-800">{t('dangerZone')}</h4>
                        <p className="text-sm text-red-600">{t('resetDesc')}</p>
                    </div>
                </div>
                <button onClick={handleResetData} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">
                    {t('resetData')}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
