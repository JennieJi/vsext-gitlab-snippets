import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItemCollapsibleState,
  ThemeIcon,
} from "vscode";
import { Host, HostRegistry, Snippet, SnippetExtended, SnippetFileExtended, SnippetGroup } from "../types";
import getSnippetItem from "./getSnippetItem";
import getHostItem from "./getHostItem";
import hostManager from "../hostManager";
import { SNIPPET_GROUP } from "../constants";

export class MySnippetsProvider implements TreeDataProvider<Host | SnippetGroup | SnippetExtended | SnippetFileExtended> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private hosts: ReturnType<typeof hostManager>;

  constructor(hosts: ReturnType<typeof hostManager>) {
    this.hosts = hosts;
  }

  public reload(host?: string) {
    if (host) {
      this.hosts.lastUse = host;
    }
    this._onDidChangeTreeData.fire();
  }

  private async getGroupedSnippets(host: string): Promise<SnippetGroup[]> {
    const { registry } = this.hosts.getById(host) as HostRegistry;
    const snippets = await registry.getUserSnippets();
    if (!snippets.length) { return []; }
    const groups: {
      [key: string]: SnippetGroup
    } = {
      global: {
        type: SNIPPET_GROUP.category,
        host,
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
          host,
          snippets: []
        };
      }
      group.snippets.push({ ...snippet, host });
    });
    return Object.values(groups)
  }

  public async getChildren(el?: Host | SnippetGroup | SnippetExtended): Promise<Host[] | SnippetGroup[] | SnippetExtended[] | SnippetFileExtended[]> {
    if (!el) {
      return this.hosts.get();
    }
    if ((el as SnippetGroup).snippets) {
      return (el as SnippetGroup).snippets;
    }
    if ((el as SnippetExtended).id) {
      return (el as SnippetExtended).files.map(f => ({
        ...f,
        snippet: el
      } as SnippetFileExtended));
    }
    return this.getGroupedSnippets((el as Host).host);
  }

  private async getGroupItem(group: SnippetGroup): Promise<TreeItem> {
    if (group.type === SNIPPET_GROUP.project) {
      let label = `Project ${group.projectId.toString()}`;
      const { registry } = this.hosts.getById(group.host) as HostRegistry;
      try {
        const project = await registry.getProject(group.projectId);
        label = project.name;
      } catch (e) {
        // ignore
      }
      return {
        label,
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        contextValue: "snippetGroup",
        iconPath: new ThemeIcon("folder"),
      };
    }
    return {
      label: group.label,
      collapsibleState: TreeItemCollapsibleState.Expanded,
      contextValue: "snippetGroup",
      iconPath: new ThemeIcon("folder"),
    };
  }

  public async getTreeItem(el: Host | SnippetGroup | SnippetExtended | SnippetFileExtended): Promise<TreeItem> {
    if ((el as SnippetGroup).snippets) {
      return this.getGroupItem(el as SnippetGroup);
    }
    if ((el as SnippetExtended).id) {
      return getSnippetItem(el as SnippetExtended, undefined, { hideAuthor: true });
    }
    if ((el as SnippetFileExtended).path) {
      const { path, snippet } = el as SnippetFileExtended;
      return getSnippetItem(snippet, path, { hideAuthor: true });
    }
    return getHostItem(el as Host, this.hosts.lastUse === (el as Host).host);
  }
}
