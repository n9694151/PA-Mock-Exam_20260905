import React from 'react';
import { ExternalLink, ShieldAlert, Award, FileCheck } from 'lucide-react';
import { OFFICIAL_MOEX_SEARCH_URL } from '../data/subjects';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-900" />
              <h2 className="font-bold text-slate-900 text-base">專利師歷屆試題寶典</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                111～115年專利師考試線上刷題平台
              </span>
            </div>
            <p className="text-slate-500 mt-1">
              專利法規・專利行政救濟・專利審查基準・物理化學・專業英文・工程力學・專利代理實務
            </p>
          </div>

          <div>
            <a
              id="footer-moex-link"
              href={OFFICIAL_MOEX_SEARCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors"
            >
              <FileCheck className="w-4 h-4 text-blue-800" />
              <span>考選部官方考畢試題查詢平台</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Legal and Disclaimer Notices */}
        <div className="space-y-2 text-slate-500 leading-relaxed">
          <div className="flex items-start gap-2 text-amber-800/90 bg-amber-50/60 p-3 rounded-lg border border-amber-200/50">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-amber-900">
                【版權與資料使用提醒】非官方考試平台，僅供學習使用
              </p>
              <p className="text-slate-600">
                本平台為非官方之自學練習工具，題目資料來源為中華民國考選部公開之考試資訊。相關試題、公布答案及其他資料之著作權與權利均歸原權利人（中華民國考選部及出題單位）所有。
              </p>
              <p className="text-slate-600">
                Gemini AI 輔助解析僅供個人學習理解參考，不代表考選部、智慧財產局或其他官方機關之立場；正式考試作答與法規引用請以主管機關最新公布之法規及實務標準為準。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} 專利師歷屆試題寶典 • 題目資料來源：中華民國考選部公開資訊</p>
            <p>最後更新：依題庫資料為準</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
