import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Ruleout",
  description: "한국 의학회 진료지침서 AI 검색 플랫폼",
  icons: {
    icon: [
      { url: '/image/logo_candidate1 복사본.png', sizes: '32x32', type: 'image/png' },
      { url: '/image/logo_candidate1 복사본.png', sizes: '64x64', type: 'image/png' },
      { url: '/image/logo_candidate1 복사본.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: '/image/logo_candidate1 복사본.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
