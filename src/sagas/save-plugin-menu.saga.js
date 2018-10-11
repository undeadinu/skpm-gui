// @flow
import { call, put, takeEvery } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import type { Action } from 'redux';
import {
  loadPackageJson,
  loadManifestJson,
  writeManifestJson,
} from '../services/read-from-disk.service';
import { menuToInternalMenu } from '../services/plugin-menu.service';

import { remote } from 'electron';

import { savePluginMenuFinish, SAVE_PLUGIN_MENU_START } from '../actions';

const { dialog } = remote;
const { showErrorBox } = dialog;

export function* handleProjectSaveError(err: Error): Saga<void> {
  console.error('Project save error', err);

  switch (err.message) {
    case 'loading-packageJson-failed': {
      // EPERM: operation not permitted, open
      yield call(
        showErrorBox,
        'Reading not permitted',
        "Egad! Couldn't read package.json. Please check that you're having the permission to read the directory."
      );
      break;
    }

    case 'loading-manifestJson-failed': {
      // EPERM: operation not permitted, open
      yield call(
        showErrorBox,
        'Reading not permitted',
        "Egad! Couldn't read manifest.json. Please check that you're having the permission to read the directory."
      );
      break;
    }

    default: {
      yield call([console, console.error], err);
      yield call(
        showErrorBox,
        'Unknown error',
        'An unknown error has occurred. Sorry about that! Details have been printed to the console.'
      );
    }
  }
}

export function* handleSavePluginManu(action: Action): Saga<void> {
  const { project, menu } = action;
  const internalMenu = menuToInternalMenu(menu);
  const { path: projectPath } = project;

  let packageJson;
  try {
    // Let's load the basic project info for the path specified, if possible.
    packageJson = yield call(loadPackageJson, projectPath);
  } catch (err) {
    yield call(handleProjectSaveError, new Error('loading-packageJson-failed'));
    return;
  }

  let manifestJson;
  try {
    // Let's load the basic project info for the path specified, if possible.
    manifestJson = yield call(loadManifestJson, projectPath, packageJson);
  } catch (err) {
    yield call(
      handleProjectSaveError,
      new Error('loading-manifestJson-failed')
    );
    return;
  }

  try {
    // quick path if there is no menu
    if (!internalMenu && !manifestJson.menu) {
      return;
    }

    const newManifest = { ...manifestJson };

    if (internalMenu) {
      newManifest.menu = internalMenu;
    } else if (newManifest.menu) {
      delete newManifest.menu;
    }
    // Apply changes to manifestJSON
    yield call(writeManifestJson, projectPath, packageJson, newManifest);

    // Update state & close modal
    yield put(savePluginMenuFinish(internalMenu, project));
  } catch (err) {
    yield call(handleProjectSaveError, err);
  }
}

export default function* rootSaga(): Saga<void> {
  yield takeEvery(SAVE_PLUGIN_MENU_START, handleSavePluginManu);
}
