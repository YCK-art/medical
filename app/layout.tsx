import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Noto Serif 폰트 최적화
const notoSerif = localFont({
  src: '../public/fonts/NotoSerif-VariableFont_wdth,wght.ttf',
  variable: '--font-noto-serif',
  display: 'block',
  preload: true,
});

// Pretendard 폰트 최적화
const pretendard = localFont({
  src: '../public/fonts/Pretendard-Regular.otf',
  variable: '--font-pretendard',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Ruleout",
  description: "Empower veterinarians to make faster, smarter decisions",
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
      <body className={`antialiased ${pretendard.variable} ${notoSerif.variable}`}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
