import { Memento, window } from 'vscode';
import hostManager from './hostManager';
import SnippetRegistry from './SnippetRegistry';
import { Host } from './types';
import { starManager } from './starManager';
import addHost from './addHost';

const ADD_NEW = 'Add new...';

export default async function starById(state: Memento) {
  const hostManage = hostManager(state);
  const options = hostManage
    .get()
    .map(({ host }) => host)
    .concat(ADD_NEW);
  const host = await window.showQuickPick(options, {
    placeHolder: 'Where do you add snippet from?',
  });
  if (!host) {
    return;
  }
  let hostConfig;
  if (host === ADD_NEW) {
    const res = await addHost(state);
    hostConfig = res?.registry?.host;
  } else {
    hostConfig = hostManage.getById(host) as Host;
  }
  if (!hostConfig) {
    return;
  }

  const id = await window.showInputBox({
    placeHolder: 'Enter snippet ID',
  });
  if (!id) {
    return;
  }
  const registry = new SnippetRegistry(hostConfig);
  const snippet = await registry.getSnippet(parseInt(id, 10));
  if (!snippet) {
    window.showErrorMessage(`Couldn't find snippet #${id} on ${host}!`);
    return;
  }
  starManager(state).add({
    ...snippet,
    host,
    starTime: Date.now(),
  });
}
