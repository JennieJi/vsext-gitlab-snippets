import fetch from 'node-fetch';
import { Host, Snippet, NewSnippet } from './types';
import { URLSearchParams, URL } from 'url';
import { window } from 'vscode';

class SnippetRegistry {
  public host: Host;
  private headers: { [key: string]: string };

  constructor(host: Host) {
    this.host = host;
    this.headers = {
      'PRIVATE-TOKEN': host.token,
      'Content-Type': 'application/json',
    };
  }

  private endpoint(name: string) {
    const { host, version } = this.host;
    const ret = new URL(`/api/v${version}/${name}`, host);
    return ret;
  }

  private get(endpoint: string) {
    return fetch(this.endpoint(endpoint), {
      headers: this.headers,
    });
  }
  private post(endpoint: string, body: { [key: string]: any }) {
    return fetch(this.endpoint(endpoint), {
      method: 'POST',
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
    return this.get('snippets/public?' + search.toString()).then((res) =>
      res.json()
    );
  }

  public getUserSnippets(): Promise<Snippet[]> {
    return this.get('snippets').then((res) => res.json());
  }

  public getSnippet(id: number): Promise<Snippet> {
    return this.get(`snippets/${id}`).then((res) => res.json());
  }

  public getSnippetContent(id: number): Promise<string> {
    return this.get(`snippets/${id}/raw`).then((res) => res.text());
  }

  public publish(data: NewSnippet) {
    return this.post('snippets', data);
  }
}
export default SnippetRegistry;
