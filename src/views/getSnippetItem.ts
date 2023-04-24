import { Memento, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { Snippet } from "../types";
import commandName from "../commandName";

export default function getSnippetItem(
  state: Memento,
  prefix: string,
  snippet: Snippet,
  path?: string,
  {
    hideAuthor
  }: {
    hideAuthor?: boolean;
  } = {}
): TreeItem {
  const { raw_url: url, title, file_name: fileName, author, files, description: tooltip } = snippet;
  if (!path && files.length > 1) {
    return {
      label: title,
      id: prefix + url,
      contextValue: "snippetRepo",
      description: hideAuthor ? '' : `- ${author.name}`,
      iconPath: new ThemeIcon("repo"),
      collapsibleState: TreeItemCollapsibleState.Collapsed,
      tooltip,
    };
  }
  const command = {
    command: commandName("viewSnippet"),
    arguments: [state, snippet, path],
    title: `Preview snippet`,
  };
  if (path) {
    return {
      label: path,
      id: prefix + path,
      contextValue: "snippetFile",
      description: '',
      iconPath: new ThemeIcon("code"),
      command,
    };
  }
  return {
    label: title,
    id: prefix + url,
    contextValue: "snippet",
    description: hideAuthor ? fileName : `${fileName} - ${author.name}`,
    iconPath: new ThemeIcon("code"),
    command,
    tooltip,
  };
}
