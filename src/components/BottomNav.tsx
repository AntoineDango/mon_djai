import React from 'react';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, LineChart, Settings, Plus } from 'lucide-react';

export type NavTab = 'dashboard' | 'expenses' | 'incomes' | 'analytics' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, onOpenQuickAdd }) => {
  return (
    <>
      {/* Floating Action Button (FAB) for fast transaction input on mobile */}
      <div className="fixed bottom-20 right-5 z-40 md:bottom-8 md:right-8">
        <button
          onClick={onOpenQuickAdd}
          className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-600/30 active:scale-95 transition-all focus:outline-none"
          title="Ajouter rapidement une dépense ou un revenu"
          aria-label="Ajouter une transaction"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 transition-colors pb-safe">
        <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
          {/* 1. Accueil */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
              currentTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1">Accueil</span>
          </button>

          {/* 2. Dépenses */}
          <button
            onClick={() => onSelectTab('expenses')}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
              currentTab === 'expenses'
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className={`w-5 h-5 ${currentTab === 'expenses' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1">Dépenses</span>
          </button>

          {/* 3. Revenus */}
          <button
            onClick={() => onSelectTab('incomes')}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
              currentTab === 'incomes'
                ? 'text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className={`w-5 h-5 ${currentTab === 'incomes' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1">Revenus</span>
          </button>

          {/* 4. Analyses */}
          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
              currentTab === 'analytics'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LineChart className={`w-5 h-5 ${currentTab === 'analytics' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1">Analyses</span>
          </button>

          {/* 5. Paramètres */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
              currentTab === 'settings'
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className={`w-5 h-5 ${currentTab === 'settings' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1">Paramètres</span>
          </button>
        </div>
      </nav>
    </>
  );
};
