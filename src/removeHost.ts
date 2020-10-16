import { Memento, window } from 'vscode';
import hostManager from './hostManager';

const confirmOptions = {
  y: 'Yes, remove it!',
  n: 'No, let me think about it again.',
};
export async function removeHost(state: Memento, host: string) {
  const confirm = await window.showQuickPick(Object.values(confirmOptions), {
    canPickMany: false,
    placeHolder: `Are you confirm to remove ${host}?`,
  });
  if (confirm === confirmOptions.y) {
    const hostManage = hostManager(state);
    hostManage.remove(host);
    window.showInformationMessage(`Removed host ${host} from gitlab-snippets!`);
    return host;
  }
}
export async function removeHostSelector(
  state: Memento,
  placeHolder = 'Choose host to remove'
) {
  const hostManage = hostManager(state);
  const options = hostManage.get().map(({ host }) => host);
  const host = await window.showQuickPick(options, {
    placeHolder,
  });
  if (!host) {
    return;
  }
  return removeHost(state, host);
}
