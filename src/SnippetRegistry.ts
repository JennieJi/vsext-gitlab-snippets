import fetch from 'node-fetch';
import { Host, Snippet, NewSnippet } from './types';

class SnippetRegistry {
  private host: Host;
  private headers: { [key: string]: string };

  constructor(host: Host) {
    this.host = host;
    this.headers = {
      'PRIVATE-TOKEN': host.token,
    };
  }

  private endpoint(name: string) {
    const { host, version } = this.host;
    return `${host}/api/v${version}/${name}`;
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

  public getSnippets(): Promise<Snippet[]> {
    return this.get('snippets').then((res) => res.json());
  }

  public getSnippetContent(id: number): Promise<string> {
    return this.get(`snippets/${id}/raw`).then((res) => res.text());
  }

  public publish(data: NewSnippet) {
    return this.post('snippets', data);
  }
}
export default SnippetRegistry;
