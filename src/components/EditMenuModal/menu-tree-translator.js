// @flow
import type { PluginMenuRoot, PluginMenuItem, Command } from '../../types';
import type { Tree } from './types';

export const separatorNode = (): Tree => ({
  expanded: true,
  title: '-- Separator --',
  type: 'separator',
});

export const commandNode = (command: Command): Tree => ({
  expanded: true,
  title: command.name,
  identifier: command.identifier,
  type: 'command',
});

export const submenuNode = (title: string, children: Tree[]): Tree => ({
  expanded: true,
  title,
  children,
  type: 'submenu',
});

export const rootNode = (title: string, children: Tree[]): Tree => ({
  expanded: true,
  title,
  children,
  type: 'root',
});

function menuToTree(item: PluginMenuItem<Command | void>): Tree {
  if (!item) {
    return separatorNode();
  } else if (item === '-') {
    return separatorNode();
  } else if (item.title) {
    return submenuNode(item.title, item.items.map(i => menuToTree(i)));
  } else if (item.identifier) {
    return commandNode(item);
  } else {
    throw new Error('impossible');
  }
}

function treeToMenu(
  tree: Tree,
  commands: Array<Command>
): PluginMenuItem<Command | void> {
  if (tree.type === 'separator') {
    return '-';
  } else if (tree.type === 'submenu') {
    return {
      title: tree.title,
      items: tree.items.map(treeToMenu),
    };
  } else if (tree.type === 'command') {
    return commands.find(command => command.identifier === tree.identifier);
  } else {
    throw new Error('impossible');
  }
}

export function rootMenuToTree(menu: PluginMenuRoot): Array<Tree> {
  return menu.isRoot
    ? menu.items.map(menuToTree)
    : [rootNode(menu.title, menu.items.map(menuToTree))];
}

export function treeToRootMenu(
  tree: Array<Tree>,
  commands: Array<Command>
): PluginMenuRoot {
  const isRoot = tree[0].type !== 'root';
  return isRoot
    ? {
        isRoot: true,
        title: '',
        items: tree.map(t => treeToMenu(t, commands)),
      }
    : {
        title: tree[0].title,
        items: tree[0].items.map(t => treeToMenu(t, commands)),
      };
}
