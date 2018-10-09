type Separator = {
  title: '-',
  expanded: true,
  type: 'separator',
};

type SubMenu = {
  title: string,
  expanded: true,
  type: 'submenu',
  children: Tree[],
};

type Root = {
  title: string,
  expanded: true,
  type: 'root',
  children: Tree[],
};

type Command = {
  title: string,
  identifier: string,
  expanded: true,
  type: 'command',
};

export type Tree = Separator | SubMenu | Root | Command;
