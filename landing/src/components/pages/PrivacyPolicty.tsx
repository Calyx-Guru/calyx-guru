import Link from "next/link";
import {
  LegalBullet,
  LegalBulletList,
  LegalDocumentLayout,
  LegalExternalLink,
  LegalParagraph,
  LegalRelatedLinks,
  LegalSection,
} from "@/components/legal/LegalDocumentLayout";
import { CONTACT_EMAIL } from "@/config/constants";

const GAME_ANALYTICS_PRIVACY_URL = "https://gameanalytics.com/privacy";
const SUPABASE_PRIVACY_URL = "https://supabase.com/privacy";
const GOOGLE_PRIVACY_URL = "https://policies.google.com/privacy";
const DEVELOPER_PAGE_URL: string | null = null;

export default function PrivacyPolicy() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      breadcrumbLabel="Privacy Policy"
      lastUpdated="June 20, 2026"
      lead="How Calyx Guru collects, uses, and protects your information."
      sidebar={<LegalRelatedLinks />}
    >
      <LegalParagraph>
        This Privacy Policy describes how Calyx Guru (“we”, “our”, or “us”), as
        an individual developer, collects, uses and shares information when you
        use the Calyx Guru mobile application (the “APP”) available on the
        Google Play Store.
      </LegalParagraph>

      <LegalParagraph>
        Calyx Guru is an entertainment application designed to provide fun
        fortune-telling, mascot interactions and digital elemental animations.
        By installing and using this APP, you agree to the collection and use of
        information in accordance with this policy.
      </LegalParagraph>

      <LegalSection title="Information Collection and Use">
        <LegalParagraph>
          Because Calyx Guru is designed primarily for entertainment, we
          prioritize user privacy. You can play as a guest without creating an
          account. Optional sign-in methods (Google Play sign-in or email and
          password) let you back up game progress to our cloud storage.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Information You Provide Directly">
        <LegalBulletList>
          <LegalBullet>
            <strong>Account sign-in (optional)</strong> — If you choose Google
            Play sign-in, we receive a Google account identifier to create your
            in-app user ID. If you choose email and password sign-in, your email
            address and credentials are processed by our authentication provider
            (Supabase) to verify your account. We do not ask for your real name
            or phone number to use the core features of the APP.
          </LegalBullet>
          <LegalBullet>
            <strong>Game preferences</strong> — When you choose an elemental
            companion, we store your selected element and related game progress
            (for example pet power, fortune-reading history and unlocks). If
            you enter a date of birth to help choose an element, that input is
            used on your device to derive the element; we store the element
            choice, not your date of birth, in your saved game data.
          </LegalBullet>
          <LegalBullet>
            <strong>Guest play</strong> — If you play as a guest, your progress
            is tied to a device-based identifier and stored locally on your
            device. Guest data is not uploaded to our cloud storage.
          </LegalBullet>
        </LegalBulletList>
      </LegalSection>

      <LegalSection title="Information Collected Automatically">
        <LegalParagraph>
          When you use the APP, certain information may be collected
          automatically by us or by third-party SDKs:
        </LegalParagraph>
        <LegalBulletList>
          <LegalBullet>
            <strong>Device information:</strong> Operating system version, device
            model, language settings, and installation or device identifiers
            used for guest play and analytics.
          </LegalBullet>
          <LegalBullet>
            <strong>Usage data:</strong> Screens viewed, session information,
            and interaction events sent to our analytics provider to understand
            how the APP is used and to improve it.
          </LegalBullet>
          <LegalBullet>
            <strong>Purchase data:</strong> If you make in-app purchases through
            Google Play, Google processes the transaction. We receive purchase
            status needed to unlock paid features; we do not receive your full
            payment card details.
          </LegalBullet>
        </LegalBulletList>
      </LegalSection>

      <LegalSection title="Third-Party Services">
        <LegalParagraph>
          The APP uses the following third-party services. Each may collect
          information as described in its own privacy policy:
        </LegalParagraph>
        <LegalBulletList>
          <LegalBullet>
            <strong>Supabase</strong> — Authentication (email and password
            sign-in) and cloud storage for signed-in users’ game data (profile
            and progress JSON files). Privacy policy:{" "}
            <LegalExternalLink href={SUPABASE_PRIVACY_URL}>
              supabase.com/privacy
            </LegalExternalLink>
          </LegalBullet>
          <LegalBullet>
            <strong>GameAnalytics</strong> — Analytics and product improvement
            (device and usage events, session data). Privacy policy:{" "}
            <LegalExternalLink href={GAME_ANALYTICS_PRIVACY_URL}>
              gameanalytics.com/privacy
            </LegalExternalLink>
          </LegalBullet>
          <LegalBullet>
            <strong>Google Play Services and Google Sign-In</strong> — App
            delivery, updates, Google Play sign-in on Android, and in-app
            billing when you purchase through Google Play. Privacy policy:{" "}
            <LegalExternalLink href={GOOGLE_PRIVACY_URL}>
              policies.google.com/privacy
            </LegalExternalLink>
          </LegalBullet>
        </LegalBulletList>
        <LegalParagraph>
          Calyx Guru does not display third-party advertisements and does not
          use advertising SDKs such as Google AdMob.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Data Storage and Security">
        <LegalBulletList>
          <LegalBullet>
            <strong>Local storage</strong> — Preferences, session tokens, and
            game data are stored on your device using secure storage where
            available (for example expo-secure-store on mobile).
          </LegalBullet>
          <LegalBullet>
            <strong>Cloud backup</strong> — If you sign in with Google Play or
            email and password, your profile and game state may be synced to
            Supabase Storage so you can restore progress on another device
            signed into the same account.
          </LegalBullet>
          <LegalBullet>
            <strong>Encryption in transit</strong> — Data sent to Supabase,
            GameAnalytics, and Google services is transmitted over encrypted
            connections (HTTPS/TLS).
          </LegalBullet>
          <LegalBullet>
            <strong>Data security</strong> — We take reasonable measures to
            protect information, but no method of transmission or electronic
            storage is completely secure.
          </LegalBullet>
        </LegalBulletList>
      </LegalSection>

      <LegalSection title="Your Choices and Account Deletion">
        <LegalParagraph>
          You can play without signing in, sign out from Settings, or delete
          your account and associated cloud data using “Delete account and data”
          in Settings. Deleting your account removes your saved profile and game
          state from our Supabase Storage for your user ID. Local data on your
          device may remain until you uninstall the APP or clear app storage.
        </LegalParagraph>
        <LegalParagraph>
          For step-by-step instructions, see our{" "}
          <Link href="/delete-account" className="as_legal_email_link">
            delete account page
          </Link>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Children’s Privacy">
        <LegalParagraph>
          Calyx Guru is intended for a general audience as a casual
          entertainment APP. We do not knowingly collect personally identifiable
          information from children under the age of 13 (or under 16 in certain
          jurisdictions like the EU). If you are a parent or guardian and
          discover that your child has provided personal information via
          third-party services used in this APP, please contact us immediately
          so we can take necessary corrective actions.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Permissions Requested by the APP">
        <LegalParagraph>
          Depending on your use of the APP, Calyx Guru may request specific
          device permissions. You can revoke these permissions at any time
          through your Android System Settings:
        </LegalParagraph>
        <LegalBulletList>
          <LegalBullet>
            <strong>Network access</strong> — Required to sync saved game data,
            authenticate signed-in users, and send analytics events.
          </LegalBullet>
          <LegalBullet>
            <strong>Notifications (optional)</strong> — Used to schedule local
            reminders about the APP. Notification content is generated on your
            device; we do not upload push tokens to our servers for remote
            messaging.
          </LegalBullet>
          <LegalBullet>
            <strong>Storage/media</strong> — Required if you save screenshots or
            download content to your device.
          </LegalBullet>
        </LegalBulletList>
      </LegalSection>

      <LegalSection title="Changes to This Privacy Policy">
        <LegalParagraph>
          We may update our Privacy Policy from time to time. Any changes will
          be reflected by updating the “Last Updated” date at the top of this
          page. You are advised to review this Privacy Policy periodically for
          any updates.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Contact Us">
        <LegalParagraph>
          If you have any questions, suggestions, or concerns regarding our
          Privacy Policy while using Calyx Guru, please feel free to contact us
          directly:
        </LegalParagraph>
        <LegalBulletList>
          <LegalBullet>
            By email:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="as_legal_email_link"
            >
              {CONTACT_EMAIL}
            </a>
          </LegalBullet>
          <LegalBullet>
            Developer Page:{" "}
            {DEVELOPER_PAGE_URL ? (
              <LegalExternalLink href={DEVELOPER_PAGE_URL}>
                {DEVELOPER_PAGE_URL}
              </LegalExternalLink>
            ) : (
              "Coming soon"
            )}
          </LegalBullet>
        </LegalBulletList>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
