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
export type DependencyStatus =
  | 'idle'
  | 'queued-install'
  | 'queued-update'
  | 'queued-delete'
  | 'installing'
  | 'updating'
  | 'deleting';
export type DependencyLocation = 'dependencies' | 'devDependencies';
export type CommandStatus =
  | 'idle'
  | 'pending'
  | 'success'
  | 'failed'
  | 'installing'
  | 'updating'
  | 'deleting';
export type QueueAction = 'install' | 'uninstall';
export type QueuedDependency = {
  name: string,
  version?: string,
  updating?: boolean,
};

export type Task = {
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

export type PluginMenuRootInternal = {
  title?: string,
  items?: PluginMenuItem<string>[],
  isRoot?: boolean,
};

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
  items: PluginMenuItem<Command>[],
  isRoot?: boolean,
|};

/**
 * ProjectInternal is the behind-the-scenes type used in projects.reducer.
 * This is a copy of the project's package.json (which means it may have many
 * more fields, but these are the only ones I care about).
 */
export type ProjectInternal = {
  // This is the project's lowercase, slugified name. Eg. "hello-world"
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
    bundleVersion?: 1,
    disableCocoaScriptPreprocessor?: boolean,
    commands?: CommandInternal[],
    menu?: PluginMenuRootInternal,
  },
  __skpm_icon?: string,
  __skpm_createdAt: number,
};

/**
 * While the `ProjectInternal` type above is just a representation of the
 * project's package.json, we also have a `Project` type. This type is meant
 * to be used within the React app, and wraps up a number of reducers:
 *
 * - tasks from tasks.reducer
 * - dependencies from dependencies.reducer
 * - project path on disk from path.reducer
 *
 * It also provides a limited subset of the `ProjectInternal` type, to abstract
 * away some of the peculiarities (such as the difference between project.name
 * and project.skpm.name).
 */
export type Project = {
  // `id` here is equal to `name` in `ProjectInternal`
  id: string,
  // `name` is the friendly name, with full UTF-8 character access.
  name: string,
  description?: string,
  homepage?: string,
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
  pluginMenu: PluginMenuRoot | void,
};

export type ProjectsMap = { [id: string]: Project };
