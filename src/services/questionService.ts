import { Question, QuizFilter } from '../types';
import { SEED_QUESTIONS } from '../data/seedQuestions';
import { storageService } from './storageService';

export const questionService = {
  // Returns all available questions: seed + custom imported
  getAllQuestions(): Question[] {
    const custom = storageService.getCustomQuestions();
    return [...SEED_QUESTIONS, ...custom];
  },

  getQuestionById(id: string): Question | undefined {
    return this.getAllQuestions().find((q) => q.id === id);
  },

  filterQuestions(filter: QuizFilter): Question[] {
    let list = this.getAllQuestions();

    if (filter.year && filter.year !== 'all') {
      list = list.filter((q) => q.year === Number(filter.year));
    }

    if (filter.subjectId && filter.subjectId !== 'all') {
      list = list.filter((q) => q.subjectId === filter.subjectId);
    }

    if (filter.status && filter.status !== 'all') {
      const answers = storageService.getAllAnswers();
      const favorites = new Set(storageService.getFavoriteIds());
      const wrongRecords = storageService.getAllWrongRecords();

      if (filter.status === 'unanswered') {
        list = list.filter((q) => !answers[q.id]);
      } else if (filter.status === 'correct') {
        list = list.filter((q) => answers[q.id]?.isCorrect === true);
      } else if (filter.status === 'wrong') {
        list = list.filter((q) => Boolean(wrongRecords[q.id]));
      } else if (filter.status === 'favorite') {
        list = list.filter((q) => favorites.has(q.id));
      }
    }

    if (filter.keyword && filter.keyword.trim() !== '') {
      const kw = filter.keyword.trim().toLowerCase();
      list = list.filter((q) => {
        const inQuestion = q.question.toLowerCase().includes(kw);
        const inExplanation = q.explanation?.toLowerCase().includes(kw) ?? false;
        const inTag = q.categoryTag?.toLowerCase().includes(kw) ?? false;
        const inOptions = Object.values(q.options || {}).some((opt) =>
          String(opt).toLowerCase().includes(kw)
        );
        return inQuestion || inExplanation || inTag || inOptions;
      });
    }

    return list;
  },

  // Pick random non-repeating questions
  getRandomQuestions(options: {
    year?: number | 'all';
    subjectId?: string | 'all';
    count: number;
  }): Question[] {
    let pool = this.getAllQuestions();

    if (options.year && options.year !== 'all') {
      pool = pool.filter((q) => q.year === Number(options.year));
    }

    if (options.subjectId && options.subjectId !== 'all') {
      pool = pool.filter((q) => q.subjectId === options.subjectId);
    }

    // Shuffle pool using Fisher-Yates
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.min(options.count, shuffled.length));
  },

  getMockExamQuestions(year: number, subjectId: string): Question[] {
    return this.getAllQuestions()
      .filter((q) => q.year === year && q.subjectId === subjectId)
      .sort((a, b) => a.questionNumber - b.questionNumber);
  },

  getSubjectsSummary(year?: number | 'all') {
    const questions = this.getAllQuestions();
    const filtered = year && year !== 'all' ? questions.filter((q) => q.year === Number(year)) : questions;
    const answers = storageService.getAllAnswers();

    const stats: Record<string, { total: number; completed: number; correct: number }> = {};

    filtered.forEach((q) => {
      if (!stats[q.subjectId]) {
        stats[q.subjectId] = { total: 0, completed: 0, correct: 0 };
      }
      stats[q.subjectId].total++;
      if (answers[q.id]) {
        stats[q.subjectId].completed++;
        if (answers[q.id].isCorrect) {
          stats[q.subjectId].correct++;
        }
      }
    });

    return stats;
  },
};
