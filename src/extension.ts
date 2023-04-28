import { ExtensionContext, commands, TreeView, window } from "vscode";
import commandName, { Command } from "./commandName";
import addHost from "./commands/addHost";
import publish from "./commands/publishSnippet";
import { StaredSnippetsProvider } from "./views/staredView";
import { HostSnippetsProvider } from "./views/hostsView";
import { MySnippetsProvider } from "./views/myView";
import { starManager } from "./starManager";
import starById from "./commands/starById";
import viewSnippet from "./commands/viewSnippet";
import viewSnippetInBrowser from "./commands/viewSnippetInBrowser";
import { Snippet, StaredSnippet, Host, SnippetFileExtended, SnippetExtended } from "./types";
import downloadSnippet from "./commands/downloadSnippet";
import { removeHostSelector, removeHost } from "./commands/removeHost";
import updateToken from "./commands/updateToken";
import hostManager from "./hostManager";

let views = [] as TreeView<any>[];

export function activate(context: ExtensionContext) {
  const { subscriptions, globalState } = context;
  const hosts = hostManager(globalState);
  const stared = starManager(globalState);
  const staredSnippetsProvider = new StaredSnippetsProvider(stared);
  const hostSnippetsProvider = new HostSnippetsProvider(hosts);
  const mySnippetsProvider = new MySnippetsProvider(hosts);
  views = [
    window.createTreeView("gitlabSnippetsExplorer-stared", {
      treeDataProvider: staredSnippetsProvider,
    }),
    window.createTreeView("gitlabSnippetsExplorer-all", {
      treeDataProvider: hostSnippetsProvider,
    }),
    window.createTreeView("gitlabSnippetsExplorer-mine", {
      treeDataProvider: mySnippetsProvider,
    })
  ];

  const reloadHosts = (res: any) => {
    if (res) {
      hostSnippetsProvider.reload();
      mySnippetsProvider.reload();
    }
  }

  [
    [
      "removeHostSelector",
      () =>
        removeHostSelector(hosts).then(reloadHosts),
    ],
    [
      "removeHost",
      (host: Host) =>
        removeHost(hosts, host.host).then(reloadHosts),
    ],
    [
      "addHost",
      () =>
        addHost(hosts).then(reloadHosts)
    ],
    [
      "publish",
      () =>
        publish(hosts).then(res => {
          if (res) {
            mySnippetsProvider.reload(res.host);
          }
        })
    ],
    ["reloadMySnippets", ({ host }: Host) => mySnippetsProvider.reload(host)],
    [
      "reloadExploreSnippets",
      ({ host }: Host) => hostSnippetsProvider.reload(host),
    ],
    [
      "star",
      async (snippet: Snippet) => {
        await stared.add(snippet);
        staredSnippetsProvider.reload();
      },
    ],
    [
      "starById",
      async () => {
        await starById(hosts, stared);
        staredSnippetsProvider.reload();
      },
    ],
    [
      "unstar",
      async (snippet: StaredSnippet) => {
        await stared.remove(stared.getId(snippet));
        staredSnippetsProvider.reload();
      },
    ],
    [
      "download",
      (snippet: SnippetExtended | SnippetFileExtended) =>
        downloadSnippet(hosts, snippet),
    ],
    ["viewSnippet", (snippet: SnippetExtended, path?: string) => viewSnippet(hosts, snippet, path)],
    ["viewSnippetInBrowser", viewSnippetInBrowser],
    ["exploreMore", () => hostSnippetsProvider.loadMore()],
    ["updateToken", async ({ host }: Host) => {
      await updateToken(hosts, host);
      hostSnippetsProvider.reload(host);
      mySnippetsProvider.reload(host);
    }]
  ].forEach(([cmd, callback]) =>
    subscriptions.push(
      commands.registerCommand(
        commandName(cmd as Command),
        callback as () => void
      )
    ),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  views.forEach((v) => v.dispose());
}
