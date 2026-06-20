export interface FormulaTemplate {
  id: string
  code: string
  name: string
  description: string
  skeleton: string
  targetPlatforms: string[]
  complexity: number
  category: 'basic' | 'viral' | 'thread' | 'mode-c'
}

export const FORMULA_TEMPLATES: FormulaTemplate[] = [
  // ─── Part 1: 基礎公式 (F1-F7) ───

  {
    id: 'f1-day-n',
    code: 'F1',
    name: 'Day-N 開發日誌',
    description: '連載型開發紀錄，靠累積建立追劇效應。適合小帳號用每日進度吸引固定讀者回訪。',
    skeleton:
      'Day N 做＜專案＞：今天解決了＜具體問題＞，卡了＜時間＞在＜坑＞。明天要＜下一步＞。',
    targetPlatforms: ['threads', 'x'],
    complexity: 1,
    category: 'basic',
  },
  {
    id: 'f2-screenshot',
    code: 'F2',
    name: '截圖先丟再講',
    description:
      '用大圖或截圖抓住注意力，再補文字說明。利用 media dwell time 讓演算法推到 Explore。',
    skeleton:
      '[大圖/截圖] + 一句話標題 + 2-3 行解釋 + 一句 CTA',
    targetPlatforms: ['facebook', 'threads', 'instagram'],
    complexity: 1,
    category: 'basic',
  },
  {
    id: 'f3-翻車',
    code: 'F3',
    name: '實測翻車版',
    description:
      '先給正向實測結果，再用「沒人告訴你」反轉揭坑。save 率約純誇獎文 2 倍。',
    skeleton:
      '我用＜工具＞＜N＞天，＜正向結果＞。但有三件事沒人告訴你：1)... 2)... 3)...',
    targetPlatforms: ['facebook', 'x'],
    complexity: 2,
    category: 'basic',
  },
  {
    id: 'f4-milestone',
    code: 'F4',
    name: '社群里程碑+投票',
    description:
      '慶祝社群人數突破，搭配投票讓粉絲選下一步內容。留言權重高於讚，適合小號衝互動。',
    skeleton:
      '＜社群＞＜人數＞！！！＜時間敘述＞，沒想到＜情緒＞。留言告訴我想看 A)... B)... C)...，票最多的＜行動＞。',
    targetPlatforms: ['facebook', 'threads'],
    complexity: 1,
    category: 'basic',
  },
  {
    id: 'f5-tool-battle',
    code: 'F5',
    name: '工具對打',
    description:
      '兩款工具跑同一任務的對比文。save 率 3-5 倍，演算法搜工具名時會推給非追蹤者。',
    skeleton:
      '＜A＞ vs ＜B＞ 跑＜具體任務＞。結論：＜洞見＞。細節：[三行對比]',
    targetPlatforms: ['x', 'threads'],
    complexity: 2,
    category: 'basic',
  },
  {
    id: 'f6a-invite-code',
    code: 'F6a',
    name: '邀請碼版',
    description:
      '推廣他人工具時使用，搭配邀請碼或 referral 制度做引流。成果炸場 + 教學引流 + 邀請碼 CTA。',
    skeleton: `[成果炸場] ＜工具＞＜動詞＞＜具體數字＞＜成果＞！！！你沒看錯！！＜賣點＞！！真的太神啦！！！
[教學引流] 還不會使用的可以去看看我的＜工具＞教學！！
[邀請碼 CTA] 沒有邀請碼的我可以給你好幾組😂
[可選合作] ＜社群/品牌＞跟＜工具＞官方達成合作了🎉🎉🎉`,
    targetPlatforms: ['facebook', 'instagram'],
    complexity: 3,
    category: 'viral',
  },
  {
    id: 'f6b-a-promo',
    code: 'F6b-A',
    name: 'F6b promo 型（self-evident 鉤子）',
    description:
      '推廣自己做的產品，用 meta 鉤子「這篇就是它自己發的」製造 curiosity。4 段 4 句鐵則，適合 shipping announcement。',
    skeleton: `[段 1：成果炸場 + meta 鉤子] ＜工具/AI＞這次真的殺瘋了，我直接做了一個＜產品＞能＜能力敘述＞！！！你沒看錯！！＜自證懸念＞！！真的太神啦！！！

[段 2：過程數字] 剛剛花＜時間＞讓它＜具體動作＞，＜量化成果＞

[段 3：使用體驗敘事] 現在我說「＜指令＞」它就＜動作＞

[段 4：社群召集 CTA（非邀請碼）] ＜未來計畫＞，沒入群的留言我拉你`,
    targetPlatforms: ['facebook', 'instagram'],
    complexity: 4,
    category: 'viral',
  },
  {
    id: 'f6b-b-retro',
    code: 'F6b-B',
    name: 'F6b 復盤型（self-experimental 鉤子）',
    description:
      'launch 後的復盤或 lesson-sharing，用「跑了 N 篇對照組打臉自己」實驗自證鉤子拉討論深度，突破鐵粉圈。',
    skeleton: `[段 1：成果炸場 + meta 鉤子] ＜工具/AI＞這次真的殺瘋了，我直接做了一個＜產品＞能＜能力敘述＞！！！你沒看錯！！＜實驗自證懸念＞！！真的太神啦！！！

[段 2：過程數字] 剛剛花＜時間＞讓它＜具體動作＞，＜量化成果＞

[段 3：使用體驗敘事] 現在我說「＜指令＞」它就＜動作＞

[段 4：社群召集 CTA（非邀請碼）] ＜未來計畫＞，沒入群的留言我拉你`,
    targetPlatforms: ['facebook', 'instagram'],
    complexity: 4,
    category: 'viral',
  },
  {
    id: 'f6b-d-social-proof',
    code: 'F6b-D',
    name: 'F6b social proof 型（社群成長鉤子）',
    description:
      '用社群成長軌跡做 social proof，pitch 社群價值。meta 鉤子是「我帶起來的社群現在 N 人」，適合拉群 funnel。',
    skeleton: `[段 1：成果炸場+meta 鉤子] ＜AI＞這次真的殺瘋了，我用這個 skill 帶起來的＜社群＞現在＜人數＞，＜社群價值描述＞！！！你沒看錯！！＜成員 social proof＞！！真的太神啦！！！

[段 2：過程數字] ＜時間前＞還＜舊人數＞，發＜貼文數＞貼文衝到＜新人數＞，＜流量轉化機制＞

[段 3：使用體驗敘事] 現在我問「＜情境問題＞」群裡＜時間＞就有人＜動作＞，比＜對照物＞還快

[段 4：社群召集 CTA] ＜社群名＞歡迎一起來，沒入群的留言我拉你`,
    targetPlatforms: ['facebook', 'instagram'],
    complexity: 4,
    category: 'viral',
  },
  {
    id: 'f7-pov',
    code: 'F7',
    name: 'POV 吐槽',
    description:
      'Threads 專屬短文吐槽格式。60 字以內 + 回覆率 >5% 的短文在 Threads 2026 演算法獲得最大推送。',
    skeleton:
      'POV：你是＜身分＞，＜場景＞，然後＜反轉/吐槽點＞。',
    targetPlatforms: ['threads'],
    complexity: 1,
    category: 'basic',
  },

  // ─── Part 2: 廣推公式 (F8-F13) ───

  {
    id: 'f8-credibility',
    code: 'F8',
    name: 'Credibility Piggyback',
    description:
      '標記有名字的外部實體（官方/開發者），讓演算法同時推給追蹤該實體的人。每次換不同對象都是新觸發源，可持續使用。',
    skeleton:
      '我剛用 ＜工具/框架＞ ＜具體反直覺動作＞，＜量化結果＞。@＜官方/開發者＞ 你們下一版能不能＜具體建議＞？',
    targetPlatforms: ['facebook', 'x', 'threads'],
    complexity: 3,
    category: 'viral',
  },
  {
    id: 'f9-public-l',
    code: 'F9',
    name: 'Public L-taking（我錯了反轉文）',
    description:
      '公開承認過去觀點錯誤，觸發強烈情緒和超高 dwell time。分享率特別高，因為轉「認錯文」比轉炫耀文心理阻力低。',
    skeleton:
      '三個月前我說＜過去堅定觀點＞，我錯了。今天＜具體事件＞讓我重新想：＜新觀點 3 行＞。',
    targetPlatforms: ['facebook'],
    complexity: 3,
    category: 'viral',
  },
  {
    id: 'f10-controversy',
    code: 'F10',
    name: 'Controversy Middle Ground（居中開炮）',
    description:
      '兩派爭論中取第三立場。兩邊支持者都會留言反駁/支持，留言數暴衝觸發演算法強推。居中比選邊風險低，每週最多 1 次。',
    skeleton:
      '＜A 派＞說＜立場＞，＜B 派＞說＜立場＞，兩邊都錯。真相是＜你的第三立場＞。＜2-3 行論證＞。',
    targetPlatforms: ['facebook', 'x'],
    complexity: 3,
    category: 'viral',
  },
  {
    id: 'f11-counter-funnel',
    code: 'F11',
    name: 'Counter-Funnel Giveaway（反漏斗教學）',
    description:
      '免費送出私藏資源，不要求追蹤或按讚。反 CTA 觸發「不是在收割」信任感，自發分享率極高。每月上限 1 次。',
    skeleton:
      '今天免費送＜原本私藏的東西＞：[內容 or 連結]。不用追蹤不用留言，拿走就好。只有一個條件：＜低門檻反 CTA＞。',
    targetPlatforms: ['facebook', 'threads'],
    complexity: 2,
    category: 'viral',
  },
  {
    id: 'f12-timestamp',
    code: 'F12',
    name: 'Timestamp Live-ops（時間戳直播）',
    description:
      '用精確時間戳和未來式懸念，觸發讀者「回來看結果」的重返訪問訊號。單篇 revisit 率破 30% 直接觸發 FB 高價值內容判定。',
    skeleton:
      '[精確時間] 我現在正在＜具體行動＞，目標是＜量化目標＞，＜N＞小時後回來報結果。＜1 行懸念＞。',
    targetPlatforms: ['facebook', 'threads'],
    complexity: 2,
    category: 'viral',
  },
  {
    id: 'f13-gratitude-chain',
    code: 'F13',
    name: 'Named Gratitude Chain（具名致謝鍊結）',
    description:
      '具名感謝 3-5 位貢獻者並 tag，每 tag 1 人等於多一個漏斗口。比 F4 純里程碑擴散 5 倍，每月上限 1 次。',
    skeleton:
      '這件事沒有 ＜3-5 個人名＞ 就不會發生：@A ＜具體貢獻 1 行＞、@B ＜貢獻 1 行＞、@C ＜貢獻 1 行＞。＜1 句總結＞。',
    targetPlatforms: ['facebook', 'threads'],
    complexity: 3,
    category: 'viral',
  },

  // ─── Part 3: 分享驅動公式 (F14-F19) ───

  {
    id: 'f14-speech-condensed',
    code: 'F14',
    name: '演講濃縮型',
    description:
      'Thought leadership 長文，用權威 stacking + 可截圖金句 + 反主流觀點驅動分享。寫作 3-5 小時，月配額 1 篇。',
    skeleton: `[hook 個人痛點] 第一人稱卡關 + 第三方權威背書（某大會某 KOL）

[震撼數據] 反直覺對比數據讓讀者停下來

[反命題立場] 「大家以為 X，其實 Y」

▋ [概念 1 標題] 提問 + 引用權威 + 例子 + 個人 take + 金句
▋ [概念 2 ...]
...（4-7 個 ▋ 段，每段 1 金句）

[結論金句] 個人反思 → punch line 升格

[CTA] 追蹤我，過濾雜訊`,
    targetPlatforms: ['facebook', 'threads'],
    complexity: 5,
    category: 'viral',
  },
  {
    id: 'f15-source-material',
    code: 'F15',
    name: '源材料公開型',
    description:
      '分享稀缺資源全文（流出/翻譯/反向工程），靠內幕優越感和超長 dwell time 驅動收藏分享。寫作 1-2 小時。',
    skeleton: `[hook 稀缺資源] 「X 的 Y 被流出 / 翻譯 / 反向工程，公開」

[個人短評 1 句] 為何重要 / 觀察

[觀察金句] 結構分析（例「禁止類放最前、SPO 中段」）= reusable framework

[升格 framing] 「憲法等級 / 經典級 / 教科書級」價值升格

[完整原稿] 直接貼整套內容`,
    targetPlatforms: ['facebook', 'threads'],
    complexity: 4,
    category: 'viral',
  },
  {
    id: 'f15-mini',
    code: 'F15 mini',
    name: '極簡開源型',
    description:
      '3 段 / 每段 1 句 / 零繞圈的極簡 FOMO 型開源分享。5-10 分鐘寫完，低成本高回報，月配額 2-3 篇。',
    skeleton: `[正向成果 hook + ！！！] X 終於開啦！！！或 X 終於 Y 了！！！

[歸功 + skill 連結] 多虧了我的 ＜skill/工具＞！！

[零摩擦 CTA] 我有開源了/已上架，歡迎自取`,
    targetPlatforms: ['facebook', 'threads'],
    complexity: 1,
    category: 'viral',
  },
  {
    id: 'f16-curated-roundup',
    code: 'F16',
    name: '精選彙整型',
    description:
      '整理好內容的 bullet 重點，借大咖背書 + 「我幫你濾過了」感。30-45 分鐘寫作，每小時等效讚分 ROI 最高。',
    skeleton: `[hook fanboy + 大咖背書] 「我最喜歡的 X（量化大咖等級）公開了 Y，重點不是 A 而是 B」

[個人短評 1 句] 「乾貨很多，詳細看影片」

[連結 1] 詳細整理（你自己 blog 或第三方）

[bullet 重點 6 點] 題目：具體做法 + 工具

[驚奇 bullet 3 點] 「沒想到吧」感反差數字

[原始連結] YT / 來源`,
    targetPlatforms: ['facebook', 'threads'],
    complexity: 2,
    category: 'viral',
  },
  {
    id: 'f17-minimal-repost',
    code: 'F17',
    name: '極簡轉發型',
    description:
      '3 秒看完的極簡轉發，分享率可破 1。但沒留言入口、沒拉群 funnel，不建議模仿整套，僅偷學 hook 句式。',
    skeleton: `[絕對化定位] 「如果只能看一篇 X，那就是這篇」
[權威 stacking] 「Y 之父」+「親授」+「實戰派」
[零摩擦行動] 「不想讀就丟給 AI 讀」
[連結]`,
    targetPlatforms: ['facebook'],
    complexity: 1,
    category: 'viral',
  },
  {
    id: 'f18-aigc-demo',
    code: 'F18',
    name: 'AIGC 作品 demo + Reels 變體',
    description:
      'AIGC 作品展示，搭配 15-30 秒 Reels 格式可獲 Meta 2026 演算法 +50% 觸及加成。適合創作者展示作品。',
    skeleton: `[極簡標題] 「工具 A x 工具 B」或「項目 N」
[作品內容] 圖片 / 影片 / 縮圖網格（15-30 秒 Reels 最佳）
[可選] 1-2 句純技術說明`,
    targetPlatforms: ['facebook', 'instagram', 'threads'],
    complexity: 3,
    category: 'viral',
  },
  {
    id: 'f19-threads-manifesto',
    code: 'F19',
    name: 'Threads 立場宣言型',
    description:
      'Threads 專屬 1 段不換行格式，用敵人/英雄/純粹動機三要素驅動轉發。60-150 字連續逗號流，TM 級用詞增加真實感。',
    skeleton:
      '最近 ＜敵人＞ 都 ＜行為＞，我做 ＜正確事＞ 就 TM 做真的！我就持續 ＜行動＞ 幹翻 ＜敵人＞！！對我來說 ＜行動＞ 就是 ＜純粹動機＞，我 ＜大方行為＞ 對我來說 ＜零代價聲明＞！！',
    targetPlatforms: ['threads'],
    complexity: 2,
    category: 'thread',
  },

  // ─── Mode C: 深度反思系列 (F20-F27) ───

  {
    id: 'f20-story-legacy',
    code: 'F20',
    name: '個人故事傳承型',
    description:
      '分享被 mentor 或金句深度影響的故事，傳承給讀者。功能是鐵粉信任深化（不擴散），觸發高深度留言。',
    skeleton: `[1. 第一人稱 vulnerable hook] 「踏進 X 之前，我是 Y 的鐵粉」
[2. 故事鋪陳 + 引用源] 「他出了書，書裡有一句話」
[3. 核心金句（必短 / 反命題）] 「消費不如生產」
[4. 個人 epiphany + 對比 punch] 對比 framing
[5. 個人 case study] 我做了 X / Y / Z
[6. 知識傳承 framing] 「前輩 → 中介 → 我 → 你」
[7. 對讀者反命題 CTA] 「如果你 X，也許不是 Y，是 Z」
[8. 行動 lowering barrier] 「寫一段文字、拍爛爛的影片」
[9. 金句收尾 + identity trigger] 「希望它也能傳到你這裡」`,
    targetPlatforms: ['facebook'],
    complexity: 4,
    category: 'mode-c',
  },
  {
    id: 'f21-ship-qa',
    code: 'F21',
    name: 'Ship 答疑解構型',
    description:
      'Ship 完產品後回應留言區常見問題，用反命題 framework 解構。加 R35 keyword CTA 可衝 mega-viral（實證 10,966 觀眾）。',
    skeleton: `[1. 痛點開頭 + 回應留言 framing] 「最近發了 X，一堆人問『是不是 Y』── 今天一次講清楚」
[2. 反命題破題 — 短句 punch] 「先回答：不是 X」
[3. 概念對比 framework] 「X 是『你操作』，我的是『AI 操作』」
[4. ── section 1 ──] 具體解釋
[5. ── section 2 ──] use case + bullet 列舉
[6. ── section 3 ──] 差異化 punch line
[7. ── 開源 CTA ──] 「還沒領取的，留言『關鍵詞』，我傳給你」`,
    targetPlatforms: ['facebook'],
    complexity: 4,
    category: 'mode-c',
  },
  {
    id: 'f22-vulnerable-tool',
    code: 'F22',
    name: '工具發現 + 個人脆弱解套型',
    description:
      '新工具解決長期卡點（焦慮/拖延/出鏡），用 vulnerable confess + 普世議題突破鐵粉圈 90%+。Mode C 廣 identity 最強。',
    skeleton: `[1. 個人實驗 framing] 「昨天玩 X 發現一個 ... 功能 ── 終於可以 Y 了」
[2. 技術細節 + 工具 stacking] 「操作跟 A、B 一樣 ... C 追上了」
[3. 反命題破題] 「但我想聊的不是『又一家做 X』，是這功能對 Y 的人真的解套」
[4. 個人脆弱 confess] 「我自己一直想 X，最大的卡點是 Y ... 拖了大半年」
[5. 解套 + 具體 use case] 「有了 X，門檻一下降很多」
[6. 承認爭議 + 公正 framing] 「當然這東西有爭議 ── 但用在 X 範圍」
[7. 意義升格] 「把 X 的入場券發給更多人」
[8. 自嘲 punch 收尾] 「至少對我來說，X 那個藉口，現在沒了」`,
    targetPlatforms: ['facebook'],
    complexity: 4,
    category: 'mode-c',
  },
  {
    id: 'f23-industry-insight',
    code: 'F23',
    name: '行業洞察解構型',
    description:
      'Mode C 最強公式。媒體寫了什麼但你不同意，用 insider 觀察 + 趨勢預言驅動 mega-viral（實證 10,022 觀眾 / 94.5% 非追蹤者）。',
    skeleton: `[1. 反命題破題] 「昨天 X 更新，很多標題都寫『終於解決 Y』，但說真的 ── Z」
[2. 個人實證 cred] 「我前幾天那支 X 就是 Y 跑的」
[3. 觀點升格] 「X 在 2026 已經不是門檻，還拿這個當賣點其實有點落伍」
[4. 設置 N 點解構] 「真正值得看的不是 X，是另外 3 件事」
[5. ── 1. concept 1 ──] 概念升格 punch（「資產化思維」）
[6. ── 2. concept 2 ──] 技術細節 + framework punch
[7. ── 3. concept 3 ──] 行業比較 + big-picture
[8. ── 真的差別在哪 ──] meta section + 反命題
[9. 自然 brand plug] 「我那個 X 一直在做的也是這件事」
[10. 預言式 punch line] 「X 大戰已打完，下一場是 Y 大戰」`,
    targetPlatforms: ['facebook'],
    complexity: 5,
    category: 'mode-c',
  },
  {
    id: 'f24-brand-boundary',
    code: 'F24',
    name: 'Brand 邊界澄清型',
    description:
      'Trust reset 工具。私訊量爆或有人誤解你在賣課時，用編號 5 點 + 謙卑收尾重設邊界。月配額 1 次。',
    skeleton: `[1. 標題式 hook] 「一些說明，跟大家講清楚」
[2. 動機開場] 「最近有些聲音，想藉這篇一次說明，讓彼此都舒服一點」
[3. 編號 5 點，每點 = 問題 + 反駁/澄清 + 立場]
   一、我從來沒有賣過 X
   二、Y 系列是 Z 不是 W
   三、麻煩多用「追蹤」陌生交友我不會加
   四、訊息太多回不完，來社群找我更快
   五、我發出來的東西，都是開源，沒賺大家錢
[4. 謙卑收尾] 「感謝大家的配合，也謝謝一直以來支持的每一個人」`,
    targetPlatforms: ['facebook'],
    complexity: 3,
    category: 'mode-c',
  },
  {
    id: 'f25a-ship-manifest',
    code: 'F25a',
    name: '集體願景型 - Ship 系列承諾',
    description:
      '宣告新系列 / 內容承諾，用反個人主義 + 拒絕主流 framing 突破鐵粉圈。適合月初宣告新系列。',
    skeleton: `[標題式 hook] 「做了一個決定」
[自問自答] 「為什麼想做這件事？」
[痛點 framing] 私訊量爆，與其一個個回不如公開
[拒絕主流] 「不藏 / 不留一手 / 不鎖付費」
[個人成長傳承] 「我也是這樣學起來的，現在輪到我傳下去」
[系列預告 + 互動 CTA] 「每天一部 + 留言類型告訴我」
[簡短收尾] 「我們明天見」`,
    targetPlatforms: ['facebook'],
    complexity: 3,
    category: 'mode-c',
  },
  {
    id: 'f25b-milestone-collective',
    code: 'F25b',
    name: '集體願景型 - Milestone 集體歸功',
    description:
      '達標慶祝 + 反個人主義歸功。用時間軸故事 + 數字 stacking + 「不是我一個人的功勞」framing。適合社群達標時。',
    skeleton: `[達標 hype 但克制] 「達標了！！我們 X」
[時間軸故事] 「4/1 創 → 4/16 認真經營 → 5/28 滿額」
[數字 stacking + 雙 funnel] 「Line 5000 + Discord 6930 = 12,000+」
[集體歸功反個人] 「完全不是我一個人的功勞，是所有夥伴」
[「故事才剛開始」延續] 「Line 滿額但我們才剛開始」`,
    targetPlatforms: ['facebook'],
    complexity: 3,
    category: 'mode-c',
  },
  {
    id: 'f25c-phase-review',
    code: 'F25c',
    name: '集體願景型 - 階段 review + 集體願景',
    description:
      '月底總結 + 下月預告。用階段 review + 反命題 punch + 名言引用 + 未來 vision，適合換 phase 時。',
    skeleton: `[個人總結 hook] 「玩了一個多月，X 套路透了 😂」
[階段 review] 「我做了 A / B / C」
[反命題 punch] 「最開心的不是數字 ── 是 Y」
[名言引用] 「一個人快，一群人遠」（集體價值觀）
[未來 vision] 「下階段：合作 / 把大家專長兜在一起」
[期待收尾 + emoji] 「玩點更大的 😂」`,
    targetPlatforms: ['facebook'],
    complexity: 3,
    category: 'mode-c',
  },
  {
    id: 'f26-portfolio-reveal',
    code: 'F26',
    name: '隱藏作品集釋出型',
    description:
      '揭露私藏作品集 + giveaway 預告。用私藏浮出 hook + vulnerable confess + 「要不要送」開放式問句做留言磁鐵。月配額 1 次。',
    skeleton: `[1. 反差 hook 私藏浮出] 其實，除了大家最近看到的這些，我私底下還默默做了很多東西
──
[2. 作品集 stacking] 具體列 5-8 個自己做的工具（越具體越好），收一句「一個一個做出來的」
──
[3. 脆弱 confess 為何沒拿出來] 以前從來沒想過要拿出來，總覺得沒什麼人需要，但這陣子大家的回應讓我有點動搖
──
[4. 集體 epiphany] 花了時間是真的，可是看到真的有人會用上、對某些人有幫助，那種感覺比收在硬碟裡珍貴太多
──
[5. giveaway 開放式 CTA] 正在認真考慮要不要乾脆全部免費送，不知道你們有沒有興趣，後續個人版面慢慢推出，到時候自己來拿`,
    targetPlatforms: ['facebook', 'threads'],
    complexity: 3,
    category: 'mode-c',
  },
  {
    id: 'f27-single-product-giveaway',
    code: 'F27',
    name: '單品 spotlight giveaway',
    description:
      '作品集 reveal 後的單品接力。每個產品一篇，用 niche 鎖定 + PWYW + 條件開源 + R35 keyword CTA 驅動留言。',
    skeleton: `[1. 感謝 + 承接前篇] 謝謝這幾天的熱情，Discord 已發大家自己看
──
[2. 單品 reveal + 鎖定 niche] 不知道你們有沒有人在做 X，我做了一套 Y，社群演示過很多次，這次直接送
──
[3. 領取 + PWYW] 輸入 0 元就能帶走，想贊助也可以但那不是重點
──
[4. 條件開源 hook（進階）] 你真的導入跑起來、覺得好用，我就把整套程式碼開源給你改
──
[5. 哲學收尾] 最好的禮物不是只能照用的成品，是能打開、能改、變成你自己的東西
──
[6. R35 keyword CTA（必加）] 想要的留言「關鍵詞」，連結放留言區自己拿`,
    targetPlatforms: ['facebook'],
    complexity: 2,
    category: 'mode-c',
  },

  // ─── Mode A: 日常 ───

  {
    id: 'mode-a-daily',
    code: 'Mode A',
    name: 'Mode A 日常',
    description:
      '日常輕鬆貼文，維持 brand 真實感和鐵粉黏著度。不追求 viral，用來填補 14 天日曆內的非爆款 slot。',
    skeleton:
      '（無固定骨架）日常分享、心得、碎念、生活片段。保持自然口語，不需要特定結構。',
    targetPlatforms: ['facebook', 'threads', 'instagram', 'x'],
    complexity: 1,
    category: 'basic',
  },
]
