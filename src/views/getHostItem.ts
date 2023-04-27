import { Host } from '../types';
import { TreeItem, TreeItemCollapsibleState, ThemeIcon } from 'vscode';

export default function getHostItem(
  { host }: Host,
  isExpanded = false,
): TreeItem {
  return {
    label: host.replace(/\w+:\/\//, ''),
    contextValue: 'host',
    collapsibleState: isExpanded
      ? TreeItemCollapsibleState.Expanded
      : TreeItemCollapsibleState.Collapsed,
    iconPath: new ThemeIcon('remote-explorer-view-icon'),
  };
}
