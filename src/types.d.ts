export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnail: string;
  tags: string[];
  folderId: string | null;
  favorite: boolean;
  dateAdded: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
}

export interface AppConfig {
  darkMode: boolean;
  showSidebar: boolean;
  viewMode: 'grid' | 'list';
  apiKey: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  apiKey: string;
}
