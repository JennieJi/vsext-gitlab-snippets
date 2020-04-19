import { window, Memento } from 'vscode';
import SnippetRegistry from './SnippetRegistry';
import hostManager from './hostManager';

const PROTOCOL = 'https://';

export default async function addHost(state: Memento, defaultValue?: string) {
  let host = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: 'Enter your gitlab host',
    value: defaultValue || PROTOCOL,
    validateInput(value) {
      if (value && value.replace(PROTOCOL, '').trim()) {
        return null;
      }
      return 'Must enter a valid host';
    },
  });
  if (!host) {
    return;
  }
  if (!host.startsWith(PROTOCOL)) {
    host = PROTOCOL + host;
  }
  const token = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: 'Enter your gitlab token',
    validateInput(value) {
      if (!value || !value.trim()) {
        return 'Personal token is required!';
      }
    },
  });
  if (!token) {
    return;
  }
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
