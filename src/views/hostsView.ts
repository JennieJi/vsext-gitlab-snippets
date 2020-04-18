import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  Memento,
  TreeItemCollapsibleState,
  window,
  ThemeIcon,
} from 'vscode';
import { Host, Snippet } from '../types';
import getSnippetItem from '../getSnippetItem';
import SnippetRegistry from '../SnippetRegistry';
import hostManager from '../hostManager';
import commandName from '../commandName';

class SnippetsProvider implements TreeDataProvider<Host | Snippet> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  private state: Memento;
  private activeLimit: number;

  private _activeHost: string | undefined;
  get activeHost() {
    return this._activeHost || '';
  }
  set activeHost(val: string) {
    this._activeHost = val;
    this.activeLimit = 20;
  }

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  constructor(state: Memento) {
    this.state = state;
    this.activeLimit = 20;
  }

  private getHosts() {
    return hostManager(this.state).get();
  }

  private getHostItem({ host }: Host): TreeItem {
    return {
      label: host,
      id: host,
      contextValue: 'host',
      collapsibleState:
        this.activeHost === host
          ? TreeItemCollapsibleState.Expanded
          : TreeItemCollapsibleState.Collapsed,
      iconPath: ThemeIcon.Folder,
      command: {
        command: commandName('toggleHost'),
        title: 'Expand/collapse host list',
      },
    };
  }

  private getLoadMoreItem(): TreeItem {
    return {
      label: 'Load more ...',
      id: `${this.activeHost}-loadmore`,
      iconPath: new ThemeIcon('chevron-down'),
      command: {
        command: commandName('exploreMore'),
        title: 'More',
      },
    };
  }

  public reload() {
    this._onDidChangeTreeData.fire();
  }
  public openLastest() {
    const hosts = this.getHosts();
    this.activeHost = hosts?.[0]?.host;
    this.reload();
  }
  public loadMore() {}

  public getChildren(el?: Host): Thenable<Host[] | Snippet[]> {
    if (!el) {
      return Promise.resolve(this.getHosts());
    } else {
      const registry = new SnippetRegistry(el);
      return registry
        .getSnippets(1, this.activeLimit)
        .then((snippets) =>
          snippets.length === this.activeLimit
            ? [...snippets, {} as Snippet]
            : snippets
        );
    }
  }

  public getTreeItem(el: Host | Snippet): TreeItem {
    if ((el as Host).host) {
      return this.getHostItem(el as Host);
    }
    if ((el as Snippet).id) {
      return getSnippetItem(el as Snippet);
    }
    return this.getLoadMoreItem();
  }
}

export default function registerView(state: Memento) {
  const dataProvider = new SnippetsProvider(state);
  return {
    view: window.createTreeView('gitlabSnippetsExplorer-all', {
      treeDataProvider: dataProvider,
    }),
    dataProvider,
  };
}
