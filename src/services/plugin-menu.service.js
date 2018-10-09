// @flow
import type { PluginMenuItem, Command } from '../types';

export function menuToMenu(
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
      .map(i => menuToMenu(i, commands))
      .filter(i => typeof i !== 'undefined'),
    title: menuItem.title,
  };
}
