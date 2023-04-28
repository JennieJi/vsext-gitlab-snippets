import { SNIPPET_GROUP } from "./constants";
import SnippetRegistry from "./SnippetRegistry";

export interface Host {
  host: string;
  token: string;
  version: number;
}
export interface HostRegistry extends Host {
  registry: SnippetRegistry;
}

export interface StaredSnippet extends SnippetExtended {
  starTime: number;
};

export interface Snippet {
  id: number;
  title: string;
  file_name: string;
  description: string;
  visibility: string;
  author: Author;
  updated_at: string;
  created_at: string;
  project_id: number | null;
  web_url: string;
  raw_url: string;
  files: SnippetFile[];
}
export interface SnippetExtended extends Snippet {
  host: string;
}
export interface SnippetFile {
  path: string;
  raw_url: string;
}
export interface SnippetFileExtended extends SnippetFile {
  snippet: SnippetExtended;
}

export type NewSnippet = Pick<
  Snippet,
  'title' | 'file_name' | 'description' | 'visibility'
> & {
  content: string;
};

export type SnippetGroup = SnippetGroupCategory | SnippetGroupProject;
interface SnippetGroupBase {
  host: string,
  type: SNIPPET_GROUP;
  snippets: SnippetExtended[];
}
export interface SnippetGroupCategory extends SnippetGroupBase {
  type: SNIPPET_GROUP.category,
  label: string,
}
export interface SnippetGroupProject extends SnippetGroupBase {
  type: SNIPPET_GROUP.project,
  projectId: number,
}

export interface Author {
  id: number;
  name: string;
  username: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

export interface Project {
  id: number;
  description?: any;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  default_branch: string;
  tag_list: string[];
  topics: string[];
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  avatar_url: string;
  star_count: number;
  last_activity_at: string;
  namespace: Namespace;
}

interface Namespace {
  id: number;
  name: string;
  path: string;
  kind: string;
  full_path: string;
  parent_id?: any;
  avatar_url?: any;
  web_url: string;
}