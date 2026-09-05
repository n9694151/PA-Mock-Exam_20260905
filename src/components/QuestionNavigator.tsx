import React from 'react';
import { Check, X } from 'lucide-react';
import { Question } from '../types';

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  answers: Record<string, { isCorrect: boolean; selectedOption: string }>;
  isMockExam?: boolean; // In mock exam, hide right/wrong colors until submitted
  mockAnswers?: Record<string, string>;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  onSelectIndex,
  answers,
  isMockExam = false,
  mockAnswers = {},
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">題號導航</h3>
        <span className="text-xs text-slate-500">
          共 {questions.length} 題
        </span>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-600 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border-2 border-blue-600 bg-blue-50"></span>
          <span>目前</span>
        </div>
        {!isMockExam ? (
          <>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span>答對</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-500"></span>
              <span>答錯</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
            <span>已填答</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300"></span>
          <span>未答</span>
        </div>
      </div>

      {/* Question Number Buttons Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-5 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          let colorClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
          let icon = null;

          if (isMockExam) {
            // In mock exam mode, show filled vs unfilled
            const isAnswered = Boolean(mockAnswers[q.id]);
            if (isAnswered) {
              colorClass = 'bg-blue-600 text-white font-semibold hover:bg-blue-700';
            }
          } else {
            // Standard practice mode
            const ans = answers[q.id];
            if (ans) {
              if (ans.isCorrect) {
                colorClass = 'bg-emerald-600 text-white font-medium hover:bg-emerald-700';
                icon = <Check className="w-2.5 h-2.5 inline-block -ml-0.5" />;
              } else {
                colorClass = 'bg-red-500 text-white font-medium hover:bg-red-600';
                icon = <X className="w-2.5 h-2.5 inline-block -ml-0.5" />;
              }
            }
          }

          const currentClass = isCurrent
            ? 'ring-2 ring-blue-600 ring-offset-2 scale-105 z-10 font-bold shadow-xs'
            : '';

          return (
            <button
              key={q.id}
              id={`nav-q-btn-${idx + 1}`}
              onClick={() => onSelectIndex(idx)}
              className={`h-9 rounded-lg text-xs flex items-center justify-center transition-all border ${colorClass} ${currentClass}`}
              title={`第 ${idx + 1} 題`}
            >
              <span className="flex items-center gap-0.5">
                {idx + 1}
                {icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
