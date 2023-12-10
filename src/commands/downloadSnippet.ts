import { window, workspace } from "vscode";
import * as fs from "fs";
import { HostRegistry, SnippetExtended, SnippetFileExtended } from "../types";
import hostManager from "../hostManager";

export default async function downloadSnippet(
  hosts: ReturnType<typeof hostManager>,
  snippet: SnippetExtended,
  path?: string
) {
  const { registry } = hosts.getById(snippet.host) as HostRegistry;
  const raw = await registry.getSnippetContent(snippet.id, path);
  const targetPath = await window.showSaveDialog({
    defaultUri: workspace.workspaceFile,
    saveLabel: "Save snippet",
  });
  if (!targetPath) {
    return;
  }
  fs.writeFile(
    targetPath.fsPath,
    raw,
    (err) => err && window.showErrorMessage(err.message)
  );
}
