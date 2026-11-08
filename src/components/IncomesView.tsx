import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  DollarSign,
  PieChart as PieIcon,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { Income, IncomeSource } from '../types/index.ts';
import { formatFCFA, formatDateFr, getTodayAbidjan } from '../utils/formatters.ts';

interface IncomesViewProps {
  incomes: Income[];
  sources: IncomeSource[];
  loading: boolean;
  onOpenAddIncome: () => void;
  onEditIncome: (inc: Income) => void;
  onDeleteIncome: (id: number) => Promise<void>;
  onOpenSourcesSettings: () => void;
}

export const IncomesView: React.FC<IncomesViewProps> = ({
  incomes,
  sources,
  loading,
  onOpenAddIncome,
  onEditIncome,
  onDeleteIncome,
  onOpenSourcesSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<number | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const todayStr = getTodayAbidjan();

  // Weekly starting Monday
  const mondayStr = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    return monday.toISOString().split('T')[0];
  }, []);

  const currentMonthPrefix = todayStr.substring(0, 7);

  // Key totals
  const todayIncome = useMemo(() => {
    return incomes.filter((i) => i.transactionDate === todayStr).reduce((sum, i) => sum + i.amount, 0);
  }, [incomes, todayStr]);

  const weekIncome = useMemo(() => {
    return incomes.filter((i) => i.transactionDate >= mondayStr && i.transactionDate <= todayStr).reduce((sum, i) => sum + i.amount, 0);
  }, [incomes, mondayStr, todayStr]);

  const monthIncome = useMemo(() => {
    return incomes.filter((i) => i.transactionDate.startsWith(currentMonthPrefix)).reduce((sum, i) => sum + i.amount, 0);
  }, [incomes, currentMonthPrefix]);

  const totalAllTime = useMemo(() => {
    return incomes.reduce((sum, i) => sum + i.amount, 0);
  }, [incomes]);

  // Breakdown by source
  const sourceBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; color: string; amount: number; count: number }>();
    for (const inc of incomes) {
      const name = inc.sourceName || 'Non spécifié';
      const color = inc.sourceColor || '#10b981';
      const cur = map.get(name) || { name, color, amount: 0, count: 0 };
      cur.amount += inc.amount;
      cur.count += 1;
      map.set(name, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [incomes]);

  // Filtered incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter((inc) => {
      const matchesSearch =
        !searchTerm ||
        (inc.description && inc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inc.sourceName && inc.sourceName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSource = selectedSource === 'all' || inc.sourceId === selectedSource;
      return matchesSearch && matchesSource;
    });
  }, [incomes, searchTerm, selectedSource]);

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      await onDeleteIncome(id);
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Gestion des Revenus
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-900">
              {incomes.length} rentrées
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Suivi des rémunérations, missions (GLM, Solidarity, Stage...) et entrées de fonds
          </p>
        </div>

        <button
          onClick={onOpenAddIncome}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau revenu</span>
        </button>
      </div>

      {/* Income Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aujourd'hui</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
            {formatFCFA(todayIncome)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Revenus du jour</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cette semaine</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatFCFA(weekIncome)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semaine active</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ce mois</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {formatFCFA(monthIncome)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mois en cours</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cumul global</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatFCFA(totalAllTime)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tous les revenus</p>
        </div>
      </div>

      {/* Sources Overview Section */}
      {sourceBreakdown.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Provenance des revenus
            </h3>
            <button
              onClick={onOpenSourcesSettings}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Gérer les sources
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {sourceBreakdown.map((src, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: src.color }} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{src.name}</span>
                </div>
                <p className="text-sm font-mono font-extrabold text-teal-600 dark:text-teal-400">
                  {formatFCFA(src.amount)}
                </p>
                <p className="text-[10px] text-slate-400">{src.count} versement(s)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Source Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par description ou source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Source Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSource === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Toutes les sources
          </button>
          {sources.map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 border transition-colors ${
                selectedSource === src.id
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: src.color }} />
              <span>{src.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Incomes List */}
      {filteredIncomes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Aucun revenu enregistré
          </p>
          <p className="text-xs text-slate-400">
            Enregistrez vos salaires, primes ou indemnités (GLM, Solidarity, CIC, etc.).
          </p>
          <button
            onClick={onOpenAddIncome}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs"
          >
            + Enregistrer un revenu
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filteredIncomes.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center space-x-3.5 truncate">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: item.sourceColor || '#10b981' }}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.sourceName || 'Revenu'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateFr(item.transactionDate)}</span>
                    </span>
                    {item.transactionTime && (
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.transactionTime}</span>
                      </span>
                    )}
                  </div>
                  {item.description ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic mt-0.5">Aucun commentaire</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
                <span className="font-mono font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                  +{formatFCFA(item.amount)}
                </span>

                {/* Edit & Delete actions */}
                <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditIncome(item)}
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
                Supprimer le revenu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Êtes-vous certain de vouloir supprimer cette rentrée financière ? Le solde global sera recalculé automatiquement.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
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
