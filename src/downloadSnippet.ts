import { window, workspace } from "vscode";
import * as fs from "fs";
import { HostRegistry, SnippetExtended, SnippetFileExtended } from "./types";
import hostManager from "./hostManager";

export default async function downloadSnippet(
  hosts: ReturnType<typeof hostManager>,
  source: SnippetExtended | SnippetFileExtended
) {
  const snippet = (source as SnippetFileExtended).snippet ?? source;
  const { registry } = hosts.getById(snippet.host) as HostRegistry;
  const raw = await registry.getSnippetContent(snippet.id, (source as SnippetFileExtended).path);
  const targetPath = await window.showSaveDialog({
    defaultUri: workspace.workspaceFile,
    saveLabel: "Save snippet",
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
