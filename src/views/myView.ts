import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  Memento,
  window,
} from 'vscode';
import { Host, Snippet } from '../types';
import getSnippetItem from './getSnippetItem';
import getHostItem from './getHostItem';
import SnippetRegistry from '../SnippetRegistry';
import hostManager from '../hostManager';

export class SnippetsProvider implements TreeDataProvider<Host | Snippet> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private state: Memento;

  private _activeHost: string | undefined;
  get activeHost() {
    return this._activeHost || '';
  }
  set activeHost(val: string) {
    this._activeHost = val;
  }

  constructor(state: Memento) {
    this.state = state;
  }

  private getHosts() {
    return hostManager(this.state).get();
  }

  private getSnippets(host: Host) {
    const registry = new SnippetRegistry(host);
    return registry.getUserSnippets();
  }

  public reload(host?: Host) {
    if (host) {
      this.activeHost = host.host;
    }
    this._onDidChangeTreeData.fire();
  }
  public openLastest() {
    const hosts = this.getHosts();
    this.activeHost = hosts?.[0]?.host;
    this.reload();
  }

  public getChildren(el?: Host): Thenable<Host[] | Snippet[]> {
    if (!el) {
      return Promise.resolve(this.getHosts());
    }
    return this.getSnippets(el);
  }

  public getTreeItem(el: Host | Snippet): TreeItem {
    if ((el as Host).host) {
      return getHostItem(el as Host, this.activeHost === (el as Host).host);
    }
    return getSnippetItem('host-', el as Snippet);
  }
}

export default function registerView(state: Memento) {
  const dataProvider = new SnippetsProvider(state);
  return {
    view: window.createTreeView('gitlabSnippetsExplorer-mine', {
      treeDataProvider: dataProvider,
    }),
    dataProvider,
  };
}
