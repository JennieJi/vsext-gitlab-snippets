import * as vscode from "vscode";
import { SnippetFileExtended, StaredSnippet } from "../types";
import getSnippetItem from "./getSnippetItem";
import { starManager } from "../starManager";

class SnippetsProvider implements vscode.TreeDataProvider<StaredSnippet | SnippetFileExtended> {
  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
  private state: vscode.Memento;
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor(state: vscode.Memento) {
    this.state = state;
  }

  public reload() {
    this._onDidChangeTreeData.fire();
  }
  public getTreeItem(stared: StaredSnippet | SnippetFileExtended): vscode.TreeItem {
    if ((stared as SnippetFileExtended).path) {
      const { path, snippet } = stared as SnippetFileExtended;
      return getSnippetItem(this.state, "stared-", snippet, path);
    }
    return getSnippetItem(this.state, "stared-", stared as StaredSnippet);
  }
  public getChildren(el?: StaredSnippet): StaredSnippet[] | SnippetFileExtended[] {
    if (el) {
      return el.files.map(f => ({
        ...f,
        snippet: el,
      })) as SnippetFileExtended[];
    }
    return starManager(this.state).get();
  }
}

export default function registerView(state: vscode.Memento) {
  const dataProvider = new SnippetsProvider(state);
  return {
    view: vscode.window.createTreeView("gitlabSnippetsExplorer-stared", {
      treeDataProvider: dataProvider,
    }),
    dataProvider,
  };
}
