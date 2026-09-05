import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, Clock, Share2, RotateCcw, AlertCircle, Home, Check } from 'lucide-react';
import { MockExamResult } from '../types';

interface ScoreReportModalProps {
  result: MockExamResult;
  onClose: () => void;
  onRetry: () => void;
  onReviewWrong: () => void;
  onGoHome: () => void;
}

export const ScoreReportModal: React.FC<ScoreReportModalProps> = ({
  result,
  onRetry,
  onReviewWrong,
  onGoHome,
}) => {
  const [copied, setCopied] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} 分 ${secs} 秒`;
  };

  const handleShare = async () => {
    const shareText = `🎯 我剛完成「專利師歷屆試題寶典」${result.year}年【${result.subjectName}】測驗，得分：${result.score}分，正確率：${result.accuracy}%！一塊來刷題挑戰專利師國考吧！`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '專利師歷屆試題寶典 測驗成果',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const isPassing = result.score >= 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Top Celebration Badge */}
        <div className="text-center space-y-3">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-md ${
              isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Award className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">測驗完成！</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {result.year} 年・{result.subjectName}
            </p>
          </div>
        </div>

        {/* Big Score Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
          <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            總評得分 / 正確率
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`text-5xl font-black tracking-tight ${
                isPassing ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {result.score}
            </span>
            <span className="text-slate-500 font-semibold text-xl">分</span>
          </div>
          <div className="text-sm font-medium text-slate-700">
            正確率：<span className="font-bold text-blue-900">{result.accuracy}%</span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500">總題數</div>
            <div className="text-lg font-bold text-slate-800">{result.totalQuestions}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
            <div className="text-xs text-emerald-700 flex items-center justify-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              答對
            </div>
            <div className="text-lg font-bold text-emerald-700">{result.correctCount}</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-900">
            <div className="text-xs text-red-700 flex items-center justify-center gap-0.5">
              <XCircle className="w-3 h-3" />
              答錯
            </div>
            <div className="text-lg font-bold text-red-700">{result.wrongCount}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-0.5">
              <Clock className="w-3 h-3" />
              耗時
            </div>
            <div className="text-xs font-bold text-slate-800 pt-1">
              {formatTime(result.timeSpentSeconds)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {result.wrongCount > 0 && (
            <button
              id="report-review-wrong-btn"
              onClick={onReviewWrong}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <AlertCircle className="w-4 h-4" />
              查看錯題（共 {result.wrongCount} 題）
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="report-retry-btn"
              onClick={onRetry}
              className="py-2.5 px-4 rounded-xl font-semibold text-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              重新測驗
            </button>

            <button
              id="report-share-btn"
              onClick={handleShare}
              className="py-2.5 px-4 rounded-xl font-semibold text-sm bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              {copied ? '已複製成果！' : '分享成績'}
            </button>
          </div>

          <button
            id="report-home-btn"
            onClick={onGoHome}
            className="w-full py-2.5 text-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
};
