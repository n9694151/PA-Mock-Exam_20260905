import { AnswerRecord, MockExamResult, OverallStats, Question, WrongQuestionRecord } from '../types';
import { CORE_SUBJECTS } from '../data/subjects';
import { authService } from './authService';

const BASE_KEYS = {
  ANSWERS: 'patent_answers_v1',
  WRONG_QUESTIONS: 'patent_wrong_questions_v1',
  FAVORITES: 'patent_favorites_v1',
  CUSTOM_QUESTIONS: 'patent_custom_questions_v1', // shared globally across accounts
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

function getUserStorageKey(baseKey: string, emailOverride?: string | null): string {
  const currentEmail = emailOverride !== undefined ? emailOverride : authService.getCurrentUser()?.email;
  if (!currentEmail) {
    // Guest or unauthenticated storage key
    return `${baseKey}_guest`;
  }
  const safeEmail = encodeURIComponent(currentEmail.trim().toLowerCase());
  return `${baseKey}_user_${safeEmail}`;
}

export const storageService = {
  // Authentication status query
  isLoggedIn(): boolean {
    return authService.getCurrentUser() !== null;
  },

  getCurrentUserEmail(): string | null {
    return authService.getCurrentUser()?.email || null;
  },

  // Answer records
  saveAnswer(record: AnswerRecord, emailOverride?: string | null): void {
    const activeEmail = emailOverride !== undefined ? emailOverride : this.getCurrentUserEmail();
    const recordWithEmail: AnswerRecord = {
      ...record,
      userEmail: activeEmail || undefined,
    };

    const key = getUserStorageKey(BASE_KEYS.ANSWERS, activeEmail);
    const all = safeGetItem<Record<string, AnswerRecord>>(key, {});
    all[record.questionId] = recordWithEmail;
    safeSetItem(key, all);

    if (!record.isCorrect) {
      this.recordWrongQuestion(record.questionId, record.selectedOption, '', activeEmail);
    }
  },

  getAnswer(questionId: string, emailOverride?: string | null): AnswerRecord | null {
    const key = getUserStorageKey(BASE_KEYS.ANSWERS, emailOverride);
    const all = safeGetItem<Record<string, AnswerRecord>>(key, {});
    return all[questionId] || null;
  },

  getAllAnswers(emailOverride?: string | null): Record<string, AnswerRecord> {
    const key = getUserStorageKey(BASE_KEYS.ANSWERS, emailOverride);
    return safeGetItem<Record<string, AnswerRecord>>(key, {});
  },

  // Wrong questions notebook (specifically tracked and isolated for logged-in accounts)
  recordWrongQuestion(
    questionId: string,
    userChoice: string,
    officialAnswer: string = '',
    emailOverride?: string | null
  ): void {
    const activeEmail = emailOverride !== undefined ? emailOverride : this.getCurrentUserEmail();
    const key = getUserStorageKey(BASE_KEYS.WRONG_QUESTIONS, activeEmail);
    const all = safeGetItem<Record<string, WrongQuestionRecord>>(key, {});
    const existing = all[questionId];

    if (existing) {
      existing.failedCount += 1;
      existing.lastAttemptTime = Date.now();
      existing.lastAnsweredOption = userChoice;
      if (officialAnswer) existing.officialAnswer = officialAnswer;
      existing.solved = false;
      existing.userEmail = activeEmail || undefined;
      all[questionId] = existing;
    } else {
      all[questionId] = {
        questionId,
        lastAnsweredOption: userChoice,
        officialAnswer,
        failedCount: 1,
        lastAttemptTime: Date.now(),
        solved: false,
        userEmail: activeEmail || undefined,
      };
    }
    safeSetItem(key, all);
  },

  removeWrongQuestion(questionId: string, emailOverride?: string | null): void {
    const key = getUserStorageKey(BASE_KEYS.WRONG_QUESTIONS, emailOverride);
    const all = safeGetItem<Record<string, WrongQuestionRecord>>(key, {});
    if (all[questionId]) {
      delete all[questionId];
      safeSetItem(key, all);
    }
  },

  markWrongQuestionSolved(questionId: string, emailOverride?: string | null): void {
    const key = getUserStorageKey(BASE_KEYS.WRONG_QUESTIONS, emailOverride);
    const all = safeGetItem<Record<string, WrongQuestionRecord>>(key, {});
    if (all[questionId]) {
      all[questionId].solved = true;
      safeSetItem(key, all);
    }
  },

  getAllWrongRecords(emailOverride?: string | null): Record<string, WrongQuestionRecord> {
    const activeEmail = emailOverride !== undefined ? emailOverride : this.getCurrentUserEmail();
    const key = getUserStorageKey(BASE_KEYS.WRONG_QUESTIONS, activeEmail);
    const records = safeGetItem<Record<string, WrongQuestionRecord>>(key, {});

    // Backward compatibility: If logged-in user has 0 records, but legacy un-namespaced exists, check for migration
    if (activeEmail && Object.keys(records).length === 0) {
      const legacy = safeGetItem<Record<string, WrongQuestionRecord>>(BASE_KEYS.WRONG_QUESTIONS, {});
      if (Object.keys(legacy).length > 0) {
        // Auto-migrate legacy records to this first logged in user
        safeSetItem(key, legacy);
        return legacy;
      }
    }

    return records;
  },

  getWrongQuestionIds(emailOverride?: string | null): string[] {
    const all = this.getAllWrongRecords(emailOverride);
    return Object.keys(all);
  },

  getWrongQuestionCount(emailOverride?: string | null): number {
    return this.getWrongQuestionIds(emailOverride).length;
  },

  // Favorites
  toggleFavorite(questionId: string, emailOverride?: string | null): boolean {
    const key = getUserStorageKey(BASE_KEYS.FAVORITES, emailOverride);
    const set = new Set<string>(safeGetItem<string[]>(key, []));
    let isNowFav = false;
    if (set.has(questionId)) {
      set.delete(questionId);
      isNowFav = false;
    } else {
      set.add(questionId);
      isNowFav = true;
    }
    safeSetItem(key, Array.from(set));
    return isNowFav;
  },

  isFavorite(questionId: string, emailOverride?: string | null): boolean {
    const key = getUserStorageKey(BASE_KEYS.FAVORITES, emailOverride);
    const list = safeGetItem<string[]>(key, []);
    return list.includes(questionId);
  },

  getFavoriteIds(emailOverride?: string | null): string[] {
    const key = getUserStorageKey(BASE_KEYS.FAVORITES, emailOverride);
    return safeGetItem<string[]>(key, []);
  },

  // Custom imported questions (shared platform-wide)
  getCustomQuestions(): Question[] {
    return safeGetItem<Question[]>(BASE_KEYS.CUSTOM_QUESTIONS, []);
  },

  addCustomQuestions(newQuestions: Question[]): void {
    const existing = safeGetItem<Question[]>(BASE_KEYS.CUSTOM_QUESTIONS, []);
    const existingIds = new Set(existing.map((q) => q.id));
    const merged = [...existing];
    for (const q of newQuestions) {
      if (!existingIds.has(q.id)) {
        merged.push(q);
        existingIds.add(q.id);
      }
    }
    safeSetItem(BASE_KEYS.CUSTOM_QUESTIONS, merged);
  },

  clearCustomQuestions(): void {
    safeSetItem(BASE_KEYS.CUSTOM_QUESTIONS, []);
  },

  // Mock exams
  saveMockExamResult(result: MockExamResult, emailOverride?: string | null): void {
    const key = getUserStorageKey(BASE_KEYS.MOCK_EXAMS, emailOverride);
    const list = safeGetItem<MockExamResult[]>(key, []);
    list.unshift(result);
    safeSetItem(key, list);
  },

  getMockExamHistory(emailOverride?: string | null): MockExamResult[] {
    const key = getUserStorageKey(BASE_KEYS.MOCK_EXAMS, emailOverride);
    return safeGetItem<MockExamResult[]>(key, []);
  },

  // Migration helper: Transfer guest records to logged-in user account
  migrateGuestDataToUser(targetEmail: string): { migratedWrong: number; migratedAnswers: number } {
    if (!targetEmail) return { migratedWrong: 0, migratedAnswers: 0 };
    const guestWrongKey = getUserStorageKey(BASE_KEYS.WRONG_QUESTIONS, null);
    const guestAnswerKey = getUserStorageKey(BASE_KEYS.ANSWERS, null);
    const userWrongKey = getUserStorageKey(BASE_KEYS.WRONG_QUESTIONS, targetEmail);
    const userAnswerKey = getUserStorageKey(BASE_KEYS.ANSWERS, targetEmail);

    const guestWrong = safeGetItem<Record<string, WrongQuestionRecord>>(guestWrongKey, {});
    const guestAnswers = safeGetItem<Record<string, AnswerRecord>>(guestAnswerKey, {});
    const userWrong = safeGetItem<Record<string, WrongQuestionRecord>>(userWrongKey, {});
    const userAnswers = safeGetItem<Record<string, AnswerRecord>>(userAnswerKey, {});

    let migratedWrong = 0;
    Object.entries(guestWrong).forEach(([id, rec]) => {
      if (!userWrong[id]) {
        userWrong[id] = { ...rec, userEmail: targetEmail };
        migratedWrong++;
      }
    });

    let migratedAnswers = 0;
    Object.entries(guestAnswers).forEach(([id, rec]) => {
      if (!userAnswers[id]) {
        userAnswers[id] = { ...rec, userEmail: targetEmail };
        migratedAnswers++;
      }
    });

    safeSetItem(userWrongKey, userWrong);
    safeSetItem(userAnswerKey, userAnswers);

    return { migratedWrong, migratedAnswers };
  },

  // Compute Overall Statistics dynamically for current user
  getOverallStats(allQuestions: Question[], emailOverride?: string | null): OverallStats {
    const answers = this.getAllAnswers(emailOverride);
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

  // Reset data for currently active user only
  resetCurrentUserData(): void {
    const email = this.getCurrentUserEmail();
    const wrongKey = getUserStorageKey(BASE_KEYS.WRONG_QUESTIONS, email);
    const ansKey = getUserStorageKey(BASE_KEYS.ANSWERS, email);
    const favKey = getUserStorageKey(BASE_KEYS.FAVORITES, email);
    const mockKey = getUserStorageKey(BASE_KEYS.MOCK_EXAMS, email);

    localStorage.removeItem(wrongKey);
    localStorage.removeItem(ansKey);
    localStorage.removeItem(favKey);
    localStorage.removeItem(mockKey);
  },

  resetAllData(): void {
    Object.values(BASE_KEYS).forEach((k) => {
      // Clear legacy
      localStorage.removeItem(k);
    });
    this.resetCurrentUserData();
  },
};
