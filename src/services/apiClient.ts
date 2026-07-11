import { Bookmark, Folder } from '../types';

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'https://api.bookmarks.straccini.com';

async function request<T>(path: string, apiKey: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request to ${path} failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  getBookmarks: (apiKey: string) => request<Bookmark[]>('/bookmarks', apiKey),

  createBookmark: (apiKey: string, bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) =>
    request<Bookmark>('/bookmarks', apiKey, {
      method: 'POST',
      body: JSON.stringify(bookmark),
    }),

  updateBookmark: (apiKey: string, bookmark: Bookmark) =>
    request<Bookmark>(`/bookmarks/${bookmark.id}`, apiKey, {
      method: 'PUT',
      body: JSON.stringify(bookmark),
    }),

  deleteBookmark: (apiKey: string, id: string) =>
    request<void>(`/bookmarks/${id}`, apiKey, {
      method: 'DELETE',
    }),

  getFolders: (apiKey: string) => request<Folder[]>('/folders', apiKey),

  createFolder: (apiKey: string, name: string, parentId: string | null) =>
    request<Folder>('/folders', apiKey, {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    }),

  updateFolder: (apiKey: string, folderId: string, name: string) =>
    request<Folder>(`/folders/${folderId}`, apiKey, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
};
