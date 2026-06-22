import "./globals.css";

export const metadata = {
  title: "ToDo App | 學習用待辦清單",
  description: "給初學者練習 component、state 與事件處理的 ToDo App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
