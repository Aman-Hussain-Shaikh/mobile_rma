module.exports = function(api) {
  api.cache(true);

  return {
      // Presets array remains the same to maintain NativeWind functionality
      presets: [
          ["babel-preset-expo", {
              jsxImportSource: "nativewind"
          }], 
          "nativewind/babel"
      ],

      // Plugins array gets updated to include both module-resolver and react-native-paper
      plugins: [
          ["module-resolver", {
              root: ["./"],
              alias: {
                  "@": "./",
                  "tailwind.config": "./tailwind.config.js"
              }
          }]
      ],

      // Add the env configuration for React Native Paper
      env: {
          production: {
              plugins: ['react-native-paper/babel']
          }
      }
  };
};