import { env, commands, window } from "vscode";
import { HostRegistry, SnippetExtended, SnippetFileExtended } from "../types";
import hostManager from "../hostManager";

export default async function copyToClipboardAndPaste(
  hosts: ReturnType<typeof hostManager>,
  source: SnippetExtended | SnippetFileExtended,
  paste: Boolean = true
) {
  const snippet = (source as SnippetFileExtended).snippet ?? source;
  const { registry } = hosts.getById(snippet.host) as HostRegistry;
  const raw = await registry.getSnippetContent(snippet.id, (source as SnippetFileExtended).path);

  await env.clipboard.writeText(raw);
  window.showInformationMessage('Snippet copied to clipboard.');
  if (paste) {
  	commands.executeCommand("editor.action.clipboardPasteAction");
  }
 
}
