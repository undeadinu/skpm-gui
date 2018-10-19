// @flow
// app-wide settings (no user changable settings here)
module.exports = {
  PACKAGE_MANAGER: 'yarn',
  DEFAULT_PLUGIN_ICON: require('../assets/images/default-plugin-icon.png').replace(
    'data:image/png;charset=utf-8;base64,',
    ''
  ),
  // Enable logging, if enabled all terminal responses are visible in the console (useful for debugging)
  LOGGING: false,
};
