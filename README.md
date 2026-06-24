# 📝 ToDo App — 第一階段進階版（Next.js + Supabase）

這是給初學者練習「會員系統 + 資料庫 CRUD + RLS 資料隔離」的教學專案。

---

## 📁 檔案結構與用途

```
todo-app-v2/
├── app/
│   ├── layout.js           # 根版面，定義 <html>/<body>，引入全域 CSS
│   ├── page.js             # 首頁：監聽 Auth 狀態，決定顯示登入表單或 TodoApp
│   └── globals.css         # 全域樣式（Auth 卡片、Todo 畫面、RWD）
│
├── components/
│   ├── AuthForm.js         # 登入 / 註冊表單，可切換兩種模式，處理錯誤訊息
│   ├── TodoApp.js          # 登入後主畫面：讀取、新增、切換、刪除 todos，含登出按鈕
│   └── TodoItem.js         # 單一 todo 顯示（checkbox + 文字 + 刪除按鈕）
│
├── lib/
│   └── supabase.js         # 建立 Supabase client，所有元件共用這個實例
│
├── docs/
│   ├── Database_init.md    # Supabase SQL：建表、開啟 RLS、設定 4 個 Policies
│   └── database_implement.md  # 完整實作說明：概念解釋、驗收清單、部署步驟
│
├── .env.example            # 環境變數範本（不含真實 Key，可以 push 到 GitHub）
├── .gitignore              # 排除 node_modules、.next、.env.local
├── jsconfig.json           # 設定 @ 路徑別名（讓 import 更簡潔）
├── next.config.mjs         # Next.js 設定檔
└── package.json            # 專案依賴：next、react、react-dom、@supabase/supabase-js
```

---

## 🚀 本機開發步驟

### 1. 安裝套件

```bash
npm install
```

### 2. 建立環境變數

複製 `.env.example` 並重新命名為 `.env.local`：

```bash
cp .env.example .env.local
```

填入你的 Supabase 連線資訊：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_public_key
```

> 去哪裡找這兩個值？
> Supabase 後台 → **Project Settings** → **API** → Project URL / anon public

### 3. 建立 Supabase 資料庫

前往 Supabase 後台 → **SQL Editor**，
把 `docs/Database_init.md` 裡的 SQL 全部貼上並執行。

### 4. 啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)

---

## ☁️ 部署到 Vercel

### Step 1：推上 GitHub

```bash
git init
git add .
git commit -m "init: todo app v2 with supabase"
git remote add origin https://github.com/你的帳號/todo-app-v2.git
git push -u origin main
```

### Step 2：在 Vercel 建立專案

1. 前往 [vercel.com](https://vercel.com) → **Add New → Project**
2. 選擇剛剛的 GitHub repository
3. Framework 會自動偵測為 **Next.js**，保持預設

### Step 3：設定 Environment Variables（重要！）

在 Vercel 的 **Settings → Environment Variables** 新增以下兩個變數：

| 變數名稱 | 說明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

Production、Preview、Development 三個環境都要勾選。

### Step 4：部署

點選 **Deploy**，等約 1 分鐘後即可取得部署網址。

> ⚠️ 若先部署再設環境變數，需要點選 **Redeploy** 才會生效。

---

## 🧠 核心概念說明

### 為什麼需要 `user_id`？

`user_id` 是每筆 todo 的「擁有者標記」。
沒有它，所有人的 todos 會混在一起，根本無法區分是誰的資料。

### 為什麼需要 RLS？

Supabase 的 `anon key` 是公開的（任何人都可以從程式碼看到）。
沒有 RLS，任何人拿到 key 就能讀取所有使用者的資料。
開啟 RLS 後，每個請求都必須通過 `auth.uid() = user_id` 的驗證，
即使 key 外洩，資料也不會被非授權的人存取。

### Supabase URL 和 Anon Key 要放在哪裡？

| 環境 | 放置位置 |
|---|---|
| 本機開發 | `.env.local`（不能上傳 GitHub） |
| Vercel 部署 | Vercel 後台 → Settings → Environment Variables |

---

## ✅ 第一階段驗收清單

- [ ] 開啟網站，看到登入 / 註冊表單
- [ ] 用 Email + Password 完成註冊
- [ ] 用同一組帳密成功登入
- [ ] 登入後看到 ToDo App（顯示使用者 Email）
- [ ] 新增幾筆 todo
- [ ] 切換 todo 完成狀態
- [ ] 刪除 todo
- [ ] 重新整理頁面，todos 仍然存在（Supabase 有保存）
- [ ] 登出，回到登入表單
- [ ] 換另一個帳號登入，看不到第一個帳號的 todos
- [ ] Vercel 部署後，以上功能全部正常
