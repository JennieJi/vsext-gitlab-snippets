import { env, commands, window } from "vscode";
import { HostRegistry, SnippetExtended, SnippetFileExtended } from "../types";
import hostManager from "../hostManager";

export default async function copyToClipboardAndPaste(
  hosts: ReturnType<typeof hostManager>,
  snippet: SnippetExtended,
  path?: string,
  paste: Boolean = true
) {
  const { registry } = hosts.getById(snippet.host) as HostRegistry;
  const raw = await registry.getSnippetContent(snippet.id, path);

  await env.clipboard.writeText(raw);
  window.showInformationMessage('Snippet copied to clipboard.');
  if (paste) {
    commands.executeCommand("editor.action.clipboardPasteAction");
  }

}
