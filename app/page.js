"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import TodoApp from "@/components/TodoApp";

export default function Home() {
  // session：儲存目前的登入 session（null 代表未登入）
  const [session, setSession] = useState(null);
  // loading：等待 Supabase 確認 session 狀態時顯示載入中
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 頁面載入時，讀取目前瀏覽器儲存的 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. 監聽 Auth 狀態變化（登入、登出、Session 更新）
    //    當狀態改變時，自動更新 session state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. 元件卸載時取消監聽，避免 memory leak
    return () => subscription.unsubscribe();
  }, []);

  // 等待 session 確認完畢，避免畫面閃爍（先顯示登入頁，一秒後跳到 TodoApp）
  if (loading) {
    return (
      <main className="page">
        <div className="loading-spinner">
          <span>載入中...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      {/* 根據是否有 session，決定顯示哪個元件 */}
      {session ? (
        <TodoApp session={session} />
      ) : (
        <AuthForm />
      )}
    </main>
  );
}
