interface Step {
  title: string
  detail: string
  link?: { label: string; url: string }
}

interface Guide {
  title: string
  steps: Step[]
}

export const PLATFORM_GUIDES: Record<string, Guide> = {
  facebook: {
    title: 'Facebook 商業帳號 API 設定教學',
    steps: [
      {
        title: '建立 Facebook 粉絲專頁（如已有可跳過）',
        detail: '你的個人帳號必須擁有或管理至少一個粉絲專頁，API 只能透過粉絲專頁發文，不能發到個人頁面。',
        link: { label: '建立粉絲專頁', url: 'https://www.facebook.com/pages/create/' },
      },
      {
        title: '前往 Meta 開發者平台，建立應用程式',
        detail: '登入後點擊「建立應用程式」→ 選擇「商業」類型 → 填寫應用程式名稱（例如：Social Post Manager）→ 選擇你的商業帳號。',
        link: { label: '前往 Meta 開發者平台', url: 'https://developers.facebook.com/apps/' },
      },
      {
        title: '新增「Facebook Login for Business」產品',
        detail: '在應用程式儀表板，找到「新增產品」→ 選擇「Facebook Login for Business」→ 設定完成。',
      },
      {
        title: '取得 Page Access Token',
        detail: '前往「工具」→「Graph API Explorer」：\n• 在「Meta App」下拉選你的 App\n• 在「使用者或粉絲專頁」選你的粉絲專頁\n• 點擊「產生存取權杖」\n• 勾選權限：pages_manage_posts、pages_read_engagement、pages_show_list\n• 點擊「產生存取權杖」→ 複製這個 Token',
        link: { label: '前往 Graph API Explorer', url: 'https://developers.facebook.com/tools/explorer/' },
      },
      {
        title: '取得 Page ID',
        detail: '在 Graph API Explorer 中，選擇你的粉絲專頁後，在上方欄位輸入 /me?fields=id,name 並按「提交」，回傳結果中的 id 就是你的 Page ID。',
      },
      {
        title: '（建議）將 Token 延長為長期 Token',
        detail: '預設 Token 只有 1-2 小時效期。前往「設定」→「進階」→ 使用「存取權杖除錯工具」把短期 Token 換成長期 Token（60 天），或建立「永不過期的系統使用者 Token」。',
        link: { label: '存取權杖除錯工具', url: 'https://developers.facebook.com/tools/debug/accesstoken/' },
      },
      {
        title: '貼回設定',
        detail: '將 Page Access Token 填入「Access Token」欄位，Page ID 填入「Page ID」欄位，儲存即可。',
      },
    ],
  },

  instagram: {
    title: 'Instagram 商業帳號 API 設定教學',
    steps: [
      {
        title: '將 IG 帳號轉為「商業帳號」或「創作者帳號」',
        detail: '打開 IG App → 設定 → 帳號 → 切換為專業帳號 → 選擇「商業」。個人帳號無法使用 API 發文。',
      },
      {
        title: '將 IG 帳號連結到 Facebook 粉絲專頁',
        detail: '在 IG App → 設定 → 帳號 → 已連結帳號 → Facebook → 選擇你的粉絲專頁進行連結。這一步是必要的，IG API 透過 Facebook 粉絲專頁授權。',
      },
      {
        title: '在 Meta 開發者平台建立應用程式（如已有可跳過）',
        detail: '跟 Facebook 相同步驟。如果你已經有 Facebook 的 App，可以直接使用同一個。',
        link: { label: '前往 Meta 開發者平台', url: 'https://developers.facebook.com/apps/' },
      },
      {
        title: '取得 Page Access Token',
        detail: '前往 Graph API Explorer → 選擇你的 App → 選擇你的粉絲專頁 → 勾選權限：\n• instagram_basic\n• instagram_content_publish\n• pages_read_engagement\n→ 產生存取權杖',
        link: { label: '前往 Graph API Explorer', url: 'https://developers.facebook.com/tools/explorer/' },
      },
      {
        title: '取得 Instagram User ID',
        detail: '在 Graph API Explorer 中，選擇你的粉絲專頁後，輸入：\n/me?fields=instagram_business_account\n按「提交」，回傳的 instagram_business_account.id 就是你的 IG User ID。',
      },
      {
        title: '取得 Facebook Page ID',
        detail: '在 Graph API Explorer 輸入 /me?fields=id,name 並按「提交」，回傳的 id 就是 Page ID。',
      },
      {
        title: '貼回設定',
        detail: '• Access Token → 填入 Page Access Token\n• Page ID → 填入 Facebook Page ID\n• IG User ID → 填入上一步取得的 Instagram User ID\n儲存即可。',
      },
    ],
  },

  threads: {
    title: 'Threads API 設定教學',
    steps: [
      {
        title: '確認 Threads 帳號已建立',
        detail: '你需要有一個 Threads 帳號（用 Instagram 帳號登入即可）。Threads API 於 2024 年中開放，所有帳號都可申請。',
      },
      {
        title: '前往 Meta 開發者平台，建立應用程式',
        detail: '登入後點擊「建立應用程式」→ 選擇「其他」→「消費者」類型 → 填寫名稱。\n如果你已有 Facebook/IG 的 App，也可以在同一個 App 新增 Threads 產品。',
        link: { label: '前往 Meta 開發者平台', url: 'https://developers.facebook.com/apps/' },
      },
      {
        title: '新增「Threads API」產品',
        detail: '在應用程式儀表板 → 新增產品 → 找到「Threads API」→ 點擊設定。',
      },
      {
        title: '設定 Threads API 權限',
        detail: '在 Threads API 設定頁面：\n• 勾選 threads_basic\n• 勾選 threads_content_publish\n• 勾選 threads_manage_replies（如需管理留言）\n• 新增你的 Threads 帳號為測試使用者',
      },
      {
        title: '產生 Access Token',
        detail: '在 Threads API 設定頁面：\n• 找到「使用者權杖產生器」區塊\n• 選擇你的測試使用者\n• 點擊「產生權杖」→ 會跳轉到 Threads 授權頁面\n• 點擊「允許」→ 複製產生的 Access Token',
      },
      {
        title: '取得 Threads User ID',
        detail: '使用你的 Access Token 呼叫：\nhttps://graph.threads.net/v1.0/me?access_token=YOUR_TOKEN\n回傳的 id 就是你的 Threads User ID。\n\n或在「Graph API Explorer」中選擇 Threads，輸入 /me 查詢。',
      },
      {
        title: '貼回設定',
        detail: '• Access Token → 填入剛才產生的 Token\n• User ID → 填入 Threads User ID\n儲存即可。',
      },
    ],
  },

  x: {
    title: 'X (Twitter) API 設定教學',
    steps: [
      {
        title: '前往 X 開發者平台，申請開發者帳號',
        detail: '用你的 X 帳號登入開發者平台。免費版（Free Tier）每月可發 1,500 則推文，適合個人使用。',
        link: { label: '前往 X Developer Portal', url: 'https://developer.twitter.com/en/portal/dashboard' },
      },
      {
        title: '建立 Project 和 App',
        detail: '登入後 → Projects & Apps → 點擊「+ Add Project」→ 填寫 Project 名稱 → 選擇用途（例如：Managing my own social media）→ 建立 App。',
      },
      {
        title: '設定 App 權限為「Read and Write」',
        detail: '在 App 設定頁面 → 「User authentication settings」→ 點擊 Set up：\n• App permissions：選擇「Read and write」\n• Type of App：選擇「Web App, Automated App or Bot」\n• Callback URL：填入 https://localhost（個人用途填這個就行）\n• Website URL：填入你的網站或 https://localhost\n→ 儲存',
      },
      {
        title: '取得 API Key 和 API Secret',
        detail: '在 App 的「Keys and tokens」頁面：\n• Consumer Keys 區塊 → 點擊「Regenerate」\n• 複製 API Key 和 API Key Secret\n⚠️ Secret 只會顯示一次，請立即複製儲存！',
      },
      {
        title: '產生 Access Token 和 Access Token Secret',
        detail: '在同一頁面往下找到「Authentication Tokens」區塊：\n• 點擊「Generate」\n• 複製 Access Token 和 Access Token Secret\n⚠️ 同樣只會顯示一次！\n\n這組 Token 代表你自己的帳號權限，用它發文就是用你自己的帳號發。',
      },
      {
        title: '貼回設定',
        detail: '四個欄位分別填入：\n• API Key → Consumer API Key\n• API Secret → Consumer API Key Secret\n• Access Token → 上一步的 Access Token\n• Access Secret → 上一步的 Access Token Secret\n儲存即可。',
      },
    ],
  },
}

