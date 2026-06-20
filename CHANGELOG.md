# Changelog

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
