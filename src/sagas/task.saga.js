// @flow
import { select, call, put, take, takeEvery } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import { ipcRenderer } from 'electron';
import * as childProcess from 'child_process';
import chalkRaw from 'chalk';

import {
  RUN_TASK,
  ABORT_TASK,
  COMPLETE_TASK,
  LAUNCH_DEV_SERVER,
  completeTask,
  attachTaskMetadata,
  receiveDataFromTaskExecution,
  launchDevServer,
  runTask,
  abortTask,
} from '../actions';
import projectConfigs from '../config/project-types';
import { getPathForProjectId } from '../reducers/paths.reducer';
import { isDevServerTask } from '../reducers/tasks.reducer';
import killProcessId from '../services/kill-process-id.service';
import {
  isWin,
  getBaseProjectEnvironment,
  PACKAGE_MANAGER_CMD,
} from '../services/platform.service';
import { processLogger } from '../services/process-logger.service';

import type { Saga } from 'redux-saga';
import type { ChildProcess } from 'child_process';
import type { Task, ProjectType } from '../types';
import type { ReturnType } from '../actions/types';

// Mapping type for config template variables '$port'
export type VariableMap = {};

const chalk = new chalkRaw.constructor({ level: 3 });

export function* handleLaunchDevServer({
  task,
}: ReturnType<typeof launchDevServer>): Saga<void> {
  const projectPath = yield select(getPathForProjectId, {
    projectId: task.projectId,
  });

  try {
    const { args, env } = yield call(getDevServerCommand, 'empty');

    const child = yield call(
      [childProcess, childProcess.spawn],
      PACKAGE_MANAGER_CMD,
      args,
      {
        cwd: projectPath,
        env: { ...getBaseProjectEnvironment(projectPath), ...env },
        shell: true,
      }
    );

    processLogger(child, 'DEVSERVER');

    // Now that we have a port/processId for the server, attach it to
    // the task. The port is used for opening the app, the pid is used
    // to kill the process
    yield put(attachTaskMetadata(task, child.pid));

    yield call([ipcRenderer, ipcRenderer.send], 'addProcessId', child.pid);

    const stdioChannel = createStdioChannel(child, {
      stdout: emitter => data => {
        const text = stripUnusableControlCharacters(data.toString());

        // Re-route "Failed to compile" messages to stderr, since this should
        // be treated as an error.
        // TODO: refactor error handling
        const isDevServerFail = text.includes('Failed to compile');

        emitter({
          channel: isDevServerFail ? 'stderr' : 'stdout',
          text,
          isDevServerFail,
        });
      },
      stderr: emitter => data => {
        const text = stripUnusableControlCharacters(data.toString());

        emitter({ channel: 'stderr', text });
      },
      exit: emitter => code => {
        // For Windows Support
        // Windows sends code 1 (I guess its because we force kill??)
        const successfulCode = isWin ? 1 : 0;
        const wasSuccessful = code === successfulCode || code === null;
        const timestamp = new Date();

        emitter({ channel: 'exit', timestamp, wasSuccessful });
        // calling emitter(END) will break out of the while loop of any
        // actively listening subscribers when they take() it
        emitter(END);
      },
    });

    while (true) {
      const message = yield take(stdioChannel);

      switch (message.channel) {
        case 'stdout':
          yield put(receiveDataFromTaskExecution(task, message.text));
          break;

        case 'stderr':
          yield put(
            receiveDataFromTaskExecution(
              task,
              message.text,
              message.isDevServerFail
            )
          );
          break;

        case 'exit':
          yield call(displayTaskComplete, task, message.wasSuccessful);
          yield put(
            completeTask(task, message.timestamp, message.wasSuccessful)
          );
          break;

        default:
          throw new Error('Unexpected channel for message: ' + message.channel);
      }
    }
  } catch (err) {
    // TODO: Error handling (this can happen if there's some generic Node error)
    console.error(err);
  }
}

