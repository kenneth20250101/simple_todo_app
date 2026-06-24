import { createClient } from "@supabase/supabase-js";

// 從環境變數讀取 Supabase 連線設定
// NEXT_PUBLIC_ 前綴讓 Next.js 把這些變數暴露給瀏覽器端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 基本的環境變數檢查，開發時方便排錯
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "缺少 Supabase 環境變數。請建立 .env.local 並填入 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。"
  );
}

// 建立並匯出 Supabase client 實例
// 這個 client 負責所有與 Supabase 的溝通（Auth + Database）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
