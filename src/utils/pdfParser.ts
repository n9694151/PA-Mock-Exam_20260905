import { Question } from '../types';

export interface ParseResult {
  success: boolean;
  questions: Question[];
  errors: string[];
  totalParsed: number;
}

/**
 * 考選部歷屆試題 PDF 文字解析器
 * 可處理直接從考選部 PDF 複製的文字段落，自動擷取題號、題目、A/B/C/D 選項與答案
 */
export function parsePDFQuestions(
  rawText: string,
  year: number,
  subjectId: string,
  subjectName: string
): ParseResult {
  const errors: string[] = [];
  const questions: Question[] = [];

  if (!rawText || rawText.trim().length === 0) {
    return { success: false, questions: [], errors: ['請提供試題文字內容'], totalParsed: 0 };
  }

  // Normalize line endings
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Regex splitting on numbered questions, e.g. "1.", "1 ", "(1)", "第 1 題"
  const questionBlocks = cleanText.split(/\n(?=(?:第\s*\d+\s*題|\d+[\.、\s]|\(\d+\)))/);

  let fallbackNumber = 1;

  for (let idx = 0; idx < questionBlocks.length; idx++) {
    const block = questionBlocks[idx].trim();
    if (!block || block.length < 15) continue; // skip headers / noise

    try {
      // Extract question number
      const numMatch = block.match(/^(?:第\s*(\d+)\s*題|(\d+)[\.、\s]|\((\d+)\))/);
      const qNum = numMatch
        ? parseInt(numMatch[1] || numMatch[2] || numMatch[3], 10)
        : fallbackNumber++;

      // Remove leading number header from text
      const contentWithoutNum = block.replace(/^(?:第\s*\d+\s*題|\d+[\.、\s]|\(\d+\))/, '').trim();

      // Look for options (A), (B), (C), (D) or (1), (2), (3), (4) or A., B., C., D.
      // Split question text from options
      const optMatchA = contentWithoutNum.search(/(?:\([A-Da-d]\)|[A-Da-d][\.、\s])/);

      let questionText = contentWithoutNum;
      const options: Record<string, string> = { A: '', B: '', C: '', D: '' };

      if (optMatchA !== -1) {
        questionText = contentWithoutNum.substring(0, optMatchA).trim();
        const optionsPart = contentWithoutNum.substring(optMatchA);

        // Extract A, B, C, D
        const optA = optionsPart.match(/(?:\([Aa]\)|[Aa][\.、\s])\s*([\s\S]*?)(?=(?:\([Bb]\)|[Bb][\.、\s])|$)/);
        const optB = optionsPart.match(/(?:\([Bb]\)|[Bb][\.、\s])\s*([\s\S]*?)(?=(?:\([Cc]\)|[Cc][\.、\s])|$)/);
        const optC = optionsPart.match(/(?:\([Cc]\)|[Cc][\.、\s])\s*([\s\S]*?)(?=(?:\([Dd]\)|[Dd][\.、\s])|$)/);
        const optD = optionsPart.match(/(?:\([Dd]\)|[Dd][\.、\s])\s*([\s\S]*?)(?=(?:答案|Ans|解析|$))/);

        if (optA) options.A = optA[1].trim().replace(/\n+/g, ' ');
        if (optB) options.B = optB[1].trim().replace(/\n+/g, ' ');
        if (optC) options.C = optC[1].trim().replace(/\n+/g, ' ');
        if (optD) options.D = optD[1].trim().replace(/\n+/g, ' ');
      }

      // Look for answer if present in text
      let officialAnswer = 'A';
      const ansMatch = block.match(/(?:答案|Ans|解答)[：:\s]*([A-Da-d])/i);
      if (ansMatch) {
        officialAnswer = ansMatch[1].toUpperCase();
      }

      // Look for explanation
      let explanation = '';
      const expMatch = block.match(/(?:解析|說明)[：:\s]*([\s\S]*?)$/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }

      // Generate question object
      const parsedQuestion: Question = {
        id: `${year}-${subjectId}-${String(qNum).padStart(3, '0')}`,
        year,
        subjectId,
        subjectName,
        questionNumber: qNum,
        questionType: 'multiple-choice',
        question: questionText || `題目 #${qNum}`,
        options: {
          A: options.A || '（選項 A 待確認）',
          B: options.B || '（選項 B 待確認）',
          C: options.C || '（選項 C 待確認）',
          D: options.D || '（選項 D 待確認）',
        },
        officialAnswer,
        explanation: explanation || '本題目前尚未建立官方解析。',
        source: '考選部公開資訊（匯入）',
        sourceYear: year,
        sourceUrl: 'https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx?y=2024&e=113130',
        isDemo: false,
      };

      questions.push(parsedQuestion);
    } catch (e: any) {
      errors.push(`第 ${idx + 1} 個題目區塊解析異常：${e.message}`);
    }
  }

  return {
    success: questions.length > 0,
    questions,
    errors,
    totalParsed: questions.length,
  };
}

