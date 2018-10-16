// @flow
// app-wide settings (no user changable settings here)
module.exports = {
  PACKAGE_MANAGER: 'yarn',
  DEFAULT_PLUGIN_ICON: require('../assets/images/default-plugin-icon.png').replace(
    'data:image/png;charset=utf-8;base64,',
    ''
  ),
};
