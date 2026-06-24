# 📦 Database 初始化 SQL

> 請在 Supabase 後台 → **SQL Editor** 頁面貼上以下 SQL 執行。
> 建議分區塊逐步執行，方便確認每一步是否成功。

---

## Step 1：建立 todos 資料表

```sql
CREATE TABLE todos (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  is_complete BOOLEAN     NOT NULL DEFAULT FALSE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 欄位說明

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | UUID | 主鍵，自動產生唯一 ID |
| `title` | TEXT | 任務文字內容 |
| `is_complete` | BOOLEAN | 是否完成，預設 `false` |
| `user_id` | UUID | 關聯 `auth.users`，代表這筆 todo 屬於哪位使用者 |
| `created_at` | TIMESTAMPTZ | 建立時間，自動帶入 |

> `user_id` 使用 `REFERENCES auth.users(id) ON DELETE CASCADE`，
> 當使用者帳號被刪除時，該使用者的所有 todos 也會一起刪除，避免孤兒資料。

---

## Step 2：建立索引（加速查詢）

```sql
-- 讓「依 user_id 查詢 todos」的速度更快
CREATE INDEX todos_user_id_idx ON todos(user_id);
```

---

## Step 3：開啟 Row Level Security（RLS）

```sql
-- 開啟 RLS，讓資料列層級的存取控制生效
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
```

> **為什麼需要 RLS？**
>
> Supabase 在前端使用的 `anon key` 是公開的，任何人都可以拿到。
> 如果不開啟 RLS，任何人都可以直接透過 API 讀取或修改所有使用者的 todos。
> 開啟 RLS 後，Supabase 會在每一次資料庫操作時檢查「這個使用者有沒有權限」，
> 確保即使 anon key 外洩，資料也不會被非授權的人存取。

---

## Step 4：建立 RLS Policies

### 4-1 SELECT：只能讀取自己的 todos

```sql
CREATE POLICY "Users can select own todos"
  ON todos
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 4-2 INSERT：只能新增屬於自己的 todos

```sql
CREATE POLICY "Users can insert own todos"
  ON todos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4-3 UPDATE：只能更新自己的 todos

```sql
CREATE POLICY "Users can update own todos"
  ON todos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 4-4 DELETE：只能刪除自己的 todos

```sql
CREATE POLICY "Users can delete own todos"
  ON todos
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Step 5：確認設定是否正確

```sql
-- 確認資料表存在
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'todos';

-- 確認欄位結構
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos';

-- 確認 RLS 是否開啟
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'todos';

-- 確認 RLS Policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'todos';
```

---

## Policy 邏輯說明

| Policy | 動作 | 條件說明 |
|---|---|---|
| SELECT | 讀取 | `auth.uid()` 必須等於該列的 `user_id` |
| INSERT | 新增 | 新增的資料，`user_id` 必須等於目前登入的 `auth.uid()` |
| UPDATE | 更新 | 只能更新 `user_id` 等於 `auth.uid()` 的列 |
| DELETE | 刪除 | 只能刪除 `user_id` 等於 `auth.uid()` 的列 |

> `auth.uid()` 是 Supabase 提供的內建函式，
> 它會回傳「目前發出這個請求的使用者的 UUID」，
> 也就是 JWT Token 裡面解析出來的使用者 ID。

---

## 重置（如果需要重來）

```sql
-- 刪除所有 policies
DROP POLICY IF EXISTS "Users can select own todos" ON todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;

-- 刪除資料表（連帶刪除索引）
DROP TABLE IF EXISTS todos;
```
