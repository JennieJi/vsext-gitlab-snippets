import { window, Memento } from 'vscode';
import SnippetRegistry from './SnippetRegistry';
import hostManager from './hostManager';

const PROTOCOL = 'https://';

export default async function addHost(state: Memento, defaultValue?: string) {
  let host = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'Enter your gitlab host',
    value: defaultValue || PROTOCOL,
  });
  if (!host) {
    return;
  }
  if (!host.startsWith(PROTOCOL)) {
    host = PROTOCOL + host;
  }
  const token = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'Enter your gitlab token',
  });
  if (!token) {
    return;
  }
  const version = await window.showQuickPick(['4', '3'], {
    canPickMany: false,
    placeHolder: 'Choose host API version',
    ignoreFocusOut: true,
  });
  if (!version) {
    return;
  }
  const registry = {
    host,
    token,
    version: parseInt(version, 10),
  };
  const api = new SnippetRegistry(registry);
  const snippets = await api.getSnippets();

  hostManager(state).add(registry);

  return {
    registry: api,
    snippets,
  };
}
