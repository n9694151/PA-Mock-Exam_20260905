import React, { useState } from 'react';
import { Shuffle, X, Layers, CheckCircle2 } from 'lucide-react';
import { ALL_YEARS, CORE_SUBJECTS } from '../data/subjects';

interface RandomQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRandomQuiz: (year: number | 'all', subjectId: string | 'all', count: number) => void;
}

export const RandomQuizModal: React.FC<RandomQuizModalProps> = ({
  isOpen,
  onClose,
  onStartRandomQuiz,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
  const [selectedCount, setSelectedCount] = useState<number>(10);

  if (!isOpen) return null;

  const countOptions = [10, 20, 30, 50];

  const handleStart = () => {
    onStartRandomQuiz(selectedYear, selectedSubject, selectedCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">隨機抽題刷題</h2>
              <p className="text-xs text-slate-500">不重複題型，快速驗收知識盲點</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Year selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">考試年度</label>
            <select
              id="random-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">全部年度（111～115 年隨機）</option>
              {ALL_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} 年專利師試題
                </option>
              ))}
            </select>
          </div>

          {/* Subject selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">考試科目</label>
            <select
              id="random-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">全部科目（綜合隨機）</option>
              {CORE_SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question count selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">抽題題數</label>
            <div className="grid grid-cols-4 gap-2">
              {countOptions.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setSelectedCount(cnt)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    selectedCount === cnt
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cnt} 題
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            id="start-random-quiz-confirm-btn"
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            開始隨機刷題（{selectedCount} 題）
          </button>
        </div>
      </div>
    </div>
  );
};
