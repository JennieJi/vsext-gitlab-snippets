import listManager from './listManager';
import { StaredSnippet, Snippet } from './types';
import { Memento } from 'vscode';

const getId = (stared: StaredSnippet) => stared.raw_url;

export function starManager(state: Memento) {
  const helpers = listManager<StaredSnippet>(
    'stared',
    getId,
    state
  );
  return {
    ...helpers,
    add: (snippet: Snippet) => helpers.add({
      ...snippet,
      starTime: Date.now(),
      host: snippet.raw_url.replace(/^(\w+:\/\/)?([\w-\.]+)\/.*/, '$1$2')
    }),
  };
}
