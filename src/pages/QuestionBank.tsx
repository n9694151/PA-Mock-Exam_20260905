import React, { useState } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  XCircle,
  Bookmark,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ALL_YEARS, CORE_SUBJECTS } from '../data/subjects';
import { questionService } from '../services/questionService';
import { storageService } from '../services/storageService';
import { Question } from '../types';

interface QuestionBankProps {
  onStartPracticing: (questions: Question[], title: string) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ onStartPracticing }) => {
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'unanswered' | 'correct' | 'wrong' | 'favorite'
  >('all');
  const [keyword, setKeyword] = useState<string>('');

  const answers = storageService.getAllAnswers();
  const wrongRecords = storageService.getAllWrongRecords();
  const favoriteIds = new Set(storageService.getFavoriteIds());

  const filteredQuestions = questionService.filterQuestions({
    year: yearFilter,
    subjectId: subjectFilter,
    status: statusFilter,
    keyword,
  });

  const handleStartFiltered = () => {
    if (filteredQuestions.length === 0) return;
    onStartPracticing(filteredQuestions, '自訂篩選試題練習');
  };

  const handleResetFilters = () => {
    setYearFilter('all');
    setSubjectFilter('all');
    setStatusFilter('all');
    setKeyword('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">歷屆試題目錄瀏覽</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            可依年度、應試科目、作答狀態與法規關鍵字多維度檢索
          </p>
        </div>

        <button
          id="practice-filtered-btn"
          onClick={handleStartFiltered}
          disabled={filteredQuestions.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all active:scale-98"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>練習當前結果（共 {filteredQuestions.length} 題）</span>
        </button>
      </div>

      {/* Multi-criteria Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="bank-keyword-input"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋題目關鍵字、法條、專利技術詞彙（如：更正、先申請原則、熱力學、新穎性）..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              考試年度
            </label>
            <select
              value={yearFilter}
              onChange={(e) =>
                setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="all">全部年度（111～115年）</option>
              {ALL_YEARS.map((y) => (
                <option key={y} value={y}>
                  民國 {y} 年
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              應試科目
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="all">全部科目</option>
              {CORE_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              作答狀態
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="all">全部狀態</option>
              <option value="unanswered">尚未作答</option>
              <option value="correct">曾答對</option>
              <option value="wrong">曾答錯（錯題）</option>
              <option value="favorite">已收藏題目</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              重設所有條件
            </button>
          </div>
        </div>
      </div>

      {/* Questions Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>共檢索出 {filteredQuestions.length} 筆試題</span>
          <span>點選任一題即可單題檢視或展開刷題</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <p className="font-semibold text-sm">找不到符合條件的試題</p>
            <p className="text-xs">請嘗試放寬搜尋關鍵字或重新調整篩選條件。</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {filteredQuestions.map((q, idx) => {
              const ans = answers[q.id];
              const isWrong = Boolean(wrongRecords[q.id]);
              const isFav = favoriteIds.has(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => onStartPracticing([q, ...filteredQuestions.filter((item) => item.id !== q.id)], `${q.year}年 ${q.subjectName}`)}
                  className="p-4 sm:p-5 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {q.year} 年
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {q.subjectName}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        第 {q.questionNumber} 題
                      </span>

                      {/* Status Badges */}
                      {ans ? (
                        ans.isCorrect ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            已答對
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            曾答錯
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          未作答
                        </span>
                      )}

                      {isFav && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                          <Bookmark className="w-3 h-3 fill-amber-500" />
                          已收藏
                        </span>
                      )}

                      {q.isDemo && (
                        <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-sm">
                          Demo
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-900 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                      {q.questionNumber}. {q.question}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-900 group-hover:translate-x-0.5 transition-transform flex items-center">
                      進入作答
                      <ChevronRight className="w-4 h-4 text-blue-700" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
