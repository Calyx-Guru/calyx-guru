# Android Release Keystore Setup

This guide walks you through setting up a release signing keystore for Android builds.

## Prerequisites

- Java Development Kit (JDK) installed
- Android project already initialized

## Step 1: Generate the Keystore

Run the following command from the project root directory:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias calyxguru -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted to enter:

- **Keystore password** (keep this secure!)
- **Key password** (can be the same as keystore password)
- **Distinguished name information**:
  - First and last name
  - Organizational unit
  - Organization name
  - City/Locality
  - State/Province
  - Two-letter country code

## Step 2: Move Keystore to Android Directory

Move the generated keystore file:

```bash
mv release.keystore android/app/
```

## Step 3: Create keystore.properties

Create `android/keystore.properties` file:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=calyxguru
storeFile=../release.keystore
```

Replace `YOUR_KEYSTORE_PASSWORD` and `YOUR_KEY_PASSWORD` with your actual passwords.

## Step 4: Update build.gradle

Add keystore loading code at the top of `android/app/build.gradle`:

```groovy
// Load keystore properties
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add release signing config in the `android.signingConfigs` block:

```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (keystorePropertiesFile.exists()) {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
}
```

Update the release build type to use the release signing config:

```groovy
buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... other release config
    }
}
```

## Step 5: Update .gitignore

Add these lines to `.gitignore` to protect your keystore:

```
*.keystore
keystore.properties
```

## Step 6: Build Release APK

Test your configuration:

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

## Important Notes

⚠️ **CRITICAL**: Backup your keystore file and passwords securely!

- If you lose the keystore, you **cannot update your app** in Google Play Store
- Store backups in multiple secure locations (password manager, encrypted drive, etc.)
- Never commit the keystore or keystore.properties to version control

## Troubleshooting

### Build fails with "Keystore was tampered with"

- Verify the password in `keystore.properties` is correct

### "keyAlias not found"

- Check that the alias in `keystore.properties` matches the one used when generating the keystore

### Permission denied errors

- Ensure the keystore file path is correct relative to the build.gradle location
