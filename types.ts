export interface UserData {
  creditScore: number;
  activeDisputes: number;
  taxSavings: number;
  businessPaydex: number;
  creditHistory: { month: string; score: number }[];
  lastUpdated: string;
}

export type Section = 'dashboard' | 'taxes' | 'personal-credit' | 'business-credit' | 'disputes' | 'ai-chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'monkey';
  text: string;
  timestamp: Date;
}

export interface DisputeItem {
  id: string;
  name: string;
  type: string;
  date: string;
  amount: number;
  probability: number;
}
