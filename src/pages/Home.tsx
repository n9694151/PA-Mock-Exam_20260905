import React, { useState } from 'react';
import {
  BookOpen,
  Shuffle,
  Clock,
  AlertCircle,
  Bookmark,
  BarChart2,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Award,
  Zap,
} from 'lucide-react';
import { ALL_YEARS, CORE_SUBJECTS, OFFICIAL_MOEX_SEARCH_URL } from '../data/subjects';
import { questionService } from '../services/questionService';
import { storageService } from '../services/storageService';

interface HomeProps {
  onStartQuiz: (options: { year: number | 'all'; subjectId: string | 'all' }) => void;
  onStartMockExam: (year: number, subjectId: string) => void;
  onOpenRandomModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const Home: React.FC<HomeProps> = ({
  onStartQuiz,
  onStartMockExam,
  onOpenRandomModal,
  onNavigateTab,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(113);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'all'>('patent-law');

  const allQuestions = questionService.getAllQuestions();
  const stats = storageService.getOverallStats(allQuestions);
  const wrongCount = storageService.getWrongQuestionIds().length;
  const favCount = storageService.getFavoriteIds().length;

  const subjectSummary = questionService.getSubjectsSummary(selectedYear);

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-400/30 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            中華民國專門職業及技術人員高等考試・專利師
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            專利師歷屆試題寶典
          </h1>

          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed font-normal">
            111～115 年專利師考試歷屆試題線上練習平台。支援即時答題對答案、法條解析、Gemini AI 考點詳解與整年度全真模擬考試。
          </p>

          {/* Quick Year + Subject Selector in Hero */}
          <div className="pt-2 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-200 block mb-1">
                選擇考試年度
              </label>
              <select
                id="hero-year-select"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-semibold focus:outline-hidden"
              >
                <option value="all">全部年度（111～115 年）</option>
                {ALL_YEARS.map((y) => (
                  <option key={y} value={y}>
                    民國 {y} 年（{1911 + y}）
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-blue-200 block mb-1">
                選擇考試科目
              </label>
              <select
                id="hero-subject-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-semibold focus:outline-hidden"
              >
                <option value="all">全部科目（綜合練習）</option>
                {CORE_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                id="hero-start-quiz-btn"
                onClick={() =>
                  onStartQuiz({ year: selectedYear, subjectId: selectedSubjectId })
                }
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                立即開始練習
              </button>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* User Quick Learning Dashboard Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">已完成題數</div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalAnswered}
              <span className="text-xs font-normal text-slate-400 ml-1">
                / {allQuestions.length} 題
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">整體正確率</div>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.accuracy}%
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('wrong-questions')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-red-300 cursor-pointer transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">待複習錯題</div>
            <div className="text-2xl font-bold text-red-600">{wrongCount} 題</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('favorites')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-amber-300 cursor-pointer transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">重點收藏題</div>
            <div className="text-2xl font-bold text-amber-700">{favCount} 題</div>
          </div>
        </div>
      </div>

      {/* Quick Action Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={onOpenRandomModal}
          className="bg-linear-to-br from-indigo-50 to-blue-50/40 p-5 rounded-2xl border border-indigo-100 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Shuffle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">隨機抽題刷題</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            自由指定 10、20、30、50 題，隨機挑選不重複試題，快速查驗弱點。
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('mock-exam')}
          className="bg-linear-to-br from-emerald-50 to-teal-50/40 p-5 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">全真模擬考試</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            比照國考計時、倒數計時交卷、自動產生成績單與錯題分析報告。
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('wrong-questions')}
          className="bg-linear-to-br from-red-50 to-rose-50/40 p-5 rounded-2xl border border-red-100 hover:border-red-300 hover:shadow-sm cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">錯題專屬重溫</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            自動彙整歷史作答錯誤題目，提供重新挑戰與攻克標籤，杜絕二度失分。
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('statistics')}
          className="bg-linear-to-br from-sky-50 to-blue-50/40 p-5 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-sm cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">科目掌握度統計</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            量化 7 大核心科目作答正確率，一眼看穿最強與最弱科目，精準配分。
          </p>
        </div>
      </div>

      {/* Select By Core Exam Subject Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              專利師高等考試應試科目題庫
            </h2>
            <p className="text-xs text-slate-500">
              點擊科目即可直接開始刷題，或進行該科目專題訓練
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('question-bank')}
            className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1"
          >
            查看所有歷屆試題目錄
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_SUBJECTS.map((subject) => {
            const sum = subjectSummary[subject.id] || { total: 0, completed: 0, correct: 0 };
            const subAccuracy =
              sum.completed > 0 ? Math.round((sum.correct / sum.completed) * 100) : null;

            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-100">
                      應試科目
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      題庫共 {sum.total} 題
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {subject.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Progress info */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>進度：{sum.completed} / {sum.total} 題</span>
                    {subAccuracy !== null ? (
                      <span className="font-semibold text-emerald-700">
                        正確率 {subAccuracy}%
                      </span>
                    ) : (
                      <span className="text-slate-400">尚未作答</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`start-subject-${subject.id}-btn`}
                      onClick={() =>
                        onStartQuiz({ year: selectedYear, subjectId: subject.id })
                      }
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center gap-1 transition-colors"
                    >
                      開始刷題
                    </button>
                    <button
                      id={`mock-subject-${subject.id}-btn`}
                      onClick={() => {
                        const yr = selectedYear === 'all' ? 113 : selectedYear;
                        onStartMockExam(yr, subject.id);
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 transition-colors"
                    >
                      模擬考
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official MoEx Citation Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-slate-900 text-sm">
              考選部官方考畢試題與官方答案庫
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            本平台試題文字與公告解答均本於考選部官方資訊。若需檢索申論題或歷年原始 PDF，歡迎前往考選部官方檢索系統。
          </p>
        </div>

        <a
          href={OFFICIAL_MOEX_SEARCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <span>前往考選部考畢試題系統</span>
          <ExternalLink className="w-4 h-4 text-slate-500" />
        </a>
      </div>
    </div>
  );
};
