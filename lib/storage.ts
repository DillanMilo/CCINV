// Purpose: Supabase storage for cross-device sync with simple authentication
import { supabase, SYNC_KEY } from './supabase-client';

const STORAGE_KEY = 'ccinv-data';

export interface AppData {
  expenses: Expense[];
  income: Income[];
  invoices: Invoice[];
  profile: Profile;
  lastSync: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  merchant?: string;
  date: string;
  created_at: string;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid';
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  tax_rate: number;
  discount: number;
}

export interface Profile {
  company_name: string;
  ein: string;
  tax_number: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  logo_url: string;
}

// Initialize default data
const defaultData: AppData = {
  expenses: [],
  income: [],
  invoices: [],
  profile: {
    company_name: 'Creative Currents',
    ein: '',
    tax_number: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    logo_url: '',
  },
  lastSync: new Date().toISOString(),
};

// Local storage fallback
function getLocalData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
}

function setLocalData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Supabase storage functions
export async function loadData(): Promise<AppData> {
  try {
    // Try to load from Supabase first
    const { data: supabaseData, error } = await supabase
      .from('app_data')
      .select('*')
      .eq('sync_key', SYNC_KEY)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase load error:', error);
      return getLocalData();
    }

    if (supabaseData) {
      const parsedData = JSON.parse(supabaseData.data);
      setLocalData(parsedData); // Cache locally
      return parsedData;
    }

    // Fallback to local storage
    return getLocalData();
  } catch (error) {
    console.error('Failed to load data from Supabase:', error);
    return getLocalData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    data.lastSync = new Date().toISOString();
    
    // Save to local storage first (for immediate feedback)
    setLocalData(data);
    
    // Save to Supabase for cross-device sync
    const { error } = await supabase
      .from('app_data')
      .upsert({
        sync_key: SYNC_KEY,
        data: JSON.stringify(data),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'sync_key'
      });

    if (error) {
      console.error('Supabase save error:', error);
      // Data is still saved locally, so app continues to work
    }
  } catch (error) {
    console.error('Failed to save data to Supabase:', error);
    setLocalData(data); // Ensure local backup
  }
}

// Helper functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
