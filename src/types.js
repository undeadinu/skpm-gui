// @flow
export type ProjectType = 'empty' | 'webview';

export type SubmittedProject = {
  projectName: string,
  projectType: ProjectType,
  projectIcon: string,
};

export type Log = {
  text: string,
  id: string,
};

// TODO: Better names:
export type TaskType = 'short-term' | 'sustained';

export type TaskStatus = 'idle' | 'pending' | 'success' | 'failed';
export type DependencyStatus = 'idle' | 'installing' | 'updating' | 'deleting';
export type DependencyLocation = 'dependencies' | 'devDependencies';
export type CommandStatus =
  | 'idle'
  | 'pending'
  | 'success'
  | 'failed'
  | 'installing'
  | 'updating'
  | 'deleting';

export type Task = {
  id: string,
  projectId: string,
  name: string,
  description: string,
  type: TaskType,
  status: TaskStatus,
  processId?: number,
  port?: number,
  command: string,
  timeSinceStatusChange: ?Date,
  logs: Array<Log>,
};

export type Repository = {
  type: string,
  url: string,
};

export type Dependency = {
  name: string,
  description: string,
  keywords?: Array<string>,
  version: string,
  homepage: string,
  license: string,
  repository: Repository,
  // All of the above fields are straight from the dependency's package.json.
  // The following two are derived values:
  // `status` is used to show loading indicators while performing actions on the dependency
  status: DependencyStatus,
  // `location` refers to where the dependency lives in the host project
  location: DependencyLocation,
};

export type CommandInternal = {
  name: string,
  identifier: string,
  shortcut?: string,
  script: string,
  handler?: string,
  handlers?: {
    [action: string]: string,
  },
};

export type PluginMenu<T> = {|
  title: string,
  items: PluginMenuItem<T>[], // eslint-disable-line no-use-before-define
|};

export type PluginMenuItem<T> = '-' | T | PluginMenu<T>;

export type PluginMenuRootInternal = {|
  title?: string,
  items: PluginMenuItem<string>[],
  isRoot?: boolean,
|};

export type Command = {|
  identifier: string,
  name: string,
  script: string,
  status: CommandStatus,
  shortcut?: string,
  status: CommandStatus,
  processId?: number,
  handler?: string,
  handlers?: {
    [action: string]: string,
  },
  timeSinceStatusChange: ?Date,
  logs: Array<Log>,
|};

export type PluginMenuRoot = {|
  title: string,
  items: PluginMenuItem<Command | void>[],
  isRoot?: boolean,
|};

/**
 * ProjectInternal is the behind-the-scenes type used in projects.reducer.
 * This is a copy of the project's package.json (which means it may have many
 * more fields, but these are the only ones I care about).
 */
export type ProjectInternal = {
  // NOTE: this `name` is the same as `guppy.id`. It's the actual name of the
  // project, in package.json.
  // The reason for this confusing discrepancy is that NPM package names are
  // lowercase-and-dash only, whereas I want Guppy projects to be able to use
  // any UTF-8 characters.
  name: string,
  author?: string,
  description?: string,
  homepage?: string,
  version: string,
  dependencies?: {
    [key: string]: string,
  },
  devDependencies?: {
    [key: string]: string,
  },
  scripts?: {
    [key: string]: string,
  },
  skpm?: {
    name?: string,
    manifest?: string,
    main?: string,
    assets?: string[],
  },
  __skpm_manifest?: {
    name?: string,
    appcast?: string,
    bundleVersion: 1,
    disableCocoaScriptPreprocessor?: boolean,
    commands: CommandInternal[],
    menu?: PluginMenuRootInternal,
  },
  __skpm_icon?: string,
  __skpm_createdAt: number,
};

export type Project = {
  // `id` here is equal to `name` in `ProjectInternal`
  id: string,
  // `name` is the friendly name, with full UTF-8 character access.
  name: string,
  icon?: string,
  createdAt: number,
  // `dependencies` is a "souped-up" version of the internal copy, with some
  // additional fields, like description, homepage, repository...
  // It also holds the specific version number used, not just an acceptable
  // version range.
  dependencies: Array<Dependency>,
  // `tasks` is a superset of `ProjectInternal.scripts`. Includes much more
  // info.
  tasks: Array<Task>,
  // `path` is the project's on-disk location.
  path: string,
  manifestPath: string,
  commands: Array<Command>,
  pluginMenu: PluginMenuRoot,
};

export type ProjectsMap = { [id: string]: Project };
