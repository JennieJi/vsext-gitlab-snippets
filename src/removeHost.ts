import { window } from 'vscode';
import hostManager from './hostManager';

const confirmOptions = {
  y: 'Yes, remove it!',
  n: 'No, let me think about it again.',
};
export async function removeHost(hostManage: ReturnType<typeof hostManager>, host: string) {
  const confirm = await window.showQuickPick(Object.values(confirmOptions), {
    canPickMany: false,
    placeHolder: `Are you confirm to remove ${host}?`,
  });
  if (confirm === confirmOptions.y) {
    hostManage.remove(host);
    window.showInformationMessage(`Removed host ${host} from gitlab-snippets!`);
    return host;
  }
}
export async function removeHostSelector(
  hostManage: ReturnType<typeof hostManager>
) {
  const options = hostManage.get().map(({ host }) => host);
  const host = await window.showQuickPick(options, {
    placeHolder: 'Choose host to remove'
  });
  if (!host) {
    return;
  }
  return removeHost(hostManage, host);
}
