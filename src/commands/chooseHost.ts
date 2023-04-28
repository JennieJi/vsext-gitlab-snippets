import { window } from 'vscode';
import hostManager from '../hostManager';
import addHost from './addHost';
import { HostRegistry } from '../types';

const ADD_NEW = 'Add new...';

export default async function chooseHost(
  hostManage: ReturnType<typeof hostManager>,
  placeHolder = 'Choose host'
): Promise<HostRegistry | undefined> {
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
    return addHost(hostManage);
  } else {
    return hostManage.getById(host) as HostRegistry;
  }
}
