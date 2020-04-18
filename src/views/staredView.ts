import * as vscode from 'vscode';
import { StaredSnippet } from '../types';
import getSnippetItem from '../getSnippetItem';
import starManager from '../starManager';

class SnippetsProvider implements vscode.TreeDataProvider<StaredSnippet> {
  private snippets: StaredSnippet[];
  private _onDidChangeTreeData: vscode.EventEmitter<
    any
  > = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor(snippets: StaredSnippet[]) {
    this.snippets = snippets;
  }

  public reload() {
    this._onDidChangeTreeData.fire();
  }
  public getTreeItem(stared: StaredSnippet): vscode.TreeItem {
    return getSnippetItem(stared.snippet);
  }
  public getChildren(): StaredSnippet[] {
    return this.snippets;
  }
}

export default function registerView(state: vscode.Memento) {
  const snippets = starManager(state).get();
  const dataProvider = new SnippetsProvider(snippets);
  return {
    view: vscode.window.createTreeView('gitlabSnippetsExplorer-stared', {
      treeDataProvider: dataProvider,
    }),
    dataProvider,
  };
}
