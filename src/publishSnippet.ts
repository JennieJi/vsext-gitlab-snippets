import { window, Memento } from 'vscode';
import SnippetRegistry from './SnippetRegistry';
import addHost from './addHost';
import { Host } from './types';
import { VISIBILITY } from './constants';
import hostManager from './hostManager';

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

  const hosts = hostManager(state).get();
  let api;
  if (!hosts || !hosts.length) {
    const res = await addHost(state);
    api = res?.registry;
  } else {
    const host = await window.showQuickPick(
      hosts.map(({ host }) => host),
      {
        canPickMany: false,
        placeHolder: 'Choose host to publish',
        ignoreFocusOut: true,
      }
    );
    if (!host) {
      return;
    }
    api = new SnippetRegistry(hosts.find((h) => h.host === host) as Host);
  }
  const fileName = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'Enter file name',
    value: activeTextEditor.document.fileName,
  });
  if (!fileName) {
    return;
  }
  const title = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'Enter a title',
  });
  if (!title) {
    return;
  }
  const description =
    (await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: 'Enter a brief description',
    })) || null;
  const visibility =
    (await window.showQuickPick(Object.values(VISIBILITY), {
      canPickMany: false,
      placeHolder: 'Choose visibility',
      ignoreFocusOut: true,
    })) || VISIBILITY.private;

  return await api?.publish({
    file_name: fileName,
    title,
    description,
    visibility,
    content,
  });
}
