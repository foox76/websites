
import React from 'react';
import { Lead, LabStatus } from '../types';
import { Package, Truck, CheckCircle, Clock, Phone, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LabManagerProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, orderId: string, newStatus: LabStatus) => void;
}

const LabCard: React.FC<{ order: any; onUpdateStatus: (leadId: string, orderId: string, status: LabStatus) => void }> = ({ order, onUpdateStatus }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-3 group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{order.itemName}</h4>
          <p className="text-xs text-gray-500">{order.leadName}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
          order.status === LabStatus.RECEIVED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
          order.status === LabStatus.AT_LAB ? 'bg-blue-100 text-blue-700 border-blue-200' :
          'bg-gray-100 text-gray-600 border-gray-200'
        }`}>
          {order.labName}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t('dueDate')}: {new Date(order.dueDate).toLocaleDateString()}</span>
        {order.assignedDoctor && <span className="flex items-center gap-1 text-indigo-400 font-medium">{order.assignedDoctor}</span>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-50">
        {order.status === LabStatus.PENDING && (
          <button 
            onClick={() => onUpdateStatus(order.leadId, order.id, LabStatus.AT_LAB)}
            className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700"
          >
            {t('markSent')}
          </button>
        )}
        {(order.status === LabStatus.SENT || order.status === LabStatus.AT_LAB) && (
          <button 
            onClick={() => onUpdateStatus(order.leadId, order.id, LabStatus.RECEIVED)}
            className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-3 h-3" /> {t('markReceived')}
          </button>
        )}
        {order.status === LabStatus.RECEIVED && (
          <button 
             onClick={() => window.open(`https://wa.me/${order.leadPhone}?text=Hi ${order.leadName}, your ${order.itemName} is ready!`, '_blank')}
             className="flex-1 py-1.5 bg-white border border-emerald-200 text-emerald-600 text-xs font-bold rounded hover:bg-emerald-50 flex items-center justify-center gap-1"
          >
            <Phone className="w-3 h-3" /> {t('notifyPatient')}
          </button>
        )}
      </div>
    </div>
  );
};

const LabManager: React.FC<LabManagerProps> = ({ leads, onUpdateStatus }) => {
  const { t } = useLanguage();
  
  // Flatten all orders to list them easily
  const allOrders = leads.flatMap(lead => 
    lead.labOrders.map(order => ({ ...order, leadName: lead.name, leadPhone: lead.phone, leadId: lead.id, assignedDoctor: lead.assignedDoctor }))
  );

  const filterOrders = (status: LabStatus) => allOrders.filter(o => o.status === status);

  const pendingOrders = filterOrders(LabStatus.PENDING);
  const atLabOrders = [...filterOrders(LabStatus.SENT), ...filterOrders(LabStatus.AT_LAB)];
  const receivedOrders = filterOrders(LabStatus.RECEIVED);

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="mb-6 px-1">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-600" /> {t('labInventoryManager')}
        </h2>
        <p className="text-gray-500 text-sm">{t('trackProsthetics')}</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-[900px] h-full items-start">
          
          {/* To Send */}
          <div className="flex-1 bg-gray-100/50 rounded-xl p-4 flex flex-col h-full border border-gray-200/50">
            <div className="flex items-center gap-2 mb-4 text-gray-600 font-bold">
              <Clock className="w-5 h-5" />
              <h3>{t('toSendPending')}</h3>
              <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {pendingOrders.map(order => <LabCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />)}
              {pendingOrders.length === 0 && <div className="text-center text-xs text-gray-400 py-10 italic">{t('noPendingOrders')}</div>}
            </div>
          </div>

          {/* At Lab */}
          <div className="flex-1 bg-blue-50/50 rounded-xl p-4 flex flex-col h-full border border-blue-100">
            <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
              <Truck className="w-5 h-5" />
              <h3>{t('inProduction')}</h3>
              <span className="ml-auto bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">{atLabOrders.length}</span>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
               {atLabOrders.map(order => <LabCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />)}
               {atLabOrders.length === 0 && <div className="text-center text-xs text-blue-300 py-10 italic">{t('nothingAtLab')}</div>}
            </div>
          </div>

          {/* Ready */}
          <div className="flex-1 bg-emerald-50/50 rounded-xl p-4 flex flex-col h-full border border-emerald-100">
            <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold">
              <CheckCircle className="w-5 h-5" />
              <h3>{t('readyInClinic')}</h3>
              <span className="ml-auto bg-emerald-200 text-emerald-800 text-xs px-2 py-0.5 rounded-full">{receivedOrders.length}</span>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {receivedOrders.map(order => <LabCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} />)}
              {receivedOrders.length === 0 && <div className="text-center text-xs text-emerald-300 py-10 italic">{t('noItemsWaiting')}</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LabManager;
