import { Host } from '../types';
import { TreeItem, TreeItemCollapsibleState, ThemeIcon } from 'vscode';
import commandName from '../commandName';

export default function getHostItem(
  { host }: Host,
  isExpanded = false
): TreeItem {
  return {
    label: host.replace(/\w+:\/\//, ''),
    id: host,
    contextValue: 'host',
    collapsibleState: isExpanded
      ? TreeItemCollapsibleState.Expanded
      : TreeItemCollapsibleState.Collapsed,
    iconPath: ThemeIcon.Folder,
    command: {
      command: commandName('toggleHost'),
      title: 'Expand/collapse host list',
    },
  };
}
