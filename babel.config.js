/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
        extensions: ['.js', '.json'],
        root: ['./src'],
      },
    ],
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true,
      }
    ],
    ['@babel/plugin-transform-class-properties', {
      "loose": true,
    }],
    [
      "@babel/plugin-transform-runtime",
      {
        "helpers": true,
        "regenerator": true
      }
    ],
    'inline-dotenv',
    'react-native-reanimated/plugin', // needs to be last
  ],
  presets: [
    ['module:@react-native/babel-preset', {
      runtime: 'automatic'
    }]
  ],
};