export const AI_PROVIDER_GUIDES: Record<string, Guide> = {
  openai: {
    title: 'OpenAI API Key 設定教學',
    steps: [
      {
        title: '前往 OpenAI 平台',
        detail: '用你的 OpenAI 帳號登入（沒有帳號先註冊一個）。',
        link: { label: '前往 OpenAI Platform', url: 'https://platform.openai.com/' },
      },
      {
        title: '建立 API Key',
        detail: '登入後 → 點擊右上角頭像 → 「Your profile」→ 左側選單點「API keys」→ 點擊「+ Create new secret key」。\n\n給 Key 取個名字（例如：Social Post Manager）→ 點擊「Create secret key」→ 複製產生的 Key（sk-... 開頭）。\n⚠️ Key 只會顯示一次！',
        link: { label: '前往 API Keys 頁面', url: 'https://platform.openai.com/api-keys' },
      },
      {
        title: '確認帳戶有餘額',
        detail: '前往「Billing」頁面確認有足夠的使用額度：\n• 新帳號通常有免費額度\n• 用完需加值（Settings → Billing → Add payment method）\n• GPT-4o 約 $2.5/百萬 input tokens，日常使用很便宜',
        link: { label: '查看 Billing', url: 'https://platform.openai.com/settings/organization/billing/overview' },
      },
      {
        title: '選擇模型',
        detail: '建議模型：\n• gpt-4o — 最強最智慧，適合正式貼文（較貴）\n• gpt-4o-mini — 快又便宜，日常草稿首選\n• gpt-4.1 — 最新模型，品質與速度兼具',
      },
      {
        title: '貼回設定',
        detail: '將 API Key 填入「API Key」欄位 → 選擇模型 → 調整 Temperature（建議 0.7-0.8，數字越高越有創意）→ 點「測試連線」確認可用。',
      },
    ],
  },

  anthropic: {
    title: 'Anthropic (Claude) API Key 設定教學',
    steps: [
      {
        title: '前往 Anthropic Console',
        detail: '用你的 Anthropic 帳號登入（沒有帳號先註冊）。',
        link: { label: '前往 Anthropic Console', url: 'https://console.anthropic.com/' },
      },
      {
        title: '建立 API Key',
        detail: '登入後 → 左側選單點「API keys」→ 點擊「Create Key」→ 填入名稱（例如：Social Post Manager）→ 複製產生的 Key（sk-ant-... 開頭）。\n⚠️ Key 只會顯示一次！',
        link: { label: '前往 API Keys 頁面', url: 'https://console.anthropic.com/settings/keys' },
      },
      {
        title: '確認帳戶有餘額',
        detail: '前往「Plans & Billing」確認有足夠額度：\n• 新帳號可能有免費試用額度\n• 需加值才能持續使用（Settings → Billing → Add credits）\n• Claude Sonnet 約 $3/百萬 input tokens',
        link: { label: '查看 Billing', url: 'https://console.anthropic.com/settings/billing' },
      },
      {
        title: '選擇模型',
        detail: '建議模型：\n• claude-sonnet-4-6 — 最新 Sonnet，智慧度高、速度快、CP 值最佳\n• claude-haiku-4-5 — 最快最便宜，適合大量生成草稿',
      },
      {
        title: '貼回設定',
        detail: '將 API Key 填入「API Key」欄位 → 選擇模型 → 調整 Temperature（建議 0.7）→ 點「測試連線」確認可用。',
      },
    ],
  },

  google: {
    title: 'Google Gemini API Key 設定教學',
    steps: [
      {
        title: '前往 Google AI Studio',
        detail: '用你的 Google 帳號登入 AI Studio。',
        link: { label: '前往 Google AI Studio', url: 'https://aistudio.google.com/' },
      },
      {
        title: '取得 API Key',
        detail: '登入後 → 左側選單找到「API keys」或點擊右上角「Get API key」→ 點擊「Create API key」→ 選擇一個 Google Cloud 專案（沒有的話會自動建立）→ 複製產生的 Key（AIza... 開頭）。',
        link: { label: '前往 API Keys 頁面', url: 'https://aistudio.google.com/apikey' },
      },
      {
        title: '免費額度說明',
        detail: 'Gemini API 有慷慨的免費額度：\n• gemini-2.5-flash — 免費版每分鐘 15 次請求，適合日常使用\n• gemini-2.5-pro — 免費版每分鐘 5 次請求\n• 超出免費額度才需付費，個人使用幾乎不會超過',
      },
      {
        title: '選擇模型',
        detail: '建議模型：\n• gemini-2.5-flash — 免費、快速、品質不錯，日常生成首選 ✨\n• gemini-2.5-pro — 更強更智慧，適合重要貼文',
      },
      {
        title: '貼回設定',
        detail: '將 API Key 填入「API Key」欄位 → 選擇模型 → 調整 Temperature（建議 0.7-0.8）→ 點「測試連線」確認可用。\n\n💡 Gemini 2.5 Flash 免費又快，非常推薦作為預設！',
      },
    ],
  },
}

