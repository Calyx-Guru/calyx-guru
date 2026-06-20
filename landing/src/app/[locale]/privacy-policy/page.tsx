import PrivacyPolicy from "@/components/pages/PrivacyPolicty";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Calyx Guru — how we collect, use, and protect your information.",
};

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <PrivacyPolicy />;
}
