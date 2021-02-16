import { window, Memento, workspace } from "vscode";
import { Snippet } from "./types";
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

export default async function viewSnippet(state: Memento, snippet: Snippet) {
  const banner = `/* ${snippet.file_name || snippet.title} - ${
    snippet.web_url
  }  */\n`;
  const content = await new SnippetItem(state, snippet).getContent();
  const fileExt = snippet.file_name?.match(/\.\w+$/)?.[0];
  const language = fileExt && langMap[fileExt]?.ace_mode;
  workspace
    .openTextDocument({
      content: banner + content,
      language,
    })
    .then(window.showTextDocument);
}