export const GOOGLE_SHEETS_GUIDE: Guide = {
  title: 'Google Sheets 儲存設定教學',
  steps: [
    {
      title: '建立一個 Google Sheets 試算表',
      detail: '前往 Google Sheets 建立一個新的空白試算表，命名為「Social Post Data」或你喜歡的名稱。',
      link: { label: '建立 Google Sheets', url: 'https://sheets.google.com/create' },
    },
    {
      title: '複製 Spreadsheet ID',
      detail: '從試算表的網址中複製 ID：\nhttps://docs.google.com/spreadsheets/d/【這段就是ID】/edit\n\n例如：1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
    },
    {
      title: '前往 Google Cloud Console，啟用 Sheets API',
      detail: '登入 Google Cloud Console → 建立或選擇專案 → 搜尋「Google Sheets API」→ 點擊「啟用」。',
      link: { label: '前往 Google Cloud Console', url: 'https://console.cloud.google.com/' },
    },
    {
      title: '建立 Service Account',
      detail: '在 Google Cloud Console：\n• 前往「IAM 與管理」→「Service Account」\n• 點擊「建立 Service Account」\n• 名稱填「social-post-manager」\n• 角色選「編輯者」\n• 完成後點進帳號 → 「金鑰」→「新增金鑰」→ 選 JSON → 下載',
    },
    {
      title: '將試算表分享給 Service Account',
      detail: '回到你的 Google Sheets → 點右上角「共用」→ 將 Service Account 的 Email（xxx@xxx.iam.gserviceaccount.com）加入為「編輯者」。',
    },
    {
      title: '貼回設定',
      detail: '• Spreadsheet ID → 填入第 2 步複製的 ID\n• Service Account Email → 填入 Service Account 的 Email\n• JSON 金鑰 → 設定為 Vercel 環境變數（GOOGLE_SERVICE_ACCOUNT_KEY）',
    },
  ],
}
