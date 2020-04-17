import * as vscode from 'vscode';
import { Snippet, Host } from './types';
import commandName from './commandName';

class SnippetsProvider implements vscode.TreeDataProvider<Snippet> {
  private snippets: Snippet[];
  private _onDidChangeTreeData: vscode.EventEmitter<
    any
  > = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor(snippets: Snippet[]) {
    this.snippets = snippets;
  }

  public getTreeItem(snippet: Snippet): vscode.TreeItem {
    const { id, title, file_name, description } = snippet;
    return {
      label: `${file_name} - ${title}`,
      id: '' + id,
      description: description || '',
      command: {
        command: commandName('view'),
        arguments: [snippet],
        title: `Preview snippet`,
      },
    };
  }

  public getChildren(): Snippet[] | Thenable<Snippet[]> {
    return this.snippets;
  }
}

function registerView(id: string, snippets: Snippet[]) {
  const dataProvider = new SnippetsProvider(snippets);
  return {
    view: vscode.window.createTreeView(id, {
      treeDataProvider: dataProvider,
    }),
    dataProvider,
  };
}
export default registerView;
