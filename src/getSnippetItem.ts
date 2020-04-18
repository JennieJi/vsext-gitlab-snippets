import * as vscode from 'vscode';
import { Snippet } from './types';
import commandName from './commandName';

export default function getSnippetItem(
  prefix: string,
  snippet: Snippet
): vscode.TreeItem {
  const { raw_url: id, title: label, file_name: description } = snippet;
  return {
    label,
    id: prefix + id,
    contextValue: 'snippet',
    description,
    iconPath: vscode.ThemeIcon.File,
    command: {
      command: commandName('viewSnippet'),
      arguments: [snippet],
      title: `Preview snippet`,
    },
  };
}
