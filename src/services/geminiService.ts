import { Question } from '../types';

export interface GeminiExplainResponse {
  explanation: string;
  isFallback?: boolean;
  error?: string;
}

export async function requestGeminiExplanation(
  question: Question,
  userAnswer?: string
): Promise<GeminiExplainResponse> {
  try {
    const res = await fetch('/api/gemini/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.question,
        options: question.options,
        officialAnswer: question.officialAnswer,
        userAnswer: userAnswer || '',
        subjectName: question.subjectName,
        year: question.year,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        explanation:
          errData.explanation ||
          '無法取得 AI 輔助解析。請確認網路連線與後端設定，建議查閱官方公布之法規條文與解答。',
        error: errData.error,
      };
    }

    const data = await res.json();
    return {
      explanation: data.explanation,
      isFallback: data.isFallback,
    };
  } catch (err: any) {
    return {
      explanation:
        'AI 解析連線逾時。請稍後再試，或逕向考選部及經濟部智慧財產局法規資料庫查詢。',
      error: err.message,
    };
  }
}
