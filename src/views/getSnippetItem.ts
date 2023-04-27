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
  if (!path && files.length > 1) {
    return {
      label: title,
      contextValue: "snippetRepo",
      description: hideAuthor ? '' : `- ${author.name}`,
      iconPath: new ThemeIcon("repo"),
      collapsibleState: TreeItemCollapsibleState.Collapsed,
      tooltip,
    };
  }
  const command = {
    command: commandName("viewSnippet"),
    arguments: [snippet, path],
    title: `Preview snippet`,
  };
  if (path) {
    return {
      label: path,
      contextValue: "snippetFile",
      description: '',
      iconPath: new ThemeIcon("code"),
      command,
    };
  }
  return {
    label: title,
    contextValue: "snippet",
    description: hideAuthor ? fileName : `${fileName} - ${author.name}`,
    iconPath: new ThemeIcon("code"),
    command,
    tooltip,
  };
}
