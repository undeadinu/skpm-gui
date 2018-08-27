// @flow
import { call, put, select, takeEvery } from 'redux-saga/effects';

import {
  refreshProjectsFinish,
  refreshProjectsError,
  REFRESH_PROJECTS_START,
} from '../actions';
import { loadProjects } from '../services/read-from-disk.service';
import { getPathsArray } from '../reducers/paths.reducer';

import type { Saga } from 'redux-saga';

export function* refreshProjects(): Saga<void> {
  const pathsArray = yield select(getPathsArray);

  try {
    const projectsFromDisk = yield call(loadProjects, pathsArray);

    yield put(refreshProjectsFinish(projectsFromDisk));
  } catch (err) {
    yield put(refreshProjectsError(err));
  }
}

export default function* rootSaga(): Saga<void> {
  yield takeEvery(REFRESH_PROJECTS_START, refreshProjects);
}
