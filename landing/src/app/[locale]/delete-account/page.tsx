import DeleteAccount from "@/components/pages/DeleteAccount";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Delete account",
  description:
    "How to delete your Calyx Guru account or game progression in the app or by email.",
};

export default async function DeleteAccountPage({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <DeleteAccount />;
}
