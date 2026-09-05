import React, { useState } from 'react';
import {
  Upload,
  X,
  FileText,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Save,
} from 'lucide-react';
import { ALL_YEARS, CORE_SUBJECTS } from '../data/subjects';
import { parseCSVQuestions, parseJSONQuestions, parsePDFQuestions, ParseResult } from '../utils/pdfParser';
import { storageService } from '../services/storageService';
import { Question } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf-text' | 'json' | 'csv'>('pdf-text');
  const [targetYear, setTargetYear] = useState<number>(113);
  const [targetSubjectId, setTargetSubjectId] = useState<string>('patent-law');
  const [rawInput, setRawInput] = useState<string>('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!isOpen) return null;

  const currentSubject = CORE_SUBJECTS.find((s) => s.id === targetSubjectId) || CORE_SUBJECTS[0];

  const handleParse = () => {
    if (!rawInput.trim()) return;

    let res: ParseResult;
    if (activeTab === 'pdf-text') {
      res = parsePDFQuestions(rawInput, targetYear, targetSubjectId, currentSubject.name);
    } else if (activeTab === 'csv') {
      res = parseCSVQuestions(rawInput, targetYear, targetSubjectId, currentSubject.name);
    } else {
      res = parseJSONQuestions(rawInput);
    }

    setParseResult(res);
    if (res.questions.length > 0) {
      setPreviewOpen(true);
    }
  };

  const handleSaveToBank = () => {
    if (!parseResult || parseResult.questions.length === 0) return;
    storageService.addCustomQuestions(parseResult.questions);
    onImportSuccess(parseResult.questions.length);
    onClose();
  };

  const handleExportJSON = () => {
    if (!parseResult || parseResult.questions.length === 0) return;
    const jsonStr = JSON.stringify(parseResult.questions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-${targetYear}-${targetSubjectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">題庫資料匯入與管理</h2>
              <p className="text-xs text-slate-500">
                支援考選部 PDF 試題文字、JSON 及 CSV 結構化題庫批次匯入
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Metadata Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">目標考試年度</label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
              >
                {ALL_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y} 年專利師考試
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">目標考試科目</label>
              <select
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
              >
                {CORE_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format Selection Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab('pdf-text')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'pdf-text'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              考選部 PDF 試題文字貼上
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'json'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              JSON 題庫資料
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'csv'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV 試題表格
            </button>
          </div>

          {/* Format Hint */}
          <div className="text-xs text-slate-500 bg-blue-50/70 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              {activeTab === 'pdf-text' && (
                <p>
                  直接複製考選部 PDF 試題文本（例如包含「1. 依專利法規定... (A)... (B)... (C)... (D)...」），系統會自動辨識題號、題目與選項，容錯設計確保單一錯誤不中斷整批匯入。
                </p>
              )}
              {activeTab === 'json' && (
                <p>
                  支援標準 Question 陣列格式（含 id, year, subjectId, questionNumber, question, options, officialAnswer, explanation）。
                </p>
              )}
              {activeTab === 'csv' && (
                <p>
                  支援逗號分隔 CSV：題號, 題目, 選項A, 選項B, 選項C, 選項D, 正確答案, 解析說明。
                </p>
              )}
            </div>
          </div>

          {/* Textarea Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                貼上試題內容或資料
              </label>
              <span className="text-[11px] text-slate-400">
                {rawInput.length} 字元
              </span>
            </div>
            <textarea
              id="import-raw-textarea"
              rows={8}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={
                activeTab === 'pdf-text'
                  ? `例如貼上考選部 PDF 內容：\n1. 依專利法規定，下列何者正確？\n(A) 專利申請權不得讓與\n(B) 受雇人職務上之發明，專利權屬於雇用人\n(C) 新型專利保護期限為20年\n(D) 設計專利不具優先權\n答案：B\n解析：依專利法第7條規定...`
                  : activeTab === 'csv'
                  ? `題號,題目,A,B,C,D,答案,解析\n1,依專利法規定職務發明歸屬？,歸受雇人,歸雇用人,歸主管機關,不予專利,B,依專利法第7條`
                  : `[\n  {\n    "questionNumber": 1,\n    "question": "依專利法規定...",\n    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },\n    "officialAnswer": "B",\n    "explanation": "依專利法第7條..."\n  }\n]`
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed"
            />
          </div>

          {/* Parse Result Summary */}
          {parseResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                parseResult.success
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-red-50/60 border-red-200 text-red-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm flex items-center gap-1.5">
                  {parseResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>
                    解析完成：成功擷取 {parseResult.questions.length} 題
                  </span>
                </div>
                {parseResult.questions.length > 0 && (
                  <button
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="text-xs font-medium text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {previewOpen ? '收合預覽' : '展開預覽'}
                  </button>
                )}
              </div>

              {parseResult.errors.length > 0 && (
                <div className="text-xs text-red-700 space-y-0.5 pt-1">
                  <p className="font-semibold">部分警告或忽略訊息：</p>
                  {parseResult.errors.slice(0, 3).map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                  {parseResult.errors.length > 3 && (
                    <p>• 還有 {parseResult.errors.length - 3} 項訊息...</p>
                  )}
                </div>
              )}

              {/* Preview Table */}
              {previewOpen && parseResult.questions.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white text-xs text-slate-700 divide-y divide-slate-100 mt-2">
                  {parseResult.questions.map((q, idx) => (
                    <div key={idx} className="p-2.5 space-y-1">
                      <div className="font-semibold text-slate-900">
                        #{q.questionNumber} {q.question.substring(0, 45)}...
                      </div>
                      <div className="text-[11px] text-slate-500">
                        答案：【{q.officialAnswer}】｜ A: {q.options.A?.substring(0, 20)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              id="parse-btn"
              onClick={handleParse}
              disabled={!rawInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white transition-colors"
            >
              開始解析試題
            </button>

            {parseResult && parseResult.questions.length > 0 && (
              <button
                id="export-json-btn"
                onClick={handleExportJSON}
                className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors"
                title="匯出為 questions-*.json"
              >
                <Download className="w-3.5 h-3.5" />
                匯出 JSON
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              id="confirm-write-bank-btn"
              onClick={handleSaveToBank}
              disabled={!parseResult || parseResult.questions.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              確認寫入題庫（{parseResult?.questions.length || 0} 題）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
