import { window, Memento } from 'vscode';
import SnippetRegistry from './SnippetRegistry';
import hostManager from './hostManager';
import { showTokenInput } from './updateToken';

export default async function addHost(state: Memento) {
  let host = await window.showInputBox({
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
  const registry = {
    host,
    token,
    version: (version && parseInt(version, 10)) || 4,
  };
  const api = new SnippetRegistry(registry);
  const snippets = await api.getSnippets();

  hostManager(state).add(registry);

  return {
    registry: api,
    snippets,
  };
}
