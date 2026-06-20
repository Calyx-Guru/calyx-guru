import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Philosopher, PT_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { htmlLang, routing } from "@/i18n/routing";
import "../globals.css";

const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pt-sans",
});

const philosopher = Philosopher({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-philosopher",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Astrology",
  description: "Astrology landing page",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={htmlLang[locale]}
      className={`${ptSans.variable} ${philosopher.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages}>
          <div className="as_main_wrapper">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
