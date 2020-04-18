import listManager from './listManager';
import { Host } from './types';
import { Memento } from 'vscode';

export default function hostManager(state: Memento) {
  return listManager<Host>('hosts', (host: Host) => host.host, state);
}
