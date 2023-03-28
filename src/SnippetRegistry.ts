import fetch from "node-fetch";
import { Memento, window } from "vscode";
import { Host, Snippet, NewSnippet, StaredSnippet } from "./types";
import { URLSearchParams, URL } from "url";
import hostManager from "./hostManager";
class SnippetRegistry {
  public host: Host;
  private headers: { [key: string]: string };

  constructor(host: Host) {
    this.host = host;
    this.headers = {
      "PRIVATE-TOKEN": host.token,
      "Content-Type": "application/json",
    };
  }

  private endpoint(name: string) {
    const { host, version } = this.host;
    const ret = new URL(`/api/v${version}/${name}`, host);
    return ret.toString();
  }

  private get(endpoint: string) {
    return fetch(this.endpoint(endpoint), {
      headers: this.headers,
    });
  }
  private post(endpoint: string, body: { [key: string]: any }) {
    return fetch(this.endpoint(endpoint), {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
  }

  public getSnippets(page?: number, perPage?: number): Promise<Snippet[]> {
    const params = {} as { [key: string]: string };
    if (page) {
      params.page = page.toString();
    }
    if (perPage) {
      params.perPage = perPage.toString();
    }
    const search = new URLSearchParams(params);
    return this.get("snippets/public?" + search.toString()).then((res) =>
      res.json() as Promise<Snippet[]>
    );
  }

  public getUserSnippets(): Promise<Snippet[]> {
    return this.get("snippets").then((res) => res.json() as Promise<Snippet[]>);
  }

  public getSnippet(id: number): Promise<Snippet> {
    return this.get(`snippets/${id}`).then((res) => res.json() as Promise<Snippet>);
  }

  public getSnippetContent(id: number, path?: string): Promise<string> {
    const url = path ? `snippets/${id}/files/main/${path}/raw` : `snippets/${id}/raw`;
    return this.get(url).then((res) => res.text());
  }

  public publish(data: NewSnippet) {
    return this.post("snippets", data);
  }
}
export default SnippetRegistry;

export class SnippetItem {
  registry?: SnippetRegistry;
  snippet: Snippet;

  constructor(state: Memento, snippet: Snippet) {
    this.snippet = snippet;
    const host =
      (snippet as StaredSnippet).host ||
      snippet.raw_url.replace(/^(\w+:\/\/)?([\w-\.]+)\/.*/, "$1$2");
    let hostConfig = hostManager(state).getById(host);
    if (!hostConfig) {
      window.showErrorMessage(
        `Lack of token for ${host}! Please add token and try again.`
      );
      return;
    }
    this.registry = new SnippetRegistry(hostConfig);
  }
  public getContent(path?: string): Promise<string> {
    return (
      this.registry?.getSnippetContent(this.snippet.id, path) || Promise.reject()
    );
  }
}
