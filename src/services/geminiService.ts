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
  // Try backend endpoint first (if running with server.ts)
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

    if (res.ok) {
      const data = await res.json();
      return {
        explanation: data.explanation,
        isFallback: data.isFallback,
      };
    }
  } catch {
    // Fall through to standalone local explanation generator
  }

  // 100% Client-side local explanation (Works offline & on GitHub Pages, zero API keys required)
  const isCorrect = userAnswer === question.officialAnswer;
  const optionsText = question.options
    ? Object.entries(question.options)
        .map(([key, val]) => `• (${key}) ${val}`)
        .join('\n')
    : '';

  const explanation = `【官方標準解答與解析指引】
考試年度：民國 ${question.year || 113} 年
科目名稱：${question.subjectName || '專利師專業考科'}

【作答對照】
• 官方公布正確答案：【${question.officialAnswer || '見官方公告'}】
• 考生目前選擇答案：【${userAnswer || '未作答'}】（${isCorrect ? '作答正確 ✅' : '作答錯誤 ❌'}）

【試題內容】
${question.question}

${optionsText ? `【選項內容】\n${optionsText}\n` : ''}
【法規與研讀指引】
1. 本題標準解答以考選部公布之專利師考試官方正解為依據。
2. 法律考科請查閱經濟部智慧財產局最新版《專利法》、《專利法施行細則》與《專利審查基準》對照條文。
3. 理工科目（普通物理與普通化學、工程力學等）請著重基礎公式推導與題幹邊界條件分析。`;

  return {
    explanation,
    isFallback: true,
  };
}
