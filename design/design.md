# 纸感编辑风 · 设计系统（Design System）

> 一套「像印刷杂志」的暖纸系设计语言，用于内容型网站（博客、文档、刊物、作品集）。
> 关键词：**暖纸 · 墨黑 · 朱红 · 宋体大字 · 细线分区 · 纸面颗粒**。
> 参考实现：`F:\mini-blog\design\`（index / post / tag / about / admin）。

---

## 1. 设计理念

- **气质**：印刷编辑风 / 报刊 / 书卷气。打开页面像翻开一本装帧讲究的独立杂志。
- **核心对比**：暖米色纸面 vs 墨黑文字；朱红只做点睛（eyebrow、印章、hover、数字）。
- **分区**：用 `1px` 细线（`line`）划分区块，少用卡片堆叠与阴影层次。
- **克制**：正方形/直角为主，几乎不用大圆角；留白充足，行距大，文字排版是第一主角。
- **字体即视觉**：宋体大标题撑场面，等宽 mono 负责日期/编号/标签这些"印刷细节"。

---

## 2. 色彩系统（CSS 变量，支持暗黑模式）

> 所有颜色以 `rgb(r g b)` 三段数字定义，供 Tailwind `/<alpha-value>` 使用；`html.dark` 覆盖即整套翻转。

| Token | 语义 | 亮色 Light | 暗色 Dark |
|---|---|---|---|
| `--c-paper` | 页面底色 | `246 241 231` #F6F1E7 暖纸 | `27 24 20` 墨夜 |
| `--c-paper2` | 次级底色 / 色块 | `237 229 211` #EDE5D3 | `37 32 26` |
| `--c-card` | 卡片表面 | `253 251 244` #FDFBF4 | `34 30 24` |
| `--c-ink` | 主文字 | `33 28 22` #211C16 墨黑 | `244 239 229` |
| `--c-inkSoft` | 次要文字 | `111 102 87` #6F6657 | `172 162 144` |
| `--c-line` | 分割线 | `217 205 185` #D9CDB9 | `66 57 46` |
| `--c-lineSoft` | 浅分割线 | `231 222 203` #E7DECB | `47 40 33` |
| `--c-accent` | 朱红（品牌强调） | `166 61 47` #A63D2F | `208 95 74` 亮朱红 |
| `--c-accentDeep` | 朱红加深（hover） | `126 42 31` #7E2A1F | `228 120 96` |
| `--c-gold` | 金黄（深色带上点缀） | `185 138 47` #B98A2F | `208 165 90` |
| `--c-sage` | 青灰（状态/成功） | `111 125 94` #6F7D5E | `139 156 122` |
| `--c-night` | **恒定深色带**（不随主题翻转） | `33 28 22` | `16 14 11` |
| `--c-nightText` | 深色带上的文字 | `246 241 231` | `244 239 229` |

> `night` / `nightText` 是"反色带"专用：顶部通告条、订阅区、代码块、深色按钮一律用它们，切主题时保持不变。

---

## 3. 字体（Typography）

| 角色 | 字体 | 用法 |
|---|---|---|
| 标题 Display | **Noto Serif SC**（900 / 700） | 刊头、章节、文章标题 |
| 正文 / UI | **Noto Sans SC**（400 / 500 / 700） | 段落、导航、按钮文字 |
| 印刷细节 | **IBM Plex Mono**（400 / 500 / 600） | eyebrow、日期、编号、标签、统计数字 |

- **Eyebrow 小标签**：`font-mono; font-size:10-11px; letter-spacing:.35em; uppercase`，多用朱红或墨灰。
- **字号阶梯**：刊头 `5xl–7xl`；章节 H2 `2xl`；文章标题 `2xl–3xl`；正文约 `15px`、行高 `2` 左右（正文用 `leading-loose` / prose 行高 `2.05`）。
- **中文为主**，英文 mono 只做点缀标签（如 `INK & CODE`、`VOL. 03`）。

### 字体引入
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700;900&display=swap" rel="stylesheet" />
```

---

## 4. 关键样式片段（可直接复制）

### 4.1 Tailwind 颜色映射（让 `bg-paper`/`text-ink` 等自动跟随主题）
```js
tailwind.config = {
  theme: { extend: { colors: {
    paper: 'rgb(var(--c-paper) / <alpha-value>)',
    paper2: 'rgb(var(--c-paper2) / <alpha-value>)',
    card: 'rgb(var(--c-card) / <alpha-value>)',
    ink: 'rgb(var(--c-ink) / <alpha-value>)',
    inkSoft: 'rgb(var(--c-inkSoft) / <alpha-value>)',
    line: 'rgb(var(--c-line) / <alpha-value>)',
    lineSoft: 'rgb(var(--c-lineSoft) / <alpha-value>)',
    accent: 'rgb(var(--c-accent) / <alpha-value>)',
    accentDeep: 'rgb(var(--c-accentDeep) / <alpha-value>)',
    gold: 'rgb(var(--c-gold) / <alpha-value>)',
    sage: 'rgb(var(--c-sage) / <alpha-value>)',
    night: 'rgb(var(--c-night) / <alpha-value>)',
    nightText: 'rgb(var(--c-nightText) / <alpha-value>)',
  } } }
}
```

