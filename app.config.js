const path = require("path");

// Load env before Expo/Metro read EXPO_PUBLIC_* values. .env.local wins.
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({
  path: path.resolve(__dirname, ".env.local"),
  override: true,
});

const appJson = require("./app.json");

const googleSignInPlugin = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME
  ? [
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
        },
      ],
    ]
  : ["@react-native-google-signin/google-signin"];

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [...(appJson.expo.plugins ?? []), ...googleSignInPlugin, "expo-web-browser"],
    extra: {
      ...(appJson.expo?.extra ?? {}),
      useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA === "true",
    },
  },
};
