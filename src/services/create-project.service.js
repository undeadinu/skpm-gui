// @flow
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { loadProject } from './read-from-disk.service';
import { enableDevMode } from './dev-mode.service';

import { getSlug } from '../utils';
import {
  formatCommandForPlatform,
  getBaseProjectEnvironment,
} from './platform.service';

import { FAKE_CRA_PROJECT } from './create-project.fixtures';

import type { ProjectType, ProjectInternal } from '../types';

// Change this boolean flag to skip project creation.
// Useful when working on the flow, to avoid having to wait for a real project
// to be created every time.
const DISABLE = false;

type ProjectInfo = {
  projectName: string,
  projectType: ProjectType,
  projectIcon?: string | null,
};

export const checkIfProjectExists = (dir: string, projectName: string) =>
  fs.existsSync(path.join(dir, projectName));

/**
 * This service manages the creation of a new project.
 * It is in charge of interfacing with the host machine to:
 *   1) Figure out if it needs to install any dependencies
 *      I'm gonna assume that installing Guppy also installs Node.
 *
 *   2) Generate the project directory, if it doesn't already exist
 *
 *   3) Using skpm to generate a new project
 *
 * TODO: Ew callbacks. I can't just use a promise, though, since it needs to
 * fire multiple times, to handle updates mid-creation. Maybe an observable?
 */
export default (
  { projectName, projectType, projectIcon }: ProjectInfo,
  projectHomePath: string,
  onStatusUpdate: (update: string) => void,
  onError: (err: string) => void,
  onComplete: (packageJson: ProjectInternal) => void
) => {
  if (DISABLE) {
    onComplete(FAKE_CRA_PROJECT);
    return;
  }

  // Create the projects directory, if this is the first time creating a
  // project.
  if (!fs.existsSync(projectHomePath)) {
    fs.mkdirSync(projectHomePath);
  }

  // do it async, don't really care
  enableDevMode();

  onStatusUpdate('Created parent directory');

  const projectDirectoryName = getSlug(projectName);

  // For Windows Support
  // To support cross platform with slashes and escapes
  const projectPath = path.join(projectHomePath, projectDirectoryName);

  const [instruction, ...args] = getBuildInstructions(projectType, {
    id: projectDirectoryName,
    name: projectName,
  });

  const child = childProcess.spawn(instruction, args, {
    cwd: projectHomePath,
    env: {
      ...getBaseProjectEnvironment(projectPath),
      CI: true,
    },
    shell: true,
  });

  let hasError = false;

  child.stdout.on('data', onStatusUpdate);
  child.stderr.on('data', onError);
  child.on('error', err => {
    hasError = true;
    onError(err);
  });

  // TODO: This code could be a lot nicer.
  // Maybe promisify some of these callback APIs to avoid callback hell?
  child.on('close', () => {
    if (hasError) {
      return;
    }

    if (projectIcon) {
      fs.writeFileSync(
        path.join(projectPath, 'assets', 'icon.png'),
        projectIcon,
        'base64'
      );
    }

    onStatusUpdate('Dependencies installed');

    loadProject(projectPath)
      .then(onComplete)
      .catch(console.error);
  });
};

//
//
// Helpers
//

export const getBuildInstructions = (
  projectType: ProjectType,
  { id, name }: { id: string, name: string }
) => {
  // For Windows Support
  // Windows tries to run command as a script rather than on a cmd
  // To force it we add *.cmd to the commands
  const command = formatCommandForPlatform('npx');
  switch (projectType) {
    case 'empty':
      return [command, 'create-sketch-plugin', id, `--name="${name}"`];
    case 'webview':
      return [
        command,
        'create-sketch-plugin',
        id,
        `--name="${name}"`,
        '--template=skpm/with-webview',
      ];
    case 'datasupplier':
      return [
        command,
        'create-sketch-plugin',
        id,
        `--name="${name}"`,
        '--template=skpm/with-datasupplier',
      ];
    default:
      throw new Error('Unrecognized project type: ' + projectType);
  }
};
