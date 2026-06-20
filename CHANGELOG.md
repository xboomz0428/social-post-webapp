# Changelog

## v1.4.0 — 2026-06-20

### 功能實際接通（排程 / Google Sheets / 發佈）

- **🚀 立即發佈功能**：新增「立即發佈」按鈕，可真正呼叫各平台 API 發文
  - Threads API（建立 → 發佈兩步驟）
  - X (Twitter) API v2（OAuth 1.0a HMAC-SHA1 簽名）
  - Facebook Graph API（粉絲專頁發文）
  - Instagram Graph API（需圖片 + 商業帳號）
  - 發佈結果即時顯示（成功/失敗 + 錯誤訊息）
- **📊 Google Sheets 真正接通**：
  - 後端 `/api/sheets` API route，使用 `googleapis` 套件
  - 自動建立「貼文」「帳號」「口吻設定」三個工作表 + 表頭
  - 儲存/發佈貼文時自動同步寫入 Google Sheets
  - 設定頁面新增「測試連線 & 初始化工作表」按鈕
  - 說明 Google Sheets 需在 Vercel 環境變數設定（GOOGLE_SPREADSHEET_ID + GOOGLE_SERVICE_ACCOUNT_KEY）
- **⚠️ 重要說明**：Google Sheets 的 Service Account JSON 金鑰需設定為 Vercel 環境變數，不能從前端 UI 輸入（安全考量）

---

## v1.3.1 — 2026-06-20

### 帳號管理教學位置調整

- **將各平台設定教學移至帳號管理主畫面**：FB / IG / Threads / X 四個平台的 step-by-step 教學直接列在帳號列表下方，不再藏在 Dialog 中
- 教學指引含平台 icon 識別，展開即可查看完整步驟

---

## v1.3.0 — 2026-06-20

### 完整操作說明頁面

- **新增 `/guide` 操作說明頁面**：完整的 step-by-step 使用教學
  - SVG 工作流程圖（5 步驟視覺化流程）
  - 每個步驟含 UI 模擬畫面（瀏覽器風格 mockup）
  - 帳號建立、口吻設定、AI 設定、公式選擇、生成發佈完整教學
  - AI 模型推薦比較卡片（免費/CP值/品質）
  - 全功能一覽（10 大功能）
  - FAQ 常見問題 6 題
- **導覽列新增「說明」入口**
- 每個步驟含直達按鈕（前往帳號管理 / 前往設定 / 瀏覽模板庫等）

---

## v1.2.0 — 2026-06-20

### 新增教學指引

- **帳號設定教學**：每個平台（FB/IG/Threads/X）在帳號設定頁面新增可展開的 step-by-step 教學，含外部連結
  - Facebook 商業帳號 API 設定（7 步驟）
  - Instagram 商業帳號 API 設定（7 步驟）
  - Threads API 設定（7 步驟）
  - X (Twitter) API 設定（6 步驟）
- **AI 設定教學**：每個 AI 提供者新增設定教學
  - OpenAI API Key 設定（5 步驟，含模型建議）
  - Anthropic (Claude) API Key 設定（5 步驟）
  - Google Gemini API Key 設定（5 步驟，含免費額度說明）
- **Google Sheets 設定教學**：6 步驟教學，含 Service Account 建立方式
- 新增可收合教學元件 `SetupGuide`，統一教學 UI 風格

---

## v1.1.0 — 2026-06-20

### Phase 1 全面改版

- **多帳號系統**：每個平台（FB/IG/Threads/X）可建立多組帳號，右上角快速切換
- **每帳號獨立口吻**：語氣摘要、範例貼文、目標受眾、偏好 hashtag、禁用詞、AI 自訂指令
- **每帳號排程設定**：每週幾篇、每天最多幾篇、偏好發文時段
- **AI 內容生成**：支援 OpenAI (GPT-4o)、Anthropic (Claude)、Google (Gemini)，可在編輯器內直接生成
- **AI 設定頁面**：三家 API Key 設定、模型選擇、Temperature 調整、一鍵測試連線
- **公式模板庫**：30 個 F1-F27 公式，含骨架預覽，可直接套用到新貼文
- **Google Sheets 欄位**：Spreadsheet ID + Service Account 設定（待完整接通）

---

## v1.0.0 — 2026-06-19

### 初版上線

- 排程總覽頁面（草稿/已排程/已發佈統計）
- 圖文編輯器（Tiptap 富文編輯，支援粗體/斜體/圖片上傳/字數統計）
- 平台勾選發佈（FB/IG/Threads/X）
- 排程時間設定
- 公式/Day 選擇
- 戰績數據追蹤（讚/留言/分享/觸及/非追蹤者%）
- API 設定頁面（Threads/X/IG API Key）
- 部署至 Vercel
