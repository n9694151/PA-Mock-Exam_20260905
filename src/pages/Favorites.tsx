import React, { useState } from 'react';
import { Bookmark, Play, Trash2, ChevronRight, BookOpen } from 'lucide-react';
import { storageService } from '../services/storageService';
import { questionService } from '../services/questionService';
import { Question } from '../types';
import { CORE_SUBJECTS } from '../data/subjects';

interface FavoritesProps {
  onStartPracticing: (questions: Question[], title: string) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ onStartPracticing }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [, setRefreshKey] = useState(0);

  const favoriteIds = storageService.getFavoriteIds();
  const allQuestions = questionService.getAllQuestions();
  const qMap = new Map<string, Question>();
  allQuestions.forEach((q) => qMap.set(q.id, q));

  let favoriteQuestions: Question[] = [];
  favoriteIds.forEach((id) => {
    const q = qMap.get(id);
    if (q) {
      if (selectedSubject === 'all' || q.subjectId === selectedSubject) {
        favoriteQuestions.push(q);
      }
    }
  });

  const handleStartAll = () => {
    if (favoriteQuestions.length === 0) return;
    onStartPracticing(favoriteQuestions, '我的收藏試題練習');
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.toggleFavorite(id);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-amber-600 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">我的收藏</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {favoriteIds.length} 題
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            自行標記的經典法條考題、計算題與核心爭點整理
          </p>
        </div>

        {favoriteQuestions.length > 0 && (
          <button
            id="start-favorites-quiz-btn"
            onClick={handleStartAll}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>開始練習收藏題目（{favoriteQuestions.length} 題）</span>
          </button>
        )}
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
            selectedSubject === 'all'
              ? 'bg-amber-500 text-slate-950 border-amber-500'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          全部科目 ({favoriteIds.length})
        </button>
        {CORE_SUBJECTS.map((sub) => {
          const count = favoriteIds.filter((id) => qMap.get(id)?.subjectId === sub.id).length;
          if (count === 0) return null;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                selectedSubject === sub.id
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sub.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Favorites List */}
      {favoriteQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">尚未收藏任何試題</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            在刷題或瀏覽題目時，點選右上角的「收藏」按鈕即可將重要試題留存於此。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favoriteQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => onStartPracticing([q], `${q.year}年 ${q.subjectName} 收藏試題`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-xs cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                    {q.year} 年
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {q.subjectName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    第 {q.questionNumber} 題
                  </span>
                  {q.categoryTag && (
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                      {q.categoryTag}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => handleRemove(q.id, e)}
                  className="text-xs text-slate-400 hover:text-amber-700 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  取消收藏
                </button>
              </div>

              <p className="text-sm font-medium text-slate-900 leading-snug group-hover:text-amber-950">
                {q.questionNumber}. {q.question}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div>
                  官方答案：
                  <span className="font-bold text-emerald-700">{q.officialAnswer}</span>
                </div>

                <span className="text-amber-800 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  進入練習
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
