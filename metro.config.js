const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('ktx2')) {
  config.resolver.assetExts.push('ktx2');
}

module.exports = config;
