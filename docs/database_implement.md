# 🚀 第一階段進階版實作說明

## 這一階段做了什麼？

| 功能 | 說明 |
|---|---|
| 會員註冊 | Email + Password 建立帳號（Supabase Auth） |
| 會員登入 | 驗證身份，取得 Session（JWT） |
| 會員登出 | 清除 Session |
| 資料隔離 | 每位使用者只能看到自己的 todos（RLS） |
| 資料持久化 | todos 存在 Supabase Database，重新整理後仍然存在 |

---

## 📁 完整檔案結構與用途

```
todo-app-v2/
├── app/
│   ├── layout.js           # 根版面：初始化 Supabase Auth 監聽，提供全域 Session context
│   ├── page.js             # 首頁：根據登入狀態顯示 AuthForm 或 TodoApp
│   └── globals.css         # 全域樣式：配色、版面、RWD、Auth 表單樣式
│
├── components/
│   ├── AuthForm.js         # 登入 / 註冊表單元件（可切換模式）
│   ├── TodoApp.js          # ToDo 主元件：讀取、新增、切換、刪除 todos，顯示登出按鈕
│   └── TodoItem.js         # 單一 todo 顯示元件（checkbox + 文字 + 刪除按鈕）
│
├── lib/
│   └── supabase.js         # Supabase client 初始化（createBrowserClient）
│
├── docs/
│   ├── Database_init.md    # Supabase SQL：建表、RLS、Policies
│   └── database_implement.md  # 本文件：整合實作說明
│
├── .env.example            # 環境變數範本（給學生參考填寫，不含真實值）
├── .env.local              # ⚠️ 真實的 Key（不能上傳 GitHub，已加入 .gitignore）
├── .gitignore
├── next.config.mjs
├── jsconfig.json
├── package.json
└── README.md
```

---

## 🔑 環境變數設定

### 哪裡取得這兩個值？

1. 前往 [supabase.com](https://supabase.com) 建立（或開啟）你的專案
2. 左側選單 → **Project Settings** → **API**
3. 複製以下兩個值：
   - **Project URL** → 填入 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → 填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 本機開發

在專案根目錄建立 `.env.local` 檔案（參考 `.env.example`）：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://你的project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
```

> `.env.local` 已加入 `.gitignore`，不會被推上 GitHub。

### Vercel 部署設定

1. 在 Vercel 專案頁面 → **Settings** → **Environment Variables**
2. 新增以下兩個變數（Production / Preview / Development 都勾選）：

| 變數名稱 | 值 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://你的project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `你的 anon key` |

3. 儲存後重新部署（Redeploy）即可生效

> **為什麼變數名稱要加 `NEXT_PUBLIC_` 前綴？**
>
> Next.js 預設只有加了 `NEXT_PUBLIC_` 的環境變數才會暴露給瀏覽器端（Client Side）。
> Supabase client 在前端初始化時需要讀取這兩個值，所以必須加這個前綴。

---

## 🔐 為什麼需要 `user_id`？

`user_id` 是資料表中用來「標記這筆資料屬於哪個使用者」的欄位。

**沒有 user_id 的問題：**
- 所有使用者的 todos 會混在一起，沒辦法區分
- 你無法知道某筆 todo 是哪位使用者建立的

**有了 user_id 之後：**
1. 每次使用者新增 todo，後端自動把 `user_id` 設為 `auth.uid()`（登入者的 UUID）
2. 查詢時使用 `.eq('user_id', user.id)` 過濾，只拿出屬於自己的資料
3. 搭配 RLS，即使前端的查詢沒有帶 filter，資料庫也會自動過濾

---

## 🛡️ 為什麼需要 RLS（Row Level Security）？

Supabase 的 `anon key` 是設計給前端使用的，它本質上是公開的。
任何看到你原始碼或網路請求的人，都可以拿到這把 key。

**如果不開啟 RLS：**
```
有心人士拿到 anon key
→ 直接發 API 請求 GET /rest/v1/todos
→ 拿到所有使用者的 todos
→ 嚴重資料外洩
```

**開啟 RLS 後：**
```
有心人士拿到 anon key
→ 發 API 請求 GET /rest/v1/todos
→ 但沒有登入 Session / JWT
→ auth.uid() 回傳 null
→ RLS policy 的 USING (auth.uid() = user_id) 一筆都不符合
→ 回傳空陣列，沒有任何資料外洩
```

> **結論：RLS 是 Supabase 資料安全的最後一道防線，絕對不能省略。**

---

## 🔄 Auth 流程說明

```
使用者開啟網頁
  ↓
Supabase 自動讀取 Cookie / LocalStorage 裡的 Session
  ↓
有 Session → 直接進入 TodoApp（不需要重新登入）
沒有 Session → 顯示 AuthForm
  ↓
登入成功 → Supabase 回傳 Session（含 JWT Token）
  ↓
TodoApp 讀取 todos（帶著 JWT，Supabase 驗證 auth.uid()）
  ↓
RLS 生效：只回傳 user_id = auth.uid() 的 todos
```

---

## 🗃️ Supabase CRUD 對應說明

| 功能 | Supabase 語法 | 對應 RLS |
|---|---|---|
| 讀取 todos | `.from('todos').select('*').eq('user_id', user.id).order('created_at', { ascending: true })` | SELECT policy |
| 新增 todo | `.from('todos').insert({ title, is_complete: false, user_id: user.id })` | INSERT policy |
| 切換完成 | `.from('todos').update({ is_complete: !current }).eq('id', id)` | UPDATE policy |
| 刪除 todo | `.from('todos').delete().eq('id', id)` | DELETE policy |

---

## ✅ 驗收清單

完成部署後，請逐項確認：

- [ ] 開啟網站，看到登入 / 註冊表單（未登入狀態）
- [ ] 用 Email + Password 完成註冊
- [ ] 用同一組帳密成功登入
- [ ] 登入後看到 ToDo App，顯示使用者 Email
- [ ] 新增幾筆 todo，確認出現在列表
- [ ] 切換某筆 todo 的完成狀態（勾選 / 取消）
- [ ] 刪除某筆 todo
- [ ] 重新整理頁面，todos 仍然存在（代表有儲存到 Supabase）
- [ ] 登出，回到登入表單
- [ ] 用另一個帳號登入，看不到第一個帳號的 todos
- [ ] 在 Supabase Dashboard → Table Editor → todos 確認資料有存進去

---

## 🔮 第二階段預告

第二階段將加入：
- **群組（Groups）功能**：建立多個 Todo 群組
- **群組 RLS**：成員才能看到群組的 todos
- **邀請機制**：邀請其他使用者加入群組
- 資料表：`groups`、`group_members`
- 欄位：`todos.group_id`（第一階段刻意不加，第二階段才加）
