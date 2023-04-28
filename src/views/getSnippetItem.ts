import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { SnippetExtended } from "../types";
import commandName from "../commandName";

export default function getSnippetItem(
  snippet: SnippetExtended,
  path?: string,
  {
    hideAuthor
  }: {
    hideAuthor?: boolean;
  } = {}
): TreeItem {
  const { title, file_name: fileName, author, files, description: tooltip } = snippet;
  const item = new TreeItem(title);
  if (!path && files.length > 1) {
    item.contextValue = "snippetRepo",
      item.description = hideAuthor ? '' : `- ${author.name}`,
      item.iconPath = new ThemeIcon("repo"),
      item.collapsibleState = TreeItemCollapsibleState.Collapsed,
      item.tooltip = tooltip;
  } else {
    item.command = {
      command: commandName("viewSnippet"),
      arguments: [snippet, path],
      title: `Preview snippet`,
    };
    item.iconPath = new ThemeIcon("code");
    if (path) {
      item.label = path;
      item.contextValue = "snippetFile";
    } else {
      item.contextValue = "snippet";
      item.description = hideAuthor ? fileName : `${fileName} - ${author.name}`;
      item.tooltip = tooltip;
    }
  }
  return item;
}
