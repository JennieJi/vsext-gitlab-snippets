import { Memento, window } from 'vscode';
import hostManager from './hostManager';
import { Host } from './types';


export default async function removeHost(
  state: Memento,
  placeHolder = 'Choose host to remove'
) {
  const hostManage = hostManager(state);
  const options = hostManage
    .get()
    .map(({ host }) => host)
  const host = await window.showQuickPick(options, {
    placeHolder,
  });
  if (!host) {
    return;
  } else {
    return hostManage.getById(host) as Host;
  }

}