export function waitForChildProcessToComplete(
  installProcess: ChildProcess
): Promise<void> {
  return new Promise((resolve, reject) => {
    installProcess.on('exit', (code: number) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error('Exit with error code: ' + code));
      }
    });
  });
}

export function* taskRun({ task }: ReturnType<typeof runTask>): Saga<void> {
  const projectPath = yield select(getPathForProjectId, {
    projectId: task.projectId,
  });
  const { name } = task;

  const child = yield call(
    [childProcess, childProcess.spawn],
    PACKAGE_MANAGER_CMD,
    ['run', name],
    {
      cwd: projectPath,
      env: getBaseProjectEnvironment(projectPath),
      shell: true,
    }
  );

  processLogger(child, 'TASK');

  // TODO: Does the renderer process still need to know about the child
  // processId?
  yield put(attachTaskMetadata(task, child.pid));

  // When this application exits, we want to kill this process.
  // Send it up to the main process.
  yield call([ipcRenderer, ipcRenderer.send], 'addProcessId', child.pid);

  const stdioChannel = createStdioChannel(child, {
    stdout: emitter => data => {
      const text = stripUnusableControlCharacters(data.toString());
      emitter({ channel: 'stdout', text });
    },
    stderr: emitter => data => {
      const text = stripUnusableControlCharacters(data.toString());

      // When trying to eject, there will be an error from CRA if git state
      // isn't clean. We can use this.
      const uncleanRepo = text.includes(
        'git repository has untracked files or uncommitted changes'
      );

      emitter({
        channel: uncleanRepo ? 'exit' : 'stderr',
        text,
        uncleanRepo,
      });
    },
    exit: emitter => code => {
      const timestamp = new Date();

      emitter({ channel: 'exit', timestamp, wasSuccessful: code === 0 });
      emitter(END);
    },
  });

  while (true) {
    const message = yield take(stdioChannel);

    switch (message.channel) {
      case 'stdout':
        yield put(receiveDataFromTaskExecution(task, message.text));
        break;

      case 'stderr':
        yield put(receiveDataFromTaskExecution(task, message.text));
        break;

      case 'exit':
        yield call(displayTaskComplete, task, message.wasSuccessful);
        yield put(completeTask(task, message.timestamp, message.wasSuccessful));
        break;

      default:
        throw new Error('Unexpected channel for message: ' + message.channel);
    }
  }
}

export function* taskAbort({
  task,
  projectType,
}: ReturnType<typeof abortTask>): Saga<void> {
  const { processId, name } = task;

  yield call(killProcessId, processId);
  yield call([ipcRenderer, ipcRenderer.send], 'removeProcessId', processId);

  // Once the children are killed, we should dispatch a notification
  // so that the terminal shows something about this update.
  // My initial thought was that all tasks would have the same message,
  // but given that we're treating `start` as its own special thing,
  // I'm realizing that it should vary depending on the task type.
  // TODO: Find a better place for this to live.
  const abortMessage = isDevServerTask(name, projectType)
    ? 'Dev mode stopped'
    : 'Task aborted';

  yield put(receiveDataFromTaskExecution(task, chalk.bold.red(abortMessage)));
}

export function* displayTaskComplete(
  task: Task,
  wasSuccessful: boolean
): Saga<void> {
  // Send a message to add info to the terminal about the task being done.
  // TODO: ASCII fish art?

  const message = wasSuccessful
    ? chalk.bold.green('Task completed')
    : chalk.bold.red('Task failed');

  yield put(receiveDataFromTaskExecution(task, message));
}

export function* taskComplete({
  task,
}: ReturnType<typeof completeTask>): Saga<void> {
  if (task.processId) {
    yield call(
      [ipcRenderer, ipcRenderer.send],
      'removeProcessId',
      task.processId
    );
  }
}

