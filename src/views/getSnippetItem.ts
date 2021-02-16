import { Memento, ThemeIcon, TreeItem } from "vscode";
import { Snippet } from "../types";
import commandName from "../commandName";

export default function getSnippetItem(
  state: Memento,
  prefix: string,
  snippet: Snippet
): TreeItem {
  const { raw_url: id, title: label, file_name: fileName, author } = snippet;
  return {
    label,
    id: prefix + id,
    contextValue: "snippet",
    description: `${fileName} - ${author.name}`,
    iconPath: new ThemeIcon("code"),
    command: {
      command: commandName("viewSnippet"),
      arguments: [state, snippet],
      title: `Preview snippet`,
    },
  };
}
