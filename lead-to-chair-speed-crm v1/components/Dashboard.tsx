
import React, { useEffect, useState } from 'react';
import { Lead, LeadStatus, LeadSource, ClinicSettings } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { analyzePerformance } from '../services/geminiService';
import { BrainCircuit, TrendingUp, Users, Wallet, Stethoscope, DollarSign, Calendar, ChevronDown, ArrowUpRight, ArrowDownRight, Target, Sparkles } from 'lucide-react';
import GoogleDateRangePicker from './GoogleDateRangePicker';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  leads: Lead[];
  totalSpend: number;
  settings: ClinicSettings;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
const SOURCE_COLORS = {
    [LeadSource.GOOGLE_ADS]: '#3B82F6',
    [LeadSource.WEBSITE]: '#10B981',
    [LeadSource.MANUAL]: '#6366F1'
};

const Dashboard: React.FC<DashboardProps> = ({ leads, totalSpend, settings }) => {
  const { t, language } = useLanguage();
  const [aiInsight, setAiInsight] = useState<string>(t('loading'));
  
  const [dateLabel, setDateLabel] = useState(t('thisWeek'));
  const [start, setStart] = useState<number>(() => {
    const d = new Date();
    const day = d.getDay() || 7;
    if (day !== 1) d.setHours(-24 * (day - 1));
    d.setHours(0,0,0,0);
    return d.getTime();
  });
  const [end, setEnd] = useState<number>(() => {
     const d = new Date();
     d.setHours(23,59,59,999);
     return d.getTime();
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const leadsInRange = leads.filter(l => l.createdAt >= start && l.createdAt <= end);
  const bookedInRange = leadsInRange.filter(l => l.status === LeadStatus.BOOKED);
  
  // --- Financial Calculations ---
  let collectedRevenue = 0;
  const revenueByDoctor: Record<string, number> = {};
  const revenueByDate: Record<string, number> = {};
  const revenueBySource: Record<string, number> = {};
  const revenueByTreatment: Record<string, number> = {};

  leads.forEach(lead => {
    lead.payments.forEach(payment => {
      if (payment.date >= start && payment.date <= end) {
        collectedRevenue += payment.amount;
        
        // Doctor Attribution
        if (lead.assignedDoctor) {
           revenueByDoctor[lead.assignedDoctor] = (revenueByDoctor[lead.assignedDoctor] || 0) + payment.amount;
        }
        
        // Date Trend
        const dateKey = new Date(payment.date).toLocaleDateString('en-US'); // Consistent key
        revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + payment.amount;

        // Source Attribution
        const source = lead.source || LeadSource.MANUAL;
        revenueBySource[source] = (revenueBySource[source] || 0) + payment.amount;

        // Treatment Attribution
        if (lead.treatmentInterest) {
            revenueByTreatment[lead.treatmentInterest] = (revenueByTreatment[lead.treatmentInterest] || 0) + payment.amount;
        }
      }
    });
  });

  // --- Estimated Ad Spend Logic ---
  const daysDifference = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const estimatedSpend = parseFloat(((totalSpend / 30) * daysDifference).toFixed(2));
  
  // --- Net Profit Logic ---
  // Net Profit = Gross Revenue - (Doctor Commission) - Ad Spend
  const commissionDecimal = settings.commissionRate / 100;
  const totalCommission = collectedRevenue * commissionDecimal;
  const netProfit = collectedRevenue - totalCommission - estimatedSpend;
  
  const conversionRate = leadsInRange.length > 0 ? ((bookedInRange.length / leadsInRange.length) * 100).toFixed(1) : '0';
  const costPerLead = leadsInRange.length > 0 ? (estimatedSpend / leadsInRange.length).toFixed(2) : '0';
  const avgTicket = bookedInRange.length > 0 ? (collectedRevenue / bookedInRange.length).toFixed(0) : '0';

  // --- Chart Data Prep ---
  const trendData = Object.keys(revenueByDate).map(date => ({
      date: new Date(date).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', { month: 'short', day: 'numeric' }),
      revenue: revenueByDate[date]
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const sourceData = [
      { name: t('googleAds'), revenue: revenueBySource[LeadSource.GOOGLE_ADS] || 0, spend: estimatedSpend, fill: SOURCE_COLORS[LeadSource.GOOGLE_ADS] },
      { name: t('website'), revenue: revenueBySource[LeadSource.WEBSITE] || 0, spend: 0, fill: SOURCE_COLORS[LeadSource.WEBSITE] },
      { name: t('walkIn'), revenue: revenueBySource[LeadSource.MANUAL] || 0, spend: 0, fill: SOURCE_COLORS[LeadSource.MANUAL] }
  ];

  const treatmentData = Object.entries(revenueByTreatment)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

  useEffect(() => {
    const fetchInsight = async () => {
      if (leadsInRange.length > 0) {
         const insight = await analyzePerformance(leadsInRange, estimatedSpend);
         setAiInsight(insight);
      } else {
         setAiInsight("No data available for AI analysis in this period.");
      }
    };
    fetchInsight();
  }, [start, end]);

  const MetricCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
         <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color === 'emerald' ? 'text-emerald-600' : color === 'blue' ? 'text-blue-600' : 'text-indigo-600'}`}>
            <Icon className="w-16 h-16" />
         </div>
         
         <div className="flex justify-between items-start mb-2 relative z-10">
            <div className={`p-2 rounded-xl ${color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : color === 'blue' ? 'bg-blue-100 text-blue-600' : color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            )}
         </div>
         
         <div className="relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">{subValue}</p>
         </div>
      </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative max-w-[1600px] mx-auto">
      
      <GoogleDateRangePicker 
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialStartDate={new Date(start)}
        initialEndDate={new Date(end)}
        onApply={(range) => {
          setStart(range.startDate.getTime());
          setEnd(range.endDate.getTime());
          setDateLabel(range.label || 'Custom Range');
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600" /> {t('analyticsTitle')}
            </h2>
            <p className="text-gray-500 text-sm">{t('analyticsSub')}</p>
          </div>

          <div className="relative z-20">
              <button 
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 text-sm font-bold text-gray-700 transition-all"
              >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  {dateLabel}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
          </div>
      </div>
      
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard 
            title={t('cashCollected')} 
            value={`${collectedRevenue} ${settings.currency}`} 
            subValue={t('actualMoney')}
            icon={Wallet}
            color="blue"
            trend={12} // Mock trend for visual
         />
         <MetricCard 
            title={t('netProfit')} 
            value={`${netProfit.toFixed(0)} ${settings.currency}`} 
            subValue={t('profitDesc')}
            icon={TrendingUp}
            color="emerald"
            trend={8}
         />
         <MetricCard 
            title={t('conversion')} 
            value={`${conversionRate}%`} 
            subValue={`${bookedInRange.length} / ${leadsInRange.length} leads`}
            icon={Users}
            color="indigo"
         />
         <MetricCard 
            title={t('estSpend')} 
            value={`${estimatedSpend} ${settings.currency}`} 
            subValue={t('budget')}
            icon={DollarSign}
            color="amber"
            trend={-2} 
         />
      </div>

      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-6 opacity-10">
            <BrainCircuit className="w-32 h-32" />
         </div>
         <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">{t('aiAnalyst')}</h3>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-3xl">{aiInsight}</p>
            </div>
         </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Revenue Trend - Takes up 2 columns */}
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" /> {t('revenueTrend')}
                </h3>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Marketing ROI - Takes up 1 column */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" /> {t('marketingRoi')}
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#4B5563', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="spend" name="Ad Spend" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Bottom Row: Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Treatments */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
             <h3 className="font-bold text-gray-800 mb-6">{t('topTreatments')}</h3>
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-80">
                {treatmentData.length === 0 && <p className="text-center text-gray-400 py-10">{t('noResults')}</p>}
                {treatmentData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-gray-500 border border-gray-200">
                                {idx + 1}
                            </div>
                            <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                        </div>
                        <span className="font-bold text-indigo-600">{item.value} {settings.currency}</span>
                    </div>
                ))}
             </div>
          </div>

          {/* Doctor Performance */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800">{t('doctorPayouts')}</h3>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{settings.commissionRate}% {t('commission')}</span>
             </div>
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-80">
                {Object.entries(revenueByDoctor).map(([docName, revenue], idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{docName}</p>
                                <p className="text-xs text-gray-400">{t('generated')}: {revenue} {settings.currency}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-emerald-600 text-lg">{(revenue * commissionDecimal).toFixed(0)} {settings.currency}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{t('commission')}</p>
                        </div>
                    </div>
                ))}
             </div>
          </div>

      </div>
    </div>
  );
};

export default Dashboard;