const createStdioChannel = (
  child: ChildProcess,
  handlers: {
    stdout: (
      emitter: (input: { channel: string } | typeof END) => void
    ) => (data: string) => void,
    stderr: (
      emitter: (input: { channel: string } | typeof END) => void
    ) => (data: string) => void,
    exit: (
      emitter: (input: { channel: string } | typeof END) => void
    ) => (code: number) => void,
  }
) => {
  return eventChannel(emitter => {
    child.stdout.on('data', handlers.stdout(emitter));
    child.stderr.on('data', handlers.stderr(emitter));
    child.on('exit', handlers.exit(emitter));

    return () => {
      // unsubscribe any listeners
      // since we don't have to worry about removing listeners
      // from EventEmitters, we don't need to return anything
      // here, but `eventChannel` must return a function or
      // it will throw
    };

    // NOTE: if this channel is ever used with async handlers, make sure to
    // use an expanding buffer in order to avoid losing any information
    // passed up by the child process. Initialize it at a length of 2 because
    // at bare minimum we expect to have 2 messages queued at some point (as
    // the exit channel completes, it should emit the return code of the process
    // and then immediately END.)
  });
};

// We're using "template" variables inside the project type configuration file (config/project-types.js)
// so with the following function we can replace the string $port with the real port number e.g. 3000
// (see type VariableMap for used mapping strings)
export const substituteConfigVariables = (
  configObject: any,
  variableMap: VariableMap
) => {
  // e.g. $port inside args will be replaced with variable reference from variabeMap obj. {$port: port}
  return Object.keys(configObject).reduce(
    (config, key) => {
      if (config[key] instanceof Array) {
        // replace $port inside args array
        config[key] = config[key].map(arg => variableMap[arg] || arg);
      } else {
        // check config[key] e.g. is {env: { PORT: '$port'} }
        if (config[key] instanceof Object) {
          // config[key] = {PORT: '$port'}, key = 'env'
          config[key] = Object.keys(config[key]).reduce(
            (newObj, nestedKey) => {
              // use replacement value if available
              newObj[nestedKey] =
                variableMap[newObj[nestedKey]] || newObj[nestedKey];
              return newObj;
            },
            { ...config[key] }
          );
        }
      }
      // todo: add top level substitution - not used yet but maybe needed later e.g. { env: $port } won't be replaced.
      //       Bad example but just to have it as reminder.
      return config;
    },
    { ...configObject }
  );
};

export const getDevServerCommand = (projectType: ProjectType) => {
  const config = projectConfigs[projectType];

  if (!config) {
    throw new Error('Unrecognized project type: ' + projectType);
  }

  // Substitution is needed as we'd like to have $port as args or in env
  // we can use it in either position and it will be subsituted with the port value here
  const devServer = substituteConfigVariables(config.devServer, {
    // pass every value that is needed in the commands here
  });

  return {
    args: devServer.args,
    env: devServer.env || {},
  };
};

export const stripUnusableControlCharacters = (text: string) =>
  // The control character '[1G' is meant to "Clear vertical tab stop at
  // current line". Unfortunately, it isn't correctly parsed, and shows
  // up in the output as "G".
  text.replace(/\[1G/g, '');

export const sendCommandToProcess = (child: ChildProcess, command: string) => {
  // Commands have to be suffixed with '\n' to signal that the command is
  // ready to be sent. Same as a regular command + hitting the enter key.
  child.stdin.write(`${command}\n`);
};

export default function* rootSaga(): Saga<void> {
  yield takeEvery(LAUNCH_DEV_SERVER, handleLaunchDevServer);
  // these saga handlers are named in reverse order (RUN_TASK => taskRun, etc.)
  // to avoid naming conflicts with their related actions (completeTask is
  // already an action creator).
  yield takeEvery(RUN_TASK, taskRun);
  yield takeEvery(ABORT_TASK, taskAbort);
  yield takeEvery(COMPLETE_TASK, taskComplete);
}
