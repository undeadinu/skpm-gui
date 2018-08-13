// @flow
import slug from 'slug';
import random from 'random-seed';
import * as fs from 'fs';
import * as childProcess from 'child_process';

import { COLORS } from '../constants';
import { getDefaultParentPath } from '../reducers/paths.reducer';

import { FAKE_CRA_PROJECT } from './create-project.fixtures';

import type { ProjectType } from '../types';

// Change this boolean flag to skip project creation.
// Useful when working on the flow, to avoid having to wait for a real project
// to be created every time.
const DISABLE = false;

type ProjectInfo = {
  projectName: string,
  projectType: ProjectType,
  projectIcon: string,
};

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
  onStatusUpdate: (update: string) => void,
  onError: (err: string) => void,
  onComplete: (packageJson: any) => void
) => {
  if (DISABLE) {
    onComplete(FAKE_CRA_PROJECT);
    return;
  }

  const parentPath = getDefaultParentPath();

  // Create the projects directory, if this is the first time creating a
  // project.
  if (!fs.existsSync(parentPath)) {
    fs.mkdirSync(parentPath);
  }

  onStatusUpdate('Created parent directory');

  const id = slug(projectName).toLowerCase();

  const path = `${parentPath}/${id}`;

  const [instruction, ...args] = getBuildInstructions(projectType, {
    id,
    name: projectName,
  });

  const child = childProcess.spawn(instruction, args, {
    cwd: parentPath,
    env: {
      ...window.process.env,
      CI: true,
    },
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

    fs.writeFileSync(`${path}/assets/icon.png`, projectIcon, 'base64');

    onStatusUpdate('Dependencies installed');

    fs.readFile(`${path}/package.json`, 'utf8', (err, data) => {
      if (err) {
        return console.error(err);
      }

      const packageJson = JSON.parse(data);

      onComplete(packageJson);
    });
  });
};

// Exported so that getColorForProject can be tested
export const possibleProjectColors = [
  COLORS.hotPink[700],
  COLORS.pink[700],
  COLORS.red[700],
  COLORS.orange[700],
  COLORS.green[700],
  COLORS.teal[700],
  COLORS.violet[700],
  COLORS.purple[700],
];

export const getColorForProject = (projectName: string) => {
  const projectColorIndex = random
    .create(projectName)
    .range(possibleProjectColors.length);

  return possibleProjectColors[projectColorIndex];
};

export const getBuildInstructions = (
  projectType: ProjectType,
  { id, name }: { id: string, name: string }
) => {
  switch (projectType) {
    case 'empty':
      return ['npx', 'create-sketch-plugin@1.1.5', id, '--name=' + name];
    case 'webview':
      return [
        'npx',
        'create-sketch-plugin@1.1.5',
        id,
        '--name=' + name,
        '--template=skpm/with-webview',
      ];
    default:
      throw new Error('Unrecognized project type: ' + projectType);
  }
};
