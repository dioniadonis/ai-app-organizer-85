
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
}
