import TermsOfService from "@/components/pages/TermsOfService";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Calyx Guru — rules and conditions for using the mobile app.",
};

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <TermsOfService />;
}
