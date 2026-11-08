import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ExpensesView } from './components/ExpensesView.tsx';
import { IncomesView } from './components/IncomesView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { ExcelExportModal } from './components/ExcelExportModal.tsx';
import { api } from './api/client.ts';
import {
  UserProfile,
  ExpenseCategory,
  IncomeSource,
  Expense,
  Income,
  DashboardStats,
  TimeFilter,
} from './types/index.ts';
import { getTodayAbidjan } from './utils/formatters.ts';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

function MainApp() {
  const { idToken, user } = useAuth();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // App Data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Time filter for Dashboard
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [customStartDate, setCustomStartDate] = useState(getTodayAbidjan());
  const [customEndDate, setCustomEndDate] = useState(getTodayAbidjan());

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalDefaultType, setTxModalDefaultType] = useState<'expense' | 'income'>('expense');
  const [editingItem, setEditingItem] = useState<{ type: 'expense' | 'income'; data: Expense | Income } | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load all finance data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prof, cats, srcs, exps, incs] = await Promise.all([
        api.getProfile(idToken),
        api.getCategories(idToken),
        api.getSources(idToken),
        api.getExpenses(undefined, idToken),
        api.getIncomes(undefined, idToken),
      ]);

      setProfile(prof);
      setCategories(cats);
      setSources(srcs);
      setExpenses(exps);
      setIncomes(incs);

      // Load dashboard stats
      let start: string | undefined;
      let end: string | undefined;
      const today = getTodayAbidjan();

      if (timeFilter === 'today') {
        start = today;
        end = today;
      } else if (timeFilter === 'week') {
        const d = new Date();
        const dow = (d.getDay() + 6) % 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - dow);
        start = monday.toISOString().split('T')[0];
        end = today;
      } else if (timeFilter === 'month') {
        start = today.substring(0, 7) + '-01';
        end = today;
      } else if (timeFilter === 'custom') {
        start = customStartDate;
        end = customEndDate;
      }

      const dashStats = await api.getDashboard({ startDate: start, endDate: end }, idToken);
      setStats(dashStats);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      showToast(err.message || 'Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  }, [idToken, timeFilter, customStartDate, customEndDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Quick Add Modal
  const handleOpenQuickAdd = (type: 'expense' | 'income' = 'expense') => {
    setEditingItem(null);
    setTxModalDefaultType(type);
    setIsTxModalOpen(true);
  };

  // Save Expense (Create or Update)
  const handleSaveExpense = async (data: { id?: number; amount: number; categoryId?: number; description?: string; transactionDate: string; transactionTime: string }) => {
    if (data.id) {
      await api.updateExpense(data.id, data, idToken);
      showToast('Dépense mise à jour avec succès.');
    } else {
      await api.createExpense(data, idToken);
      showToast('Dépense enregistrée avec succès.');
    }
    await loadData();
  };

  // Save Income (Create or Update)
  const handleSaveIncome = async (data: { id?: number; amount: number; sourceId?: number; description?: string; transactionDate: string; transactionTime: string }) => {
    if (data.id) {
      await api.updateIncome(data.id, data, idToken);
      showToast('Revenu mis à jour avec succès.');
    } else {
      await api.createIncome(data, idToken);
      showToast('Revenu enregistré avec succès.');
    }
    await loadData();
  };

  // Delete Expense
  const handleDeleteExpense = async (id: number) => {
    await api.deleteExpense(id, idToken);
    showToast('Dépense supprimée.');
    await loadData();
  };

  // Delete Income
  const handleDeleteIncome = async (id: number) => {
    await api.deleteIncome(id, idToken);
    showToast('Revenu supprimé.');
    await loadData();
  };

  // Update Threshold
  const handleUpdateThreshold = async (val: number) => {
    const updated = await api.updateThreshold(val, idToken);
    setProfile(updated);
    showToast(`Seuil journalier mis à jour à ${val} FCFA.`);
    await loadData();
  };

  // Category & Source management
  const handleCreateCategory = async (data: { name: string; color?: string; icon?: string }) => {
    await api.createCategory(data, idToken);
    showToast(`Catégorie "${data.name}" ajoutée.`);
    await loadData();
  };

  const handleDeleteCategory = async (id: number) => {
    await api.deleteCategory(id, idToken);
    showToast('Catégorie supprimée.');
    await loadData();
  };

  const handleCreateSource = async (data: { name: string; color?: string }) => {
    await api.createSource(data, idToken);
    showToast(`Source "${data.name}" ajoutée.`);
    await loadData();
  };

  const handleDeleteSource = async (id: number) => {
    await api.deleteSource(id, idToken);
    showToast('Source supprimée.');
    await loadData();
  };

  // Export Excel
  const handleExportExcel = async (period: string, startDate?: string, endDate?: string) => {
    await api.downloadExcel(period, startDate, endDate, idToken);
    showToast('Classeur Excel téléchargé avec succès !');
  };

  // Seed Sample Data
  const handleSeedDemoData = async () => {
    await api.seedSampleData(idToken);
    showToast('Données de démonstration chargées dans PostgreSQL !');
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Header Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-5 pb-16">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            loading={loading}
            onOpenQuickAdd={handleOpenQuickAdd}
            onNavigate={(tab) => setCurrentTab(tab)}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            recentExpenses={expenses}
            recentIncomes={incomes}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            categories={categories}
            dailyThreshold={profile?.dailyThreshold || 2000}
            loading={loading}
            onOpenAddExpense={() => handleOpenQuickAdd('expense')}
            onEditExpense={(exp) => {
              setEditingItem({ type: 'expense', data: exp });
              setIsTxModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === 'incomes' && (
          <IncomesView
            incomes={incomes}
            sources={sources}
            loading={loading}
            onOpenAddIncome={() => handleOpenQuickAdd('income')}
            onEditIncome={(inc) => {
              setEditingItem({ type: 'income', data: inc });
              setIsTxModalOpen(true);
            }}
            onDeleteIncome={handleDeleteIncome}
            onOpenSourcesSettings={() => setCurrentTab('settings')}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            loading={loading}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            onNavigateSettings={() => setCurrentTab('settings')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            profile={profile}
            categories={categories}
            sources={sources}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onUpdateThreshold={handleUpdateThreshold}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
            onCreateSource={handleCreateSource}
            onDeleteSource={handleDeleteSource}
            onOpenExcelModal={() => setIsExcelModalOpen(true)}
            onSeedDemoData={handleSeedDemoData}
          />
        )}
      </main>

      {/* Fixed Bottom Mobile Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
      />

      {/* Transaction Modal (Add / Edit Expense or Income) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingItem(null);
        }}
        categories={categories}
        sources={sources}
        onSaveExpense={handleSaveExpense}
        onSaveIncome={handleSaveIncome}
        editItem={editingItem}
        defaultType={txModalDefaultType}
      />

      {/* Excel Export Modal */}
      <ExcelExportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onExport={handleExportExcel}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 animate-slideDown">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
