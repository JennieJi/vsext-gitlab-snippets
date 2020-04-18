export interface Host {
  host: string;
  token: string;
  version: number;
}

export interface StaredSnippet {
  host: string;
  starTime: number;
  snippet: Snippet;
}

export interface Snippet {
  id: number;
  title: string;
  file_name: string;
  description: string | null;
  visibility: string;
  author: Author;
  updated_at: string;
  created_at: string;
  project_id: string | null;
  web_url: string;
  raw_url: string;
}
export type NewSnippet = Pick<
  Snippet,
  'title' | 'file_name' | 'description' | 'visibility'
> & {
  content: string;
};

export interface Author {
  id: number;
  name: string;
  username: string;
  state: string;
  avatar_url: string;
  web_url: string;
}
