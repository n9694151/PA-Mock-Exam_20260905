import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Info,
  Loader2,
} from 'lucide-react';
import { Question } from '../types';
import { requestGeminiExplanation } from '../services/geminiService';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer?: string;
  isAnswerSubmitted: boolean;
  onSelectOption: (optionKey: string) => void;
  onSubmitAnswer: () => void;
  onResetAnswer: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  isAnswerSubmitted,
  onSelectOption,
  onSubmitAnswer,
  onResetAnswer,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isFavorite,
  onToggleFavorite,
}) => {
  const [aiExplanation, setAiExplanation] = useState<string | null>(question.aiExplanation || null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Clean state when question changes
  React.useEffect(() => {
    setAiExplanation(question.aiExplanation || null);
    setAiError(null);
    setLoadingAi(false);
  }, [question.id]);

  const isCorrect = isAnswerSubmitted && userAnswer === question.officialAnswer;
  const isWrong = isAnswerSubmitted && userAnswer !== question.officialAnswer;

  const handleFetchAi = async () => {
    if (loadingAi) return;
    setLoadingAi(true);
    setAiError(null);
    const res = await requestGeminiExplanation(question, userAnswer);
    setLoadingAi(false);
    if (res.explanation) {
      setAiExplanation(res.explanation);
    }
    if (res.error) {
      setAiError(res.error);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-50/80 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-900 text-sm sm:text-base">
            {question.year} 年｜{question.subjectName}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-medium">
            第 {currentIndex + 1} 題 / 共 {totalQuestions} 題
          </span>

          {/* Explicit Demo Badge */}
          {question.isDemo ? (
            <span
              id="badge-demo-warning"
              className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-medium flex items-center gap-1"
              title="本題為系統示範用題，非考選部正式官方原題"
            >
              <Info className="w-3 h-3 text-amber-700" />
              Demo 示範題
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium">
              考選部歷屆試題
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {question.categoryTag && (
            <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full hidden md:inline-block">
              {question.categoryTag}
            </span>
          )}

          <button
            id={`btn-favorite-${question.id}`}
            onClick={onToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isFavorite
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`}
            />
            <span>{isFavorite ? '已收藏' : '收藏'}</span>
          </button>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5">
        <div
          className="bg-blue-600 h-1.5 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Body */}
      <div className="p-4 sm:p-6 sm:pb-8 space-y-6">
        {/* Question Prompt */}
        <div className="space-y-2">
          <div className="text-xs text-slate-500 font-medium">
            題號：第 {question.questionNumber} 題（單選題）
          </div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 leading-relaxed sm:leading-loose tracking-wide">
            {question.questionNumber}. {question.question}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {Object.entries(question.options || {}).map(([key, text]) => {
            const isSelected = userAnswer === key;
            const isOfficial = question.officialAnswer === key;

            let cardStyle =
              'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/70 text-slate-800';

            if (isSelected) {
              cardStyle = 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-950 font-medium';
            }

            if (isAnswerSubmitted) {
              if (isOfficial) {
                cardStyle =
                  'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500 text-emerald-950 font-semibold';
              } else if (isSelected && !isOfficial) {
                cardStyle =
                  'border-red-500 bg-red-50/80 ring-2 ring-red-500 text-red-950 line-through opacity-90';
              } else {
                cardStyle = 'border-slate-200 bg-slate-50/40 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={key}
                id={`option-${key}-btn`}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => onSelectOption(key)}
                className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${cardStyle}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                    isSelected
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  } ${
                    isAnswerSubmitted && isOfficial
                      ? '!bg-emerald-600 !text-white !border-emerald-600'
                      : ''
                  } ${
                    isAnswerSubmitted && isSelected && !isOfficial
                      ? '!bg-red-600 !text-white !border-red-600'
                      : ''
                  }`}
                >
                  {key}
                </div>
                <div className="text-base sm:text-lg leading-snug pt-0.5">
                  {text}
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit or Reset Answer CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {!isAnswerSubmitted ? (
            <button
              id="submit-answer-btn"
              onClick={onSubmitAnswer}
              disabled={!userAnswer}
              className={`px-8 py-3 rounded-xl font-bold text-base transition-all shadow-sm ${
                userAnswer
                  ? 'bg-blue-900 hover:bg-blue-800 text-white active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              送出答案
            </button>
          ) : (
            <button
              id="reset-answer-btn"
              onClick={onResetAnswer}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              重新作答
            </button>
          )}

          {/* Quick navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              id="prev-question-btn"
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              上一題
            </button>
            <button
              id="next-question-btn"
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
            >
              下一題
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Immediate Result Feedback Panel */}
        {isAnswerSubmitted && (
          <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in duration-200">
            <div
              className={`p-4 rounded-xl flex items-center justify-between gap-4 border ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-lg">
                    {isCorrect ? '✓ 答對了！' : '✕ 答錯了！'}
                  </div>
                  <div className="text-sm">
                    正確答案：
                    <span className="font-bold underline ml-1 text-base">
                      {question.officialAnswer}
                    </span>
                    {userAnswer && !isCorrect && (
                      <span className="text-slate-600 ml-2">
                        （你的選擇：{userAnswer}）
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!aiExplanation && (
                <button
                  id="ask-gemini-btn"
                  onClick={handleFetchAi}
                  disabled={loadingAi}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-blue-900 font-semibold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  {loadingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-700 animate-spin" />
                      <span>分析中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI 詳細解析</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Official / Standard Explanation */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2 text-slate-800">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-blue-800" />
                <span>試題官方解析與法條指引</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">
                {question.explanation && question.explanation.trim().length > 0
                  ? question.explanation
                  : '本題目前尚未建立官方解析。'}
              </p>
            </div>

            {/* Gemini AI Explanation Area */}
            {aiExplanation && (
              <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Gemini AI 輔助解析</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-medium px-2 py-0.5 rounded-md bg-indigo-100/70 border border-indigo-200">
                    AI 輔助學習
                  </span>
                </div>

                <div className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-4 rounded-lg border border-indigo-100">
                  {aiExplanation}
                </div>

                <div className="text-[11px] text-indigo-800/80 leading-normal flex items-start gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0 text-indigo-600 mt-0.5" />
                  <span>
                    【重要提示】AI 解析僅供學習參考，正式考試準備請以最新公布之專利法規及官方資料為準。
                  </span>
                </div>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                無法載入 AI 解析：{aiError}。建議以法規官方原意為準。
              </div>
            )}
          </div>
        )}

        {/* Source Citation & MoEx official link */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>資料來源：{question.source}</span>
          </div>

          <a
            id={`source-link-${question.id}`}
            href={question.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline font-medium"
          >
            <span>查看考選部官方原案查詢</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
