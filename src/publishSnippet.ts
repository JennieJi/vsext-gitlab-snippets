import * as path from 'path';
import { window, Memento } from 'vscode';
import SnippetRegistry from './SnippetRegistry';
import addHost from './addHost';
import { VISIBILITY } from './constants';
import hostManager from './hostManager';
import chooseHost from './chooseHost';

export default async function publish(state: Memento) {
  const { activeTextEditor } = window;
  if (!activeTextEditor) {
    window.showErrorMessage('Please open the file first!');
    return;
  }
  const content = activeTextEditor.document.getText();
  if (!content) {
    window.showErrorMessage('Could not publish an empty file!');
    return;
  }

  const manageHosts = hostManager(state);
  const hosts = manageHosts.get();
  let api;
  if (!hosts || !hosts.length) {
    const res = await addHost(state);
    api = res?.registry;
  } else {
    const hostConfig = await chooseHost(state);
    if (!hostConfig) {
      return;
    }
    api = new SnippetRegistry(hostConfig);
  }
  const activeEditorPath = activeTextEditor.document.fileName;
  const fileName = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: 'Enter file name with extention. E.g., "example.js".',
    value: activeEditorPath ? path.basename(activeEditorPath) : undefined,
  });
  if (!fileName) {
    return;
  }
  const title = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: 'Enter a title',
    validateInput(value) {
      if (!value || !value.trim()) {
        return 'Title is required!';
      }
    },
  });
  if (!title) {
    return;
  }
  const description =
    (await window.showInputBox({
      ignoreFocusOut: true,
      prompt: '[Optional]Enter a brief description',
    })) || null;
  const visibility =
    (await window.showQuickPick(Object.values(VISIBILITY), {
      canPickMany: false,
      placeHolder: 'Choose visibility',
      ignoreFocusOut: true,
    })) || VISIBILITY.private;
  const snippet = {
    file_name: fileName,
    title,
    description,
    visibility,
    content,
  };
  await api?.publish(snippet);
  window.showInformationMessage(
    `Successfully published "${fileName || title}" to ${api?.host.host}!`
  );
  return {
    snippet,
    registry: api,
  };
}
