const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Loads `.env` then `.env.local` (local overrides) into `process.env`.
 */
function loadProjectEnv(projectRoot) {
  dotenv.config({ path: path.join(projectRoot, ".env") });
  dotenv.config({ path: path.join(projectRoot, ".env.local"), override: true });
}

/**
 * When CALYXGURU_RELEASE_* are set (e.g. from .env / .env.local), writes
 * android/keystore.properties so Gradle can sign without a separate shell export.
 */
function writeKeystorePropertiesFromEnv(projectRoot) {
  loadProjectEnv(projectRoot);
  const storePassword = process.env.CALYXGURU_RELEASE_STORE_PASSWORD;
  if (storePassword === undefined || storePassword === "") {
    return;
  }
  const androidDir = path.join(projectRoot, "android");
  if (!fs.existsSync(androidDir)) {
    return;
  }
  const escapeProp = (value) =>
    String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n");
  const keyAlias = process.env.CALYXGURU_RELEASE_KEY_ALIAS ?? "";
  const keyPassword = process.env.CALYXGURU_RELEASE_KEY_PASSWORD ?? "";
  const body = [
    `storePassword=${escapeProp(storePassword)}`,
    `keyAlias=${escapeProp(keyAlias)}`,
    `keyPassword=${escapeProp(keyPassword)}`,
  ].join("\n");
  fs.writeFileSync(
    path.join(androidDir, "keystore.properties"),
    `${body}\n`,
    "utf8",
  );
}

/**
 * Signs release APK/AAB with the repo keystore at ./secrets/release.keystore (project root).
 * Credentials: android/keystore.properties, or CALYXGURU_RELEASE_* from the environment.
 * This plugin loads .env / .env.local and, when those vars are present, writes keystore.properties.
 */
function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    writeKeystorePropertiesFromEnv(config.modRequest.projectRoot);

    let contents = config.modResults.contents;
    if (contents.includes("calyxReleaseKeystoreFile")) {
      config.modResults.contents = contents;
      return config;
    }

    const signingConfigsReplacement = `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            def calyxReleaseKeystoreFile = file("../../secrets/release.keystore")
            storeFile calyxReleaseKeystoreFile
            def calyxKeystoreProperties = new Properties()
            def calyxKeystorePropertiesFile = rootProject.file("keystore.properties")
            if (calyxKeystorePropertiesFile.exists()) {
                calyxKeystoreProperties.load(new FileInputStream(calyxKeystorePropertiesFile))
            }
            storePassword calyxKeystoreProperties.getProperty("storePassword", System.getenv("CALYXGURU_RELEASE_STORE_PASSWORD"))
            keyAlias calyxKeystoreProperties.getProperty("keyAlias", System.getenv("CALYXGURU_RELEASE_KEY_ALIAS"))
            keyPassword calyxKeystoreProperties.getProperty("keyPassword", System.getenv("CALYXGURU_RELEASE_KEY_PASSWORD"))
        }
    }`;

    const signingConfigsPattern =
      /signingConfigs\s*\{\s*debug\s*\{[^}]*\}\s*\}/s;

    if (!signingConfigsPattern.test(contents)) {
      throw new Error(
        "withAndroidReleaseSigning: unexpected app/build.gradle; signingConfigs.debug block not found",
      );
    }

    contents = contents.replace(signingConfigsPattern, signingConfigsReplacement);

    const releaseDebugSigning =
      /(\brelease\s*\{\s*\n)(\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n)(\s*)signingConfig signingConfigs\.debug/;

    if (!releaseDebugSigning.test(contents)) {
      throw new Error(
        "withAndroidReleaseSigning: release buildType still uses debug signing; template may have changed",
      );
    }

    contents = contents.replace(
      releaseDebugSigning,
      "$1$3signingConfig signingConfigs.release",
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withAndroidReleaseSigning;
