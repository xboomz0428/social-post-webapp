'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users, Settings, PenSquare, BookTemplate, Calendar, Sparkles,
  ArrowRight, ChevronRight, CheckCircle2, Info, Zap, Globe,
  Image as ImageIcon, Clock, BarChart3, FileText
} from 'lucide-react'

function FlowDiagram() {
  return (
    <svg viewBox="0 0 900 120" className="w-full max-w-4xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Step boxes */}
      {[
        { x: 10, label: '① 建立帳號', sub: '設定平台 API', color: '#3B82F6' },
        { x: 190, label: '② 設定口吻', sub: '語氣 & 風格', color: '#8B5CF6' },
        { x: 370, label: '③ AI 設定', sub: 'API Key & 模型', color: '#F59E0B' },
        { x: 550, label: '④ 選公式', sub: '30+ 模板', color: '#10B981' },
        { x: 730, label: '⑤ 生成發佈', sub: 'AI 寫 → 修改 → 發', color: '#EF4444' },
      ].map(({ x, label, sub, color }) => (
        <g key={x}>
          <rect x={x} y={15} width={155} height={80} rx={12} fill={color} opacity={0.1} stroke={color} strokeWidth={2} />
          <text x={x + 78} y={48} textAnchor="middle" fontSize={14} fontWeight="bold" fill={color}>{label}</text>
          <text x={x + 78} y={72} textAnchor="middle" fontSize={11} fill="#666">{sub}</text>
          {x < 730 && (
            <polygon points={`${x + 165},55 ${x + 180},55 ${x + 180},50 ${x + 190},57 ${x + 180},64 ${x + 180},59 ${x + 165},59`} fill="#CBD5E1" />
          )}
        </g>
      ))}
    </svg>
  )
}

function ScreenMockup({ title, icon: Icon, children, color = 'blue' }: { title: string; icon: React.ElementType; children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50/30',
    purple: 'border-purple-200 bg-purple-50/30',
    green: 'border-green-200 bg-green-50/30',
    amber: 'border-amber-200 bg-amber-50/30',
    red: 'border-red-200 bg-red-50/30',
  }
  return (
    <div className={`border-2 rounded-xl overflow-hidden ${colors[color]}`}>
      <div className="bg-white border-b px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">social-post-webapp.vercel.app</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-5 w-5 text-gray-700" />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        {children}
      </div>
    </div>
  )
}

