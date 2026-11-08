import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Layers,
  Briefcase,
  FileSpreadsheet,
  Plus,
  Trash2,
  Check,
  Edit2,
  Sparkles,
  User,
  Moon,
  Sun,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ExpenseCategory, IncomeSource, UserProfile } from '../types/index.ts';
import { formatFCFA } from '../utils/formatters.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface SettingsViewProps {
  profile: UserProfile | null;
  categories: ExpenseCategory[];
  sources: IncomeSource[];
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onUpdateThreshold: (val: number) => Promise<void>;
  onCreateCategory: (data: { name: string; color?: string; icon?: string }) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  onCreateSource: (data: { name: string; color?: string }) => Promise<void>;
  onDeleteSource: (id: number) => Promise<void>;
  onOpenExcelModal: () => void;
  onSeedDemoData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  categories,
  sources,
  darkMode,
  setDarkMode,
  onUpdateThreshold,
  onCreateCategory,
  onDeleteCategory,
  onCreateSource,
  onDeleteSource,
  onOpenExcelModal,
  onSeedDemoData,
}) => {
  const { user, signInWithGoogle, signOut, isGuest } = useAuth();

  // Threshold form state
  const [thresholdInput, setThresholdInput] = useState<string>(
    profile ? String(profile.dailyThreshold) : '2000'
  );
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdSaved, setThresholdSaved] = useState(false);

  // New Category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [addingCategory, setAddingCategory] = useState(false);

  // New Source form
  const [newSrcName, setNewSrcName] = useState('');
  const [newSrcColor, setNewSrcColor] = useState('#10b981');
  const [addingSource, setAddingSource] = useState(false);

  // Seeding demo state
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleThresholdSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(thresholdInput, 10);
    if (isNaN(val) || val <= 0) return;
    try {
      setSavingThreshold(true);
      await onUpdateThreshold(val);
      setThresholdSaved(true);
      setTimeout(() => setThresholdSaved(false), 2000);
    } finally {
      setSavingThreshold(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setAddingCategory(true);
      await onCreateCategory({ name: newCatName.trim(), color: newCatColor });
      setNewCatName('');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrcName.trim()) return;
    try {
      setAddingSource(true);
      await onCreateSource({ name: newSrcName.trim(), color: newSrcColor });
      setNewSrcName('');
    } finally {
      setAddingSource(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await onSeedDemoData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Paramètres & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gérez votre seuil de dépense journalier, personnalisez les catégories et exportez vos données.
        </p>
      </div>

      {/* 1. SEUIL JOURNALIER DE DÉPENSES (Règle Métier 2 000 FCFA) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Seuil journalier de dépenses (en FCFA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fixé par défaut à 2 000 FCFA. Si le total cumulé des dépenses de la journée dépasse ce seuil, il s'affiche en <strong className="text-rose-600">ROUGE</strong> avec une alerte visuelle. En-dessous ou égal, il reste en <strong className="text-emerald-600">VERT</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handleThresholdSave} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              min="100"
              step="100"
              required
              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              FCFA
            </span>
          </div>

          <button
            type="submit"
            disabled={savingThreshold}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {savingThreshold ? (
              <span>Sauvegarde...</span>
            ) : thresholdSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Enregistré en base !</span>
              </>
            ) : (
              <span>Mettre à jour le seuil</span>
            )}
          </button>
        </form>

        <div className="flex gap-2">
          {[1500, 2000, 3000, 5000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setThresholdInput(String(val))}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              {val} FCFA {val === 2000 && '(Défaut)'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. EXCEL EXPORT BUTTON */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 dark:border-emerald-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Exportation des données au format Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Téléchargez un classeur Excel complet avec 4 onglets : Dépenses, Revenus, Synthèse financière et Analyse par catégorie.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenExcelModal}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exporter vers Excel</span>
        </button>
      </div>

      {/* 3. EXPENSE CATEGORIES MANAGEMENT */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Catégories de Dépenses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transport, Nourriture, Imprévus, Famille, Autres et catégories personnalisées
            </p>
          </div>
        </div>

        {/* Existing categories chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
              </div>
              {!cat.isDefault && (
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Supprimer la catégorie"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleAddCategory} className="pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nom de la nouvelle catégorie..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
          />
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              title="Choisir la couleur"
            />
            <button
              type="submit"
              disabled={addingCategory || !newCatName.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. INCOME SOURCES MANAGEMENT */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Sources de Revenus
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              GLM, SOLIDARITY PROJECT, CIC (Stage), Autres revenus et sources personnalisées
            </p>
          </div>
        </div>

        {/* Existing sources list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: src.color }} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{src.name}</span>
              </div>
              {!src.isDefault && (
                <button
                  onClick={() => onDeleteSource(src.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Supprimer la source"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add custom source form */}
        <form onSubmit={handleAddSource} className="pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nom de la nouvelle source de revenu..."
            value={newSrcName}
            onChange={(e) => setNewSrcName(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
          />
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={newSrcColor}
              onChange={(e) => setNewSrcColor(e.target.value)}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              title="Choisir la couleur"
            />
            <button
              type="submit"
              disabled={addingSource || !newSrcName.trim()}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. SEED DEMO DATA HELPER */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Données de démonstration réalistes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Peuplez instantanément la base PostgreSQL avec des transactions types pour Antoine DANGO (Stage CIC, GLM, Solidarity, taxis, repas...) pour tester le seuil et les graphiques.
            </p>
          </div>
        </div>

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {seeding ? (
            <span>Initialisation...</span>
          ) : seedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Données créées !</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Charger démo</span>
            </>
          )}
        </button>
      </div>

      {/* 6. PROFILE & ACCOUNT INFO */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Profil Utilisateur & Base PostgreSQL
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connecté à Google Cloud SQL (PostgreSQL Developer Edition)
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Nom du titulaire :</span>
            <strong className="text-slate-800 dark:text-slate-200">{user?.displayName || 'Antoine DANGO'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Adresse e-mail :</span>
            <strong className="text-slate-800 dark:text-slate-200">{user?.email || 'antoinedango@gmail.com'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Devise officielle :</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Franc CFA (FCFA)</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fuseau horaire :</span>
            <strong className="text-slate-800 dark:text-slate-200 font-mono">Africa/Abidjan (UTC+0)</strong>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            <span>Thème {darkMode ? 'Clair' : 'Sombre'}</span>
          </button>

          {user ? (
            <button
              onClick={signOut}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Déconnexion du compte Google
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Se connecter avec Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
