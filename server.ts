import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const currentFilename =
  typeof import.meta?.url === "string"
    ? fileURLToPath(import.meta.url)
    : typeof __filename !== "undefined"
    ? __filename
    : "";
const currentDirname = currentFilename ? path.dirname(currentFilename) : process.cwd();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Question explanation endpoint (100% offline, zero external API keys)
app.post("/api/gemini/explain", (req, res) => {
  try {
    const { question, options, officialAnswer, userAnswer, subjectName, year } = req.body;

    if (!question) {
      return res.status(400).json({ error: "缺少題目內容" });
    }

    const isCorrect = userAnswer === officialAnswer;
    const optionsText = options
      ? Object.entries(options)
          .map(([key, val]) => `• (${key}) ${val}`)
          .join("\n")
      : "";

    const explanation = `【官方標準解答與解析指引】
考試年度：民國 ${year || 113} 年
科目名稱：${subjectName || "專利師專業考科"}

【作答對照】
• 官方公布正確答案：【${officialAnswer || "見官方公告"}】
• 考生目前選擇答案：【${userAnswer || "未作答"}】（${isCorrect ? "作答正確 ✅" : "作答錯誤 ❌"}）

【試題內容】
${question}

${optionsText ? `【選項內容】\n${optionsText}\n` : ""}
【法規與研讀指引】
1. 本題標準解答以考選部公布之專利師考試官方正解為依據。
2. 法律考科請查閱經濟部智慧財產局最新版《專利法》、《專利法施行細則》與《專利審查基準》對照條文。
3. 理工科目（普通物理與普通化學、工程力學等）請著重基礎公式推導與題幹邊界條件分析。`;

    return res.json({
      explanation,
      isFallback: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || "解析服務暫時無法處理",
      explanation: "解析服務暫時無法處理，請稍後再試。",
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
