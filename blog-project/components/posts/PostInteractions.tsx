"use client";

import { useEffect, useState } from "react";

/** 文章阅赞交互：浏览按会话去重 +1，点赞前端防连点 */
export default function PostInteractions({
  postId,
  initialLikes,
  initialViews,
}: {
  postId: string;
  initialLikes: number;
  initialViews: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const key = `viewed_${postId}`;
    if (typeof sessionStorage === "undefined" || sessionStorage.getItem(key)) return;
    fetch(`/api/posts/${postId}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.views === "number") {
          setViews(d.views);
          sessionStorage.setItem(key, "1");
        }
      })
      .catch(() => {});
  }, [postId]);

  async function like() {
    if (busy || liked) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data && typeof data.likes === "number") {
        setLikes(data.likes);
        setLiked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-inksoft">
      <button
        onClick={like}
        disabled={liked || busy}
        title={liked ? "已赞" : "点赞"}
        className={`flex items-center gap-1.5 transition-colors ${
          liked ? "text-accent" : "hover:text-accent"
        } disabled:opacity-70`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M19 14c1.5-1.5 2-3.6 2-5.5A4.5 4.5 0 0 0 16.5 4c-1.6 0-3 .8-4.5 2-1.5-1.2-2.9-2-4.5-2A4.5 4.5 0 0 0 3 8.5c0 1.9.5 4 2 5.5l7 7Z" />
        </svg>
        <span>{likes}</span> 赞
      </button>
      <span className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {views} 次浏览
      </span>
    </div>
  );
}
