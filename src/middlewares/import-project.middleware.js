// @flow
import { remote } from 'electron';
import {
  SHOW_IMPORT_EXISTING_PROJECT_PROMPT,
  IMPORT_EXISTING_PROJECT_START,
  importExistingProjectStart,
  importExistingProjectFinish,
  importExistingProjectError,
} from '../actions';
import { getInternalProjectById } from '../reducers/projects.reducer';
import { loadProject } from '../services/read-from-disk.service';

const { dialog } = remote;

// TODO: Flow types
export default (store: any) => (next: any) => (action: any) => {
  // Pass all actions through
  next(action);

  switch (action.type) {
    case SHOW_IMPORT_EXISTING_PROJECT_PROMPT: {
      dialog.showOpenDialog(
        {
          message: 'Select the directory of an existing Sketch plugin',
          properties: ['openDirectory'],
        },
        paths => {
          // The user might cancel out without selecting a directory.
          // In that case, do nothing.
          if (!paths) {
            return;
          }

          // Only a single path should be selected
          const [path] = paths;

          store.dispatch(importExistingProjectStart(path));
        }
      );

      return;
    }

    case IMPORT_EXISTING_PROJECT_START: {
      const { path } = action;

      const state = store.getState();

      // Let's load the basic project info for the path specified, if possible.
      loadProject(path)
        .then(json => {
          const projectId = json.name;

          // Check to see if we already have a project with this ID.
          // In the future, maybe I can attach a suffix like `-copy`, but for
          // now I'll just reject it outright.
          if (getInternalProjectById(state, projectId)) {
            throw new Error('project-name-already-exists');
          }

          if (!json.skpm) {
            throw new Error('unsupported-project-type');
          }

          return json;
        })
        .then(json => {
          next(importExistingProjectFinish(path, json));
        })
        .catch(err => {
          switch (err.message) {
            case 'project-name-already-exists': {
              dialog.showErrorBox(
                'Project name already exists',
                "Egad! A project with that name already exists. Are you sure it hasn't already been imported?"
              );
              break;
            }

            case 'unsupported-project-type': {
              dialog.showErrorBox(
                'Unsupported project type',
                "Looks like the project you're trying to import isn't supported. Skpm only supports plugins created with skpm"
              );
              break;
            }

            default: {
              console.error(err);

              dialog.showErrorBox(
                'Unknown error',
                'An unknown error has occurred. Sorry about that! Details have been printed to the console.'
              );
              break;
            }
          }

          next(importExistingProjectError());
        });

      return;
    }

    default: {
      return;
    }
  }
};
