const { withProjectBuildGradle } = require("@expo/config-plugins");

const MARKER = "calyx-async-storage-local-maven";

/**
 * @react-native-async-storage/async-storage@3 depends on
 * `org.asyncstorage.shared_storage:storage-android`, which is published only in the
 * package's `android/local_repo` (not Maven Central). Gradle must include that repo.
 *
 * @see https://github.com/react-native-async-storage/async-storage/issues/1280
 */
function withAsyncStorageLocalMaven(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes(MARKER)) {
      return config;
    }

    const anchor = `allprojects {
  repositories {
    google()
    mavenCentral()`;

    if (!contents.includes(anchor)) {
      throw new Error(
        "withAsyncStorageLocalMaven: android/build.gradle missing expected allprojects.repositories block",
      );
    }

    const injection = `
    // ${MARKER}: resolves org.asyncstorage.shared_storage from the npm package (Async Storage v3+).
    maven {
      url(uri("\${rootDir}/../node_modules/@react-native-async-storage/async-storage/android/local_repo"))
    }`;

    contents = contents.replace(anchor, `${anchor}${injection}`);
    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withAsyncStorageLocalMaven;
