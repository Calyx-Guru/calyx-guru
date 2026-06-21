import {
  mailIcon,
  screenshotDeleteAccount,
  screenshotDeleteProgression,
  screenshotDeleteSelection,
  screenshotSettings,
} from "@/assets";
import { SunGlyph } from "@/components/home/SunGlyph";
import { DELETE_ACCOUNT_EMAIL } from "@/config/constants";
import Image, { type StaticImageData } from "next/image";

const DELETE_FLOW_SCREENSHOTS = [
  {
    src: screenshotSettings,
    alt: "Settings screen showing the Delete account and data option",
    step: "01",
    caption: "Open Settings and tap Delete account and data under Account.",
  },
  {
    src: screenshotDeleteSelection,
    alt: "Dialog to choose between deleting your account or progression only",
    step: "02",
    caption: "Choose whether to delete your full account or progression only.",
  },
  {
    src: screenshotDeleteAccount,
    alt: "Final confirmation dialog for deleting your account",
    step: "03",
    caption: "Confirm Delete my account to permanently remove your profile.",
  },
  {
    src: screenshotDeleteProgression,
    alt: "Final confirmation dialog for deleting progression only",
    step: "04",
    caption:
      "Or confirm Delete my progression only to reset game progress while keeping your profile.",
  },
] as const;

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

function ScreenshotFrame({
  src,
  alt,
  step,
  caption,
}: {
  src: StaticImageData;
  alt: string;
  step: string;
  caption: string;
}) {
  return (
    <figure className="as_legal_screenshot">
      <div className="as_legal_screenshot__frame">
        <div className="as_legal_screenshot__bezel" aria-hidden="true" />
        <div className="as_legal_screenshot__screen">
          <Image
            src={src}
            alt={alt}
            width={270}
            height={600}
            className="as_legal_screenshot__img"
            sizes="(min-width: 992px) 240px, (min-width: 576px) 42vw, 78vw"
          />
        </div>
      </div>
      <figcaption className="as_legal_screenshot__caption">
        <span className="as_legal_screenshot__step">{step}</span>
        <span className="as_legal_screenshot__caption-text">{caption}</span>
      </figcaption>
    </figure>
  );
}

export default function DeleteAccount() {
  const mailto = `mailto:${DELETE_ACCOUNT_EMAIL}?subject=${encodeURIComponent("Account deletion request")}`;

  return (
    <>
      <section className="as_breadcrum_wrapper text-center">
        <div className="container">
          <h1>Delete your account</h1>
        </div>
      </section>

      <section className="as_legal_content as_section_light">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="as_legal_panel">
                <div className="as_legal_panel__heading">
                  <SunGlyph />
                  <h2 className="as_heading">In the App</h2>
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
                        your profile and all saved game data, then signs you
                        out.
                      </li>
                    </ul>
                  </StepCard>
                </div>

                <div className="as_legal_screenshots">
                  {DELETE_FLOW_SCREENSHOTS.map((screenshot, index) => (
                    <div
                      key={screenshot.step}
                      className="as_legal_screenshots__item"
                    >
                      {index > 0 ? (
                        <span
                          className="as_legal_screenshots__arrow"
                          aria-hidden="true"
                        />
                      ) : null}
                      <ScreenshotFrame {...screenshot} />
                    </div>
                  ))}
                </div>

                <p className="as_legal_note">These actions cannot be undone.</p>
              </div>

              <div className="as_legal_panel as_legal_panel--email">
                <div className="as_legal_panel__heading">
                  <Image src={mailIcon} alt="" width={34} height={34} />
                  <h2 className="as_heading">Request deletion by email</h2>
                </div>

                <div className="as_legal_email_intro">
                  <p className="as_text_color">
                    If you cannot access the app or need assistance, send a
                    message to{" "}
                    <a href={mailto} className="as_legal_email_link">
                      {DELETE_ACCOUNT_EMAIL}
                    </a>{" "}
                    with the subject line{" "}
                    <strong>Account deletion request</strong>.
                  </p>
                </div>

                <h3 className="as_legal_subheading">What to include in your email</h3>
                <p className="as_text_color">
                  To help us verify and process your request, please include the
                  following details in your message:
                </p>
                <ul className="as_legal_list">
                  <li>
                    <strong>Google Play Gamer Name</strong>{" "}
                    <span className="as_legal_required">(required)</span>
                    <br />
                    <span className="as_text_color">
                      For example, <em>DragonSlayer99</em>. You can find this in
                      the Google Play app (your Play Games profile / gamer name).
                    </span>
                  </li>
                  <li>
                    <strong>
                      Verification question 1: &ldquo;When was your last time
                      playing?&rdquo;
                    </strong>{" "}
                    <span className="as_legal_required">(required)</span>
                    <br />
                    <span className="as_text_color">
                      Answer based on your own memory (for example, a date or
                      approximate time frame).
                    </span>
                  </li>
                  <li>
                    <strong>
                      Verification question 2: &ldquo;Provide the Google Play
                      Order Number (GPA.xxxx-xxxx&hellip;) from any in-app
                      purchase receipt found in your email.&rdquo;
                    </strong>{" "}
                    <span className="as_legal_optional">(optional)</span>
                    <br />
                    <span className="as_text_color">
                      Only needed if you have made in-app purchases. Check your
                      email for a Google Play receipt and copy the order number
                      starting with <em>GPA.</em>
                    </span>
                  </li>
                  <li>
                    <strong>
                      Verification question 3: &ldquo;Your Google Play unique
                      ID&rdquo;
                    </strong>{" "}
                    <span className="as_legal_optional">(optional)</span>
                    <br />
                    <span className="as_text_color">
                      Open our app, go to <strong>Settings</strong> &rarr;{" "}
                      <strong>Account Information</strong>, and copy your Google
                      Play user ID shown there.
                    </span>
                  </li>
                  <li>
                    <strong>Contact email</strong>{" "}
                    <span className="as_legal_optional">(optional)</span>
                    <br />
                    <span className="as_text_color">
                      An email address where we can confirm your data has been
                      deleted. We only use this to reply; it does not need to
                      match an account. Include this only if your contact email
                      is different from the address you send the request from.
                    </span>
                  </li>
                </ul>

                <p className="as_legal_email_timeline as_text_color">
                  We will verify your request and process it as soon as
                  possible, usually within 30 days as complication.
                </p>

                <div className="as_legal_email_cta">
                  <div className="as_legal_email_cta__info">
                    <Image src={mailIcon} alt="" width={32} height={32} />
                    <div>
                      <p className="as_legal_email_cta__label">
                        Send your deletion request
                      </p>
                      <p className="as_legal_email_cta__subject as_text_color">
                        Subject: Account deletion request
                      </p>
                    </div>
                  </div>
                  <a href={mailto} className="as_legal_email_cta__btn">
                    <span className="as_legal_email_cta__btn-label">
                      Open email app
                    </span>
                    <span className="as_legal_email_cta__btn-email">
                      {DELETE_ACCOUNT_EMAIL}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
