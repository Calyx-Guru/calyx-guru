const path = require("path");

// Ensure .env.local is loaded before Metro inlines EXPO_PUBLIC_* variables.
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });

module.exports = require("./app.json");
