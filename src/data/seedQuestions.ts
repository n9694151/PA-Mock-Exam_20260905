import { Question } from '../types';
import questions111 from './questions-111.json';
import questions112 from './questions-112.json';
import questions113 from './questions-113.json';
import questions114 from './questions-114.json';
import questions115 from './questions-115.json';

// Automatically merge static year questions into one dataset
export const SEED_QUESTIONS: Question[] = [
  ...(questions111 as Question[]),
  ...(questions112 as Question[]),
  ...(questions113 as Question[]),
  ...(questions114 as Question[]),
  ...(questions115 as Question[]),
];

export function getQuestionsByYear(year: number): Question[] {
  return SEED_QUESTIONS.filter((q) => q.year === year);
}

export function getQuestionsBySubject(subjectId: string): Question[] {
  return SEED_QUESTIONS.filter((q) => q.subjectId === subjectId);
}
