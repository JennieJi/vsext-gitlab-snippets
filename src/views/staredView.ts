import * as vscode from "vscode";
import { SnippetFileExtended, StaredSnippet } from "../types";
import getSnippetItem from "./getSnippetItem";
import { starManager } from "../starManager";

export class StaredSnippetsProvider implements vscode.TreeDataProvider<StaredSnippet | SnippetFileExtended> {
  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
  private stared: ReturnType<typeof starManager>;
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor(stared: ReturnType<typeof starManager>) {
    this.stared = stared;
  }

  public reload() {
    this._onDidChangeTreeData.fire();
  }
  public getTreeItem(stared: StaredSnippet | SnippetFileExtended): vscode.TreeItem {
    if ((stared as SnippetFileExtended).path) {
      const { path, snippet } = stared as SnippetFileExtended;
      return getSnippetItem(snippet, path);
    }
    return getSnippetItem(stared as StaredSnippet);
  }
  public getChildren(el?: StaredSnippet): StaredSnippet[] | SnippetFileExtended[] {
    if (el) {
      return el.files.map(f => ({
        ...f,
        snippet: el,
      })) as SnippetFileExtended[];
    }
    return this.stared.get();
  }
}
