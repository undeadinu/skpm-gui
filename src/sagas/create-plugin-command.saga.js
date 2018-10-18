// @flow
import { call, put, takeEvery } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import type { Action } from 'redux';
import {
  loadPackageJson,
  loadManifestJson,
  writeManifestJson,
  createCommandJs,
} from '../services/read-from-disk.service';

import { remote } from 'electron';

import {
  addCommandFinish,
  addCommandError,
  ADD_COMMAND_START,
} from '../actions';

import type { CommandInternal, Project } from '../types';

const { dialog } = remote;
const { showErrorBox } = dialog;

export function* handleError(
  project: Project,
  identifier: string,
  err: Error
): Saga<void> {
  console.error('Command creation error', err);

  yield put(addCommandError(project, identifier));

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

export function* handleCreateCommand(action: Action): Saga<void> {
  const { project, shortcut, name, identifier } = action;
  const { path: projectPath } = project;

  let packageJson;
  try {
    // Let's load the basic project info for the path specified, if possible.
    packageJson = yield call(loadPackageJson, projectPath);
  } catch (err) {
    yield call(
      handleError,
      project,
      identifier,
      new Error('loading-packageJson-failed')
    );
    return;
  }

  let manifestJson;
  try {
    // Let's load the basic project info for the path specified, if possible.
    manifestJson = yield call(loadManifestJson, projectPath, packageJson);
  } catch (err) {
    yield call(
      handleError,
      project,
      identifier,
      new Error('loading-manifestJson-failed')
    );
    return;
  }

  try {
    const newManifest = { ...manifestJson };

    const commandPath = `./${identifier}.js`;

    yield call(createCommandJs, projectPath, packageJson, commandPath);

    const newCommand: CommandInternal = {
      name,
      identifier,
      script: `./${identifier}.js`,
    };

    if (shortcut) {
      newCommand.shortcut = shortcut;
    }

    if (!newManifest.commands) {
      newManifest.commands = [];
    }

    newManifest.commands.push(newCommand);

    // Apply changes to manifestJSON
    yield call(writeManifestJson, projectPath, packageJson, newManifest);

    // Update state & close modal
    yield put(addCommandFinish(project, identifier));
  } catch (err) {
    yield call(handleError, project, identifier, err);
  }
}

export default function* rootSaga(): Saga<void> {
  yield takeEvery(ADD_COMMAND_START, handleCreateCommand);
}
