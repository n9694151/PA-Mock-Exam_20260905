import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini AI explanation endpoint
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { question, options, officialAnswer, userAnswer, subjectName, year } = req.body;

    if (!question) {
      return res.status(400).json({ error: "缺少題目內容" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        explanation: `【系統提示】尚未配置 GEMINI_API_KEY。若需使用 Gemini AI 即時輔助解析，請於平台設定中提供 API 金鑰。\n\n針對此題：\n本題正確答案為【${officialAnswer || "見官方公告"}】。\n考生作答為【${userAnswer || "未作答"}】。\n\n建議考生查閱經濟部智慧財產局公布之最新專利法規條文與審查基準以核對詳解。`,
        isFallback: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const optionsText = options
      ? Object.entries(options)
          .map(([key, val]) => `(${key}) ${val}`)
          .join("\n")
      : "（未提供選項）";

    const prompt = `你是一位精通中華民國專門職業及技術人員高等考試「專利師考試」的權威專業輔導講師。
請針對以下專利師歷屆試題提供精準、嚴謹的解析。

【題目資訊】
考試年度：民國 ${year || 113} 年
科目名稱：${subjectName || "專利師專業科目"}
題目內容：
${question}

選項內容：
${optionsText}

官方公布答案：【${officialAnswer || "未指定"}】
考生選擇之答案：【${userAnswer || "未選擇"}】

【解析要求】
1. 嚴格使用「繁體中文（台灣習慣用語，例如：專利權、舉發、優先權、更正、新型專利、發明專利、審定、訴願、行政訴訟等）」。
2. 明確說明正確答案【${officialAnswer}】之所以正確之法理依據或法條規範（若為法律科目，請務必指出中華民國專利法、專利法施行細則、專利審查基準或行政程序法等切確條號；若為物理/化學/力學計算題，請詳細列出推導或計算過程）。
3. 逐項分析其他選項（錯誤選項）之所以錯誤的原因或瑕疵點。
4. 【嚴格規範】切勿捏造法條、條號或不存在的判決判例！若對特定條文或裁決不確定，請明確說明「請以最新公布之專利法規及智慧財產局解釋為準」。
5. 解析最後請附上：重點提示與國考應試記憶小撇步。

請依結構化格式條理分明地輸出解析。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "你是專精於台灣專利師國考的法規與理工考題解析專家，回答客觀嚴謹、依據法條法理，絕不捏造條文。",
        temperature: 0.2,
      },
    });

    return res.json({
      explanation: response.text || "AI 解析生成中，無文字回傳",
      isFallback: false,
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({
      error: error?.message || "AI 解析請求失敗",
      explanation: "AI 服務暫時無法連線，請稍後再試，或逕行查閱官方公布之法規標準答案。",
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
