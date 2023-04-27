import { Host } from '../types';
import { TreeItem, TreeItemCollapsibleState, ThemeIcon } from 'vscode';

export default function getHostItem(
  { host }: Host,
  isExpanded = false,
): TreeItem {
  const item = new TreeItem(host.replace(/\w+:\/\//, ''), isExpanded
    ? TreeItemCollapsibleState.Expanded
    : TreeItemCollapsibleState.Collapsed);
  item.contextValue = 'host';
  item.iconPath = new ThemeIcon('remote-explorer-view-icon');
  return item;
}
