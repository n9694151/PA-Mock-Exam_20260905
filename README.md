# 專利師歷屆試題寶典 (PA-Mock-Exam)

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2?style=flat&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Automated_Deploy-2088FF?style=flat&logo=githubactions&logoColor=white)](https://github.com/features/actions)

> 中華民國專門職業及技術人員高等考試「專利師考試」歷屆試題全功能線上練習與全真模擬測驗平台。  
> 收錄 111～115 年度專利法規、專利行政與救濟法規、普通物理與普通化學等關鍵考科。

---

## 目錄

- [核心功能特色](#-核心功能特色)
- [系統架構與技術棧](#-系統架構與技術棧)
- [快速開始與本機運行](#-快速開始與本機運行)
  - [環境需求](#環境需求)
  - [安裝步驟](#安裝步驟)
  - [常用指令列表](#常用指令列表)
- [環境變數設定](#-環境變數設定)
- [GitHub Actions 自動化部署上線](#-github-actions-自動化部署上線)
  - [GitHub Pages 設定步驟](#github-pages-設定步驟一鍵上線)
  - [工作流程機制說明](#工作流程機制說明)
- [雲端伺服器部屬指南 (Full-Stack Mode)](#-雲端伺服器部屬指南-full-stack-mode)
- [專案目錄結構](#-專案目錄結構)
- [常見問題與除錯 (FAQ)](#-常見問題與除錯-faq)

---

## 🌟 核心功能特色

1. **七大科目題庫瀏覽**：
   - 收錄專利法規、專利行政與救濟法規、普通物理與化學等核心考科，支援多維度即時篩選（年度、科目、關鍵字檢索）。
2. **全真模考計時與隨機抽題**：
   - 模擬考場真實倒數計時情境，交卷後自動計算得分、正確率與答題歷程。
   - 支援跨科目或指定年度彈性隨機抽題測驗（10題、20題、40題）。
3. **個人錯題本與重點收藏**：
   - 答錯題目自動歸檔至「錯題筆記」，支援針對錯題重練直至精通。
   - 題目可隨時加入星號收藏，隨時調閱重點法條。
4. **學習成效雷達統計**：
   - 自動統計練習總題數、平均正確率、科目強弱分析與作答時間分佈，輔助制定衝刺複習策略。
5. **Gemini 3.8 Flash 智慧 AI 解析**：
   - 針對爭議法條、複雜化學/物理計算題，提供嚴謹繁體中文法理依據、條號引用與解題盲點剖析。

---

## 🛠 系統架構與技術棧

| 層級 | 技術 / 套件 | 說明 |
| :--- | :--- | :--- |
| **前端核心** | React 19 + TypeScript | 最新版 React，兼具效能與型別安全 |
| **建置工具** | Vite 6 + @vitejs/plugin-react | 極速 HMR 與高度最佳化 Rollup 打包 |
| **樣式設計** | Tailwind CSS v4 | 最新世代高效原子化 CSS 引擎 |
| **圖示與動效** | Lucide React + Motion | 專業美觀之向量圖示與微互動體驗 |
| **後端伺服器** | Node.js (22 LTS) + Express 4 | 負責靜態託管與 Gemini API 安全轉發代理 |
| **AI 驅動** | `@google/genai` (Gemini 3.8 Flash) | 低延遲、高專業度之智慧試題解析模型 |
| **自動化部署** | GitHub Actions (Pages Workflow) | Push 即自動進行型別檢查、打包與無痛部署 |

---

## 🚀 快速開始與本機運行

### 環境需求
- **Node.js**：`v20.x` 或 `v22.x` 以上版本 (推薦 LTS)
- **npm**：`v9.x` 以上版本

### 安裝步驟

1. **複製儲存庫**：
   ```bash
   git clone https://github.com/n9694151/PA-Mock-Exam_20260905.git
   cd PA-Mock-Exam_20260905
   ```

2. **安裝相依套件**：
   ```bash
   npm install
   ```

3. **設定環境變數（可選）**：
   複製 `.env.example` 為 `.env`，並填入 Gemini API Key：
   ```bash
   cp .env.example .env
   ```

4. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 即可開始使用！

---

### 常用指令列表

| 指令 | 說明 |
| :--- | :--- |
| `npm run dev` | 以 Full-Stack 模式啟動（Express API + Vite 中介層，監聽 3000 埠） |
| `npm run dev:client` | 純前端開發伺服器啟動（Vite 獨立執行） |
| `npm run lint` / `npm run typecheck` | 執行 TypeScript 靜態型別無損檢查 (`tsc --noEmit`) |
| `npm run build` | 同步建置前端靜態資源與後端伺服器 (`dist/`) |
| `npm run build:client` | 僅建置前端 SPA 靜態產物（供 GitHub Pages 使用） |
| `npm start` | 運行正式環境伺服器 (`node dist/server.cjs`) |
| `npm run preview` | 本機預覽 Vite 生產環境建置產物 |

---

## 🔐 環境變數設定

專案根目錄中的 `.env` 檔案受 `.gitignore` 保護，不會洩漏至版本庫：

```ini
# Gemini AI 金鑰（用於題目法規解析）
# 可至 Google AI Studio (https://aistudio.google.com/) 免費申請
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# 伺服器監聽埠號（預設為 3000，雲端主機通常會自動注入 PORT 變數）
PORT=3000

# 靜態資源基礎路徑（部署至 GitHub Pages 時預設為 './' 相對路徑）
VITE_BASE_PATH="./"
```

> **注意**：若未配置 `GEMINI_API_KEY`，系統仍可正常進行所有測驗、模擬考與瀏覽題庫，遇 AI 解析時會友善提示官方解答並引導至智慧財產局法規資料庫。

---

## 🚢 GitHub Actions 自動化部署上線

專案已內建 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 工作流程，只要推送程式碼至 `main` 分支，GitHub 就會自動執行測試、建置並發布至 **GitHub Pages**！

### GitHub Pages 設定步驟（一鍵上線）

1. 將程式碼推送至 GitHub 遠端儲存庫：
   ```bash
   git add .
   git commit -m "feat: setup project and github actions deploy"
   git push origin main
   ```
2. 開啟 GitHub 儲存庫頁面，點選上方 **Settings**。
3. 在左側選單點選 **Pages**。
4. 在 **Build and deployment** > **Source** 下拉選單中，選擇 **GitHub Actions**。
5. 切換至儲存庫的 **Actions** 分頁，即可看到 `Deploy to GitHub Pages` 正在自動執行。
6. 完成後，即可透過上方提供的專屬網址造訪線上平台：
   ```
   https://<你的GitHub帳號>.github.io/PA-Mock-Exam_20260905/
   ```

### 工作流程機制說明
- **型別防護**：部署前嚴格執行 `npm run lint`，確保無語法或型別錯誤。
- **快取加速**：啟用 `actions/setup-node` 的 npm cache，大幅縮短每次部署時間。
- **相對路徑適配**：`vite.config.ts` 配置 `base: './'`，無論在自訂網域或 GitHub Pages 二級路徑皆可正確加載 CSS、JS 與圖片資源。

---

## ☁️ 雲端伺服器部屬指南 (Full-Stack Mode)

若需支援後端安全呼叫 Gemini API 的全功能服務，可部屬至支援 Node.js 的雲端平台（例如 Render、Railway、Zeabur、Google Cloud Run）：

### 方式 A：Render / Railway
1. **Build Command**：`npm install && npm run build`
2. **Start Command**：`npm start`
3. **Environment Variables**：新增 `GEMINI_API_KEY` 與 `NODE_ENV=production`。

### 方式 B：Docker 容器化
專案支援標準 Node.js 22 容器建置：
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## 📁 專案目錄結構

```text
PA-Mock-Exam_20260905/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 自動部署工作流程
├── public/                   # 靜態資源圖檔與 Favicon
├── src/
│   ├── components/           # 共用 React 元件 (Navbar, Footer, 題卡, 導航列等)
│   ├── data/                 # 111~115 年考題 JSON 題庫與科目定義檔
│   ├── pages/                # 系統主要頁面 (首頁、題庫、模擬考、錯題本、統計)
│   ├── services/             # 商業邏輯 (題庫處理、LocalStorage 存取、Gemini AI)
│   ├── types/                # TypeScript 型別介面定義
│   ├── App.tsx               # 應用程式主入口與分頁路由狀態
│   ├── index.css             # Tailwind CSS 全域樣式設定
│   └── main.tsx              # DOM 掛載進入點
├── .env.example              # 環境變數設定範例檔
├── .gitignore                # 完整版本控制排除清單 (依賴、機密、暫存檔)
├── index.html                # SPA HTML 首頁範本
├── package.json              # 專案相依性套件與 Scripts 定義
├── server.ts                 # Express + Vite 中介層全端整合伺服器
├── tsconfig.json             # TypeScript 編譯器選項
└── vite.config.ts            # Vite 建置外掛與路徑別名設定
```

---

## ❓ 常見問題與除錯 (FAQ)

### Q1：在 Windows 環境執行 npm 時出現指令受限怎麼辦？
Windows PowerShell 預設限制腳本執行，請於終端機執行一次以下指令放行或改用 CMD：
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Q2：GitHub Pages 部署後網頁呈現空白或找不到資源？
本專案在 `vite.config.ts` 已採用相對路徑 `base: './'`，並在 GitHub Actions 打包時自動注入環境變數，能完美相容所有二級路徑。若仍有異常，請確認 GitHub Repository 的 Settings > Pages 設定來源為 **GitHub Actions**。

### Q3：如何更新歷屆試題內容？
所有題庫皆以 JSON 格式儲存於 `src/data/questions-{年度}.json`，亦可於線上操作介面點選「自訂題庫匯入」進行本機擴充。

---

## 📄 授權說明
本專案僅供學術交流、專利師國家考試練習自學使用。考題版權屬中華民國考選部及經濟部智慧財產局所有。
