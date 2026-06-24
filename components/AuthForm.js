"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// AuthForm：處理登入與註冊兩種模式
// 透過 isLogin state 切換模式，不需要兩個頁面
export default function AuthForm() {
  // 控制目前是「登入」還是「註冊」模式
  const [isLogin, setIsLogin] = useState(true);

  // 表單欄位
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI 狀態
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 切換模式時，清空錯誤與訊息
  function handleToggleMode() {
    setIsLogin((prev) => !prev);
    setErrorMsg("");
    setSuccessMsg("");
    setEmail("");
    setPassword("");
  }

  // 登入
  async function handleLogin() {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 將常見英文錯誤訊息轉成中文，對初學者更友善
      if (error.message.includes("Invalid login credentials")) {
        setErrorMsg("Email 或密碼錯誤，請重新輸入。");
      } else if (error.message.includes("Email not confirmed")) {
        setErrorMsg("請先到信箱確認 Email 後再登入。");
      } else {
        setErrorMsg(error.message);
      }
    }
    // 登入成功後，page.js 的 onAuthStateChange 會自動偵測到新 session
    // 不需要在這裡手動跳轉頁面

    setLoading(false);
  }

  // 註冊
  async function handleSignUp() {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 6) {
      setErrorMsg("密碼至少需要 6 個字元。");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        setErrorMsg("這個 Email 已經註冊過了，請直接登入。");
      } else {
        setErrorMsg(error.message);
      }
    } else {
      setSuccessMsg(
        "註冊成功！請到信箱點擊確認連結，完成驗證後即可登入。"
      );
    }

    setLoading(false);
  }

  // 按下提交按鈕
  function handleSubmit() {
    if (!email || !password) {
      setErrorMsg("請填寫 Email 和密碼。");
      return;
    }
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  }

  // 按 Enter 也可以提交
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className="auth-card">
      {/* 標題 */}
      <h1 className="auth-title">📝 ToDo App</h1>
      <h2 className="auth-subtitle">{isLogin ? "登入帳號" : "建立帳號"}</h2>

      {/* Email 輸入框 */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="auth-input"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
        />
      </div>

      {/* 密碼輸入框 */}
      <div className="auth-field">
        <label className="auth-label" htmlFor="password">
          密碼{!isLogin && <span className="auth-hint">（至少 6 個字元）</span>}
        </label>
        <input
          id="password"
          type="password"
          className="auth-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </div>

      {/* 錯誤訊息 */}
      {errorMsg && <p className="auth-error">{errorMsg}</p>}

      {/* 成功訊息（通常是註冊後的提示） */}
      {successMsg && <p className="auth-success">{successMsg}</p>}

      {/* 提交按鈕 */}
      <button
        className="auth-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "處理中..." : isLogin ? "登入" : "註冊"}
      </button>

      {/* 切換模式 */}
      <p className="auth-toggle">
        {isLogin ? "還沒有帳號？" : "已經有帳號？"}
        <button className="auth-toggle-btn" onClick={handleToggleMode}>
          {isLogin ? "立即註冊" : "前往登入"}
        </button>
      </p>
    </div>
  );
}
