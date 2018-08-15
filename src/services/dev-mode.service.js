// @flow
import * as childProcess from 'child_process';

function run(instruction, args) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(instruction, args);

    child.on('close', resolve);
  });
}

function runAll(enabled) {
  return Promise.all([
    run('/usr/bin/defaults', [
      'write',
      '~/Library/Preferences/com.bohemiancoding.sketch3.plist',
      'AlwaysReloadScript',
      '-bool',
      enabled ? 'YES' : 'NO',
    ]),
    run('/usr/bin/defaults', [
      'write',
      '~/Library/Preferences/com.bohemiancoding.sketch3.beta.plist',
      'AlwaysReloadScript',
      '-bool',
      enabled ? 'YES' : 'NO',
    ]),
    run('/usr/bin/defaults', [
      'write',
      '~/Library/Preferences/com.bohemiancoding.sketch3.xcode.plist',
      'AlwaysReloadScript',
      '-bool',
      enabled ? 'YES' : 'NO',
    ]),
    run('/usr/bin/defaults', [
      'write',
      'com.bohemiancoding.sketch3',
      'WebKitDeveloperExtras',
      '-bool',
      enabled ? 'YES' : 'NO',
    ]),
    run('/usr/bin/defaults', [
      'write',
      'com.bohemiancoding.sketch3.beta',
      'WebKitDeveloperExtras',
      '-bool',
      enabled ? 'YES' : 'NO',
    ]),
    run('/usr/bin/defaults', [
      'write',
      'com.bohemiancoding.sketch3.xcode',
      'WebKitDeveloperExtras',
      '-bool',
      enabled ? 'YES' : 'NO',
    ]),
  ]);
}

export const enableDevMode = () => {
  return runAll(true);
};

export const disableDevMode = () => {
  return runAll(false);
};
