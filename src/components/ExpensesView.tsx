import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Clock,
  Tag,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../types/index.ts';
import { formatFCFA, formatDateFr, getTodayAbidjan } from '../utils/formatters.ts';

interface ExpensesViewProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  dailyThreshold: number;
  loading: boolean;
  onOpenAddExpense: () => void;
  onEditExpense: (exp: Expense) => void;
  onDeleteExpense: (id: number) => Promise<void>;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  categories,
  dailyThreshold,
  loading,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Group expenses by transaction date
  const groupedExpenses = useMemo(() => {
    // 1. Filter by search and category
    const filtered = expenses.filter((exp) => {
      const matchesSearch =
        !searchTerm ||
        (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.categoryName && exp.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || exp.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 2. Group by Date
    const groups: { date: string; displayDate: string; totalAmount: number; isExceeded: boolean; items: Expense[] }[] = [];
    const map = new Map<string, Expense[]>();

    for (const exp of filtered) {
      const date = exp.transactionDate;
      const list = map.get(date) || [];
      list.push(exp);
      map.set(date, list);
    }

    // Sort dates descending
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

    const todayStr = getTodayAbidjan();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    for (const d of sortedDates) {
      const items = map.get(d) || [];
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      let displayDate = formatDateFr(d);
      if (d === todayStr) displayDate = `Aujourd'hui (${formatDateFr(d)})`;
      else if (d === yesterdayStr) displayDate = `Hier (${formatDateFr(d)})`;

      groups.push({
        date: d,
        displayDate,
        totalAmount,
        isExceeded: totalAmount > dailyThreshold,
        items,
      });
    }

    return groups;
  }, [expenses, searchTerm, selectedCategory, dailyThreshold]);

  // Overall totals
  const totalFilteredAmount = useMemo(() => {
    return groupedExpenses.reduce((sum, group) => sum + group.totalAmount, 0);
  }, [groupedExpenses]);

  // Today's total specifically
  const todayStr = getTodayAbidjan();
  const todayTotal = useMemo(() => {
    return expenses
      .filter((e) => e.transactionDate === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const isTodayExceeded = todayTotal > dailyThreshold;

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      await onDeleteExpense(id);
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header and Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Gestion des Dépenses
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
              {expenses.length} dépenses
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Suivi quotidien et contrôle du seuil journalier ({formatFCFA(dailyThreshold)})
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle dépense</span>
        </button>
      </div>

      {/* Threshold Status Banner for Today */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isTodayExceeded
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl text-white ${
              isTodayExceeded ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          >
            {isTodayExceeded ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Cumul des dépenses d'aujourd'hui :
            </p>
            <p
              className={`text-xl font-extrabold font-mono ${
                isTodayExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatFCFA(todayTotal)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">
                (Seuil fixé à {formatFCFA(dailyThreshold)})
              </span>
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-xl self-start sm:self-auto ${
            isTodayExceeded
              ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {isTodayExceeded ? '⚠️ Seuil journalier dépassé' : '✅ Dépenses sous contrôle'}
        </span>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par description, lieu ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 border transition-colors ${
                selectedCategory === cat.id
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Total Filtered Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Affichage de {groupedExpenses.length} jour(s) actif(s)</span>
        <span>
          Total sélectionné : <strong className="font-mono text-slate-900 dark:text-white font-bold">{formatFCFA(totalFilteredAmount)}</strong>
        </span>
      </div>

      {/* Grouped Expenses List with Strict Daily Conditional Formatting */}
      {groupedExpenses.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <TrendingDown className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Aucune dépense trouvée
          </p>
          <p className="text-xs text-slate-400">
            Ajoutez une première dépense pour débuter le suivi de vos finances en FCFA.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs"
          >
            + Enregistrer une dépense
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedExpenses.map((group) => {
            // STRICT CONDITIONAL FORMATTING RULE:
            // > 2000 FCFA => RED
            // <= 2000 FCFA => GREEN
            const isExceeded = group.isExceeded;

            return (
              <div
                key={group.date}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Group Date Header with Conditional Total */}
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between ${
                    isExceeded
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {group.displayDate}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({group.items.length} dépense{group.items.length > 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Day Cumulative Total with Conditional Color (RED > 2000 vs GREEN <= 2000) */}
                  <div className="flex items-center space-x-2">
                    {isExceeded ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>Seuil dépassé</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Sous contrôle</span>
                      </span>
                    )}

                    <span
                      className={`font-mono font-extrabold text-sm sm:text-base ${
                        isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatFCFA(group.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Individual Transactions for this day */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: item.categoryColor || '#ef4444' }}
                        >
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                              {item.categoryName || 'Dépense'}
                            </span>
                            {item.transactionTime && (
                              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.transactionTime}</span>
                              </span>
                            )}
                          </div>
                          {item.description ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {item.description}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">Pas de commentaire</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {formatFCFA(item.amount)}
                        </span>

                        {/* Edit & Delete actions */}
                        <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditExpense(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Êtes-vous certain de vouloir supprimer cette dépense ? Cette action est irréversible dans la base de données.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
