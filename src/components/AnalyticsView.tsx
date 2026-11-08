import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Percent,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { DashboardStats, TimeFilter } from '../types/index.ts';
import { formatFCFA } from '../utils/formatters.ts';

interface AnalyticsViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  timeFilter: TimeFilter;
  setTimeFilter: (val: TimeFilter) => void;
  onNavigateSettings: () => void;
}

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#64748b'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  loading,
  timeFilter,
  setTimeFilter,
  onNavigateSettings,
}) => {
  if (loading && !stats) {
    return (
      <div className="space-y-4 py-8 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const habits = stats?.habitsAnalysis;
  const consumptionRate = habits?.consumptionRate || 0;
  const savingsRate = habits?.savingsRate || 0;
  const momGrowth = habits?.monthOverMonthExpenseGrowth || 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Analyse des Habitudes Financières
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprenez où va votre Djai, optimisez vos dépenses et boostez votre capacité d'épargne en FCFA.
        </p>
      </div>

      {/* 1. KEY CONSUMPTION INDICATORS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top Spending Category */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3.5">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Catégorie la plus dépensière
            </p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {habits?.topExpenseCategory || 'Aucune dépense'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Premier poste de consommation globale
            </p>
          </div>
        </div>

        {/* Daily Average Expense */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Moyenne des dépenses quotidiennes
            </p>
            <p className="text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {formatFCFA(habits?.dailyAverageExpense || 0)}
              <span className="text-xs font-normal text-slate-400"> / jour actif</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Seuil fixé à {formatFCFA(stats?.dailyThreshold || 2000)}
            </p>
          </div>
        </div>

        {/* Highest Expense Day of Week */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Jour où je dépense le plus
            </p>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {habits?.highestExpenseDayOfWeek || 'Non déterminé'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pic hebdomadaire constaté
            </p>
          </div>
        </div>
      </div>

      {/* 2. SAVINGS & CONSUMPTION RATE GAUGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Taux de consommation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Part des revenus consommés
              </h3>
            </div>
            <span className="text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400">
              {consumptionRate}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                consumptionRate > 90 ? 'bg-rose-500' : consumptionRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, consumptionRate)}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vous avez dépensé <strong>{formatFCFA(stats?.monthExpense || 0)}</strong> sur les{' '}
            <strong>{formatFCFA(stats?.monthIncome || 0)}</strong> perçus ce mois-ci.
          </p>
        </div>

        {/* Taux d'épargne */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Part des revenus économisés (Épargne)
              </h3>
            </div>
            <span className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {savingsRate}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Montant restant préservé ce mois-ci :{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {formatFCFA(stats?.monthRemaining || 0)}
            </strong>
          </p>
        </div>
      </div>

      {/* 3. MONTH OVER MONTH TREND */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Évolution d'un mois à l'autre
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparaison des dépenses de ce mois par rapport au mois précédent
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Mois précédent</p>
            <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {formatFCFA(habits?.prevMonthExpenses || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Mois en cours</p>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {formatFCFA(stats?.monthExpense || 0)}
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center space-x-1 ${
              momGrowth > 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {momGrowth > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{momGrowth > 0 ? `+${momGrowth}%` : `${momGrowth}%`}</span>
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL ADVICE & THRESHOLD OPTIMIZATION */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-4">
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Conseil d'Antoine DANGO pour optimiser votre Djai
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {stats && stats.isThresholdExceeded
              ? `Votre total d'aujourd'hui (${formatFCFA(stats.todayExpense)}) a dépassé votre seuil journalier de ${formatFCFA(stats.dailyThreshold)}. Pensez à limiter les dépenses discrétionnaires pour les prochaines 24h afin de rétablir la moyenne !`
              : `Félicitations ! Vos dépenses journalières actuelles (${formatFCFA(stats?.todayExpense || 0)}) sont bien en-dessous du seuil maximal de ${formatFCFA(stats?.dailyThreshold || 2000)}. Vous maintenez une excellente discipline budgétaire.`}
          </p>
        </div>
      </div>
    </div>
  );
};
