import fetch, { Response } from "node-fetch";
import { Host, Snippet, NewSnippet, Project } from "./types";
import { URLSearchParams, URL } from "url";

interface GitlabError {
  error: string,
  error_description: string,
  scope?: string
}

function jsonHandler<T>(res: Response): Promise<T> {
  return (res.json() as Promise<T | GitlabError>)
    .then((json) => {
      if ((json as GitlabError)?.error) {
        console.debug(json);
        return Promise.reject((json as GitlabError).error_description);
      }
      return json as T;
    });
}
class SnippetRegistry {
  public host: Host;
  private headers: { [key: string]: string };

  constructor(host: Host) {
    this.host = host;
    this.headers = {
      "PRIVATE-TOKEN": host.token,
      "Content-Type": "application/json",
      "accept": "application/json",
    };
  }

  private endpoint(name: string) {
    const { host, version } = this.host;
    const ret = new URL(`/api/v${version}/${name}`, host);
    return ret.toString();
  }

  private get(endpoint: string, params: { [key: string]: string } = {}, page?: number, perPage?: number) {
    if (page) {
      params.page = page.toString();
    }
    if (perPage) {
      params.perPage = perPage.toString();
    }
    const search = new URLSearchParams(params);
    return fetch(this.endpoint(endpoint + '?' + search.toString()), {
      headers: this.headers,
    });
  }
  private getJson<T>(endpoint: string, params: { [key: string]: string } = {}, page?: number, perPage?: number): Promise<T> {
    return this.get(endpoint, params, page, perPage).then(jsonHandler) as Promise<T>;
  }
  private post<T>(endpoint: string, body: { [key: string]: any }): Promise<T> {
    return fetch(this.endpoint(endpoint), {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    }).then(jsonHandler) as Promise<T>;
  }

  public getSnippets(page?: number, perPage?: number): Promise<Snippet[]> {
    return this.getJson<Snippet[]>("snippets/public", {}, page, perPage);
  }

  public getUserProjects(page?: number, perPage?: number): Promise<Project[]> {
    return this.getJson("projects", {
      min_access_level: "30",
      order_by: "last_activity_at"
    }, page, perPage);
  }

  public getProject(id: number): Promise<Project> {
    return this.getJson(`projects/${id}`);
  }

  public getUserSnippets(): Promise<Snippet[]> {
    return this.getJson("snippets");
  }

  public getSnippet(id: number): Promise<Snippet> {
    return this.getJson(`snippets/${id}`);
  }

  public getSnippetContent(id: number, path?: string): Promise<string> {
    const url = path ? `snippets/${id}/files/main/${path}/raw` : `snippets/${id}/raw`;
    return this.get(url).then((res) => res.text());
  }

  public publish<T = void>(data: NewSnippet, project?: number | string): Promise<T> {
    return this.post<T>(project ? `projects/${project}/snippets` : "snippets", data);
  }
}
export default SnippetRegistry;