function StepSection({ number, title, description, children, link }: {
  number: string; title: string; description: string; children: React.ReactNode; link?: { href: string; label: string }
}) {
  return (
    <section className="scroll-mt-20" id={`step-${number}`}>
      <div className="flex gap-4 items-start mb-4">
        <span className="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center">
          {number}
        </span>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
      </div>
      <div className="ml-14 space-y-4">
        {children}
        {link && (
          <Link href={link.href}>
            <Button variant="outline" className="gap-2 mt-2">
              <ArrowRight className="h-4 w-4" />
              {link.label}
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
      <div className="text-blue-800">{children}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-white">
      <Icon className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

export default function GuidePage() {
  return (
    <div className="max-w-4xl space-y-12 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-3xl font-bold">📖 操作說明</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Social Post Manager 幫你管理多個社群帳號，用 AI 自動生成貼文，一鍵排程發佈到 Facebook、Instagram、Threads、X。
        </p>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { n: '1', label: '建立帳號', icon: Users },
          { n: '2', label: '設定口吻', icon: FileText },
          { n: '3', label: 'AI 設定', icon: Sparkles },
          { n: '4', label: '選公式', icon: BookTemplate },
          { n: '5', label: '生成發佈', icon: PenSquare },
        ].map(({ n, label, icon: Icon }) => (
          <a
            key={n}
            href={`#step-${n}`}
            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
          >
            <Icon className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{label}</span>
          </a>
        ))}
      </div>

      {/* Workflow Diagram */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <h3 className="text-center font-semibold mb-4 text-gray-700">完整操作流程</h3>
          <FlowDiagram />
        </CardContent>
      </Card>

      {/* ─── STEP 1 ─── */}
      <StepSection
        number="1"
        title="建立社群帳號"
        description="新增你要管理的 FB / IG / Threads / X 帳號，並設定各平台的 API 金鑰"
        link={{ href: '/accounts', label: '前往帳號管理' }}
      >
        <ScreenMockup title="帳號管理" icon={Users} color="blue">
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <span className="text-xl">🔵</span>
              <div className="flex-1">
                <div className="text-sm font-medium">好漢草 FB</div>
                <div className="text-xs text-gray-400">Facebook · 每週 4 篇 · 09:00, 18:00</div>
              </div>
              <div className="flex gap-1">
                <div className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">口吻</div>
                <div className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">設定</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <span className="text-xl">🧵</span>
              <div className="flex-1">
                <div className="text-sm font-medium">好漢草 Threads</div>
                <div className="text-xs text-gray-400">Threads · 每週 3 篇 · 22:00</div>
              </div>
              <div className="flex gap-1">
                <div className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">口吻</div>
                <div className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">設定</div>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center text-gray-400 text-sm">
              + 新增帳號
            </div>
          </div>
        </ScreenMockup>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />操作步驟</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
            <li>點擊右上角 <strong>「帳號」</strong> 或前往 <code>/accounts</code> 頁面</li>
            <li>點擊 <strong>「+ 新增帳號」</strong> → 選擇平台（Facebook / Instagram / Threads / X）</li>
            <li>填入 <strong>帳號名稱</strong>（內部用）和 <strong>顯示名稱</strong></li>
            <li>展開 <strong>📖 教學指引</strong>，按照步驟取得該平台的 API Key</li>
            <li>填入 API Key → 設定排程頻率（每週幾篇、偏好時段）</li>
            <li>點擊 <strong>「儲存設定」</strong></li>
          </ol>
        </div>

        <Tip>
          每個平台可以建立多組帳號。例如你有兩個 FB 粉專，可以各建一組，各有獨立的 API Key 和發文口吻。
        </Tip>

        <Tip>
          Facebook 個人頁面沒有 API，無法自動發文。需要使用 <strong>粉絲專頁</strong>（商業帳號）才能透過 API 發文。
        </Tip>
      </StepSection>

      {/* ─── STEP 2 ─── */}
      <StepSection
        number="2"
        title="設定帳號口吻 / 風格"
        description="讓 AI 學會你的語氣，每個帳號可以有不同的寫作風格"
        link={{ href: '/accounts', label: '前往設定口吻' }}
      >
        <ScreenMockup title="口吻 / 風格設定" icon={FileText} color="purple">
          <div className="space-y-3">
            <div className="bg-white rounded-lg border p-3">
              <div className="text-xs text-gray-400 mb-1">語氣摘要</div>
              <div className="text-sm text-gray-700">口語實在、有溫度，說真話不說場面話。商業洞察配生活觀察...</div>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <div className="text-xs text-gray-400 mb-1">範例貼文</div>
              <div className="text-sm text-gray-600 italic">「還好，雲端做了Raid。現在Nas殘廢，但還沒有GG...」</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg border p-2.5">
                <div className="text-xs text-gray-400">目標受眾</div>
                <div className="text-xs mt-1">30-50 歲中小企業主</div>
              </div>
              <div className="bg-white rounded-lg border p-2.5">
                <div className="text-xs text-gray-400">避免用語</div>
                <div className="text-xs mt-1">護城河, 本質, 真正的...</div>
              </div>
            </div>
          </div>
        </ScreenMockup>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />操作步驟</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
            <li>在帳號管理頁面，找到你的帳號 → 點擊 <strong>「口吻」</strong> 按鈕</li>
            <li>填寫 <strong>語氣摘要</strong>：用一句話描述這個帳號的寫作風格</li>
            <li>貼入 <strong>範例貼文</strong>：2-3 篇你最滿意的貼文，用 <code>---</code> 分隔</li>
            <li>填寫 <strong>目標受眾</strong>、<strong>偏好 Hashtag</strong>、<strong>避免用語</strong></li>
            <li>（選填）<strong>自訂指令</strong>：給 AI 的額外說明，例如「不要用太多感嘆號」</li>
            <li>點擊 <strong>「儲存口吻設定」</strong></li>
          </ol>
        </div>

        <Tip>
          口吻設定越詳細，AI 生成的內容就越像你。建議至少貼入 3 篇真實貼文作為範例。
        </Tip>
      </StepSection>

      {/* ─── STEP 3 ─── */}
      <StepSection
        number="3"
        title="設定 AI 模型"
        description="選擇 AI 提供者（OpenAI / Claude / Gemini），設定 API Key 和模型"
        link={{ href: '/settings', label: '前往 AI 設定' }}
      >
        <ScreenMockup title="AI 模型設定" icon={Settings} color="amber">
          <div className="space-y-3">
            {[
              { icon: '🟢', name: 'OpenAI', model: 'gpt-4o', status: '✓ 已連線' },
              { icon: '🟠', name: 'Anthropic', model: 'claude-sonnet-4-6', status: '✓ 已連線' },
              { icon: '🔵', name: 'Google Gemini', model: 'gemini-2.5-flash', status: '⚡ 預設' },
            ].map(({ icon, name, model, status }) => (
              <div key={name} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <span className="text-lg">{icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-xs text-gray-400">{model}</div>
                </div>
                <span className="text-xs text-green-600">{status}</span>
              </div>
            ))}
          </div>
        </ScreenMockup>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />操作步驟</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
            <li>前往 <strong>「設定」</strong> 頁面（導覽列右側齒輪圖示）</li>
            <li>選擇 <strong>預設 AI 提供者</strong>（建議先從 Google Gemini 開始，免費額度最多）</li>
            <li>展開對應提供者的 <strong>📖 教學指引</strong>，按步驟取得 API Key</li>
            <li>填入 API Key → 選擇模型 → 調整 Temperature</li>
            <li>點擊 <strong>「測試連線」</strong> 確認 API 正常運作</li>
            <li>點擊 <strong>「儲存所有設定」</strong></li>
          </ol>
        </div>

        <Card className="border-amber-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm mb-3">💡 模型推薦</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-sm font-medium">🆓 免費首選</div>
                <div className="text-xs mt-1 text-gray-600">Google Gemini 2.5 Flash</div>
                <div className="text-xs text-gray-400 mt-1">免費額度充足，速度快</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-sm font-medium">⚡ CP 值最高</div>
                <div className="text-xs mt-1 text-gray-600">OpenAI GPT-4o-mini</div>
                <div className="text-xs text-gray-400 mt-1">便宜又好用，日常生成首選</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="text-sm font-medium">🏆 品質最強</div>
                <div className="text-xs mt-1 text-gray-600">Claude Sonnet 4.6</div>
                <div className="text-xs text-gray-400 mt-1">最懂中文語氣，正式貼文用</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </StepSection>

      {/* ─── STEP 4 ─── */}
      <StepSection
        number="4"
        title="選擇貼文公式"
        description="從 30+ 個驗證過的公式模板中選擇，套用到你的貼文"
        link={{ href: '/templates', label: '瀏覽公式模板庫' }}
      >
        <ScreenMockup title="公式模板庫" icon={BookTemplate} color="green">
          <div className="grid grid-cols-2 gap-2">
            {[
              { code: 'F6b-A', name: 'Promo 型', desc: '爆款推廣模板', complexity: 5 },
              { code: 'F2', name: '截圖先丟再講', desc: '圖片吸引停留', complexity: 2 },
              { code: 'F7', name: 'POV 吐槽', desc: 'Threads 專用', complexity: 2 },
              { code: 'F3', name: '實測翻車版', desc: '深度信任建立', complexity: 4 },
            ].map(({ code, name, desc, complexity }) => (
              <div key={code} className="p-3 bg-white rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono">{code}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-1 h-3 rounded-full ${i < complexity ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-sm font-medium mt-1.5">{name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </ScreenMockup>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />操作步驟</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
            <li>前往 <strong>「公式模板」</strong> 頁面</li>
            <li>瀏覽或搜尋公式 → 點擊感興趣的公式卡片</li>
            <li>查看 <strong>骨架 / 模板結構</strong>（AI 會根據這個結構生成內容）</li>
            <li>點擊 <strong>「用此公式新增貼文」</strong> → 直接跳到編輯器，公式已自動套用</li>
          </ol>
        </div>

        <Tip>
          新手建議從 <strong>F2 截圖先丟再講</strong>（簡單）和 <strong>F7 POV 吐槽</strong>（Threads 專用）開始，上手後再挑戰 <strong>F6b 爆款系列</strong>。
        </Tip>
      </StepSection>

      {/* ─── STEP 5 ─── */}
      <StepSection
        number="5"
        title="AI 生成 + 編輯 + 排程"
        description="輸入題材，讓 AI 依照你的口吻和公式骨架自動生成，修改後排程發佈"
        link={{ href: '/editor', label: '新增貼文' }}
      >
        <ScreenMockup title="貼文編輯器" icon={PenSquare} color="red">
          <div className="space-y-3">
            {/* AI panel */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-1 text-purple-700 text-xs font-medium mb-2">
                <Sparkles className="h-3 w-3" /> AI 生成
              </div>
              <div className="bg-white rounded border p-2 text-xs text-gray-500 mb-2">
                好漢草在恩主公醫院護師節快閃活動，帶了泡腳配方...
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded border px-2 py-1 text-xs text-gray-400">Google Gemini</div>
                <div className="flex-1 bg-white rounded border px-2 py-1 text-xs text-gray-400">gemini-2.5-flash</div>
                <div className="bg-purple-600 text-white px-3 py-1 rounded text-xs">生成</div>
              </div>
            </div>
            {/* Editor */}
            <div className="bg-white rounded-lg border p-3">
              <div className="flex gap-1 mb-2 pb-2 border-b">
                <div className="px-2 py-0.5 bg-gray-100 rounded text-xs">B</div>
                <div className="px-2 py-0.5 bg-gray-100 rounded text-xs">I</div>
                <div className="px-2 py-0.5 bg-gray-100 rounded text-xs">📷</div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                護理師們辛苦了！<br />
                祝全天下的白衣天使護師節快樂<br />
                今天好漢草來到三峽恩主公醫院快閃...
              </div>
            </div>
            {/* Sidebar preview */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded border p-2 text-center">
                <div className="text-xs text-gray-400">平台</div>
                <div className="text-xs mt-1">🔵 📸</div>
              </div>
              <div className="bg-white rounded border p-2 text-center">
                <div className="text-xs text-gray-400">排程</div>
                <div className="text-xs mt-1">06/24 18:00</div>
              </div>
              <div className="bg-white rounded border p-2 text-center">
                <div className="text-xs text-gray-400">公式</div>
                <div className="text-xs mt-1">F6b-A</div>
              </div>
            </div>
          </div>
        </ScreenMockup>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />操作步驟</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
            <li>前往 <strong>「新增貼文」</strong> 或從公式模板直接進入</li>
            <li>在右側選擇 <strong>所屬帳號</strong>（AI 會讀取該帳號的口吻設定）</li>
            <li>勾選要發佈的 <strong>平台</strong>（可多選）</li>
            <li>選擇 <strong>公式</strong>（AI 會依照骨架結構生成）</li>
            <li>在紫色 AI 面板輸入 <strong>題材 / 方向</strong></li>
            <li>選擇 AI 提供者和模型 → 點擊 <strong>「生成」</strong></li>
            <li>AI 生成內容會自動填入編輯器 → <strong>自由修改、刪除、新增內容</strong></li>
            <li>可以插入圖片（點擊工具列 📷 按鈕）</li>
            <li>設定排程時間 → 點擊 <strong>「儲存草稿」</strong> 或 <strong>「設為排程」</strong></li>
          </ol>
        </div>

        <Tip>
          AI 生成的內容只是初稿！你可以自由修改任何部分。建議 AI 生成後至少調整 20-30%，讓貼文更有你的個人特色。
        </Tip>

        <Tip>
          不滿意生成結果？可以換一個 AI 提供者重新生成，或修改題材描述讓 AI 換個角度寫。
        </Tip>
      </StepSection>

      {/* ─── 功能一覽 ─── */}
      <section>
        <h2 className="text-xl font-bold mb-4">🧩 全部功能一覽</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FeatureCard icon={Users} title="多帳號管理" desc="每個平台可建多組帳號，各自獨立的 API Key、口吻、排程" />
          <FeatureCard icon={Sparkles} title="AI 內容生成" desc="支援 OpenAI / Claude / Gemini，依你的口吻和公式自動生成" />
          <FeatureCard icon={BookTemplate} title="30+ 公式模板" desc="經過實戰驗證的貼文公式，含骨架結構和使用說明" />
          <FeatureCard icon={PenSquare} title="圖文編輯器" desc="Tiptap 富文編輯器，支援粗體、斜體、圖片上傳、字數統計" />
          <FeatureCard icon={Globe} title="多平台發佈" desc="FB / IG / Threads / X 勾選發佈，每平台各生一版" />
          <FeatureCard icon={Clock} title="排程管理" desc="設定發佈時間，每帳號可設每週篇數、每天上限、偏好時段" />
          <FeatureCard icon={BarChart3} title="戰績追蹤" desc="記錄每篇的讚、留言、分享、觸及、非追蹤者比例" />
          <FeatureCard icon={ImageIcon} title="口吻/風格設定" desc="語氣摘要、範例貼文、目標受眾、禁用詞，AI 學你的風格" />
          <FeatureCard icon={Zap} title="API 測試" desc="一鍵測試各 AI 提供者的 API Key 是否正常" />
          <FeatureCard icon={FileText} title="改版記錄" desc="每次更新都有版本號和完整改版內容" />
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section>
        <h2 className="text-xl font-bold mb-4">❓ 常見問題</h2>
        <div className="space-y-4">
          {[
            { q: '我的資料存在哪裡？安全嗎？', a: 'API Key 和貼文資料目前存在你的瀏覽器 localStorage 中，不會上傳到任何伺服器。但換電腦或清除瀏覽器資料會遺失，未來會支援 Google Sheets 雲端儲存。' },
            { q: 'AI 生成要花多少錢？', a: 'Google Gemini 2.5 Flash 有免費額度，日常使用幾乎不花錢。OpenAI GPT-4o-mini 約每 1000 篇貼文花 $0.5 美元，非常便宜。' },
            { q: 'Facebook 個人頁面可以自動發文嗎？', a: '不行。Meta 只開放粉絲專頁（商業帳號）的 API 發文權限。個人頁面需透過 Claude in Chrome 操作瀏覽器發佈。' },
            { q: 'Threads 和 X 可以自動發文嗎？', a: '可以！Threads 和 X 都有公開的 API，設定好 API Key 後即可自動發佈。' },
            { q: '我可以同時管理多個品牌嗎？', a: '可以！每個帳號有獨立的口吻設定，你可以為「好漢草」和其他品牌各建一組帳號，AI 會根據不同帳號的口吻生成不同風格的內容。' },
            { q: 'Temperature 是什麼？要設多少？', a: 'Temperature 控制 AI 的創意程度。0 = 最保守（每次結果類似），1 = 最有創意（結果多變）。建議設 0.7-0.8，平衡穩定性和創意。' },
          ].map(({ q, a }) => (
            <Card key={q}>
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm">{q}</h4>
                <p className="text-sm text-gray-600 mt-2">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
