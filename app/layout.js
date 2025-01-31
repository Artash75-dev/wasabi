import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/shared/header";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/shared/footer";
import ScreenSizeGuard from "@/components/shared/ScreenSizeGuard";
import Script from "next/script";
import { ConvexClientProvider } from "../providers/ConvexClientProvider";
import { SocketProvider } from "@/providers/SocketContext";
import { SocketContextProvider } from "@/providers/SocketDeliverContext";
import { Toaster as ToasterSunner } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "/fonts/GeistVF.woff", // Adjusted path for public folder
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "/fonts/GeistMonoVF.woff", // Adjusted path for public folder
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Wassabi Sushi",
  description:
    "Wassabi Sushi — это современный и стильный суши-ресторан, предлагающий широкий выбор традиционных и современных блюд японской кухни. Наши повара используют только самые свежие ингредиенты, чтобы создавать каждую ролл, сашими и нигири с точностью и вниманием. Независимо от того, являетесь ли вы любителем суши или только открываете для себя японскую кухню, Wassabi Sushi предложит вам восхитительный гастрономический опыт с блюдами на любой вкус. Приходите к нам, чтобы насладиться яркими вкусами, уютной атмосферой и высоким качеством обслуживания. Также можно заказать онлайн с доставкой свежих суши прямо к вам домой.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="icon" href="/logo.jpg" sizes="any" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative flex flex-col`}
      >
        <Script
          src={`https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YMAPS_API_KEY}&lang=en_US`}
          strategy="beforeInteractive"
        />
        <ConvexClientProvider>
          <SocketProvider>
            <SocketContextProvider>
              <ScreenSizeGuard>
                <div className="screen-block" />
                <Header />
                {children}
                <Footer />
              </ScreenSizeGuard>
            </SocketContextProvider>
          </SocketProvider>
        </ConvexClientProvider>
        <Toaster position="top-center" />
        <ToasterSunner richColors position="top-center" />
      </body>
    </html>
  );
}