/**
 * CSV 試題格式解析器
 * 支援欄位：題號,題目,A,B,C,D,答案,解析
 */
export function parseCSVQuestions(
  csvContent: string,
  year: number,
  subjectId: string,
  subjectName: string
): ParseResult {
  const errors: string[] = [];
  const questions: Question[] = [];

  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) {
    return { success: false, questions: [], errors: ['CSV 資料為空或僅包含標題列'], totalParsed: 0 };
  }

  // Simple CSV parser supporting quotes
  function parseCSVLine(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  // Header inspection
  const headers = parseCSVLine(lines[0]);
  const startRow = headers.some((h) => h.includes('題') || h.includes('Question')) ? 1 : 0;

  for (let i = startRow; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 6) {
      errors.push(`第 ${i + 1} 行欄位不足（需至少包含題號、題目、選項A-D）：${lines[i].substring(0, 30)}...`);
      continue;
    }

    const qNum = parseInt(cols[0], 10) || i;
    const qText = cols[1];
    const optA = cols[2] || '';
    const optB = cols[3] || '';
    const optC = cols[4] || '';
    const optD = cols[5] || '';
    const ans = (cols[6] || 'A').toUpperCase().trim();
    const exp = cols[7] || '';

    questions.push({
      id: `${year}-${subjectId}-${String(qNum).padStart(3, '0')}`,
      year,
      subjectId,
      subjectName,
      questionNumber: qNum,
      questionType: 'multiple-choice',
      question: qText,
      options: {
        A: optA,
        B: optB,
        C: optC,
        D: optD,
      },
      officialAnswer: ['A', 'B', 'C', 'D'].includes(ans) ? ans : 'A',
      explanation: exp || '本題目前尚未建立官方解析。',
      source: '考選部公開資訊（CSV 匯入）',
      sourceYear: year,
      sourceUrl: 'https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx?y=2024&e=113130',
      isDemo: false,
    });
  }

  return {
    success: questions.length > 0,
    questions,
    errors,
    totalParsed: questions.length,
  };
}

/**
 * JSON 格式解析與驗證
 */
export function parseJSONQuestions(jsonContent: string): ParseResult {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(jsonContent);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    const validQuestions: Question[] = [];

    arr.forEach((item, idx) => {
      if (!item.question) {
        errors.push(`第 ${idx + 1} 筆資料缺少 question 題目內容`);
        return;
      }
      validQuestions.push({
        id: item.id || `custom-${Date.now()}-${idx}`,
        year: Number(item.year) || 113,
        subjectId: item.subjectId || 'patent-law',
        subjectName: item.subjectName || '專利法規',
        questionNumber: Number(item.questionNumber) || idx + 1,
        questionType: item.questionType || 'multiple-choice',
        question: String(item.question),
        options: item.options || { A: 'A', B: 'B', C: 'C', D: 'D' },
        officialAnswer: String(item.officialAnswer || item.answer || 'A').toUpperCase(),
        explanation: item.explanation || '本題目前尚未建立官方解析。',
        source: item.source || '考選部公開資訊（JSON 匯入）',
        sourceYear: Number(item.sourceYear) || Number(item.year) || 113,
        sourceUrl: item.sourceUrl || 'https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx?y=2024&e=113130',
        isDemo: Boolean(item.isDemo),
        categoryTag: item.categoryTag || '',
      });
    });

    return {
      success: validQuestions.length > 0,
      questions: validQuestions,
      errors,
      totalParsed: validQuestions.length,
    };
  } catch (e: any) {
    return {
      success: false,
      questions: [],
      errors: [`JSON 格式錯誤：${e.message}`],
      totalParsed: 0,
    };
  }
}
