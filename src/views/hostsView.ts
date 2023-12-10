import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  ThemeIcon,
} from "vscode";
import throttle from "lodash.throttle";
import { Host, Snippet, SnippetExtended, SnippetFileExtended } from "../types";
import getSnippetItem from "./getSnippetItem";
import getHostItem from "./getHostItem";
import hostManager from "../hostManager";
import commandName from "../commandName";
import SnippetRegistry from "../SnippetRegistry";

const PER_PAGE = 20;

export class HostSnippetsProvider implements TreeDataProvider<Host | SnippetExtended | SnippetFileExtended> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private hosts: ReturnType<typeof hostManager>;
  private activeLimit: number = PER_PAGE;

  constructor(hosts: ReturnType<typeof hostManager>) {
    this.hosts = hosts;
  }

  private _reload = throttle(() => this._onDidChangeTreeData.fire(), 200);
  public reload(host?: string) {
    if (host) {
      this.hosts.setLastUse(host);
    }
    this._reload();
  }

  private getLoadMoreItem(): TreeItem {
    return {
      label: "Load more ...",
      iconPath: new ThemeIcon("chevron-down"),
      command: {
        command: commandName("exploreMore"),
        title: "More",
      },
    };
  }

  private getSnippets(host: Host): Promise<SnippetExtended[]> {
    const registry = new SnippetRegistry(host);
    return registry.getSnippets(1, this.activeLimit)
      .then(snippets =>
        snippets.map(s => ({ ...s, host: host.host }))
      );
  }

  public loadMore() {
    this.activeLimit += PER_PAGE;
    this.reload();
  }

  public async getChildren(el?: Host | SnippetExtended): Promise<Host[] | SnippetExtended[] | SnippetFileExtended[]> {
    if (!el) {
      return this.hosts.get();
    }
    if ((el as SnippetExtended).id) {
      return (el as SnippetExtended).files.map(f => ({
        ...f,
        snippet: el
      } as SnippetFileExtended));
    }
    return this.getSnippets(el as Host).then(snippets =>
      snippets.length === this.activeLimit
        ? [...snippets, {} as SnippetExtended]
        : snippets
    );
  }

  public getTreeItem(el: Host | SnippetExtended | SnippetFileExtended): TreeItem {
    if ((el as SnippetFileExtended).path) {
      const { path, snippet } = el as SnippetFileExtended;
      return getSnippetItem(snippet, path);
    }
    if ((el as Snippet).id) {
      return getSnippetItem(el as SnippetExtended);
    }
    if ((el as Host).host) {
      return getHostItem(el as Host, this.hosts.getLastUse() === (el as Host).host);
    }
    return this.getLoadMoreItem();
  }
}
