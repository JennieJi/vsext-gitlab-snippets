import { Host } from '../types';
import { TreeItem, TreeItemCollapsibleState, ThemeIcon } from 'vscode';

export default function getHostItem(
  { host }: Host,
  isExpanded = false,
  prefix: string
): TreeItem {
  return {
    label: host.replace(/\w+:\/\//, ''),
    id: prefix + host,
    contextValue: 'host',
    collapsibleState: isExpanded
      ? TreeItemCollapsibleState.Expanded
      : TreeItemCollapsibleState.Collapsed,
    iconPath: new ThemeIcon('remote-explorer-view-icon'),
  };
}
