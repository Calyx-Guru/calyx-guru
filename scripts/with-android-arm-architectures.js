const { withGradleProperties } = require("@expo/config-plugins");

const ARCH_KEY = "reactNativeArchitectures";
/** ARM only — excludes x86 / x86_64 (emulator) native libs from release APK/AAB. */
const ARCH_VALUE = "armeabi-v7a,arm64-v8a";

/**
 * Limits Android native builds to 32/64-bit ARM (real devices).
 * @see https://reactnative.dev/docs/build-speed#reduce-target-architectures
 */
function withAndroidArmArchitectures(config) {
  return withGradleProperties(config, (config) => {
    const props = config.modResults.filter(
      (item) => !(item.type === "property" && item.key === ARCH_KEY),
    );
    props.push({ type: "property", key: ARCH_KEY, value: ARCH_VALUE });
    config.modResults = props;
    return config;
  });
}

module.exports = withAndroidArmArchitectures;
