
export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  subscriptionCost: number;
  renewalDate: string;
  isFavorite: boolean;
  website?: string;
  isPaid?: boolean; // Field to track paid/unpaid status
  isExpense?: boolean; // Flag to identify as expense vs AI tool
  frequency?: string; // Frequency of renewal for expenses
}
