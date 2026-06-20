import { type Locale, locales, routing } from "@/i18n/routing";

export const SITE_NAME = "Calyx Guru";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://calyx.guru";
export const SUPPORT_EMAIL = "support@calyx.guru";
export const CONTACT_EMAIL = "calyx.guru@gmail.com";

/** Open Graph locale tags (language_TERRITORY). */
export const openGraphLocale: Record<Locale, string> = {
  en: "en_US",
  ko: "ko_KR",
  ja: "ja_JP",
  "cn-ZH": "zh_CN",
  "cn-TW": "zh_TW",
  vi: "vi_VN",
};

export function localePath(locale: Locale, pathname = ""): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === routing.defaultLocale) {
    return path === "/" ? "/" : path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function absoluteUrl(locale: Locale, pathname = ""): string {
  return `${SITE_URL}${localePath(locale, pathname)}`;
}

export function languageAlternates(pathname = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(locale, pathname);
  }
  languages["x-default"] = absoluteUrl(routing.defaultLocale, pathname);
  return languages;
}

type JsonLdInput = {
  locale: Locale;
  title: string;
  description: string;
  pathname?: string;
};

export function buildSiteJsonLd({
  locale,
  title,
  description,
  pathname = "",
}: JsonLdInput) {
  const pageUrl = absoluteUrl(locale, pathname);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description,
        inLanguage: locales.map((l) => openGraphLocale[l]),
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: SUPPORT_EMAIL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icon.png`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: openGraphLocale[locale],
      },
      {
        "@type": "MobileApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        operatingSystem: "Android",
        applicationCategory: "GameApplication",
        description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}
