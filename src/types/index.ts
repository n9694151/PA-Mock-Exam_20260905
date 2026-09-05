export type QuestionType = 'multiple-choice' | 'essay' | 'case-study';

export interface Question {
  id: string;
  year: number; // e.g. 111, 112, 113, 114, 115
  subjectId: string; // e.g. 'patent-law'
  subjectName: string; // e.g. '專利法規'
  questionNumber: number;
  questionType: QuestionType;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    [key: string]: string;
  };
  officialAnswer: string; // e.g. 'A', 'B', 'C', 'D'
  explanation?: string; // 官方或傳統解析 (若無則提示尚未建立)
  aiExplanation?: string; // Gemini AI 產生的輔助解析
  source: string; // e.g. '考選部'
  sourceYear: number;
  sourceUrl: string;
  isDemo: boolean; // 嚴格標示 Demo 示範題 vs 官方考選部原題
  categoryTag?: string; // e.g. '新穎性與進步性', '申請專利範圍', '優先權'
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  isCore: boolean;
  description: string;
  defaultQuestionCount: number;
}

export interface AnswerRecord {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface WrongQuestionRecord {
  questionId: string;
  lastAnsweredOption: string;
  officialAnswer: string;
  failedCount: number;
  lastAttemptTime: number;
  solved: boolean;
}

export interface MockExamResult {
  id: string;
  title: string;
  year: number | string;
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  accuracy: number;
  timeSpentSeconds: number;
  timestamp: number;
  userAnswers: { [questionId: string]: string };
}

export interface OverallStats {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
  streak: number;
  maxStreak: number;
  subjectBreakdown: {
    [subjectId: string]: {
      subjectName: string;
      totalAnswered: number;
      correctCount: number;
      accuracy: number;
    };
  };
  strongestSubject?: { id: string; name: string; accuracy: number };
  weakestSubject?: { id: string; name: string; accuracy: number };
}

export interface QuizFilter {
  year?: number | 'all';
  subjectId?: string | 'all';
  status?: 'all' | 'unanswered' | 'correct' | 'wrong' | 'favorite';
  keyword?: string;
}
