jest.mock('react-native-webview', () => ({
  WebView: jest.fn(({ testID }) => {
    const { View } = require('react-native');
    return <View testID={testID} />;
  }),
}));
