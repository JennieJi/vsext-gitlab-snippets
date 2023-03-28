import { window, Memento, workspace } from "vscode";
import { Snippet, SnippetFileExtended } from "./types";
import { SnippetItem } from "./SnippetRegistry";
import fetch from "node-fetch";
import * as yaml from "js-yaml";

interface Lang {
  ace_mode: string;
  extensions: string[];
}
let langs = [] as Array<Lang>;
let langMap = {} as { [ext: string]: Lang };
fetch(
  "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml"
)
  .then((res) => res.text())
  .then(yaml.load)
  // @ts-ignore
  .then((res) => {
    if (res) {
      langs = Object.values(res);
      langs.forEach((lang) => {
        lang.extensions?.forEach(
          (ext) => langMap[ext] || (langMap[ext] = lang)
        );
      });
    }
  });

export default async function viewSnippet(state: Memento, snippet: Snippet, path?: string) {
  const content = await new SnippetItem(state, snippet).getContent(path);
  const fileExt = (path ?? snippet.file_name)?.match(/\.\w+$/)?.[0];
  const language = fileExt && langMap[fileExt]?.ace_mode;
  workspace
    .openTextDocument({
      content,
      language,
    })
    .then(window.showTextDocument);
}
