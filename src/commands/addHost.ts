import { window } from 'vscode';
import hostManager from '../hostManager';
import { HostRegistry } from '../types';
import { showTokenInput } from './updateToken';

export default async function addHost(hostManage: ReturnType<typeof hostManager>): Promise<HostRegistry | undefined> {
  const host = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: 'Enter your Gitlab host',
    value: 'https://gitlab.com',
    validateInput(value) {
      if (!/https?:\/\//.test(value)) {
        return 'Must start with "http://" or "https://" protocal';
      }
      return null;
    },
  });
  if (!host) {
    return;
  }
  const token = await showTokenInput();
  if (!token) return;
  const version = await window.showQuickPick(['4', '3'], {
    canPickMany: false,
    placeHolder: 'Choose host API version',
    ignoreFocusOut: true,
  });

  return hostManage.add({
    host,
    token,
    version: version ? parseInt(version, 10) : 4,
  });
}
