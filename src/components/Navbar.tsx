import React, { useState, useEffect } from 'react';
import { Wallet, Sun, Moon, LogIn, LogOut, User as UserIcon, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { getCurrentTimeAbidjan } from '../utils/formatters.ts';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode, onOpenSettings }) => {
  const { user, signInWithGoogle, signOut, isGuest } = useAuth();
  const [abidjanTime, setAbidjanTime] = useState(getCurrentTimeAbidjan());

  useEffect(() => {
    const timer = setInterval(() => {
      setAbidjanTime(getCurrentTimeAbidjan());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400 bg-clip-text text-transparent">
                MON DJAI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                FCFA
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
              by Antoine DANGO
            </p>
          </div>
        </div>

        {/* Right Actions: Time (Abidjan), Theme switch, User Auth */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Abidjan Live Clock */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Abidjan {abidjanTime}</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label="Basculer le thème"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Sign-In or Avatar */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenSettings}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Utilisateur'} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    {user.displayName ? user.displayName.charAt(0) : 'A'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
                  {user.displayName || 'Antoine DANGO'}
                </span>
              </button>
              <button
                onClick={signOut}
                className="p-2 text-slate-500 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connexion Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
