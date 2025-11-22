
export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  BOOKED = 'BOOKED',
  LOST = 'LOST'
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  GOOGLE_ADS = 'GOOGLE_ADS',
  MANUAL = 'MANUAL'
}

export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  ARRIVED = 'ARRIVED',
  IN_CHAIR = 'IN_CHAIR',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED'
}

export enum LabStatus {
  PENDING = 'PENDING',       // Needs to be sent
  SENT = 'SENT',             // With the runner/courier
  AT_LAB = 'AT_LAB',         // In production
  RECEIVED = 'RECEIVED',     // Back in clinic
  FITTED = 'FITTED'          // In patient's mouth
}

export interface Doctor {
  id: string;
  name: string;
  color: string; // tailwind color class prefix e.g. 'blue'
  active: boolean;
}

export interface LabOrder {
  id: string;
  itemName: string;          // e.g. "Zirconia Crown"
  labName: string;           // e.g. "Muscat Dental Lab"
  sentDate: number;
  dueDate: number;
  status: LabStatus;
  cost: number;              // Cost to clinic
}

export interface Note {
  id: string;
  text: string;
  timestamp: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'CASH' | 'TRANSFER' | 'CARD' | 'CHEQUE';
  date: number;
  note?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  treatmentInterest: string;
  status: LeadStatus;
  source: LeadSource;
  initialMessage?: string; 
  createdAt: number; 
  notes: Note[]; 
  potentialValue: number; 
  lastContacted?: number;
  
  // Classification
  isVip?: boolean; // Manual override for VIP status

  // Clinic Management Fields
  appointmentDate?: number; // Unix timestamp (midnight) for the day of appointment
  appointmentTime?: string; 
  duration?: number; // Duration in minutes (e.g. 30, 60, 90)
  assignedDoctor?: string;
  visitStatus?: VisitStatus; // Track where they are physically
  
  // Lab Tracking
  labOrders: LabOrder[];

  // Financials
  priceQuoted: number;
  payments: Payment[]; // Array of all payments made
  
  // Demographics
  nationalId?: string;
  birthYear?: string;
}

export interface ClinicSettings {
  clinicName: string;
  currency: string;
  startHour: string; // "09:00"
  endHour: string;   // "21:00"
  commissionRate: number; // e.g. 40
}

export interface DashboardStats {
  totalSpend: number;
  totalLeads: number;
  bookedPatients: number;
  costPerLead: number;
  conversionRate: number;
}

export type View = 'LEADS' | 'SCHEDULE' | 'DASHBOARD' | 'SETTINGS' | 'DATABASE' | 'LAB';
