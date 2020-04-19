// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands, window } from 'vscode';
import commandName, { Command } from './commandName';
import addHost from './addHost';
import publish from './publishSnippet';
import configKey from './configKey';
import registerStaredView from './views/staredView';
import registerHostsView from './views/hostsView';
import registerMyView from './views/myView';
import { starSnippet, unstarSnippet } from './starManager';
import starById from './starById';
import viewSnippet from './viewSnippet';
import { Snippet, StaredSnippet, Host } from './types';
import downloadSnippet from './downloadSnippet';

export function activate(context: ExtensionContext) {
  const { subscriptions, globalState } = context;
  const { dataProvider: staredProvider } = registerStaredView(globalState);
  const { dataProvider: hostSnippetsProvider } = registerHostsView(globalState);
  const { dataProvider: mySnippetsProvider } = registerMyView(globalState);
  mySnippetsProvider.openLastest();

  subscriptions.concat(
    [
      [
        'addHost',
        async () => {
          const { registry } = (await addHost(globalState)) || {};
          if (registry) {
            globalState.update(configKey('lastUseHost'), registry.host);
            hostSnippetsProvider.openLastest();
            mySnippetsProvider.openLastest();
          }
        },
      ],
      [
        'publish',
        async () => {
          const res = await publish(globalState);
          mySnippetsProvider.reload(res?.registry?.host);
        },
      ],
      ['reloadMySnippets', (host: Host) => mySnippetsProvider.reload(host)],
      [
        'reloadExploreSnippets',
        (host: Host) => hostSnippetsProvider.reload(host),
      ],
      [
        'star',
        (snippet: Snippet) => {
          starSnippet(globalState, snippet);
          staredProvider.reload();
        },
      ],
      [
        'starById',
        async () => {
          await starById(globalState);
          staredProvider.reload();
        },
      ],
      [
        'unstar',
        (snippet: StaredSnippet) => {
          unstarSnippet(globalState, snippet);
          staredProvider.reload();
        },
      ],
      [
        'download',
        (snippet: StaredSnippet | Snippet) =>
          downloadSnippet(globalState, snippet),
      ],
      ['viewSnippet', viewSnippet],
      ['exploreMore', () => hostSnippetsProvider.loadMore()],
    ].map(([cmd, callback]) =>
      commands.registerCommand(
        commandName(cmd as Command),
        callback as () => void
      )
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
