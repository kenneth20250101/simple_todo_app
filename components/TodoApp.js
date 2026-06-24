"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import TodoItem from "./TodoItem";

// TodoApp：登入後的主畫面
// props:
// - session: Supabase session 物件（含 session.user）
export default function TodoApp({ session }) {
  const user = session.user; // 取出目前登入的使用者物件

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);   // 初次讀取 todos
  const [adding, setAdding] = useState(false);    // 新增中
  const [errorMsg, setErrorMsg] = useState("");

  // ─────────────────────────────────────────────
  // 讀取 todos（從 Supabase 撈取屬於此使用者的資料）
  // ─────────────────────────────────────────────
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)                      // 只拿自己的 todos
      .order("created_at", { ascending: true });   // 按建立時間排序

    if (error) {
      setErrorMsg("讀取任務失敗：" + error.message);
    } else {
      setTodos(data);
    }

    setLoading(false);
  }, [user.id]);

  // 元件掛載時讀取一次
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ─────────────────────────────────────────────
  // 新增 todo
  // ─────────────────────────────────────────────
  async function handleAddTodo() {
    const trimmedText = inputValue.trim();
    if (trimmedText === "") return;

    setAdding(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("todos")
      .insert({
        title: trimmedText,
        is_complete: false,
        user_id: user.id,        // 明確帶入 user_id（RLS 也會驗證這一點）
      })
      .select()                  // insert 後回傳新建立的資料
      .single();

    if (error) {
      setErrorMsg("新增任務失敗：" + error.message);
    } else {
      setTodos((prev) => [...prev, data]); // 樂觀更新：把新 todo 加到 state
      setInputValue("");
    }

    setAdding(false);
  }

  // ─────────────────────────────────────────────
  // 切換完成 / 未完成
  // ─────────────────────────────────────────────
  async function handleToggleTodo(id, currentIsComplete) {
    // 1. 樂觀更新 UI（先改 state，讓使用者立即看到反應）
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_complete: !currentIsComplete } : t
      )
    );

    // 2. 非同步更新 Supabase
    const { error } = await supabase
      .from("todos")
      .update({ is_complete: !currentIsComplete })
      .eq("id", id);

    if (error) {
      // 如果失敗，把 state 還原
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_complete: currentIsComplete } : t
        )
      );
      setErrorMsg("更新任務失敗：" + error.message);
    }
  }

  // ─────────────────────────────────────────────
  // 刪除 todo
  // ─────────────────────────────────────────────
  async function handleDeleteTodo(id) {
    // 1. 樂觀更新 UI
    setTodos((prev) => prev.filter((t) => t.id !== id));

    // 2. 非同步刪除
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id);

    if (error) {
      // 失敗則重新讀取，確保 UI 與資料庫一致
      setErrorMsg("刪除任務失敗：" + error.message);
      fetchTodos();
    }
  }

  // ─────────────────────────────────────────────
  // 登出
  // ─────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut();
    // signOut 後 onAuthStateChange 會偵測到 session 變成 null
    // page.js 會自動切換回 AuthForm，不需要手動跳轉
  }

  // 按 Enter 新增
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleAddTodo();
    }
  }

  // 統計
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.is_complete).length;

  return (
    <div className="todo-app">
      {/* 頂部：標題 + 使用者資訊 + 登出 */}
      <div className="todo-header">
        <h1 className="todo-title">📝 ToDo App</h1>
        <div className="user-bar">
          <span className="user-email">{user.email}</span>
          <button className="signout-btn" onClick={handleSignOut}>
            登出
          </button>
        </div>
      </div>

      {/* 輸入區 */}
      <div className="todo-input-row">
        <input
          type="text"
          className="todo-input"
          placeholder="輸入新的任務..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={adding}
        />
        <button
          className="todo-add-btn"
          onClick={handleAddTodo}
          disabled={adding || inputValue.trim() === ""}
        >
          {adding ? "新增中..." : "新增"}
        </button>
      </div>

      {/* 錯誤訊息 */}
      {errorMsg && <p className="todo-error">{errorMsg}</p>}

      {/* 統計 */}
      <div className="todo-stats">
        <span>
          總共 <strong>{totalCount}</strong> 項任務
        </span>
        <span>
          已完成 <span className="highlight">{completedCount}</span> 項
        </span>
      </div>

      {/* 任務列表 */}
      {loading ? (
        <p className="todo-empty">載入任務中...</p>
      ) : todos.length === 0 ? (
        <p className="todo-empty">目前沒有任務，新增一筆開始吧！</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
