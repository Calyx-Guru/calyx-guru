const path = require("path");

// Load env before Expo/Metro read EXPO_PUBLIC_* values. .env.local wins.
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({
  path: path.resolve(__dirname, ".env.local"),
  override: true,
});

const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra ?? {}),
      useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA === "true",
    },
  },
};
