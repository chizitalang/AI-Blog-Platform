export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown content
  author: string;
  publishedAt: string;
  tags: string[];
  coverImage?: string;
  filename?: string; // The virtual path of the file (e.g., blog/post.md)
}

export interface Author {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export enum ViewState {
  HOME = 'HOME',
  ARTICLE = 'ARTICLE',
  EDITOR = 'EDITOR',
}

export interface EditorState {
  title: string;
  content: string;
  tags: string;
  isGenerating: boolean;
}