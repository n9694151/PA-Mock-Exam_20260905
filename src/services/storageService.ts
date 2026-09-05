import { AnswerRecord, MockExamResult, OverallStats, Question, WrongQuestionRecord } from '../types';
import { CORE_SUBJECTS } from '../data/subjects';

const KEYS = {
  ANSWERS: 'patent_answers_v1',
  WRONG_QUESTIONS: 'patent_wrong_questions_v1',
  FAVORITES: 'patent_favorites_v1',
  CUSTOM_QUESTIONS: 'patent_custom_questions_v1',
  MOCK_EXAMS: 'patent_mock_exams_v1',
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function safeSetItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export const storageService = {
  // Answer records
  saveAnswer(record: AnswerRecord): void {
    const all = safeGetItem<Record<string, AnswerRecord>>(KEYS.ANSWERS, {});
    all[record.questionId] = record;
    safeSetItem(KEYS.ANSWERS, all);

    if (!record.isCorrect) {
      this.recordWrongQuestion(record.questionId, record.selectedOption);
    }
  },

  getAnswer(questionId: string): AnswerRecord | null {
    const all = safeGetItem<Record<string, AnswerRecord>>(KEYS.ANSWERS, {});
    return all[questionId] || null;
  },

  getAllAnswers(): Record<string, AnswerRecord> {
    return safeGetItem<Record<string, AnswerRecord>>(KEYS.ANSWERS, {});
  },

  // Wrong questions notebook
  recordWrongQuestion(questionId: string, userChoice: string, officialAnswer: string = ''): void {
    const all = safeGetItem<Record<string, WrongQuestionRecord>>(KEYS.WRONG_QUESTIONS, {});
    const existing = all[questionId];
    if (existing) {
      existing.failedCount += 1;
      existing.lastAttemptTime = Date.now();
      existing.lastAnsweredOption = userChoice;
      existing.solved = false;
      all[questionId] = existing;
    } else {
      all[questionId] = {
        questionId,
        lastAnsweredOption: userChoice,
        officialAnswer,
        failedCount: 1,
        lastAttemptTime: Date.now(),
        solved: false,
      };
    }
    safeSetItem(KEYS.WRONG_QUESTIONS, all);
  },

  removeWrongQuestion(questionId: string): void {
    const all = safeGetItem<Record<string, WrongQuestionRecord>>(KEYS.WRONG_QUESTIONS, {});
    if (all[questionId]) {
      delete all[questionId];
      safeSetItem(KEYS.WRONG_QUESTIONS, all);
    }
  },

  markWrongQuestionSolved(questionId: string): void {
    const all = safeGetItem<Record<string, WrongQuestionRecord>>(KEYS.WRONG_QUESTIONS, {});
    if (all[questionId]) {
      all[questionId].solved = true;
      safeSetItem(KEYS.WRONG_QUESTIONS, all);
    }
  },

  getAllWrongRecords(): Record<string, WrongQuestionRecord> {
    return safeGetItem<Record<string, WrongQuestionRecord>>(KEYS.WRONG_QUESTIONS, {});
  },

  getWrongQuestionIds(): string[] {
    const all = safeGetItem<Record<string, WrongQuestionRecord>>(KEYS.WRONG_QUESTIONS, {});
    return Object.keys(all);
  },

  // Favorites
  toggleFavorite(questionId: string): boolean {
    const set = new Set<string>(safeGetItem<string[]>(KEYS.FAVORITES, []));
    let isNowFav = false;
    if (set.has(questionId)) {
      set.delete(questionId);
      isNowFav = false;
    } else {
      set.add(questionId);
      isNowFav = true;
    }
    safeSetItem(KEYS.FAVORITES, Array.from(set));
    return isNowFav;
  },

  isFavorite(questionId: string): boolean {
    const list = safeGetItem<string[]>(KEYS.FAVORITES, []);
    return list.includes(questionId);
  },

  getFavoriteIds(): string[] {
    return safeGetItem<string[]>(KEYS.FAVORITES, []);
  },

  // Custom imported questions
  getCustomQuestions(): Question[] {
    return safeGetItem<Question[]>(KEYS.CUSTOM_QUESTIONS, []);
  },

  addCustomQuestions(newQuestions: Question[]): void {
    const existing = safeGetItem<Question[]>(KEYS.CUSTOM_QUESTIONS, []);
    const existingIds = new Set(existing.map((q) => q.id));
    const merged = [...existing];
    for (const q of newQuestions) {
      if (!existingIds.has(q.id)) {
        merged.push(q);
        existingIds.add(q.id);
      }
    }
    safeSetItem(KEYS.CUSTOM_QUESTIONS, merged);
  },

  clearCustomQuestions(): void {
    safeSetItem(KEYS.CUSTOM_QUESTIONS, []);
  },

  // Mock exams
  saveMockExamResult(result: MockExamResult): void {
    const list = safeGetItem<MockExamResult[]>(KEYS.MOCK_EXAMS, []);
    list.unshift(result);
    safeSetItem(KEYS.MOCK_EXAMS, list);
  },

  getMockExamHistory(): MockExamResult[] {
    return safeGetItem<MockExamResult[]>(KEYS.MOCK_EXAMS, []);
  },

  // Compute Overall Statistics dynamically
  getOverallStats(allQuestions: Question[]): OverallStats {
    const answers = this.getAllAnswers();
    const records = Object.values(answers) as AnswerRecord[];

    const totalAnswered = records.length;
    const totalCorrect = records.filter((r) => r.isCorrect).length;
    const totalWrong = totalAnswered - totalCorrect;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    // Calculate current streak
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    let streak = 0;
    for (const r of sorted) {
      if (r.isCorrect) {
        streak++;
      } else {
        break;
      }
    }

    // Question map to look up subject
    const qMap = new Map<string, Question>();
    allQuestions.forEach((q) => qMap.set(q.id, q));

    // Subject breakdown
    const subjectBreakdown: OverallStats['subjectBreakdown'] = {};
    CORE_SUBJECTS.forEach((sub) => {
      subjectBreakdown[sub.id] = {
        subjectName: sub.name,
        totalAnswered: 0,
        correctCount: 0,
        accuracy: 0,
      };
    });

    records.forEach((r) => {
      const q = qMap.get(r.questionId);
      if (q && subjectBreakdown[q.subjectId]) {
        subjectBreakdown[q.subjectId].totalAnswered++;
        if (r.isCorrect) {
          subjectBreakdown[q.subjectId].correctCount++;
        }
      }
    });

    let strongest: { id: string; name: string; accuracy: number } | undefined;
    let weakest: { id: string; name: string; accuracy: number } | undefined;
    let maxAcc = -1;
    let minAcc = 101;

    Object.entries(subjectBreakdown).forEach(([subId, item]) => {
      if (item.totalAnswered > 0) {
        item.accuracy = Math.round((item.correctCount / item.totalAnswered) * 100);
        if (item.accuracy > maxAcc) {
          maxAcc = item.accuracy;
          strongest = { id: subId, name: item.subjectName, accuracy: item.accuracy };
        }
        if (item.accuracy < minAcc) {
          minAcc = item.accuracy;
          weakest = { id: subId, name: item.subjectName, accuracy: item.accuracy };
        }
      }
    });

    return {
      totalAnswered,
      totalCorrect,
      totalWrong,
      accuracy,
      streak,
      maxStreak: streak,
      subjectBreakdown,
      strongestSubject: strongest,
      weakestSubject: weakest,
    };
  },

  resetAllData(): void {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
