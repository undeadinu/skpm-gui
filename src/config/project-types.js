// @flow

// project type configuration
// used for
// - create project command args
// - devServer name mapping
//
import type { ProjectType } from '../types';

const config: {
  [projectType: ProjectType]: {
    devServer: {
      taskName: string,
      args: Array<string>,
      env?: { [envKey: string]: string },
    },
    create: { args: (projectPath: string, name: string) => Array<string> },
  },
} = {
  empty: {
    devServer: {
      taskName: 'watch',
      args: ['run', 'watch'],
      env: {},
    },
    create: {
      // not sure if we need that nesting but I think there could be more to configure
      args: (projectPath, name) => [
        // used for project creation previous getBuildInstructions
        'create-sketch-plugin',
        projectPath,
        `--name="${name}"`,
      ],
    },
  },
  webview: {
    devServer: {
      taskName: 'watch',
      // gatsby needs -p instead of env for port changing
      args: ['run', 'watch'],
    },
    create: {
      // not sure if we need that nesting but I think there could be more to configure
      args: (projectPath, name) => [
        // used for project creation previous getBuildInstructions
        'create-sketch-plugin',
        projectPath, // todo replace later with config variables like $projectPath - so we can remove the function. Also check if it's getting complicated.
        '--template=skpm/with-webview',
        `--name="${name}"`,
      ],
    },
  },
  datasupplier: {
    devServer: {
      taskName: 'watch',
      args: ['run', 'watch'],
    },
    create: {
      args: (projectPath, name) => [
        'create-sketch-plugin', // later will be 'create-next-app' --> added a comment to the following issue https://github.com/segmentio/create-next-app/issues/30
        projectPath,
        '--template=skpm/with-datasupplier',
        `--name="${name}"`,
      ],
    },
  },
};

export default config;
