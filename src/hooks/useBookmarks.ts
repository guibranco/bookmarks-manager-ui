import { useState, useEffect } from 'react';
import { Bookmark } from '../types';
import { apiClient } from '../services/apiClient';

export function useBookmarks(isAuthenticated: boolean, apiKey: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiClient
      .getBookmarks(apiKey)
      .then(data => {
        if (!cancelled) setBookmarks(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, apiKey]);

  const addBookmark = async (selectedFolder: string | null) => {
    if (!isAuthenticated) return null;

    try {
      const newBookmark = await apiClient.createBookmark(apiKey, {
        title: 'New Bookmark',
        url: '',
        description: '',
        thumbnail: '',
        tags: [],
        folderId:
          selectedFolder === 'all' || selectedFolder === 'favorites' ? null : selectedFolder,
        favorite: false,
      });
      setBookmarks(prev => [...prev, newBookmark]);
      return newBookmark;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bookmark');
      return null;
    }
  };

  const updateBookmark = async (updatedBookmark: Bookmark) => {
    if (!isAuthenticated) return;

    try {
      const saved = await apiClient.updateBookmark(apiKey, updatedBookmark);
      setBookmarks(prev => prev.map(b => (b.id === saved.id ? saved : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
    }
  };

  const deleteBookmark = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await apiClient.deleteBookmark(apiKey, id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bookmark');
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!isAuthenticated) return;

    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;

    await updateBookmark({ ...bookmark, favorite: !bookmark.favorite });
  };

  return {
    bookmarks,
    isLoading,
    error,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
  };
}
