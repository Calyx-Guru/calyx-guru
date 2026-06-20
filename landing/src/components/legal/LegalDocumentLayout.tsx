import Link from "next/link";
import { TitleLine } from "@/components/home/TitleLine";
import type { ReactNode } from "react";

type LegalDocumentLayoutProps = {
  title: string;
  breadcrumbLabel: string;
  lastUpdated: string;
  lead: string;
  children: ReactNode;
  sidebar?: ReactNode;
};

export function LegalDocumentLayout({
  title,
  breadcrumbLabel,
  lastUpdated,
  lead,
  children,
  sidebar,
}: LegalDocumentLayoutProps) {
  return (
    <>
      <section className="as_breadcrum_wrapper text-center">
        <div className="container">
          <h1>{title}</h1>
          <ul className="breadcrumb">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>{breadcrumbLabel}</li>
          </ul>
          <div className="as_legal_hero__ornament">
            <TitleLine />
          </div>
          <p className="as_legal_hero__lead as_text_color">
            {lead} Last updated: {lastUpdated}.
          </p>
        </div>
      </section>

      <section className="as_legal_content as_section_light">
        <div className="container">
          <div className="row">
            <div className={sidebar ? "col-lg-8" : "col-lg-10 offset-lg-1"}>
              <div className="as_legal_panel as_legal_doc">{children}</div>
            </div>
            {sidebar ? <div className="col-lg-4">{sidebar}</div> : null}
          </div>
        </div>
      </section>
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="as_legal_doc__section">
      {title ? <h2 className="as_legal_doc__section-title">{title}</h2> : null}
      {children}
    </section>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="as_legal_doc__paragraph as_text_color">{children}</p>;
}

export function LegalBulletList({ children }: { children: ReactNode }) {
  return <ul className="as_legal_list as_legal_list--check">{children}</ul>;
}

export function LegalBullet({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function LegalEmphasis({ children }: { children: ReactNode }) {
  return <p className="as_legal_doc__emphasis">{children}</p>;
}

export function LegalExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="as_legal_email_link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export function LegalRelatedLinks() {
  return (
    <aside className="as_legal_sidebar">
      <div className="as_legal_sidebar__links as_legal_sidebar__links--panel">
        <p className="as_legal_doc__sidebar-title">Related</p>
        <ul>
          <li>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/terms-of-service">Terms of Service</Link>
          </li>
          <li>
            <Link href="/delete-account">Delete account</Link>
          </li>
          <li>
            <Link href="/">Back to home</Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
