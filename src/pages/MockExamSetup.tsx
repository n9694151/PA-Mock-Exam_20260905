import React, { useState } from 'react';
import { Clock, ShieldCheck, Award, ArrowRight, Info } from 'lucide-react';
import { ALL_YEARS, CORE_SUBJECTS } from '../data/subjects';

interface MockExamSetupProps {
  onStartExam: (year: number, subjectId: string, durationMinutes: number) => void;
}

export const MockExamSetup: React.FC<MockExamSetupProps> = ({ onStartExam }) => {
  const [selectedYear, setSelectedYear] = useState<number>(113);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('patent-law');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);

  const durationOptions = [
    { value: 40, label: '40 分鐘（高壓衝刺）' },
    { value: 60, label: '60 分鐘（國考標準）' },
    { value: 90, label: '90 分鐘（從容深思）' },
  ];

  const handleStart = () => {
    onStartExam(selectedYear, selectedSubjectId, durationMinutes);
  };

  const currentSubject = CORE_SUBJECTS.find((s) => s.id === selectedSubjectId);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          全真整年度模擬考試
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          比照國家專利師專技高考作答體驗，倒數計時交卷、答題不即時公布答案、考畢生成全卷分析報告。
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        {/* Year Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            1. 選擇考試年度
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ALL_YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setSelectedYear(y)}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedYear === y
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                民國 {y} 年
              </button>
            ))}
          </div>
        </div>

        {/* Subject Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            2. 選擇考試科目
          </label>
          <select
            id="mock-subject-select"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            {CORE_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          {currentSubject && (
            <p className="text-xs text-slate-500 px-1">
              {currentSubject.description}
            </p>
          )}
        </div>

        {/* Duration Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            3. 設定考試時間限制
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDurationMinutes(opt.value)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all ${
                  durationMinutes === opt.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* National Exam Rules & Instructions */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-blue-800" />
            <span>模擬考試注意事項</span>
          </div>
          <ul className="space-y-1 pl-5 list-disc">
            <li>全卷均為單選題，每題有 (A)、(B)、(C)、(D) 四個選項。</li>
            <li>答錯不倒扣。計時結束時系統將自動強制交卷並結算分數。</li>
            <li>測驗進行中不會提示正確答案，交卷後方可檢視試題官方解答與 AI 詳解。</li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            id="start-mock-exam-btn"
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <span>開始模擬考試</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
