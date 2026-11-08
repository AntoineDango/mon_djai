import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  FileText,
  Check,
  Plus,
  Tag,
  Briefcase,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ExpenseCategory, IncomeSource, Expense, Income } from '../types/index.ts';
import { getTodayAbidjan, getCurrentTimeAbidjan, formatFCFA } from '../utils/formatters.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  sources: IncomeSource[];
  onSaveExpense: (data: {
    id?: number;
    amount: number;
    categoryId?: number;
    description?: string;
    transactionDate: string;
    transactionTime: string;
  }) => Promise<void>;
  onSaveIncome: (data: {
    id?: number;
    amount: number;
    sourceId?: number;
    description?: string;
    transactionDate: string;
    transactionTime: string;
  }) => Promise<void>;
  onCreateCategory?: (data: { name: string; color?: string; icon?: string }) => Promise<ExpenseCategory | void>;
  onCreateSource?: (data: { name: string; color?: string }) => Promise<IncomeSource | void>;
  editItem?: { type: 'expense' | 'income'; data: Expense | Income } | null;
  defaultType?: 'expense' | 'income';
}

const PRESET_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#64748b'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  sources,
  onSaveExpense,
  onSaveIncome,
  onCreateCategory,
  onCreateSource,
  editItem,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sourceId, setSourceId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayAbidjan());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline creation states for new Category
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Inline creation states for new Source
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSrcName, setNewSrcName] = useState('');
  const [newSrcColor, setNewSrcColor] = useState('#10b981');
  const [creatingSource, setCreatingSource] = useState(false);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setAmount(String(editItem.data.amount));
      setDescription(editItem.data.description || '');
      setDate(editItem.data.transactionDate);
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
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      if (sources.length > 0) {
        setSourceId(sources[0].id);
      }
    }
    setError(null);
    setShowAddCategory(false);
    setShowAddSource(false);
  }, [editItem, defaultType, isOpen, categories, sources]);

  // If categoryId is undefined but categories exist, auto-select first
  useEffect(() => {
    if (type === 'expense' && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, type]);

  // If sourceId is undefined but sources exist, auto-select first
  useEffect(() => {
    if (type === 'income' && !sourceId && sources.length > 0) {
      setSourceId(sources[0].id);
    }
  }, [sources, sourceId, type]);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

  // Inline Category Creation
  const handleCreateNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setCreatingCategory(true);
      setError(null);
      if (onCreateCategory) {
        const created = await onCreateCategory({
          name: newCatName.trim(),
          color: newCatColor,
        });
        if (created && created.id) {
          setCategoryId(created.id);
        }
      }
      setNewCatName('');
      setShowAddCategory(false);
    } catch (err: any) {
      setError(err.message || 'Impossible d\'ajouter la catégorie.');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Inline Source Creation
  const handleCreateNewSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrcName.trim()) return;
    try {
      setCreatingSource(true);
      setError(null);
      if (onCreateSource) {
        const created = await onCreateSource({
          name: newSrcName.trim(),
          color: newSrcColor,
        });
        if (created && created.id) {
          setSourceId(created.id);
        }
      }
      setNewSrcName('');
      setShowAddSource(false);
    } catch (err: any) {
      setError(err.message || 'Impossible d\'ajouter la source de revenu.');
    } finally {
      setCreatingSource(false);
    }
  };

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

      // Automated recording time in Africa/Abidjan
      const recordTime = editItem ? (editItem.data.transactionTime || getCurrentTimeAbidjan()) : getCurrentTimeAbidjan();

      if (type === 'expense') {
        const finalCatId = categoryId || (categories.length > 0 ? categories[0].id : undefined);
        await onSaveExpense({
          id: editItem?.type === 'expense' ? editItem.data.id : undefined,
          amount: numAmount,
          categoryId: finalCatId,
          description,
          transactionDate: date || getTodayAbidjan(),
          transactionTime: recordTime,
        });
      } else {
        const finalSrcId = sourceId || (sources.length > 0 ? sources[0].id : undefined);
        await onSaveIncome({
          id: editItem?.type === 'income' ? editItem.data.id : undefined,
          amount: numAmount,
          sourceId: finalSrcId,
          description,
          transactionDate: date || getTodayAbidjan(),
          transactionTime: recordTime,
        });
      }
      onClose();
    } catch (err: any) {
      console.error('Submit transaction error:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement de la transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const selectedSourceObj = sources.find((s) => s.id === sourceId);

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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Type Toggle (Expense vs Income) - disabled if editing */}
          {!editItem && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setShowAddCategory(false);
                  setShowAddSource(false);
                }}
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
                onClick={() => {
                  setType('income');
                  setShowAddCategory(false);
                  setShowAddSource(false);
                }}
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
            <div className="flex flex-wrap gap-1.5 mt-2">
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

          {/* 1. CATEGORIE DE DEPENSE (MENU DEROULANT + AJOUT DE CATEGORIES) */}
          {type === 'expense' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Catégorie de dépense *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory((prev) => !prev)}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddCategory ? 'Fermer' : '+ Nouvelle catégorie'}</span>
                </button>
              </div>

              {/* Dropdown Menu for Categories */}
              <div className="relative">
                <select
                  value={categoryId ?? (categories.length > 0 ? categories[0].id : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__new__') {
                      setShowAddCategory(true);
                    } else {
                      setCategoryId(Number(val));
                    }
                  }}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                >
                  {categories.length === 0 && (
                    <option value="" disabled>
                      Chargement des catégories...
                    </option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__new__">+ Ajouter une nouvelle catégorie...</option>
                </select>

                {/* Color Dot indicator inside select */}
                <span
                  className="w-4 h-4 rounded-full absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none shadow-sm"
                  style={{ backgroundColor: selectedCategoryObj?.color || '#ef4444' }}
                />

                {/* Dropdown chevron */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>

              {/* Inline Sub-form to Add a New Category directly */}
              {showAddCategory && (
                <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
                      Ajouter une nouvelle catégorie
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Loisirs, Santé, Carburant...)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                      title="Choisir la couleur"
                    />
                  </div>
                  {/* Preset colors */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400">Couleurs :</span>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`w-4 h-4 rounded-full transition-transform ${newCatColor === c ? 'scale-125 ring-2 ring-rose-500' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    disabled={creatingCategory || !newCatName.trim()}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all disabled:opacity-50"
                  >
                    {creatingCategory ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter au menu déroulant</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. SOURCE DU REVENU (MENU DEROULANT + AJOUT DE SOURCES) */}
          {type === 'income' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Source du revenu *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddSource((prev) => !prev)}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddSource ? 'Fermer' : '+ Nouvelle source'}</span>
                </button>
              </div>

              {/* Dropdown Menu for Income Sources */}
              <div className="relative">
                <select
                  value={sourceId ?? (sources.length > 0 ? sources[0].id : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__new__') {
                      setShowAddSource(true);
                    } else {
                      setSourceId(Number(val));
                    }
                  }}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  {sources.length === 0 && (
                    <option value="" disabled>
                      Chargement des sources...
                    </option>
                  )}
                  {sources.map((src) => (
                    <option key={src.id} value={src.id}>
                      {src.name}
                    </option>
                  ))}
                  <option value="__new__">+ Ajouter une nouvelle source...</option>
                </select>

                {/* Color Dot indicator inside select */}
                <span
                  className="w-4 h-4 rounded-full absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none shadow-sm"
                  style={{ backgroundColor: selectedSourceObj?.color || '#10b981' }}
                />

                {/* Dropdown chevron */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>

              {/* Inline Sub-form to Add a New Source directly */}
              {showAddSource && (
                <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-200">
                      Ajouter une nouvelle source de revenu
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddSource(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Salaire, Freelance, Dividendes...)"
                      value={newSrcName}
                      onChange={(e) => setNewSrcName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="color"
                      value={newSrcColor}
                      onChange={(e) => setNewSrcColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                      title="Choisir la couleur"
                    />
                  </div>
                  {/* Preset colors */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400">Couleurs :</span>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewSrcColor(c)}
                        className={`w-4 h-4 rounded-full transition-transform ${newSrcColor === c ? 'scale-125 ring-2 ring-teal-500' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNewSource}
                    disabled={creatingSource || !newSrcName.trim()}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all disabled:opacity-50"
                  >
                    {creatingSource ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter au menu déroulant</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Date de la transaction (Full width - Heure d'enregistrement SUPPRIMÉE du formulaire) */}
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
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
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
