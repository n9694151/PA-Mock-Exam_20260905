import React, { useState } from 'react';
import {
  AlertCircle,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Play,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { questionService } from '../services/questionService';
import { Question } from '../types';
import { CORE_SUBJECTS } from '../data/subjects';

interface WrongQuestionsProps {
  onStartPracticing: (questions: Question[], title: string) => void;
}

export const WrongQuestions: React.FC<WrongQuestionsProps> = ({ onStartPracticing }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [, setRefreshKey] = useState(0);

  const wrongRecords = storageService.getAllWrongRecords();
  const allWrongIds = Object.keys(wrongRecords);
  const allQuestions = questionService.getAllQuestions();
  const qMap = new Map<string, Question>();
  allQuestions.forEach((q) => qMap.set(q.id, q));

  let wrongQuestions: { question: Question; record: any }[] = [];
  allWrongIds.forEach((id) => {
    const q = qMap.get(id);
    if (q) {
      if (selectedSubject === 'all' || q.subjectId === selectedSubject) {
        wrongQuestions.push({ question: q, record: wrongRecords[id] });
      }
    }
  });

  const handleStartAll = () => {
    if (wrongQuestions.length === 0) return;
    onStartPracticing(
      wrongQuestions.map((w) => w.question),
      '錯題本重溫挑戰'
    );
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.removeWrongQuestion(id);
    setRefreshKey((k) => k + 1);
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清空錯題本嗎？這將重設所有錯題紀錄。')) {
      allWrongIds.forEach((id) => storageService.removeWrongQuestion(id));
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">錯題本</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {allWrongIds.length} 題
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            針對歷史答錯題目進行循環複習，直到徹底搞懂為止
          </p>
        </div>

        <div className="flex items-center gap-2">
          {wrongQuestions.length > 0 && (
            <>
              <button
                id="clear-wrong-btn"
                onClick={handleClearAll}
                className="p-2 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                title="清空錯題本"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                id="start-wrong-quiz-btn"
                onClick={handleStartAll}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>重新挑戰錯題（{wrongQuestions.length} 題）</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
            selectedSubject === 'all'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          全部科目 ({allWrongIds.length})
        </button>
        {CORE_SUBJECTS.map((sub) => {
          const count = allWrongIds.filter((id) => qMap.get(id)?.subjectId === sub.id).length;
          if (count === 0) return null;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                selectedSubject === sub.id
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sub.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Wrong Questions List */}
      {wrongQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">太棒了！目前沒有待複習的錯題</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            您在刷題時若有答錯的題目，系統會自動歸納收錄於此，方便考前快速回顧。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {wrongQuestions.map(({ question: q, record }) => (
            <div
              key={q.id}
              onClick={() => onStartPracticing([q], `${q.year}年 ${q.subjectName} 錯題重溫`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-red-300 hover:shadow-xs cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    錯誤 {record.failedCount || 1} 次
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {q.year} 年・{q.subjectName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    第 {q.questionNumber} 題
                  </span>
                </div>

                <button
                  onClick={(e) => handleRemove(q.id, e)}
                  className="text-xs text-slate-400 hover:text-red-600 hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已掌握，自錯題本移除
                </button>
              </div>

              <p className="text-sm font-medium text-slate-900 leading-snug group-hover:text-red-950">
                {q.questionNumber}. {q.question}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div>
                  正確答案：
                  <span className="font-bold text-emerald-700">{q.officialAnswer}</span>
                  {record.lastAnsweredOption && (
                    <span className="ml-2 text-red-600">
                      （上次答錯選：{record.lastAnsweredOption}）
                    </span>
                  )}
                </div>

                <span className="text-red-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  立即重新挑戰
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
