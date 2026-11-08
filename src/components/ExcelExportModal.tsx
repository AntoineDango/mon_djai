import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Calendar, Check, AlertCircle } from 'lucide-react';
import { getTodayAbidjan } from '../utils/formatters.ts';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (period: string, startDate?: string, endDate?: string) => Promise<void>;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState(getTodayAbidjan());
  const [endDate, setEndDate] = useState(getTodayAbidjan());
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setExporting(true);
      await onExport(period, period === 'custom' ? startDate : undefined, period === 'custom' ? endDate : undefined);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Exportation Excel (.xlsx)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Génération de classeur complet multi-feuilles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheets structure note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Structure du document généré (4 feuilles) :
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            <li><strong>1. Dépenses :</strong> Transactions, catégories, dates et montants FCFA</li>
            <li><strong>2. Revenus :</strong> Provenance, montants et commentaires</li>
            <li><strong>3. Synthèse financière :</strong> Totaux, solde, seuil et moyennes</li>
            <li><strong>4. Analyse par catégorie :</strong> Cumuls et parts en pourcentage</li>
          </ul>
        </div>

        {/* Period Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Sélectionner la période d'exportation :
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'today', label: "Données du jour" },
              { id: 'week', label: 'Cette semaine' },
              { id: 'month', label: 'Ce mois' },
              { id: 'all', label: 'Tout l\'historique' },
              { id: 'custom', label: 'Période personnalisée' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id as any)}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  period === p.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                } ${p.id === 'custom' ? 'col-span-2' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range if custom selected */}
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Date début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Date fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {exporting ? (
              <span>Génération en cours...</span>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                <span>Téléchargé !</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger Excel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
