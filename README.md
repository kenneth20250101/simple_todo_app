# 📝 ToDo App（Next.js 基礎版）

給零基礎學生練習 **component、state、事件處理、部署流程** 的第一階段 ToDo App。
不使用資料庫、不需要會員登入，所有資料只存在瀏覽器記憶體中（重新整理頁面會清空）。

---

## 📁 檔案結構與用途

```
todo-app/
├── app/
│   ├── layout.js       # 根版面，定義 <html>/<body> 結構，引入全域 CSS
│   ├── page.js          # 首頁，渲染 TodoApp 元件
│   └── globals.css      # 全域樣式：配色、版面、RWD
├── components/
│   ├── TodoApp.js       # 主元件：管理 todos 與 inputValue 的 state，處理新增/切換/刪除邏輯
│   └── TodoItem.js      # 子元件：顯示單一任務（checkbox、文字、刪除按鈕）
├── package.json         # 專案設定與依賴套件
├── next.config.mjs      # Next.js 設定檔
├── jsconfig.json        # 設定 @ 路徑別名，方便 import
└── .gitignore            # Git 忽略清單
```

### 各檔案重點說明

| 檔案 | 用途 |
|---|---|
| `app/layout.js` | 所有頁面共用的根版面（Root Layout），App Router 的必要檔案 |
| `app/page.js` | 對應網站首頁 `/`，只負責引入並渲染 `TodoApp` 元件 |
| `app/globals.css` | 整個網站的樣式，使用一般 CSS（非 Tailwind），白底 + 柔和藍 + 綠色配色 |
| `components/TodoApp.js` | 核心邏輯所在：用 `useState` 管理任務陣列與輸入框文字，包含新增、切換完成、刪除三個事件處理函式 |
| `components/TodoItem.js` | 純顯示用元件，透過 props 接收資料與事件函式（練習 props 傳遞的好範例） |

---

## 🧠 學生可以學到的概念

1. **Component（元件化）**：`TodoApp` 與 `TodoItem` 拆分，理解父子元件如何透過 props 溝通
2. **State（狀態管理）**：用 `useState` 管理「任務清單」與「輸入框內容」兩種狀態
3. **事件處理**：`onClick`、`onChange`、`onKeyDown` 的使用方式
4. **條件渲染**：任務清單為空時顯示空狀態文字
5. **陣列操作**：新增（展開運算子）、切換（map）、刪除（filter）
6. **CSS 基礎**：class 切換（`completed` 狀態）、RWD（手機版調整）

---

## 🚀 本機啟動方式

```bash
# 1. 安裝套件
npm install

# 2. 啟動開發伺服器
npm run dev

# 3. 瀏覽器開啟
http://localhost:3000
```

---

## ☁️ 部署到 Vercel

1. 將專案推上 GitHub（建立一個新的 repository，把這個資料夾的內容 push 上去）
2. 前往 [vercel.com](https://vercel.com)，使用 GitHub 帳號登入
3. 點選 **Add New → Project**，選擇剛剛的 GitHub repository
4. Vercel 會自動偵測為 Next.js 專案，框架設定保持預設即可
5. 點選 **Deploy**，等待約 1 分鐘完成部署
6. 部署完成後會得到一組網址（例如 `your-app.vercel.app`），即可分享給其他人瀏覽

> 提醒：因為這個版本沒有資料庫，重新整理頁面後任務會消失，這是正常現象。
> 之後的進階版本可以加入 `localStorage` 或串接資料庫來保存資料。

---

## 🔮 可以延伸練習的方向

- 加入 `localStorage`，讓任務在重新整理後還能保留
- 加入「編輯任務」功能
- 加入「篩選」功能（全部 / 未完成 / 已完成）
- 加入拖曳排序
- 串接資料庫（如 Supabase、Firebase）做成完整版
