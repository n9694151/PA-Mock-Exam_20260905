import React, { useState } from 'react';
import {
  BookOpen,
  Shuffle,
  Clock,
  AlertCircle,
  Bookmark,
  BarChart2,
  Upload,
  Menu,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'question-bank'
  | 'quiz'
  | 'mock-exam'
  | 'wrong-questions'
  | 'favorites'
  | 'statistics'
  | 'import';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  wrongCount?: number;
  favoriteCount?: number;
  onOpenRandomModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  wrongCount = 0,
  favoriteCount = 0,
  onOpenRandomModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-800 transition-colors">
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  專利師歷屆試題寶典
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  111-115年
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                國家高等考試專利師線上刷題題庫
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              id="nav-btn-home"
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              首頁
            </button>

            <button
              id="nav-btn-question-bank"
              onClick={() => handleNavClick('question-bank')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'question-bank'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              歷屆試題
            </button>

            <button
              id="nav-btn-random"
              onClick={() => {
                onOpenRandomModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Shuffle className="w-4 h-4 text-indigo-600" />
              隨機刷題
            </button>

            <button
              id="nav-btn-mock-exam"
              onClick={() => handleNavClick('mock-exam')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'mock-exam'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              模擬考
            </button>

            <button
              id="nav-btn-wrong-questions"
              onClick={() => handleNavClick('wrong-questions')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                currentTab === 'wrong-questions'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              錯題本
              {wrongCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-red-100 text-red-700">
                  {wrongCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-favorites"
              onClick={() => handleNavClick('favorites')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                currentTab === 'favorites'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              我的收藏
              {favoriteCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">
                  {favoriteCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-statistics"
              onClick={() => handleNavClick('statistics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'statistics'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-sky-600" />
              學習統計
            </button>

            <button
              id="nav-btn-import"
              onClick={() => handleNavClick('import')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'import'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="匯入題庫 (PDF/JSON/CSV)"
            >
              <Upload className="w-4 h-4" />
              題庫匯入
            </button>
          </nav>

          {/* Quick CTA on desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              id="nav-quick-start-btn"
              onClick={() => handleNavClick('quiz')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-800 active:scale-95 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              快速刷題
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'home' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-700" />
            首頁
          </button>

          <button
            onClick={() => handleNavClick('question-bank')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'question-bank' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-700" />
            歷屆試題
          </button>

          <button
            onClick={() => {
              onOpenRandomModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700"
          >
            <Shuffle className="w-4 h-4 text-indigo-600" />
            隨機抽題
          </button>

          <button
            onClick={() => handleNavClick('mock-exam')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'mock-exam' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            模擬考試
          </button>

          <button
            onClick={() => handleNavClick('wrong-questions')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'wrong-questions' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600" />
              錯題本
            </div>
            {wrongCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
                {wrongCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('favorites')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'favorites' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-amber-500" />
              我的收藏
            </div>
            {favoriteCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                {favoriteCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('statistics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'statistics' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-sky-600" />
            學習統計
          </button>

          <button
            onClick={() => handleNavClick('import')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'import' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4 text-slate-500" />
            題庫匯入
          </button>
        </div>
      )}
    </header>
  );
};
