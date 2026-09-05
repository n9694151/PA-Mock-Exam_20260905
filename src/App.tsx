import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { QuestionBank } from './pages/QuestionBank';
import { Quiz } from './pages/Quiz';
import { MockExamSetup } from './pages/MockExamSetup';
import { WrongQuestions } from './pages/WrongQuestions';
import { Favorites } from './pages/Favorites';
import { Statistics } from './pages/Statistics';
import { RandomQuizModal } from './components/RandomQuizModal';
import { ImportModal } from './components/ImportModal';
import { questionService } from './services/questionService';
import { storageService } from './services/storageService';
import { Question } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Active quiz session state
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>('歷屆試題自主練習');
  const [isMockExamSession, setIsMockExamSession] = useState<boolean>(false);
  const [mockExamDuration, setMockExamDuration] = useState<number>(60);

  // Stats badge triggers
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);

  const updateBadges = () => {
    setWrongCount(storageService.getWrongQuestionIds().length);
    setFavoriteCount(storageService.getFavoriteIds().length);
  };

  useEffect(() => {
    updateBadges();
  }, [currentTab]);

  // Handler: Start practice from Home (Year / Subject)
  const handleStartQuizFromHome = (options: {
    year: number | 'all';
    subjectId: string | 'all';
  }) => {
    const list = questionService.filterQuestions({
      year: options.year,
      subjectId: options.subjectId,
    });

    if (list.length === 0) {
      alert('該年度及科目條件下暫無試題，已為您切換至全部試題。');
      setActiveQuestions(questionService.getAllQuestions());
    } else {
      setActiveQuestions(list);
    }

    const yearLabel = options.year === 'all' ? '歷年' : `${options.year}年`;
    const subjectName =
      options.subjectId === 'all' ? '綜合科目' : list[0]?.subjectName || '專利試題';
    setActiveQuizTitle(`${yearLabel}【${subjectName}】練習`);
    setIsMockExamSession(false);
    setCurrentTab('quiz');
  };

  // Handler: Start Mock Exam
  const handleStartMockExam = (
    year: number,
    subjectId: string,
    durationMinutes: number = 60
  ) => {
    const list = questionService.getMockExamQuestions(year, subjectId);
    if (list.length === 0) {
      // Fallback to all questions of that subject or seed
      const fallback = questionService.filterQuestions({ subjectId });
      if (fallback.length === 0) {
        alert('抱歉，目前該科目暫無試題資料。');
        return;
      }
      setActiveQuestions(fallback);
    } else {
      setActiveQuestions(list);
    }

    const subName = list[0]?.subjectName || '專利考試';
    setActiveQuizTitle(`${year} 年【${subName}】全真模擬考`);
    setIsMockExamSession(true);
    setMockExamDuration(durationMinutes);
    setCurrentTab('quiz');
  };

  // Handler: Start Random Quiz
  const handleStartRandomQuiz = (
    year: number | 'all',
    subjectId: string | 'all',
    count: number
  ) => {
    const randoms = questionService.getRandomQuestions({
      year,
      subjectId,
      count,
    });

    if (randoms.length === 0) {
      alert('找不到符合抽題條件的試題，請嘗試其他篩選條件。');
      return;
    }

    const yearLabel = year === 'all' ? '全部年度' : `${year}年`;
    setActiveQuestions(randoms);
    setActiveQuizTitle(`隨機抽題（${yearLabel}・${randoms.length} 題）`);
    setIsMockExamSession(false);
    setCurrentTab('quiz');
  };

  // Handler: Practice specific list (e.g. from Question Bank, Wrong Questions, Favorites)
  const handleStartCustomList = (questions: Question[], title: string) => {
    setActiveQuestions(questions);
    setActiveQuizTitle(title);
    setIsMockExamSession(false);
    setCurrentTab('quiz');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Top Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'import') {
            setImportModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        wrongCount={wrongCount}
        favoriteCount={favoriteCount}
        onOpenRandomModal={() => setRandomModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentTab === 'home' && (
          <Home
            onStartQuiz={handleStartQuizFromHome}
            onStartMockExam={(year, subjectId) => handleStartMockExam(year, subjectId, 60)}
            onOpenRandomModal={() => setRandomModalOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'question-bank' && (
          <QuestionBank onStartPracticing={handleStartCustomList} />
        )}

        {currentTab === 'quiz' && (
          <Quiz
            questions={
              activeQuestions.length > 0 ? activeQuestions : questionService.getAllQuestions()
            }
            title={activeQuizTitle}
            isMockExam={isMockExamSession}
            initialTimeMinutes={mockExamDuration}
            onBack={() => {
              updateBadges();
              setCurrentTab('home');
            }}
            onReviewWrong={() => {
              updateBadges();
              setCurrentTab('wrong-questions');
            }}
          />
        )}

        {currentTab === 'mock-exam' && (
          <MockExamSetup onStartExam={handleStartMockExam} />
        )}

        {currentTab === 'wrong-questions' && (
          <WrongQuestions onStartPracticing={handleStartCustomList} />
        )}

        {currentTab === 'favorites' && (
          <Favorites onStartPracticing={handleStartCustomList} />
        )}

        {currentTab === 'statistics' && <Statistics />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <RandomQuizModal
        isOpen={randomModalOpen}
        onClose={() => setRandomModalOpen(false)}
        onStartRandomQuiz={handleStartRandomQuiz}
      />

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={(cnt) => {
          updateBadges();
          alert(`🎉 成功匯入 ${cnt} 筆試題資料！您現在可以在歷屆試題與刷題中練習這些新題目。`);
        }}
      />
    </div>
  );
}
