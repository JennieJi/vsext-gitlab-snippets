import { window, Memento, workspace } from "vscode";
import * as fs from "fs";
import { Snippet, SnippetFileExtended, StaredSnippet } from "./types";
import { SnippetItem } from "./SnippetRegistry";

export default async function downloadSnippet(
  state: Memento,
  snippet: Snippet | SnippetFileExtended
) {
  const raw = (snippet as SnippetFileExtended).snippet ?
    // @ts-ignore
    await new SnippetItem(state, snippet.snippet).getContent(snippet.path) :
    await new SnippetItem(state, snippet as Snippet).getContent();
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
