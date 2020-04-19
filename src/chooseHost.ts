import { Memento, window } from 'vscode';
import hostManager from './hostManager';
import addHost from './addHost';
import { Host } from './types';

const ADD_NEW = 'Add new...';

export default async function chooseHost(
  state: Memento,
  placeHolder = 'Choose host'
) {
  const hostManage = hostManager(state);
  const options = hostManage
    .get()
    .map(({ host }) => host)
    .concat(ADD_NEW);
  const host = await window.showQuickPick(options, {
    placeHolder,
  });
  if (!host) {
    return;
  }
  if (host === ADD_NEW) {
    const res = await addHost(state);
    return res?.registry?.host;
  } else {
    return hostManage.getById(host) as Host;
  }
}
