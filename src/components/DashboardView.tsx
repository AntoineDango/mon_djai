import React, { useState } from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  PlusCircle,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DashboardStats, Expense, Income, TimeFilter } from '../types/index.ts';
import { formatFCFA, formatDateFr } from '../utils/formatters.ts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onOpenQuickAdd: (type?: 'expense' | 'income') => void;
  onNavigate: (tab: 'expenses' | 'incomes' | 'analytics' | 'settings') => void;
  timeFilter: TimeFilter;
  setTimeFilter: (val: TimeFilter) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  recentExpenses: Expense[];
  recentIncomes: Income[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#64748b'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onOpenQuickAdd,
  onNavigate,
  timeFilter,
  setTimeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  recentExpenses,
  recentIncomes,
}) => {
  const [chartView, setChartView] = useState<'7days' | '30days'>('7days');

  if (loading && !stats) {
    return (
      <div className="space-y-4 py-8 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const threshold = stats?.dailyThreshold || 2000;
  const todayExpense = stats?.todayExpense || 0;
  const isTodayExceeded = todayExpense > threshold;
  const thresholdPercentage = Math.min(100, Math.round((todayExpense / threshold) * 100));

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Time Filter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span>Filtre d'affichage :</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'today', label: "Aujourd'hui" },
              { id: 'week', label: 'Cette semaine' },
              { id: 'month', label: 'Ce mois' },
              { id: 'custom', label: 'Personnalisée' },
              { id: 'all', label: 'Tout' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                timeFilter === filter.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs if custom filter selected */}
      {timeFilter === 'custom' && (
        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Du :</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Au :</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      )}

      {/* 2. Main Solde Disponible Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 md:p-8 shadow-xl shadow-slate-900/20 border border-slate-700/50">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
                <Wallet className="w-4 h-4 text-emerald-400" />
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                Solde disponible net
              </span>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Revenus - Dépenses
            </span>
          </div>

          <div className="mt-2 flex items-baseline space-x-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-mono text-emerald-400">
              {formatFCFA(stats?.balance || 0)}
            </h1>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Total des transactions enregistrées : <strong className="text-slate-200">{stats?.totalTransactions || 0}</strong>
          </p>

          {/* Quick stats row inside card */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Revenus cumulés</p>
              <p className="text-sm sm:text-base font-bold text-teal-300 font-mono">
                {formatFCFA(stats?.totalIncome || 0)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Dépenses cumulées</p>
              <p className="text-sm sm:text-base font-bold text-rose-300 font-mono">
                {formatFCFA(stats?.totalExpense || 0)}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-400 font-medium">Reste ce mois</p>
              <p
                className={`text-sm sm:text-base font-bold font-mono ${
                  (stats?.monthRemaining || 0) >= 0 ? 'text-emerald-300' : 'text-rose-400'
                }`}
              >
                {formatFCFA(stats?.monthRemaining || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DAILY THRESHOLD CONTROL CARD (Mandatory Business Rule) */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isTodayExceeded
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 shadow-md shadow-rose-500/10'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900 shadow-md shadow-emerald-500/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div
              className={`p-2.5 rounded-2xl flex-shrink-0 text-white ${
                isTodayExceeded ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            >
              {isTodayExceeded ? <AlertTriangle className="w-6 h-6 animate-bounce" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Dépenses d'aujourd'hui
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isTodayExceeded
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {isTodayExceeded ? '⚠️ Seuil dépassé' : '✅ Dépenses sous contrôle'}
                </span>
              </div>

              {/* Conditional color: RED if > 2000 FCFA, GREEN if <= 2000 FCFA */}
              <div className="mt-1 flex items-baseline space-x-2">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                    isTodayExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatFCFA(todayExpense)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / Seuil max : <strong>{formatFCFA(threshold)}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:self-center">
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className={`px-3 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                isTodayExceeded ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              + Dépense
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            >
              Ajuster seuil
            </button>
          </div>
        </div>

        {/* Progress bar towards daily threshold */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Consommation du quota journalier : {thresholdPercentage}%</span>
            <span>{isTodayExceeded ? `Dépassement de +${formatFCFA(todayExpense - threshold)}` : `Marge restante : ${formatFCFA(threshold - todayExpense)}`}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTodayExceeded ? 'bg-rose-500' : thresholdPercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${thresholdPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Monthly Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Revenus du Mois */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span className="text-xs font-semibold">Revenus du mois</span>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono text-teal-600 dark:text-teal-400">
            {formatFCFA(stats?.monthIncome || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mois en cours</p>
        </div>

        {/* Total Dépenses du Mois */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mb-1">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold">Dépenses du mois</span>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatFCFA(stats?.monthExpense || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mois en cours</p>
        </div>

        {/* Revenus de la semaine */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mb-1">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold">Revenus semaine</span>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {formatFCFA(stats?.weekIncome || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semaine en cours</p>
        </div>

        {/* Dépenses de la semaine */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mb-1">
            <Layers className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold">Dépenses semaine</span>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatFCFA(stats?.weekExpense || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semaine en cours</p>
        </div>
      </div>

      {/* 5. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Chart (7 days or 30 days) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Évolution des dépenses
              </h3>
            </div>
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => setChartView('7days')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartView === '7days' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white font-bold' : 'text-slate-500'
                }`}
              >
                7 jours
              </button>
              <button
                onClick={() => setChartView('30days')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartView === '30days' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white font-bold' : 'text-slate-500'
                }`}
              >
                30 jours
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartView === '7days' ? stats?.last7Days || [] : stats?.last30Days || []}>
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  formatter={(value: any) => [formatFCFA(Number(value)), 'Dépenses']}
                  labelFormatter={(label) => `Date : ${label}`}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                {/* Seuil 2 000 FCFA Reference Line */}
                <ReferenceLine
                  y={threshold}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{ value: `Seuil ${threshold}`, fill: '#ef4444', fontSize: 10, position: 'top' }}
                />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            La ligne en pointillés rouges indique votre seuil journalier ({formatFCFA(threshold)}).
          </p>
        </div>

        {/* Category Breakdown (Donut Chart) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Répartition par catégorie
              </h3>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 hover:underline"
            >
              <span>Détails</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats && stats.categoryBreakdown.length > 0 ? (
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4">
              <div className="h-56 w-56 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatFCFA(Number(val))}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category legend list */}
              <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-1">
                {stats.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{cat.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatFCFA(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
              <p>Aucune dépense enregistrée sur cette période.</p>
              <button
                onClick={() => onOpenQuickAdd('expense')}
                className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
              >
                + Enregistrer une dépense
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Comparison Revenues vs Expenses (Bar Chart) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Comparaison Revenus vs Dépenses (7 derniers jours)
            </h3>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.last7Days || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatFCFA(Number(val)),
                  name === 'incomes' ? 'Revenus' : 'Dépenses',
                ]}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Legend formatter={(val) => (val === 'incomes' ? 'Revenus' : 'Dépenses')} />
              <Bar dataKey="incomes" fill="#10b981" radius={[6, 6, 0, 0]} name="incomes" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Quick Recent Transactions Preview */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Transactions récentes
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Toutes les dépenses
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => onNavigate('incomes')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Tous les revenus
            </button>
          </div>
        </div>

        {recentExpenses.length === 0 && recentIncomes.length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-xs">
            Aucune transaction pour le moment. Cliquez sur le bouton <strong>+</strong> pour commencer !
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentExpenses.slice(0, 4).map((exp) => (
              <div key={`exp-${exp.id}`} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: exp.categoryColor || '#ef4444' }}
                  >
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {exp.categoryName || 'Dépense'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDateFr(exp.transactionDate)} {exp.transactionTime && `• ${exp.transactionTime}`}
                      {exp.description ? ` • ${exp.description}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                  -{formatFCFA(exp.amount)}
                </span>
              </div>
            ))}

            {recentIncomes.slice(0, 3).map((inc) => (
              <div key={`inc-${inc.id}`} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: inc.sourceColor || '#10b981' }}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {inc.sourceName || 'Revenu'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDateFr(inc.transactionDate)} {inc.transactionTime && `• ${inc.transactionTime}`}
                      {inc.description ? ` • ${inc.description}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                  +{formatFCFA(inc.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
