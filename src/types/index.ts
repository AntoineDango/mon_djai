export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  dailyThreshold: number;
}

export interface ExpenseCategory {
  id: number;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

export interface IncomeSource {
  id: number;
  userId: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Expense {
  id: number;
  userId: string;
  amount: number;
  categoryId?: number | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  description?: string | null;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: number;
  userId: string;
  amount: number;
  sourceId?: number | null;
  sourceName?: string | null;
  sourceColor?: string | null;
  description?: string | null;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBreakdown {
  name: string;
  color: string;
  amount: number;
  count: number;
}

export interface SourceBreakdown {
  name: string;
  color: string;
  amount: number;
  count: number;
}

export interface DayHistoryItem {
  date: string;
  displayDate: string;
  expenses: number;
  incomes: number;
  threshold: number;
  isExceeded: boolean;
}

export interface HabitsAnalysis {
  topExpenseCategory: string;
  dailyAverageExpense: number;
  highestExpenseDayOfWeek: string;
  consumptionRate: number; // in %
  savingsRate: number; // in %
  monthOverMonthExpenseGrowth: number; // in %
  prevMonthExpenses: number;
  prevMonthIncomes: number;
}

export interface DashboardStats {
  dailyThreshold: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthIncome: number;
  monthExpense: number;
  monthRemaining: number;
  todayExpense: number;
  isThresholdExceeded: boolean;
  weekIncome: number;
  weekExpense: number;
  totalTransactions: number;
  categoryBreakdown: CategoryBreakdown[];
  sourceBreakdown: SourceBreakdown[];
  last7Days: DayHistoryItem[];
  last30Days: DayHistoryItem[];
  dailyTotalsMap: Record<string, number>;
  habitsAnalysis: HabitsAnalysis;
}

export type TimeFilter = 'today' | 'week' | 'month' | 'custom' | 'all';
