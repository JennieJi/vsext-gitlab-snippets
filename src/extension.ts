// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands } from 'vscode';
import commandName, { Command } from './commandName';
import addHost from './addHost';
import publish from './publishSnippet';
import configKey from './configKey';
import registerStaredView from './views/staredView';
import registerHostsView from './views/hostsView';
import { starSnippet, unstarSnippet } from './starManager';
import viewSnippet from './viewSnippet';
import { Snippet, StaredSnippet, Host } from './types';
import downloadSnippet from './downloadSnippet';

export function activate(context: ExtensionContext) {
  const { subscriptions, globalState } = context;
  const { dataProvider: staredProvider } = registerStaredView(globalState);
  const { dataProvider: hostSnippetsProvider } = registerHostsView(globalState);

  subscriptions.concat(
    [
      [
        'addHost',
        async () => {
          const { registry } = (await addHost(globalState)) || {};
          if (registry) {
            globalState.update(configKey('lastUseHost'), registry.host);
          }
        },
      ],
      ['publish', () => publish(globalState)],
      ['reload', (host: Host) => hostSnippetsProvider.reload(host)],
      [
        'star',
        (snippet: Snippet) => {
          starSnippet(globalState, snippet);
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
