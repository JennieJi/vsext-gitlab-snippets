import listManager from './listManager';
import { StaredSnippet, Snippet } from './types';
import { Memento } from 'vscode';

export function starManager(state: Memento) {
  return listManager<StaredSnippet>(
    'stared',
    (stared: StaredSnippet) => stared.raw_url,
    state
  );
}

export function starSnippet(state: Memento, snippet: Snippet) {
  const host = snippet.raw_url.replace(/^(\w+:\/\/)?([\w-\.]+)\/.*/, '$1$2');
  return starManager(state).add({
    ...snippet,
    host,
    starTime: Date.now(),
  });
}

export function unstarSnippet(state: Memento, snippet: StaredSnippet) {
  return starManager(state).remove(snippet);
}
