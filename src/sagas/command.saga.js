// @flow
import { select, call, put, take, takeEvery } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import { ipcRenderer } from 'electron';
import * as childProcess from 'child_process';
import * as path from 'path';
import chalkRaw from 'chalk';

import {
  RUN_COMMAND,
  ABORT_COMMAND,
  COMPLETE_COMMAND,
  completeCommand,
  attachCommandMetadata,
  receiveDataFromCommandExecution,
} from '../actions';
import { getPathForProjectId } from '../reducers/paths.reducer';
import killProcessId from '../services/kill-process-id.service';
import { getBaseProjectEnvironment } from '../services/platform.service';

import type { Saga } from 'redux-saga';
import type { Command, Project } from '../types';
import type { ChildProcess } from 'child_process';

const chalk = new chalkRaw.constructor({ level: 3 });

const SKETCH_PATH = '/Applications/Sketch.app';

export function* commandRun({
  command,
  project,
}: {
  command: Command,
  project: Project,
}): Saga<void> {
  const projectPath = yield select(getPathForProjectId, {
    projectId: command.projectId,
  });
  const { identifier } = command;

  const child = yield call(
    [childProcess, childProcess.spawn],
    path.join(SKETCH_PATH, './Contents/Resources/sketchtool/bin/sketchtool'),
    ['run', project.pluginPath, identifier, '--without-activating'],
    {
      cwd: projectPath,
      env: getBaseProjectEnvironment(projectPath),
    }
  );

  // TODO: Does the renderer process still need to know about the child
  // processId?
  yield put(attachCommandMetadata(command, child.pid));

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

      emitter({ channel: 'stderr', text });
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
        yield put(receiveDataFromCommandExecution(command, message.text));
        break;

      case 'stderr':
        yield put(receiveDataFromCommandExecution(command, message.text));
        break;

      case 'exit':
        yield call(displayCommandComplete, command, message.wasSuccessful);
        yield put(
          completeCommand(command, message.timestamp, message.wasSuccessful)
        );
        break;

      default:
        throw new Error('Unexpected channel for message: ' + message.channel);
    }
  }
}

export function* commandAbort({ command }: { command: Command }): Saga<void> {
  const { processId } = command;

  yield call(killProcessId, processId);
  yield call([ipcRenderer, ipcRenderer.send], 'removeProcessId', processId);

  // Once the children are killed, we should dispatch a notification
  // so that the terminal shows something about this update.
  // My initial thought was that all tasks would have the same message,
  // but given that we're treating `start` as its own special thing,
  // I'm realizing that it should vary depending on the task type.
  // TODO: Find a better place for this to live.
  const abortMessage = 'Command aborted';

  yield put(
    receiveDataFromCommandExecution(command, chalk.bold.red(abortMessage))
  );
}

export function* displayCommandComplete(
  task: Command,
  wasSuccessful: boolean
): Saga<void> {
  // Send a message to add info to the terminal about the task being done.
  // TODO: ASCII fish art?

  const message = wasSuccessful
    ? chalk.bold.green('Command completed')
    : chalk.bold.red('Command failed');

  yield put(receiveDataFromCommandExecution(task, message));
}

export function* commandComplete({
  command,
}: {
  command: Command,
}): Saga<void> {
  if (command.processId) {
    yield call(
      [ipcRenderer, ipcRenderer.send],
      'removeProcessId',
      command.processId
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
  // these saga handlers are named in reverse order (RUN_TASK => taskRun, etc.)
  // to avoid naming conflicts with their related actions (completeTask is
  // already an action creator).
  yield takeEvery(RUN_COMMAND, commandRun);
  yield takeEvery(ABORT_COMMAND, commandAbort);
  yield takeEvery(COMPLETE_COMMAND, commandComplete);
}
