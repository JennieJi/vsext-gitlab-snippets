import listManager from './listManager';
import { StaredSnippet } from './types';
import { Memento } from 'vscode';

export default function starManager(state: Memento) {
  return listManager<StaredSnippet>('stared', state);
}
