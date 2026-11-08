import {
  UserProfile,
  ExpenseCategory,
  IncomeSource,
  Expense,
  Income,
  DashboardStats,
} from '../types/index.ts';

function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Default to Antoine DANGO profile so PostgreSQL operations succeed seamlessly
    headers['x-user-id'] = 'antoine-dango-default';
    headers['x-user-email'] = 'antoinedango@gmail.com';
    headers['x-user-name'] = 'Antoine DANGO';
  }
  return headers;
}

export const api = {
  async getProfile(token?: string | null): Promise<UserProfile> {
    const res = await fetch('/api/user/profile', { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Impossible de charger le profil.');
    return res.json();
  },

  async updateThreshold(dailyThreshold: number, token?: string | null): Promise<UserProfile> {
    const res = await fetch('/api/user/threshold', {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ dailyThreshold }),
    });
    if (!res.ok) throw new Error('Échec de la mise à jour du seuil.');
    return res.json();
  },

  async getCategories(token?: string | null): Promise<ExpenseCategory[]> {
    const res = await fetch('/api/categories', { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Impossible de charger les catégories.');
    return res.json();
  },

  async createCategory(data: { name: string; color?: string; icon?: string }, token?: string | null): Promise<ExpenseCategory> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la création de la catégorie.');
    }
    return res.json();
  },

  async deleteCategory(id: number, token?: string | null): Promise<{ success: boolean }> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erreur lors de la suppression de la catégorie.');
    return res.json();
  },

  async getSources(token?: string | null): Promise<IncomeSource[]> {
    const res = await fetch('/api/sources', { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Impossible de charger les sources.');
    return res.json();
  },

  async createSource(data: { name: string; color?: string }, token?: string | null): Promise<IncomeSource> {
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la création de la source.');
    }
    return res.json();
  },

  async updateSource(id: number, data: { name: string; color?: string }, token?: string | null): Promise<IncomeSource> {
    const res = await fetch(`/api/sources/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur lors de la modification de la source.');
    return res.json();
  },

  async deleteSource(id: number, token?: string | null): Promise<{ success: boolean }> {
    const res = await fetch(`/api/sources/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erreur lors de la suppression de la source.');
    return res.json();
  },

  async getExpenses(filters?: { startDate?: string; endDate?: string; categoryId?: number }, token?: string | null): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.categoryId) params.set('categoryId', String(filters.categoryId));
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`/api/expenses${query}`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Impossible de charger les dépenses.');
    return res.json();
  },

  async createExpense(data: { amount: number; categoryId?: number; description?: string; transactionDate?: string; transactionTime?: string }, token?: string | null): Promise<Expense> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de l\'enregistrement de la dépense.');
    }
    return res.json();
  },

  async updateExpense(id: number, data: { amount: number; categoryId?: number; description?: string; transactionDate: string; transactionTime?: string }, token?: string | null): Promise<Expense> {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la modification de la dépense.');
    }
    return res.json();
  },

  async deleteExpense(id: number, token?: string | null): Promise<{ success: boolean }> {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erreur lors de la suppression de la dépense.');
    return res.json();
  },

  async getIncomes(filters?: { startDate?: string; endDate?: string; sourceId?: number }, token?: string | null): Promise<Income[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.sourceId) params.set('sourceId', String(filters.sourceId));
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`/api/incomes${query}`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Impossible de charger les revenus.');
    return res.json();
  },

  async createIncome(data: { amount: number; sourceId?: number; description?: string; transactionDate?: string; transactionTime?: string }, token?: string | null): Promise<Income> {
    const res = await fetch('/api/incomes', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de l\'enregistrement du revenu.');
    }
    return res.json();
  },

  async updateIncome(id: number, data: { amount: number; sourceId?: number; description?: string; transactionDate: string; transactionTime?: string }, token?: string | null): Promise<Income> {
    const res = await fetch(`/api/incomes/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la modification du revenu.');
    }
    return res.json();
  },

  async deleteIncome(id: number, token?: string | null): Promise<{ success: boolean }> {
    const res = await fetch(`/api/incomes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erreur lors de la suppression du revenu.');
    return res.json();
  },

  async getDashboard(filters?: { startDate?: string; endDate?: string }, token?: string | null): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`/api/dashboard${query}`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Impossible de charger les statistiques du tableau de bord.');
    return res.json();
  },

  async downloadExcel(period: string, startDate?: string, endDate?: string, token?: string | null): Promise<void> {
    const params = new URLSearchParams({ period });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    else {
      headers['x-user-id'] = 'antoine-dango-default';
      headers['x-user-email'] = 'antoinedango@gmail.com';
    }

    const res = await fetch(`/api/export-excel?${params.toString()}`, { headers });
    if (!res.ok) throw new Error('Erreur lors de l\'exportation Excel.');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mon_Djai_Export_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async seedSampleData(token?: string | null): Promise<{ message: string }> {
    const res = await fetch('/api/seed-sample-data', {
      method: 'POST',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Échec de l\'initialisation des données démo.');
    return res.json();
  },
};
