/**
 * 封面图预设池 · 来自 Unsplash「coding」主题（30 张）。
 *
 * 新建文章未填写封面 URL 时，后端随机取一张存入 `Post.coverImage`；
 * 因为值已入库，编辑时表单直接回填该值，无需额外逻辑。
 */
export const COVER_PRESETS: string[] = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483817101829-339b08e8d83f?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499673610122-01c7122c5dcb?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1536148935331-408321065b18?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595675024853-0f3ec9098ac7?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607706009771-de8808640bcf?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607706189992-eae578626c86?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607798748738-b15c40d33d57?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1562813733-b31f71025d54?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1619410283995-43d9134e7656?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564865878688-9a244444042a?q=80&w=900&auto=format&fit=crop",
];

/** 随机取一张封面（新建文章未填封面时使用） */
export function randomCover(): string {
  return COVER_PRESETS[Math.floor(Math.random() * COVER_PRESETS.length)];
}
