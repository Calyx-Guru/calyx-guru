import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { type Locale, htmlLang, routing } from "@/i18n/routing";
import {
  SITE_URL,
  absoluteUrl,
  languageAlternates,
  openGraphLocale,
} from "@/lib/site";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Philosopher, PT_Sans } from "next/font/google";
import { notFound } from "next/navigation";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteName = t("siteName");
  const title = t("title");
  const description = t("description");
  const ogTitle = t("ogTitle");
  const ogDescription = t("ogDescription");
  const keywords = t("keywords");
  const canonical = absoluteUrl(locale as Locale);
  const ogAlternateLocales = routing.locales
    .filter((l) => l !== locale)
    .map((l) => openGraphLocale[l as Locale]);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: keywords.split(",").map((word) => word.trim()),
    applicationName: siteName,
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    category: "entertainment",
    alternates: {
      canonical,
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale[locale as Locale],
      alternateLocale: ogAlternateLocales,
      url: canonical,
      siteName,
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: "/icon.png",
          width: 512,
          height: 512,
          alt: siteName,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description: ogDescription,
      images: ["/icon.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/icon.png",
      apple: "/icon.png",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");

  return (
    <html
      lang={htmlLang[locale as Locale]}
      className={`${ptSans.variable} ${philosopher.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteJsonLd
          locale={locale as Locale}
          title={title}
          description={description}
        />
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
