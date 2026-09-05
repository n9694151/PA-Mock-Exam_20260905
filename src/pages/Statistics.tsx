import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Award,
  AlertTriangle,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
} from 'lucide-react';
import { questionService } from '../services/questionService';
import { storageService } from '../services/storageService';
import { CORE_SUBJECTS } from '../data/subjects';

export const Statistics: React.FC = () => {
  const [, setRefreshKey] = useState(0);
  const allQuestions = questionService.getAllQuestions();
  const stats = storageService.getOverallStats(allQuestions);
  const mockHistory = storageService.getMockExamHistory();

  const handleReset = () => {
    if (
      window.confirm(
        '確定要重設所有學習紀錄嗎？這將會清除您已作答的紀錄、錯題本、收藏以及模擬考成績！'
      )
    ) {
      storageService.resetAllData();
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">學習統計與成效分析</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            量化您的專利師考試刷題數據，掌握各考科弱點與模擬考軌跡
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-slate-200 hover:border-red-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重設所有學習紀錄
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500">累計作答題數</div>
          <div className="text-3xl font-black text-slate-900">
            {stats.totalAnswered}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              / {allQuestions.length} 題
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            答對 {stats.totalCorrect} 題・答錯 {stats.totalWrong} 題
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500">整體正確率</div>
          <div className="text-3xl font-black text-emerald-600">
            {stats.accuracy}%
          </div>
          <div className="text-[11px] text-slate-400">
            依全部歷史練習答題計算
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            連續答對紀錄
          </div>
          <div className="text-3xl font-black text-amber-600">
            {stats.streak}
            <span className="text-xs font-normal text-slate-400 ml-1.5">題</span>
          </div>
          <div className="text-[11px] text-slate-400">
            保持手感，挑戰零失誤
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500">全真模擬考場次</div>
          <div className="text-3xl font-black text-blue-900">
            {mockHistory.length}
            <span className="text-xs font-normal text-slate-400 ml-1.5">次</span>
          </div>
          <div className="text-[11px] text-slate-400">
            已完成正式計時測驗
          </div>
        </div>
      </div>

      {/* Strongest and Weakest Subject Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              目前優勢科目
            </div>
            <div className="font-bold text-slate-900 text-base">
              {stats.strongestSubject ? stats.strongestSubject.name : '暫無足夠作答數據'}
            </div>
            {stats.strongestSubject && (
              <p className="text-xs text-slate-600">
                答題正確率高達 {stats.strongestSubject.accuracy}%，請持續維持穩定度！
              </p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              需要補強科目
            </div>
            <div className="font-bold text-slate-900 text-base">
              {stats.weakestSubject ? stats.weakestSubject.name : '暫無足夠作答數據'}
            </div>
            {stats.weakestSubject && (
              <p className="text-xs text-slate-600">
                答題正確率約 {stats.weakestSubject.accuracy}%，建議加強法條熟讀與錯題重溫。
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 7 Core Subjects Accuracy Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">各考試科目正確率分析</h2>
            <p className="text-xs text-slate-500">專利師高等考試 7 門核心考科成效</p>
          </div>
        </div>

        <div className="space-y-4">
          {CORE_SUBJECTS.map((sub) => {
            const data = stats.subjectBreakdown[sub.id] || {
              totalAnswered: 0,
              correctCount: 0,
              accuracy: 0,
            };

            return (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{sub.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      已作答 {data.totalAnswered} 題（答對 {data.correctCount}）
                    </span>
                    <span className="font-bold text-slate-900 w-10 text-right">
                      {data.totalAnswered > 0 ? `${data.accuracy}%` : '-'}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      data.accuracy >= 70
                        ? 'bg-emerald-500'
                        : data.accuracy >= 50
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${data.accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock Exam History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">全真模擬考歷史成績</h2>
            <p className="text-xs text-slate-500">每一次模擬測驗的分數與完成時間紀錄</p>
          </div>
        </div>

        {mockHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            尚未進行過模擬考試。點選上方「模擬考」立即體驗國考倒數交卷！
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead>
                <tr className="text-slate-400 font-medium">
                  <th className="py-2.5 px-3">測驗時間</th>
                  <th className="py-2.5 px-3">年度與科目</th>
                  <th className="py-2.5 px-3 text-center">得分</th>
                  <th className="py-2.5 px-3 text-center">正確率</th>
                  <th className="py-2.5 px-3 text-center">答對/總題數</th>
                  <th className="py-2.5 px-3 text-right">耗時</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {h.year}年 {h.subjectName}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-bold ${
                          h.score >= 60 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {h.score} 分
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {h.accuracy}%
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {h.correctCount} / {h.totalQuestions}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {Math.floor(h.timeSpentSeconds / 60)} 分 {h.timeSpentSeconds % 60} 秒
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
