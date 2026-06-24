import "./globals.css";

export const metadata = {
  title: "ToDo App | 第一階段進階版",
  description: "搭配 Supabase Auth 與 Database 的 ToDo App 教學專案",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
