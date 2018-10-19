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
  SAVE_PROJECT_SETTINGS_FINISH,
  RUN_COMMAND,
  RECEIVE_DATA_FROM_COMMAND_EXECUTION,
  ATTACH_COMMAND_METADATA,
  COMPLETE_COMMAND,
  CLEAR_CONSOLE,
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

          const commands = (project.__skpm_manifest || {}).commands || [];

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
              projectId,
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
            projectId,
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
      const { project, identifier, name, shortcut, script } = action;

      return produce(state, draftState => {
        draftState[project.id][identifier] = {
          projectId: project.id,
          identifier,
          shortcut,
          script,
          name,
          status: 'creating',
          timeSinceStatusChange: null,
          logs: [],
        };
      });
    }

    case ADD_COMMAND_ERROR: {
      const { project, identifier } = action;

      return produce(state, draftState => {
        // If the command couldn't be added, we should remove it from
        // state.
        delete draftState[project.id][identifier];
      });
    }

    case ADD_COMMAND_FINISH: {
      const { project, identifier } = action;

      return produce(state, draftState => {
        draftState[project.id][identifier].status = 'idle';
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
            projectId,
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
            projectId,
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

    case RUN_COMMAND: {
      const { command, timestamp } = action;

      return produce(state, draftState => {
        // If this is a long-running task, it's considered successful as long
        // as it doesn't have an failed.
        // For periodic tasks, though, this is a 'pending' state.
        const nextStatus =
          command.type === 'short-term' ? 'pending' : 'success';

        draftState[command.projectId][command.identifier].status = nextStatus;
        draftState[command.projectId][
          command.identifier
        ].timeSinceStatusChange = timestamp;
      });
    }

    case CLEAR_CONSOLE: {
      const { command } = action;

      if (!command) {
        return state;
      }

      return produce(state, draftState => {
        draftState[command.projectId][command.identifier].logs = [];
      });
    }

    case COMPLETE_COMMAND: {
      const { command, timestamp, wasSuccessful } = action;

      return produce(state, draftState => {
        // For short-term tasks like building for production, we want to show
        // either a success or failed status.
        // For long-running tasks, though, once a task is completed, it goes
        // back to being "idle" regardless of whether it was successful or not.
        // Long-running tasks reserve "failed" for cases where the task is
        // still running, it's just hit an error.
        //
        // TODO: Come up with a better model for all of this :/
        let nextStatus;
        if (command.type === 'short-term') {
          nextStatus = wasSuccessful ? 'success' : 'failed';
        } else {
          nextStatus = 'idle';
        }

        draftState[command.projectId][command.identifier].status = nextStatus;
        draftState[command.projectId][
          command.identifier
        ].timeSinceStatusChange = timestamp;
        delete draftState[command.projectId][command.identifier].processId;
      });
    }

    case ATTACH_COMMAND_METADATA: {
      const { command, processId } = action;

      return produce(state, draftState => {
        draftState[command.projectId][command.identifier].processId = processId;
      });
    }

    case RECEIVE_DATA_FROM_COMMAND_EXECUTION: {
      const { command, text, isError, logId } = action;

      return produce(state, draftState => {
        draftState[command.projectId][command.identifier].logs.push({
          id: logId,
          text,
        });

        // Either set or reset a failed status, based on the data received.
        const nextStatus = isError
          ? 'failed'
          : command.type === 'short-term'
            ? 'pending'
            : 'success';

        draftState[command.projectId][command.identifier].status = nextStatus;
      });
    }

    case SAVE_PROJECT_SETTINGS_FINISH: {
      const { id, oldId } = action;

      return produce(state, draftState => {
        delete draftState[oldId];
        draftState[id] = state[oldId];
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
