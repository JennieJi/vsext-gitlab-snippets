import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  ThemeIcon,
} from "vscode";
import { Host, Snippet, SnippetExtended, SnippetFileExtended } from "../types";
import getSnippetItem from "./getSnippetItem";
import getHostItem from "./getHostItem";
import hostManager from "../hostManager";
import commandName from "../commandName";

const PER_PAGE = 20;

export class HostSnippetsProvider implements TreeDataProvider<Host | SnippetExtended | SnippetFileExtended> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private hosts: ReturnType<typeof hostManager>;
  private activeLimit: number = PER_PAGE;

  constructor(hosts: ReturnType<typeof hostManager>) {
    this.hosts = hosts;
  }

  public reload(host?: string) {
    if (host) {
      this.hosts.lastUse = host;
    }
    this._onDidChangeTreeData.fire();
  }

  private getHosts() {
    const storedHosts = this.hosts.get();
    if (storedHosts.find(h => h.host === 'https://gitlab.com' || h.host === 'https://www.gitlab.com/')) {
      return storedHosts;
    }
    return [...storedHosts,
    {
      host: 'https://gitlab.com',
      token: 'glpat-vuVzP8sbzKZHBYRcXmyB',
      version: 4,
    }];
  }

  private getLoadMoreItem(): TreeItem {
    return {
      label: "Load more ...",
      id: `${this.hosts.lastUse}-loadmore`,
      iconPath: new ThemeIcon("chevron-down"),
      command: {
        command: commandName("exploreMore"),
        title: "More",
      },
    };
  }

  private getSnippets(host: string): Promise<SnippetExtended[]> {
    const hostRegistry = this.hosts.getById(host);
    if (hostRegistry) {
      return hostRegistry.registry.getSnippets(1, this.activeLimit)
        .then(snippets =>
          snippets.map(s => ({ ...s, host }))
        );
    }
    return Promise.reject('Host not found');
  }

  public loadMore() {
    this.activeLimit += PER_PAGE;
    this._onDidChangeTreeData.fire();
  }

  public async getChildren(el?: Host | SnippetExtended): Promise<Host[] | SnippetExtended[] | SnippetFileExtended[]> {
    if (!el) {
      return this.getHosts();
    }
    if ((el as SnippetExtended).id) {
      return (el as SnippetExtended).files.map(f => ({
        ...f,
        snippet: el
      } as SnippetFileExtended));
    }
    const host = (el as Host).host;
    return this.getSnippets(host).then(snippets =>
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
      return getHostItem(el as Host, this.hosts.lastUse === (el as Host).host);
    }
    return this.getLoadMoreItem();
  }
}
