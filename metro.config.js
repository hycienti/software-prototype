const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver = config.resolver || {};
config.resolver.assetExts = [
  ...(config.resolver.assetExts || []),
  'bin', // whisper.rn: ggml model binary
  'mil', // whisper.rn: CoreML model asset
];

module.exports = withNativeWind(config, { input: './global.css' });
