import { Memento, window } from 'vscode';
import hostManager from './hostManager';
import SnippetRegistry from './SnippetRegistry';
import { starManager } from './starManager';
import chooseHost from './chooseHost';

export default async function starById(state: Memento) {
  const hostConfig = await chooseHost(
    state,
    'Where would you add snippet from?'
  );
  if (!hostConfig) {
    return;
  }

  const id = await window.showInputBox({
    prompt: 'Enter snippet ID',
  });
  if (!id) {
    return;
  }
  const registry = new SnippetRegistry(hostConfig);
  const snippet = await registry.getSnippet(parseInt(id, 10));
  if (!snippet) {
    window.showErrorMessage(
      `Couldn't find snippet #${id} on ${hostConfig.host}!`
    );
    return;
  }
  starManager(state).add({
    ...snippet,
    host: hostConfig.host,
    starTime: Date.now(),
  });
}
