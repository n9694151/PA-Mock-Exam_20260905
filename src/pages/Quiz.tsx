import React, { useState, useEffect } from 'react';
import {
  Clock,
  Send,
  RotateCcw,
  ArrowLeft,
  AlertTriangle,
  FileCheck,
  Bookmark,
  Share2,
} from 'lucide-react';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { ScoreReportModal } from '../components/ScoreReportModal';
import { MockExamResult, Question } from '../types';
import { storageService } from '../services/storageService';

interface QuizProps {
  questions: Question[];
  title?: string;
  isMockExam?: boolean;
  initialTimeMinutes?: number;
  onBack: () => void;
  onReviewWrong: () => void;
}

export const Quiz: React.FC<QuizProps> = ({
  questions,
  title = '歷屆試題自主練習',
  isMockExam = false,
  initialTimeMinutes = 60,
  onBack,
  onReviewWrong,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Local storage answer records map for current questions
  const [answerRecords, setAnswerRecords] = useState<
    Record<string, { isCorrect: boolean; selectedOption: string }>
  >({});

  // In mock exam mode, user picks are stored temporarily until submission
  const [mockPicks, setMockPicks] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialTimeMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(isMockExam);
  const [examResult, setExamResult] = useState<MockExamResult | null>(null);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState<boolean>(false);

  // Load existing answers on mount
  useEffect(() => {
    const saved = storageService.getAllAnswers();
    const mapped: Record<string, { isCorrect: boolean; selectedOption: string }> = {};
    questions.forEach((q) => {
      if (saved[q.id]) {
        mapped[q.id] = {
          isCorrect: saved[q.id].isCorrect,
          selectedOption: saved[q.id].selectedOption,
        };
      }
    });
    setAnswerRecords(mapped);
  }, [questions]);

  // Sync state when current question changes
  useEffect(() => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (isMockExam) {
      setSelectedOption(mockPicks[currentQ.id] || '');
      setIsAnswerSubmitted(false);
    } else {
      const existing = answerRecords[currentQ.id];
      if (existing) {
        setSelectedOption(existing.selectedOption);
        setIsAnswerSubmitted(true);
      } else {
        setSelectedOption('');
        setIsAnswerSubmitted(false);
      }
    }
  }, [currentIndex, isMockExam, mockPicks, answerRecords, questions]);

  // Timer countdown for Mock Exam
  useEffect(() => {
    if (!isMockExam || !isTimerRunning) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmitMockExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMockExam, isTimerRunning]);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">查無對應之題庫試題</h3>
        <p className="text-xs text-slate-500">
          目前該年度或科目篩選條件下尚未載入題目，請調整篩選條件或透過「題庫匯入」載入更多題目。
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-semibold text-xs transition-colors"
        >
          返回前頁
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  // Option selection
  const handleSelectOption = (key: string) => {
    if (isAnswerSubmitted && !isMockExam) return;
    setSelectedOption(key);

    if (isMockExam) {
      setMockPicks((prev) => ({
        ...prev,
        [currentQ.id]: key,
      }));
    }
  };

  // Immediate submit in standard mode
  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;

    const isCorrect = selectedOption === currentQ.officialAnswer;

    // Save to storage
    storageService.saveAnswer({
      questionId: currentQ.id,
      selectedOption,
      isCorrect,
      timestamp: Date.now(),
    });

    setAnswerRecords((prev) => ({
      ...prev,
      [currentQ.id]: { isCorrect, selectedOption },
    }));

    setIsAnswerSubmitted(true);
  };

  // Reset answer
  const handleResetAnswer = () => {
    setIsAnswerSubmitted(false);
    setSelectedOption('');
  };

  // Toggle favorite
  const handleToggleFavorite = () => {
    storageService.toggleFavorite(currentQ.id);
    // Force re-render
    setCurrentIndex((c) => c);
  };

  const isCurrentFavorite = storageService.isFavorite(currentQ.id);

  // Final submit for Mock Exam
  const handleFinalSubmitMockExam = () => {
    setIsTimerRunning(false);
    setConfirmSubmitModal(false);

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const userPick = mockPicks[q.id];
      if (!userPick) {
        unanswered++;
      } else if (userPick === q.officialAnswer) {
        correct++;
        storageService.saveAnswer({
          questionId: q.id,
          selectedOption: userPick,
          isCorrect: true,
          timestamp: Date.now(),
        });
      } else {
        wrong++;
        storageService.saveAnswer({
          questionId: q.id,
          selectedOption: userPick,
          isCorrect: false,
          timestamp: Date.now(),
        });
      }
    });

    const total = questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeSpent = initialTimeMinutes * 60 - secondsRemaining;

    const result: MockExamResult = {
      id: `exam-${Date.now()}`,
      title: `${currentQ.year} 年【${currentQ.subjectName}】全真模擬考試`,
      year: currentQ.year,
      subjectId: currentQ.subjectId,
      subjectName: currentQ.subjectName,
      totalQuestions: total,
      correctCount: correct,
      wrongCount: wrong,
      unansweredCount: unanswered,
      score,
      accuracy,
      timeSpentSeconds: timeSpent,
      timestamp: Date.now(),
      userAnswers: mockPicks,
    };

    storageService.saveMockExamResult(result);
    setExamResult(result);
  };

  // Format timer
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(mockPicks).length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Quiz Top Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            id="quiz-back-btn"
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="返回前頁"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-slate-900 text-base sm:text-lg">
              {title}
            </h1>
            <p className="text-xs text-slate-500">
              {currentQ.year} 年・{currentQ.subjectName}（第 {currentIndex + 1} 題 / 共{' '}
              {questions.length} 題）
            </p>
          </div>
        </div>

        {/* Mock Exam Timer & Hand-in Button */}
        {isMockExam ? (
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm border ${
                secondsRemaining < 300
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              id="mock-exam-submit-btn"
              onClick={() => setConfirmSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>交卷評分</span>
              <span className="text-[11px] opacity-80">
                ({answeredCount}/{questions.length})
              </span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            練習模式：點擊選項後點選「送出答案」即刻核對答案與解析
          </div>
        )}
      </div>

      {/* Main Grid: Card (left/center) + Navigator (right/sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question Card (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <QuestionCard
            question={currentQ}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            userAnswer={selectedOption}
            isAnswerSubmitted={isAnswerSubmitted}
            onSelectOption={handleSelectOption}
            onSubmitAnswer={handleSubmitAnswer}
            onResetAnswer={handleResetAnswer}
            onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < questions.length - 1}
            isFavorite={isCurrentFavorite}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {/* Question Navigator Drawer/Sidebar (4 or 3 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            answers={answerRecords}
            isMockExam={isMockExam}
            mockAnswers={mockPicks}
          />
        </div>
      </div>

      {/* Mock Exam Confirmation Modal */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">確認交卷嗎？</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              您已填答 {answeredCount} 題，尚有{' '}
              <span className="font-bold text-red-600">
                {questions.length - answeredCount}
              </span>{' '}
              題未填答。交卷後系統將立即計算成績並給出解析報告。
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setConfirmSubmitModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                繼續作答
              </button>
              <button
                id="confirm-handin-btn"
                onClick={handleFinalSubmitMockExam}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                確認交卷
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Report Modal */}
      {examResult && (
        <ScoreReportModal
          result={examResult}
          onClose={() => setExamResult(null)}
          onRetry={() => {
            setExamResult(null);
            setMockPicks({});
            setCurrentIndex(0);
            setSecondsRemaining(initialTimeMinutes * 60);
            setIsTimerRunning(true);
          }}
          onReviewWrong={() => {
            setExamResult(null);
            onReviewWrong();
          }}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
