import * as vscode from "vscode";
import { StaredSnippet } from "../types";
import getSnippetItem from "./getSnippetItem";
import { starManager } from "../starManager";

class SnippetsProvider implements vscode.TreeDataProvider<StaredSnippet> {
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
  public getTreeItem(stared: StaredSnippet): vscode.TreeItem {
    return getSnippetItem(this.state, "stared-", stared);
  }
  public getChildren(): StaredSnippet[] {
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