### 4.2 暗黑模式（CSS 变量 + `html.dark`）
```css
:root { --c-paper: 246 241 231; /* …全部亮色 token… */ }
html.dark { --c-paper: 27 24 20; /* …全部暗色 token… */ }
```
- Tailwind 侧 **不需要** `dark:` 变体——`html.dark` 一加，所有 `bg-paper / text-ink / border-line` 自动翻转。
- 防闪白：在 `<head>` 里同步执行——
```html
<script>
  (function(){ var t; try{t=localStorage.getItem('theme')}catch(e){};
    if(t===null) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light';
    if(t==='dark') document.documentElement.classList.add('dark');
  })();
</script>
```
- 切换按钮逻辑：`html.classList.toggle('dark')` + `localStorage.setItem('theme', ...)`，图标日月互换。

### 4.3 纸面颗粒（噪点）
```css
body::before {
  content: ""; position: fixed; inset: 0; z-index: 70; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  opacity: .05; mix-blend-mode: multiply;
}
```

### 4.4 纸框投影（硬偏移，无模糊）
```css
.frame { box-shadow: 6px 6px 0 0 rgb(var(--c-ink) / .14); }
```

### 4.5 常用小组件
```css
/* 标签 chip：1px 同色描边，mono */
.chip { display:inline-flex; align-items:center; gap:.35rem;
  border:1px solid currentColor; padding:.18rem .6rem;
  font-family:'IBM Plex Mono',monospace; font-size:.68rem; letter-spacing:.1em; white-space:nowrap; }
.chip-accent { color: rgb(var(--c-accent)); }
.chip-soft { color: rgb(var(--c-inkSoft)); }

/* 编辑体下划线动画 */
.u-link::after { content:""; position:absolute; left:0; bottom:-3px; height:1.5px; width:100%;
  background:currentColor; transform:scaleX(0); transform-origin:right;
  transition:transform .45s cubic-bezier(.22,1,.36,1); }
.u-link:hover::after { transform:scaleX(1); transform-origin:left; }
```

---

## 5. 动效（克制的"眼前一亮"）

| 效果 | 实现 | 场景 |
|---|---|---|
| 入场上浮 | `translateY(26px)→0`，`.9s cubic-bezier(.22,1,.36,1)`，用 `animation-delay` 错峰 | 页面各区 `.reveal` |
| 墨水扫入 | `@keyframes inkWipe { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)} }` | 刊头大字 |
| 卡片悬浮 | `translate(-2px,-4px)` + `10px 12px 0 0` 硬影 | 文章/项目卡片 |
| 数字滚动 | IntersectionObserver 触发，cubic 缓动计数 | 数据台账 |
| 技能条展开 | 滚入后 `width:0→data-level%` | 关于页 |
| 印章呼吸 | `scale(1)↔scale(1.06)`，5s 循环 | 卷首诗印章 |
| 拾语轮换 | `setInterval` 淡入淡出换文案 | （可选）卷首 |

> 动效原则：**一个高光入场 + 少量 hover 反馈**，绝不散落到处乱动。

---

## 6. 布局范式（页面骨架）

- **容器**：`max-w-6xl mx-auto px-5`
- **页头**：`sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-line`，左品牌（宋体大字 + mono 小标签），中导航（`u-link` 下划线 hover，当前页朱红），右侧搜索/主题切换/管理。
- **顶部通告条**：`bg-night text-nightText`，mono 居中，可放一句题词。
- **分隔**：区与区之间 `mt-16 / mt-20`；区块标题 = 宋体 H2 + mono eyebrow + `flex-1 h-px bg-line` 横线。

### 6.1 首页
`刊头双线 → 卷首诗 hero → 数据台账（四格数字）→ 文章卡片网格 → 项目 → 标签云 → 订阅带 → 页脚`

### 6.2 文章页
`面包屑 → 头部（chip 标签 + 宋体大标题 + 作者/日期/阅赞）→ 封面 → 正文（首字下沉/表格/代码块/引文）→ 标签+分享 → 作者卡 → 上下篇 → 评论区`；桌面右侧 `sticky` 目录侧栏（`lg:col-span-4`）。

### 6.3 标签/归档页
左栏 `sticky` 分类索引（栏目 + 标签双组，active 左缘朱红条）+ 右栏"# 标签 hero（含相关标签）" + **按月归档时间线**（竖线 + 月份节点圆点）。

### 6.4 管理端（可单独用）
深墨侧栏（`bg-ink text-paper`）+ 纸面主区；统计卡（`border-t-2` 顶部色条）、SVG 面积图、文章表格（状态 pill：已发布=青 / 草稿=金）、待审评论列表。

---

## 7. 复用清单（换站时照着搭）

1. 复制 4.1 的 Tailwind 颜色映射 + 4.2 的变量块（亮/暗两套）。
2. 复制 4.3 噪点、4.4 纸框、4.5 小组件、5 的动画。
3. 加 `u-link`、`chip`、`eyebrow`、`reveal` 到全局样式。
4. 页头/页脚/顶部通告条照 6 复用。
5. 深色带一律 `bg-night text-nightText`；反色 hover 用 `hover:bg-ink hover:text-paper`。
6. 中文正文用宋体排版行高 `1.8–2`，标题用 900 字重。
7. 分隔用细线 `border-line`，少用圆角与多层阴影。

---

## 8. 注意事项 / 反模式

- ❌ 不要用浅紫渐变、大圆角卡片堆、无衬线通篇、`Inter` 这类"AI 味"默认字体。
- ❌ 深色带（通告条/代码块/订阅区）**不要**用 `bg-ink`——那会随主题翻转；用 `bg-night`。
- ⚠️ 朱红是点缀不是铺满：eyebrow、印章、hover、关键数字用，正文大段不用。
- ⚠️ 首屏 hero 若做古诗/标语，保持"大字 + 留白 + 少量装饰"，别叠太多背景层（本项目已精简）。
