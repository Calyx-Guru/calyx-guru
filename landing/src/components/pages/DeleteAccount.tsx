import Image from "next/image";
import Link from "next/link";
import { mailIcon, serviceImg1, serviceImg2 } from "@/assets";
import { SunGlyph } from "@/components/home/SunGlyph";
import { TitleLine } from "@/components/home/TitleLine";

const SUPPORT_EMAIL = "support@calyx.guru";

function StepCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="as_legal_step">
      <span className="as_legal_step__number">{number}</span>
      <div>
        <h3 className="as_legal_step__title">{title}</h3>
        <div className="as_legal_step__body">{children}</div>
      </div>
    </div>
  );
}

export default function DeleteAccount() {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Account deletion request")}`;

  return (
    <>
      <section className="as_breadcrum_wrapper text-center">
        <div className="container">
          <h1>Delete your account</h1>
          <ul className="breadcrumb">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>Delete account</li>
          </ul>
          <div className="as_legal_hero__ornament">
            <TitleLine />
          </div>
          <p className="as_legal_hero__lead as_text_color">
            Remove your Calyx Guru profile, reset game progression, or request
            deletion by email. Last updated: June 20, 2026.
          </p>
        </div>
      </section>

      <section className="as_legal_content as_section_light">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="as_legal_panel">
                <div className="as_legal_panel__heading">
                  <SunGlyph />
                  <h2 className="as_heading">In the Calyx Guru app</h2>
                </div>
                <p className="as_text_color">
                  You can delete your data directly from the app. This is the
                  fastest way to remove your account or reset your progression.
                </p>

                <div className="as_legal_steps">
                  <StepCard number="01" title="Open Settings">
                    <p className="as_text_color">
                      From the main menu, open <strong>Settings</strong>.
                    </p>
                  </StepCard>
                  <StepCard number="02" title="Delete account and data">
                    <p className="as_text_color">
                      Under <strong>Account</strong>, tap{" "}
                      <strong>Delete account and data</strong>.
                    </p>
                  </StepCard>
                  <StepCard number="03" title="Choose what to remove">
                    <ul className="as_legal_list">
                      <li>
                        <strong>Delete my progression only</strong> — resets
                        your game progress on this device and our servers. Your
                        profile (such as your chosen element) is kept.
                      </li>
                      <li>
                        <strong>Delete my account</strong> — permanently removes
                        your profile and all saved game data, then signs you out.
                      </li>
                    </ul>
                  </StepCard>
                </div>

                <p className="as_legal_note">
                  These actions cannot be undone.
                </p>
              </div>

              <div className="as_legal_panel">
                <div className="as_legal_panel__heading">
                  <SunGlyph />
                  <h2 className="as_heading">Request deletion by email</h2>
                </div>
                <p className="as_text_color">
                  If you cannot access the app or need assistance, email us with
                  the subject line <strong>Account deletion request</strong>.
                </p>
                <p className="as_text_color">Please include:</p>
                <ul className="as_legal_list as_legal_list--check">
                  <li>
                    <strong>Profile ID</strong> — your unique Calyx Guru profile
                    identifier
                  </li>
                  <li>
                    <strong>Email address</strong> — linked to your account, if
                    any
                  </li>
                  <li>
                    <strong>Google Play user ID</strong> — if you signed in with
                    Google Play
                  </li>
                  <li>
                    <strong>Supabase user ID</strong> — if you signed in with
                    email and password
                  </li>
                  <li>
                    Whether you want a <strong>full account deletion</strong> or
                    a <strong>progression-only reset</strong>
                  </li>
                </ul>
                <p className="as_text_color">
                  We will verify your request and process it as soon as
                  possible, usually within 30 days.
                </p>
              </div>

              <div className="as_legal_panel">
                <div className="as_legal_panel__heading">
                  <SunGlyph />
                  <h2 className="as_heading">Where to find your account details</h2>
                </div>
                <p className="as_text_color">
                  Open the Calyx Guru app and go to{" "}
                  <strong>Settings → Account information</strong>. That screen
                  lists the identifiers you should copy into your support email.
                </p>
                <p className="as_text_color">
                  Google Play sign-in: note your Google Play user ID. Email
                  sign-in: note your Supabase user ID and email. Guest players
                  should send their Profile ID (it begins with{" "}
                  <code className="as_legal_code">guest_</code>).
                </p>
              </div>
            </div>

            <div className="col-lg-4">
              <aside className="as_legal_sidebar">
                <div className="as_legal_sidebar__image">
                  <Image
                    src={serviceImg1}
                    alt=""
                    className="as_legal_sidebar__img"
                  />
                </div>

                <div className="as_legal_contact_card">
                  <Image src={mailIcon} alt="" width={28} height={28} />
                  <h3>Email support</h3>
                  <p className="as_text_color">
                    Send your deletion request with account details from the
                    app.
                  </p>
                  <a href={mailto} className="as_btn as_legal_contact_btn">
                    {SUPPORT_EMAIL}
                  </a>
                </div>

                <div className="as_legal_sidebar__image as_legal_sidebar__image--secondary">
                  <Image
                    src={serviceImg2}
                    alt=""
                    className="as_legal_sidebar__img"
                  />
                </div>

                <div className="as_legal_sidebar__links">
                  <p className="as_text_color">Related</p>
                  <ul>
                    <li>
                      <a href="https://calyx.guru/privacy-policy">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <Link href="/">Back to home</Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="as_legal_cta as_section_dark text-center">
        <div className="container">
          <TitleLine />
          <h2 className="as_heading as_legal_cta__title">
            Need help deleting your data?
          </h2>
          <p className="as_text_color as_legal_cta__text">
            Our team can process account and progression deletion requests when
            you cannot use the in-app options.
          </p>
          <a href={mailto} className="as_btn as_legal_cta__btn">
            Email {SUPPORT_EMAIL}
          </a>
        </div>
      </section>
    </>
  );
}
