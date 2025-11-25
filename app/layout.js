// app/layout.js
import './globals.css';

export const metadata = {
  title: '小红书爆款文案生成器',
  description: '一键生成小红书爆款文案的AI工具',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}