import { buildSiteJsonLd } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = {
  locale: Locale;
  title: string;
  description: string;
  pathname?: string;
};

export function SiteJsonLd({ locale, title, description, pathname }: Props) {
  const jsonLd = buildSiteJsonLd({ locale, title, description, pathname });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
