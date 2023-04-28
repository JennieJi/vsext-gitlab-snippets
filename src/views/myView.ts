import {
  TreeItem,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItemCollapsibleState,
  ThemeIcon,
} from "vscode";
import throttle from "lodash.throttle";
import { Host, HostRegistry, SnippetExtended, SnippetFileExtended, SnippetGroup, Project } from "../types";
import getSnippetItem from "./getSnippetItem";
import getHostItem from "./getHostItem";
import hostManager from "../hostManager";
import { SNIPPET_GROUP } from "../constants";

const projectsCache: {
  [host: string]: {
    [project: string]: {
      data: Project,
      timestamp: number,
    }
  }
} = {};

export class MySnippetsProvider implements TreeDataProvider<Host | SnippetGroup | SnippetExtended | SnippetFileExtended> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private hosts: ReturnType<typeof hostManager>;

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
        label: "/",
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

  private getGroupItem(group: SnippetGroup): TreeItem {
    const item = new TreeItem('/');
    item.contextValue = "snippetGroup";
    item.iconPath = new ThemeIcon("folder");
    if (group.type === SNIPPET_GROUP.project) {
      const { registry } = this.hosts.getById(group.host) as HostRegistry;
      const { host, projectId } = group;
      const projectCache = projectsCache[host]?.[projectId];
      item.label = projectCache?.data.path || `Project ${projectId.toString()}`;
      if (!projectCache || Date.now() - projectCache.timestamp > 1000 * 60 * 60) {
        registry.getProject(group.projectId).then(project => {
          if (!projectsCache[host]) {
            projectsCache[host] = {};
          }
          projectsCache[host][project.id] = {
            data: project,
            timestamp: Date.now(),
          };
          this.reload();
        });
      }
      item.collapsibleState = TreeItemCollapsibleState.Collapsed;
    } else {
      item.label = group.label;
      item.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
    return item;
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
    return getHostItem(el as Host, this.hosts.getLastUse() === (el as Host).host);
  }
}
