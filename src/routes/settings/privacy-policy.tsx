import { DEVELOPER_PAGE_URL } from "@/constants/links";
import type { ReactNode } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

const GAME_ANALYTICS_PRIVACY_URL =
  "https://gameanalytics.com/privacy";
const SUPABASE_PRIVACY_URL = "https://supabase.com/privacy";
const GOOGLE_PRIVACY_URL = "https://policies.google.com/privacy";

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <Text
      style={styles.link}
      onPress={() => {
        void Linking.openURL(href);
      }}
      accessibilityRole="link"
      accessibilityLabel={children}
    >
      {children}
    </Text>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: string }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletMarker}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function RoutePrivacyPolicy() {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Privacy Policy for Calyx Guru</Text>
      <Text style={styles.updated}>Last updated: June 20, 2026</Text>

      <Paragraph>
        This Privacy Policy describes how Calyx Guru (“we”, “our”, or “us”), as
        an individual developer, collects, uses and shares information when you
        use the Calyx Guru mobile application (the “APP”) available on the
        Google Play Store.
      </Paragraph>

      <Paragraph>
        Calyx Guru is an entertainment application designed to provide fun
        fortune-telling, mascot interactions and digital elemental animations.
        By installing and using this APP, you agree to the collection and use of
        information in accordance with this policy.
      </Paragraph>

      <Section title="Information Collection and Use">
        <Paragraph>
          Because Calyx Guru is designed primarily for entertainment, we
          prioritize user privacy. You can play as a guest without creating an
          account. Optional sign-in methods (Google Play sign-in or email and
          password) let you back up game progress to our cloud storage.
        </Paragraph>
      </Section>

      <Section title="Information You Provide Directly">
        <Bullet>
          Account sign-in (optional) — If you choose Google Play sign-in, we
          receive a Google account identifier to create your in-app user ID. If
          you choose email and password sign-in, your email address and
          credentials are processed by our authentication provider (Supabase) to
          verify your account. We do not ask for your real name or phone number
          to use the core features of the APP.
        </Bullet>
        <Bullet>
          Game preferences — When you choose an elemental companion, we store
          your selected element and related game progress (for example pet
          power, fortune-reading history and unlocks). If you enter a date of
          birth to help choose an element, that input is used on your device to
          derive the element; we store the element choice, not your date of birth,
          in your saved game data.
        </Bullet>
        <Bullet>
          Guest play — If you play as a guest, your progress is tied to a
          device-based identifier and stored locally on your device. Guest data
          is not uploaded to our cloud storage.
        </Bullet>
      </Section>

      <Section title="Information Collected Automatically">
        <Paragraph>
          When you use the APP, certain information may be collected
          automatically by us or by third-party SDKs:
        </Paragraph>
        <Bullet>
          Device information: Operating system version, device model, language
          settings, and installation or device identifiers used for guest play
          and analytics.
        </Bullet>
        <Bullet>
          Usage data: Screens viewed, session information, and interaction events
          sent to our analytics provider to understand how the APP is used and
          to improve it.
        </Bullet>
        <Bullet>
          Purchase data: If you make in-app purchases through Google Play, Google
          processes the transaction. We receive purchase status needed to unlock
          paid features; we do not receive your full payment card details.
        </Bullet>
      </Section>

      <Section title="Third-Party Services">
        <Paragraph>
          The APP uses the following third-party services. Each may collect
          information as described in its own privacy policy:
        </Paragraph>
        <Bullet>
          Supabase — Authentication (email and password sign-in) and cloud
          storage for signed-in users’ game data (profile and progress JSON
          files). Privacy policy:{" "}
          <ExternalLink href={SUPABASE_PRIVACY_URL}>
            supabase.com/privacy
          </ExternalLink>
        </Bullet>
        <Bullet>
          GameAnalytics — Analytics and product improvement (device and usage
          events, session data). Privacy policy:{" "}
          <ExternalLink href={GAME_ANALYTICS_PRIVACY_URL}>
            gameanalytics.com/privacy
          </ExternalLink>
        </Bullet>
        <Bullet>
          Google Play Services and Google Sign-In — App delivery, updates, Google
          Play sign-in on Android, and in-app billing when you purchase through
          Google Play. Privacy policy:{" "}
          <ExternalLink href={GOOGLE_PRIVACY_URL}>
            policies.google.com/privacy
          </ExternalLink>
        </Bullet>
        <Paragraph>
          Calyx Guru does not display third-party advertisements and does not
          use advertising SDKs such as Google AdMob.
        </Paragraph>
      </Section>

      <Section title="Data Storage and Security">
        <Bullet>
          Local storage — Preferences, session tokens, and game data are stored
          on your device using secure storage where available (for example
          expo-secure-store on mobile).
        </Bullet>
        <Bullet>
          Cloud backup — If you sign in with Google Play or email and password,
          your profile and game state may be synced to Supabase Storage so you
          can restore progress on another device signed into the same account.
        </Bullet>
        <Bullet>
          Encryption in transit — Data sent to Supabase, GameAnalytics, and
          Google services is transmitted over encrypted connections (HTTPS/TLS).
        </Bullet>
        <Bullet>
          Data security — We take reasonable measures to protect information,
          but no method of transmission or electronic storage is completely
          secure.
        </Bullet>
      </Section>

      <Section title="Your Choices and Account Deletion">
        <Paragraph>
          You can play without signing in, sign out from Settings, or delete
          your account and associated cloud data using “Delete account and data”
          in Settings. Deleting your account removes your saved profile and game
          state from our Supabase Storage for your user ID. Local data on your
          device may remain until you uninstall the APP or clear app storage.
        </Paragraph>
      </Section>

      <Section title="Children’s Privacy">
        <Paragraph>
          Calyx Guru is intended for a general audience as a casual
          entertainment APP. We do not knowingly collect personally identifiable
          information from children under the age of 13 (or under 16 in certain
          jurisdictions like the EU). If you are a parent or guardian and
          discover that your child has provided personal information via
          third-party services used in this APP, please contact us immediately
          so we can take necessary corrective actions.
        </Paragraph>
      </Section>

      <Section title="Permissions Requested by the APP">
        <Paragraph>
          Depending on your use of the APP, Calyx Guru may request specific
          device permissions. You can revoke these permissions at any time
          through your Android System Settings:
        </Paragraph>
        <Bullet>
          Network access — Required to sync saved game data, authenticate
          signed-in users, and send analytics events.
        </Bullet>
        <Bullet>
          Notifications (optional) — Used to schedule local reminders about the
          APP. Notification content is generated on your device; we do not upload
          push tokens to our servers for remote messaging.
        </Bullet>
        <Bullet>
          Storage/media — Required if you save screenshots or download content
          to your device.
        </Bullet>
      </Section>

      <Section title="Changes to This Privacy Policy">
        <Paragraph>
          We may update our Privacy Policy from time to time. Any changes will
          be reflected by updating the “Last Updated” date at the top of this
          page. You are advised to review this Privacy Policy periodically for
          any updates.
        </Paragraph>
      </Section>

      <Section title="Contact Us">
        <Paragraph>
          If you have any questions, suggestions, or concerns regarding our
          Privacy Policy while using Calyx Guru, please feel free to contact us
          directly:
        </Paragraph>
        <Bullet>By email: calyx.guru@gmail.com</Bullet>
        <Bullet>
          Developer Page:{" "}
          {DEVELOPER_PAGE_URL ? (
            <ExternalLink href={DEVELOPER_PAGE_URL}>
              {DEVELOPER_PAGE_URL}
            </ExternalLink>
          ) : (
            "Coming soon"
          )}
        </Bullet>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f4f7f8",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B3C49",
    marginBottom: 4,
  },
  updated: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5a7a82",
    marginBottom: 8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B3C49",
    marginTop: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1a3d47",
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 4,
  },
  bulletMarker: {
    fontSize: 15,
    lineHeight: 22,
    color: "#0B3C49",
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#1a3d47",
  },
  link: {
    color: "#0B6E8C",
    textDecorationLine: "underline",
  },
});
