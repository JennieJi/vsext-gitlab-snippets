import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  Memento,
  window,
  ThemeIcon,
} from "vscode";
import { Host, Snippet } from "../types";
import getSnippetItem from "./getSnippetItem";
import getHostItem from "./getHostItem";
import SnippetRegistry from "../SnippetRegistry";
import hostManager from "../hostManager";
import commandName from "../commandName";

const PER_PAGE = 20;

export class SnippetsProvider implements TreeDataProvider<Host | Snippet> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private state: Memento;
  private activeLimit: number;

  private _activeHost: string | undefined;
  get activeHost() {
    return this._activeHost || "";
  }
  set activeHost(val: string) {
    this._activeHost = val;
    this.activeLimit = PER_PAGE;
  }

  constructor(state: Memento) {
    this.state = state;
    this.activeLimit = PER_PAGE;
  }

  private getHosts() {
    return hostManager(this.state).get();
  }

  private getLoadMoreItem(): TreeItem {
    return {
      label: "Load more ...",
      id: `${this.activeHost}-loadmore`,
      iconPath: new ThemeIcon("chevron-down"),
      command: {
        command: commandName("exploreMore"),
        title: "More",
      },
    };
  }

  private getSnippets(host: Host) {
    const registry = new SnippetRegistry(host);
    return registry.getSnippets(1, this.activeLimit);
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
  public loadMore() {
    this.activeLimit += PER_PAGE;
    this._onDidChangeTreeData.fire();
  }

  public getChildren(el?: Host): Thenable<Host[] | Snippet[]> {
    if (!el) {
      return Promise.resolve(this.getHosts());
    } else {
      return this.getSnippets(el).then((snippets) =>
        snippets.length === this.activeLimit
          ? [...snippets, {} as Snippet]
          : snippets
      );
    }
  }

  public getTreeItem(el: Host | Snippet): TreeItem {
    if ((el as Host).host) {
      return getHostItem(el as Host, this.activeHost === (el as Host).host);
    }
    if ((el as Snippet).id) {
      return getSnippetItem(this.state, "host-", el as Snippet);
    }
    return this.getLoadMoreItem();
  }
}

export default function registerView(state: Memento) {
  const dataProvider = new SnippetsProvider(state);
  return {
    view: window.createTreeView("gitlabSnippetsExplorer-all", {
      treeDataProvider: dataProvider,
    }),
    dataProvider,
  };
}
