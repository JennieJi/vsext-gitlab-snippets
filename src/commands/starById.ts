import { window } from 'vscode';
import { starManager } from '../starManager';
import chooseHost from './chooseHost';
import hostManager from '../hostManager';

export default async function starById(hosts: ReturnType<typeof hostManager>, stared: ReturnType<typeof starManager>) {
  const host = await chooseHost(
    hosts,
    'Where would you add snippet from?'
  );
  if (!host) {
    return;
  }

  const id = await window.showInputBox({
    prompt: 'Enter snippet ID',
  });
  if (!id) {
    return;
  }
  const snippet = await host.registry.getSnippet(parseInt(id, 10));
  if (!snippet) {
    window.showErrorMessage(
      `Couldn't find snippet #${id} on ${host.host}!`
    );
    return;
  }
  stared.add(snippet);
}
