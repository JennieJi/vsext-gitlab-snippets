import { window, ViewColumn, Uri, env } from 'vscode';
import { Snippet } from './types';

export default function viewSnippet(snippet: Snippet) {
  return env.asExternalUri(Uri.parse(snippet.web_url)).then(env.openExternal);
}
