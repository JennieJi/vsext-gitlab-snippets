import { window, Memento, workspace } from "vscode";
import * as fs from "fs";
import { Snippet, StaredSnippet } from "./types";
import { SnippetItem } from "./SnippetRegistry";

export default async function downloadSnippet(
  state: Memento,
  snippet: StaredSnippet | Snippet
) {
  const raw = await new SnippetItem(state, snippet).getContent();
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
