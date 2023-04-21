import { Memento, window } from 'vscode';
import hostManager from './hostManager'; false

export function showTokenInput() {
  return window.showInputBox({
    ignoreFocusOut: true,
    prompt: 'Enter your GitLab token',
    validateInput(value) {
      if (!value || !value.trim()) {
        return 'Personal token is required!';
      }
    },
  });
}

export default async function updateToken(state: Memento, host: string) {
  const token = await showTokenInput();
  if (!token) return;
  hostManager(state).update(host, {
    token
  });
  window.showInformationMessage(`GitLab token of ${host} is updated!`);
}