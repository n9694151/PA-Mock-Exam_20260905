import { Subject } from '../types';

export const CORE_SUBJECTS: Subject[] = [
  {
    id: 'patent-law',
    name: '專利法規',
    code: 'PL',
    isCore: true,
    description: '專利法及其施行細則、巴黎公約、TRIPs 協議等實體專利法規核心條文與法理。',
    defaultQuestionCount: 50,
  },
  {
    id: 'patent-admin-remedy',
    name: '專利行政與救濟法規',
    code: 'PAR',
    isCore: true,
    description: '行政程序法、訴願法、行政訴訟法、智慧財產案件審理法及相關救濟爭訟法規。',
    defaultQuestionCount: 50,
  },
  {
    id: 'physics-chemistry',
    name: '普通物理與普通化學',
    code: 'PC',
    isCore: true,
    description: '古典力學、電磁學、熱力學、光學、一般化學、有機無機基礎與近代物理概念。',
    defaultQuestionCount: 50,
  },
  {
    id: 'patent-examination-practice',
    name: '專利審查基準與實務',
    code: 'PEP',
    isCore: true,
    description: '專利審查基準第一篇至第五篇、新型專利技術報告、舉發審查基準與各類專利審查流程。',
    defaultQuestionCount: 50,
  },
  {
    id: 'professional-english',
    name: '專業英文',
    code: 'PE',
    isCore: true,
    description: '專利說明書英文研析、國際專利申請審查用語、法規專業英文單字與段落理解。',
    defaultQuestionCount: 50,
  },
  {
    id: 'engineering-mechanics',
    name: '工程力學',
    code: 'EM',
    isCore: true,
    description: '靜力學、動力學、材料力學受力分析、應力應變與結構強度計算。',
    defaultQuestionCount: 50,
  },
  {
    id: 'patent-agent-practice',
    name: '專利代理實務',
    code: 'PAP',
    isCore: true,
    description: '專利申請書撰寫、說明書與申請專利範圍撰擬實務、申復更正答辯作業。',
    defaultQuestionCount: 40,
  },
];

export const ELECTIVE_SUBJECTS_RESERVED: Subject[] = [
  {
    id: 'biotechnology',
    name: '生物技術（選試）',
    code: 'BIO',
    isCore: false,
    description: '分子生物學、基因工程、生物資訊與生技專利標的審查實務。',
    defaultQuestionCount: 40,
  },
  {
    id: 'electronics',
    name: '電子學（選試）',
    code: 'EE',
    isCore: false,
    description: '半導體物理、類比電路、數位邏輯電路與電子專利標的解析。',
    defaultQuestionCount: 40,
  },
  {
    id: 'industrial-design',
    name: '工業設計（選試）',
    code: 'ID',
    isCore: false,
    description: '設計專利審查、產品外觀造形、人因工程與設計專利實務。',
    defaultQuestionCount: 40,
  },
  {
    id: 'computer-architecture',
    name: '計算機結構（選試）',
    code: 'CS',
    isCore: false,
    description: '計算機組織、處理器架構、記憶體階層與軟體相關發明專利標的。',
    defaultQuestionCount: 40,
  },
];

export const ALL_YEARS = [115, 114, 113, 112, 111];

export const OFFICIAL_MOEX_SEARCH_URL = 'https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx?y=2024&e=113130';
