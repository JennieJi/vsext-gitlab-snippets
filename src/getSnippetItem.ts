import * as vscode from 'vscode';
import { Snippet } from './types';
import commandName from './commandName';

export default function getSnippetItem(snippet: Snippet): vscode.TreeItem {
  const { id, title, file_name, description } = snippet;
  return {
    label: `${file_name} - ${title}`,
    id: '' + id,
    contextValue: 'snippet',
    description: description || '',
    iconPath: vscode.ThemeIcon.File,
    command: {
      command: commandName('viewSnippet'),
      arguments: [snippet],
      title: `Preview snippet`,
    },
  };
}
