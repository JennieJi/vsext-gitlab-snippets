import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  Memento,
  window,
  TreeItemCollapsibleState,
  ThemeIcon,
} from "vscode";
import { Host, Snippet, SnippetFileExtended, SnippetGroup } from "../types";
import getSnippetItem from "./getSnippetItem";
import getHostItem from "./getHostItem";
import SnippetRegistry from "../SnippetRegistry";
import hostManager from "../hostManager";
import { SNIPPET_GROUP } from "../constants";

export class SnippetsProvider implements TreeDataProvider<Host | SnippetGroup | Snippet | SnippetFileExtended> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private state: Memento;

  private _activeHost: string | undefined;
  get activeHost() {
    return this._activeHost || "";
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
  private async getGroupedSnippets(host: Host): Promise<SnippetGroup[]> {
    const snippets = await this.getSnippets(host);
    if (!snippets.length) { return []; }
    const groups: {
      [key: string]: SnippetGroup
    } = {
      global: {
        type: SNIPPET_GROUP.category,
        host: host.host,
        label: "Global",
        snippets: []
      }
    };
    snippets.forEach(snippet => {
      const { project_id: projectId } = snippet;
      let group = groups[projectId ?? 'global'];
      if (!group && projectId) {
        group = groups[projectId] = {
          type: SNIPPET_GROUP.project,
          projectId: projectId,
          host: host.host,
          snippets: []
        };
      }
      group.snippets.push(snippet);
    });
    return Object.values(groups)
  }

  public reload(host?: string) {
    if (host) {
      this.activeHost = host;
    }
    this._onDidChangeTreeData.fire();
  }
  public openLastest() {
    const hosts = this.getHosts();
    this.activeHost = hosts?.[0]?.host;
    this.reload();
  }

  public async getChildren(el?: Host | SnippetGroup | Snippet): Promise<Host[] | SnippetGroup[] | Snippet[] | SnippetFileExtended[]> {
    if (!el) {
      return this.getHosts();
    }
    if ((el as SnippetGroup).snippets) {
      return (el as SnippetGroup).snippets;
    }
    if ((el as Host).host) {
      return this.getGroupedSnippets(el as Host);
    }
    return (el as Snippet).files.map(f => ({
      ...f,
      snippet: el
    } as SnippetFileExtended));
  }

  private async getGroupItem(prefix: string, group: SnippetGroup): Promise<TreeItem> {
    console.log(group);
    if (group.type === SNIPPET_GROUP.project) {
      return {
        label: group.projectId.toString(),
        id: prefix + group.projectId.toString(),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        contextValue: "snippetGroup",
        iconPath: new ThemeIcon("folder"),
      };
    }
    return {
      label: group.label,
      id: prefix + group.label,
      collapsibleState: TreeItemCollapsibleState.Expanded,
      contextValue: "snippetGroup",
      iconPath: new ThemeIcon("folder"),
    };
  }

  public async getTreeItem(el: Host | SnippetGroup | Snippet | SnippetFileExtended): Promise<TreeItem> {
    if ((el as SnippetGroup).snippets) {
      return this.getGroupItem(`mine-${(el as SnippetGroup).host}-`, el as SnippetGroup);
    }
    if ((el as Host).host) {
      return getHostItem(el as Host, this.activeHost === (el as Host).host, 'mine-');
    }
    if ((el as SnippetFileExtended).path) {
      const { path, snippet } = el as SnippetFileExtended;
      return getSnippetItem(this.state, "mine-", snippet, path, { hideAuthor: true });
    }
    return getSnippetItem(this.state, "mine-", el as Snippet, undefined, { hideAuthor: true });
  }
}

export default function registerView(state: Memento) {
  const dataProvider = new SnippetsProvider(state);
  return {
    view: window.createTreeView("gitlabSnippetsExplorer-mine", {
      treeDataProvider: dataProvider,
    }),
    dataProvider,
  };
}
