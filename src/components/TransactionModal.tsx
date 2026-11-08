import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Calendar, Clock, FileText, Check, Plus } from 'lucide-react';
import { ExpenseCategory, IncomeSource, Expense, Income } from '../types/index.ts';
import { getTodayAbidjan, getCurrentTimeAbidjan, formatFCFA } from '../utils/formatters.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  sources: IncomeSource[];
  onSaveExpense: (data: { id?: number; amount: number; categoryId?: number; description?: string; transactionDate: string; transactionTime: string }) => Promise<void>;
  onSaveIncome: (data: { id?: number; amount: number; sourceId?: number; description?: string; transactionDate: string; transactionTime: string }) => Promise<void>;
  editItem?: { type: 'expense' | 'income'; data: Expense | Income } | null;
  defaultType?: 'expense' | 'income';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  sources,
  onSaveExpense,
  onSaveIncome,
  editItem,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sourceId, setSourceId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayAbidjan());
  const [time, setTime] = useState<string>(getCurrentTimeAbidjan());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setAmount(String(editItem.data.amount));
      setDescription(editItem.data.description || '');
      setDate(editItem.data.transactionDate);
      setTime(editItem.data.transactionTime || getCurrentTimeAbidjan());
      if (editItem.type === 'expense') {
        setCategoryId((editItem.data as Expense).categoryId || undefined);
      } else {
        setSourceId((editItem.data as Income).sourceId || undefined);
      }
    } else {
      setType(defaultType);
      setAmount('');
      setDescription('');
      setDate(getTodayAbidjan());
      setTime(getCurrentTimeAbidjan());
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
      if (sources.length > 0 && !sourceId) {
        setSourceId(sources[0].id);
      }
    }
    setError(null);
  }, [editItem, defaultType, isOpen, categories, sources]);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0 FCFA.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (type === 'expense') {
        await onSaveExpense({
          id: editItem?.type === 'expense' ? editItem.data.id : undefined,
          amount: numAmount,
          categoryId,
          description,
          transactionDate: date,
          transactionTime: time,
        });
      } else {
        await onSaveIncome({
          id: editItem?.type === 'income' ? editItem.data.id : undefined,
          amount: numAmount,
          sourceId,
          description,
          transactionDate: date,
          transactionTime: time,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-xl text-white ${
                type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            >
              {type === 'expense' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editItem ? 'Modifier la transaction' : 'Nouvelle transaction'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {type === 'expense' ? 'Enregistrer une dépense en FCFA' : 'Enregistrer un revenu en FCFA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Type Toggle (Expense vs Income) - disabled if editing */}
          {!editItem && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Dépense</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Revenu</span>
              </button>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Montant (en FCFA) *
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
                className="w-full pl-4 pr-16 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                FCFA
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String((parseInt(amount, 10) || 0) + q))}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                >
                  +{new Intl.NumberFormat('fr-FR').format(q)}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Category (for Expense) or Source (for Income) */}
          {type === 'expense' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Catégorie de dépense *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                      categoryId === cat.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-semibold truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Source du revenu *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sources.map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSourceId(src.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                      sourceId === src.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: src.color }}
                    />
                    <span className="text-xs font-semibold truncate">{src.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date & Time (Africa/Abidjan) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Date de la transaction
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Heure d'enregistrement
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description / Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Description ou commentaire (facultatif)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={type === 'expense' ? 'Ex: Taxi Yango Plateau, Déjeuner...' : 'Ex: Virement reçu, Mission...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={100}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-lg active:scale-98 transition-all disabled:opacity-50 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              {submitting ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editItem ? 'Enregistrer les modifications' : 'Confirmer'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
