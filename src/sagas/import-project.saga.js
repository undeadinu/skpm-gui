// @flow
import electron from 'electron';
import { call, put, cancel, select, takeEvery } from 'redux-saga/effects';

import {
  importExistingProjectStart,
  importExistingProjectFinish,
  importExistingProjectError,
  SHOW_IMPORT_EXISTING_PROJECT_PROMPT,
  IMPORT_EXISTING_PROJECT_START,
} from '../actions';
import { loadProject } from '../services/read-from-disk.service';
import { getInternalProjectById } from '../reducers/projects.reducer';
import { getOnboardingCompleted } from '../reducers/onboarding-status.reducer';

import type { Action } from 'redux';
import type { Saga } from 'redux-saga';

const { showOpenDialog, showErrorBox } = electron.remote.dialog;

export function* handlePathInput(paths: Array<string>): Saga<void> {
  // The user might cancel out without selecting a directory.
  // In that case, do nothing.
  if (!paths) yield cancel();

  // Only a single path should be selected
  const [path] = paths;
  yield put(importExistingProjectStart(path));
}

export function* showImportDialog(): Saga<void> {
  const paths = yield call(showOpenDialog, {
    message: 'Select the directory of an existing Sketch Plugin',
    properties: ['openDirectory'],
  });
  yield call(handlePathInput, paths);
}

export function* handleImportError(err: Error): Saga<void> {
  switch (err.message) {
    case 'project-name-already-exists': {
      yield call(
        showErrorBox,
        'Plugin name already exists',
        "Egad! A plugin with that name already exists. Are you sure it hasn't already been imported?"
      );
      break;
    }

    case 'unsupported-project-type': {
      yield call(
        showErrorBox,
        'Unsupported project type',
        "Looks like the project you're trying to import isn't supported. Skpm only supports plugins created with skpm."
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

export function* importProject({ path }: Action): Saga<void> {
  try {
    // Let's load the basic project info for the path specified, if possible.
    const json = yield call(loadProject, path);
    const projectId = json.name;

    // Check to see if we already have a project with this ID.
    // In the future, maybe I can attach a suffix like `-copy`, but for
    // now I'll just reject it outright.
    const alreadyExists = yield select(getInternalProjectById, { projectId });
    if (alreadyExists) {
      throw new Error('project-name-already-exists');
    }

    if (!json.skpm) {
      throw new Error('unsupported-project-type');
    }

    const isOnboardingCompleted = yield select(getOnboardingCompleted);

    yield put(importExistingProjectFinish(path, json, isOnboardingCompleted));
  } catch (err) {
    yield call(handleImportError, err);
    yield put(importExistingProjectError());
  }
}

export default function* rootSaga(): Saga<void> {
  yield takeEvery(SHOW_IMPORT_EXISTING_PROJECT_PROMPT, showImportDialog);
  yield takeEvery(IMPORT_EXISTING_PROJECT_START, importProject);
}
