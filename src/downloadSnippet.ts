import { window, Memento, workspace, Uri } from 'vscode';
import * as fs from 'fs';
import { Snippet, StaredSnippet } from './types';
import SnippetRegistry from './SnippetRegistry';
import hostManager from './hostManager';
import addHost from './addHost';

export default async function downloadSnippet(
  state: Memento,
  snippet: StaredSnippet | Snippet
) {
  const host =
    (snippet as StaredSnippet).host ||
    snippet.raw_url.replace(/^(\w+:\/\/)?([\w-\.]+)\/.*/, '$1$2');
  let hostConfig = hostManager(state).getById(host);
  if (!hostConfig) {
    const res = await addHost(state, host);
    if (!res) {
      window.showErrorMessage(
        `Lack of token for ${host}! Please add token and try again.`
      );
      return;
    }
    hostConfig = res.registry.host;
  }
  const raw = await new SnippetRegistry(hostConfig).getSnippetContent(
    snippet.id
  );
  const targetPath = await window.showSaveDialog({
    defaultUri: workspace.workspaceFile,
    saveLabel: 'Save snippet',
  });
  if (!targetPath) {
    return;
  }
  fs.writeFile(
    targetPath.path,
    raw,
    (err) => err && window.showErrorMessage(err.message)
  );
}
