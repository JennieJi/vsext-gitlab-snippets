import { ExtensionContext, window } from 'vscode';
import configKey from './configKey';
import SnippetRegistry from './SnippetRegistry';

const PROTOCOL = 'https://';
const KEY = configKey('hosts');

export default async function addHost(context: ExtensionContext) {
  let host = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'Enter your gitlab host',
    value: PROTOCOL,
  });
  if (!host) {
    return;
  }
  if (/^https:\/\//.test(host)) {
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

  const { globalState } = context;
  const current = globalState.get(KEY);
  let updatedValue;
  if (Array.isArray(current)) {
    updatedValue = current.filter((r) => r.host !== host).concat(registry);
  } else {
    updatedValue = [registry];
  }
  globalState.update(KEY, updatedValue);

  return {
    registry: api,
    snippets,
  };
}
