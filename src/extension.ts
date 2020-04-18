// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, window, commands } from 'vscode';
import commandName, { Command } from './commandName';
import addHost from './addHost';
import publish from './publishSnippet';
import configKey from './configKey';
import registerStaredView from './views/staredView';
import registerHostsView from './views/hostsView';
import starManager from './starManager';
import { Snippet } from './types';

export function activate(context: ExtensionContext) {
  const { subscriptions, globalState } = context;
  const { dataProvider: staredProvider } = registerStaredView(globalState);
  const { dataProvider: hostSnippetsProvider } = registerHostsView(globalState);
  // const stared = starManager(globalState);

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
      ['reload', hostSnippetsProvider.reload],
      [
        'star',
        // (host: string, snippet: Snippet) => {
        //   stared.add({
        //     host,
        //     snippet,
        //     starTime: Date.now(),
        //   });
        // staredProvider.reload();
        // },
        (...args: any[]) => console.log(args),
      ],
      [
        'unstar',
        // (index: number) => {
        //   stared.remove(index);
        // staredProvider.reload();
        // },
        (...args: any[]) => console.log(args),
      ],
      ['download', () => {}],
      ['viewSnippet', () => {}],
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
