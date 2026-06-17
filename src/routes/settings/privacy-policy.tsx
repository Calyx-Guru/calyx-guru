import { DEVELOPER_PAGE_URL } from "@/constants/links";
import type { ReactNode } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

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
      <Text style={styles.updated}>Last updated: June 16, 2026</Text>

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
          prioritize user privacy. We do not require you to provide traditional
          personally identifiable information (such as your real name or your
          phone number) to use the core features of the APP.
        </Paragraph>
      </Section>

      <Section title="Information You Provide Directly">
        <Bullet>
          User Input — If the APP features fortune-telling elements where you
          type a question or input a birthday/zodiac sign, this data is
          processed locally on your device to generate the entertainment
          response. We do not upload or store this text on external servers.
        </Bullet>
      </Section>

      <Section title="Information Collected Automatically (By Third Parties)">
        <Paragraph>
          To support the APP’s functionality, we may use third-party software
          development kits (SDKs) that automatically collect certain
          non-personal information:
        </Paragraph>
        <Bullet>
          Device Information: Operating system version, device model, unique
          device identifiers, and language settings.
        </Bullet>
        <Bullet>
          Usage Data: Information about how you interact with the APP (e.g.,
          button clicks, screens viewed, time spent in the APP, and crash
          reports).
        </Bullet>
      </Section>

      <Section title="Third-Party Services and Advertising">
        <Paragraph>
          The APP may utilize third-party services that collect information used
          to identify your device or optimize performance. These services may
          include:
        </Paragraph>
        <Bullet>
          Google Play Services: Used for APP delivery, updates and core Android
          functionality.
        </Bullet>
        <Bullet>
          Google Analytics for Firebase / Firebase Crashlytics: Used to
          understand APP performance, monitor crashes, and improve the user
          interface.
        </Bullet>
        <Bullet>
          Google AdMob (If applicable): Used to serve advertisements within the
          APP. AdMob may use device identifiers to personalize ads. You can
          manage ads personalization through your Android device settings.
        </Bullet>
        <Paragraph>
          Note: We recommend reviewing the Privacy Policies of these third-party
          providers directly through Google’s official Privacy documentation.
        </Paragraph>
      </Section>

      <Section title="Data Storage and Security">
        <Bullet>
          Local Processing: Any personal preferences or input data generated
          within Calyx Guru is stored locally on your device’s secure storage.
        </Bullet>
        <Bullet>
          Data Security: As an individual developer, we take reasonable
          commercial measures to safeguard any data transmitted via third-party
          SDKs. However, please be aware that no method of transmission over the
          internet or method of electronic storage is 100% secure.
        </Bullet>
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
          Network Access: Required for the APP to load assets, communicate with
          Google Play Services and serve ads (if applicable).
        </Bullet>
        <Bullet>
          Storage/Media: Required if you save screenshots or download Mascot to
          your device.
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
