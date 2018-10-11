// @flow
import type {
  PluginMenuItem,
  Command,
  ProjectInternal,
  PluginMenuRoot,
  PluginMenuRootInternal,
} from '../types';

function menuItemToMenu(
  menuItem: PluginMenuItem<string>,
  commands: Array<Command>
): PluginMenuItem<Command | void> {
  if (menuItem === '-') {
    return '-';
  }
  if (typeof menuItem === 'string') {
    return commands.find(c => c.identifier === menuItem);
  }

  return {
    items: menuItem.items
      .map(i => menuItemToMenu(i, commands))
      .filter(i => typeof i !== 'undefined'),
    title: menuItem.title,
  };
}

export function internalMenuToMenu(
  project: ProjectInternal,
  commands: Array<Command>
): PluginMenuRoot | void {
  const menu = (project.__skpm_manifest || {}).menu;
  if (!menu) {
    return undefined;
  }

  const itemsOrVoid: PluginMenuItem<Command | void>[] = (menu.items || []).map(
    i => menuItemToMenu(i, commands)
  );
  // $FlowFixMe
  const items: PluginMenuItem<Command>[] = itemsOrVoid.filter(
    i => typeof i !== 'undefined'
  );

  return {
    title: menu.title || (project.skpm || {}).name || project.name,
    isRoot: menu.isRoot,
    items,
  };
}

function menuToMenuItem(menu: PluginMenuItem<Command>): PluginMenuItem<string> {
  if (menu === '-') {
    return '-';
  }
  // if we have a command
  if (typeof menu.identifier !== 'undefined') {
    return menu.identifier;
  }
  // we have a submenu
  return {
    // $FlowFixMe
    items: menu.items.map(i => menuToMenuItem(i)),
    // $FlowFixMe
    title: menu.title,
  };
}

export function menuToInternalMenu(
  menu: PluginMenuRoot | void
): PluginMenuRootInternal | void {
  if (!menu) {
    return undefined;
  }

  const internalMenu: PluginMenuRootInternal = {};

  if (menu.isRoot) {
    internalMenu.isRoot = true;
  } else {
    internalMenu.title = menu.title;
  }

  if (menu.items) {
    internalMenu.items = menu.items
      .map(menuToMenuItem)
      .filter(i => typeof i !== 'undefined');
  }

  return internalMenu;
}
