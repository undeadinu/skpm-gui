// @flow
import produce from 'immer';
import {
  REFRESH_PROJECTS_FINISH,
  ADD_PROJECT,
  IMPORT_EXISTING_PROJECT_FINISH,
  DELETE_COMMAND_START,
  DELETE_COMMAND_ERROR,
  DELETE_COMMAND_FINISH,
  UPDATE_COMMAND_START,
  UPDATE_COMMAND_ERROR,
  UPDATE_COMMAND_FINISH,
  ADD_COMMAND_START,
  ADD_COMMAND_ERROR,
  ADD_COMMAND_FINISH,
} from '../actions';

import type { Action } from 'redux';
import type { Command, ProjectInternal } from '../types';

type CommandMap = {
  [commandId: string]: Command,
};

type State = {
  [projectId: string]: CommandMap,
};

const initialState = {};

export default (state: State = initialState, action: Action) => {
  switch (action.type) {
    case REFRESH_PROJECTS_FINISH: {
      return produce(state, draftState => {
        // remove the projects that don't exist anymore
        Object.keys(draftState).forEach(projectId => {
          if (!action.projects[projectId]) {
            delete draftState[projectId];
          }
        });
        Object.keys(action.projects).forEach(projectId => {
          const project: ProjectInternal = action.projects[projectId];

          if (!draftState[projectId]) {
            draftState[projectId] = {};
          }

          const commands = (project.__skpm_manifest || {}).commands;

          // remove the commands that don't exist anymore
          Object.keys(draftState[projectId]).forEach(identifier => {
            if (!commands.some(c => c.identifier === projectId)) {
              delete draftState[projectId][identifier];
            }
          });

          commands.forEach(command => {
            // If this command already exists, we need to be careful.
            //
            // This action is called when we want to read from the disk, and
            // it's possible that the user has manually edited the manifest.json.
            // We want to update the task command.
            //
            // But! We also store a bunch of metadata in this reducer, like
            // the log history, and the `timeSinceStatusChange`. So we don't
            // want to overwrite it, we want to merge it.
            if (draftState[projectId][command.identifier]) {
              draftState[projectId][command.identifier].shortcut =
                command.shortcut;
              draftState[projectId][command.identifier].name = command.name;
              return;
            }

            draftState[projectId][command.identifier] = {
              script: command.script,
              identifier: command.identifier,
              shortcut: command.shortcut,
              name: command.name,
              status: 'idle',
              timeSinceStatusChange: null,
              logs: [],
            };
          });
        });
      });
    }

    case ADD_PROJECT:
    case IMPORT_EXISTING_PROJECT_FINISH: {
      const { project } = action;

      const projectId = project.name;

      return produce(state, draftState => {
        draftState[projectId] = {};

        const commands = (project.__skpm_manifest || {}).commands;
        commands.forEach(command => {
          draftState[projectId][command.identifier] = {
            identifier: command.identifier,
            shortcut: command.shortcut,
            name: command.name,
            status: 'idle',
            timeSinceStatusChange: null,
            logs: [],
          };
        });
      });
    }

    case ADD_COMMAND_START: {
      const { projectId, identifier, name, shortcut, script } = action;

      return produce(state, draftState => {
        draftState[projectId][identifier] = {
          identifier,
          shortcut,
          script,
          name,
          status: 'installing',
          timeSinceStatusChange: null,
          logs: [],
        };
      });
    }

    case ADD_COMMAND_ERROR: {
      const { projectId, identifier } = action;

      return produce(state, draftState => {
        // If the command couldn't be added, we should remove it from
        // state.
        delete draftState[projectId][identifier];
      });
    }

    case ADD_COMMAND_FINISH: {
      const { projectId, identifier } = action;

      return produce(state, draftState => {
        draftState[projectId][identifier].status = 'idle';
      });
    }

    case UPDATE_COMMAND_START: {
      const { projectId, previousId } = action;

      return produce(state, draftState => {
        draftState[projectId][previousId].status = 'updating';
      });
    }

    case UPDATE_COMMAND_ERROR: {
      const { projectId, previousId } = action;

      return produce(state, draftState => {
        draftState[projectId][previousId].status = 'idle';
      });
    }

    case UPDATE_COMMAND_FINISH: {
      const {
        projectId,
        previousId,
        identifier,
        name,
        shortcut,
        script,
      } = action;

      return produce(state, draftState => {
        if (previousId !== identifier) {
          delete draftState[projectId][previousId];
          draftState[projectId][identifier] = {
            identifier,
            script,
            shortcut,
            name,
            status: 'idle',
            timeSinceStatusChange: null,
            logs: [],
          };
        } else if (draftState[projectId][identifier]) {
          draftState[projectId][identifier].shortcut = shortcut;
          draftState[projectId][identifier].name = name;
          draftState[projectId][identifier].script = script;
        } else {
          draftState[projectId][identifier] = {
            script,
            identifier,
            shortcut,
            name,
            status: 'idle',
            timeSinceStatusChange: null,
            logs: [],
          };
        }
      });
    }

    case DELETE_COMMAND_START: {
      const { projectId, identifier } = action;

      return produce(state, draftState => {
        draftState[projectId][identifier].status = 'deleting';
      });
    }

    case DELETE_COMMAND_ERROR: {
      const { projectId, identifier } = action;

      return produce(state, draftState => {
        draftState[projectId][identifier].status = 'idle';
      });
    }

    case DELETE_COMMAND_FINISH: {
      const { projectId, identifier } = action;

      return produce(state, draftState => {
        delete draftState[projectId][identifier];
      });
    }

    default:
      return state;
  }
};

//
//
//
// Selectors
export const getCommands = (state: any) => state.commands;
export const getCommandsForProjectId = (
  state: any,
  props: { projectId: string }
): CommandMap => state.commands[props.projectId];
