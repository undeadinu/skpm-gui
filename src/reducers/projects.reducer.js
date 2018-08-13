// @flow
import { combineReducers } from 'redux';
import produce from 'immer';

import {
  ADD_PROJECT,
  IMPORT_EXISTING_PROJECT_FINISH,
  ADD_DEPENDENCY_FINISH,
  REFRESH_PROJECTS,
  SELECT_PROJECT,
} from '../actions';
import { getTasksForProjectId } from './tasks.reducer';
import { getDependenciesForProjectId } from './dependencies.reducer';
import { getPathForProjectId } from './paths.reducer';

import type { Action } from 'redux';
import type { ProjectInternal, Project } from '../types';

type ById = {
  [key: string]: ProjectInternal,
};
type SelectedId = ?string;

type State = {
  byId: ById,
  selectedId: SelectedId,
};

const initialState = {
  byId: {},
  selectedId: null,
};

const byId = (state: ById = initialState.byId, action: Action) => {
  switch (action.type) {
    case REFRESH_PROJECTS: {
      return action.projects;
    }

    case ADD_PROJECT:
    case IMPORT_EXISTING_PROJECT_FINISH: {
      return {
        ...state,
        [action.project.name]: action.project,
      };
    }

    case ADD_DEPENDENCY_FINISH: {
      const { projectId, dependency } = action;

      return produce(state, draftState => {
        if (!draftState[projectId].dependencies) {
          draftState[projectId].dependencies = {};
        }
        draftState[projectId].dependencies[dependency.name] =
          dependency.version;
      });
    }

    default:
      return state;
  }
};

const selectedId = (
  state: SelectedId = initialState.selectedId,
  action: Action
) => {
  switch (action.type) {
    case ADD_PROJECT:
    case IMPORT_EXISTING_PROJECT_FINISH: {
      return action.project.name;
    }

    case REFRESH_PROJECTS: {
      // It's possible that the selected project no longer exists (say if the
      // user deletes that folder and then refreshes Guppy).
      // In that case, un-select it.
      const selectedProjectId = state;

      if (!selectedProjectId) {
        return state;
      }

      const selectedProjectExists = !!action.projects[selectedProjectId];

      return selectedProjectExists ? state : null;
    }

    case SELECT_PROJECT: {
      return action.projectId;
    }

    default:
      return state;
  }
};

export default combineReducers({ byId, selectedId });

//
//
//
// Selectors
type GlobalState = { projects: State };

// Our projects in-reducer are essentially database items that represent the
// package.json on disk.
//
// For using within the app, though, we can do a few things to make it nicer
// to work with:
//
//  - Combine it with the tasks in `tasks.reducer`, since this is much more
//    useful than project.scripts
const prepareProjectForConsumption = (
  state: GlobalState,
  project: ProjectInternal
): Project => {
  return {
    id: project.name,
    name: (project.skpm || {}).name || project.name,
    tasks: getTasksForProjectId(state, project.name),
    dependencies: getDependenciesForProjectId(state, project.name),
    path: getPathForProjectId(state, project.name),
    icon: project.__skpm_icon,
    createdAt: project.__skpm_createdAt,
  };
};

export const getById = (state: GlobalState) => state.projects.byId;
export const getSelectedProjectId = (state: GlobalState) =>
  state.projects.selectedId;

export const getInternalProjectById = (state: GlobalState, id: string) =>
  getById(state)[id];

export const getProjectsArray = (state: GlobalState) => {
  // $FlowFixMe
  return Object.values(state.projects.byId)
    .map(project =>
      // $FlowFixMe
      prepareProjectForConsumption(state, project)
    )
    .sort((p1, p2) => (p1.createdAt < p2.createdAt ? 1 : -1));
};

export const getProjectById = (state: GlobalState, id: string) =>
  prepareProjectForConsumption(state, state.projects.byId[id]);

// TODO: check the perf cost of this selector, memoize if it's non-trivial.
export const getSelectedProject = (state: GlobalState) => {
  const selectedId = getSelectedProjectId(state);

  if (!selectedId) {
    return null;
  }

  const project = state.projects.byId[selectedId];

  if (!project) {
    return null;
  }

  return prepareProjectForConsumption(state, project);
};

export const getDependencyMapForSelectedProject = (state: GlobalState) => {
  const projectId = getSelectedProjectId(state);

  if (!projectId) {
    return [];
  }

  const dependencies = getDependenciesForProjectId(state, projectId);

  return dependencies.reduce((acc, dep) => {
    acc[dep.name] = dep;
    return acc;
  }, {});
};
