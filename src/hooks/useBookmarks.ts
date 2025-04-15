import { useState } from 'react';
import { Bookmark } from '../types';
import { sampleBookmarks } from '../data/sampleData';

export function useBookmarks(isAuthenticated: boolean) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(sampleBookmarks);

  const addBookmark = (selectedFolder: string | null) => {
    if (!isAuthenticated) return null;

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      title: 'New Bookmark',
      url: 'https://example.com',
      description: 'Add a description',
      thumbnail: '',
      tags: [],
      folderId: selectedFolder === 'all' || selectedFolder === 'favorites' ? null : selectedFolder,
      favorite: false,
      dateAdded: new Date().toISOString(),
    };

    setBookmarks([...bookmarks, newBookmark]);
    return newBookmark;
  };

  const updateBookmark = (updatedBookmark: Bookmark) => {
    if (!isAuthenticated) return;
    setBookmarks(bookmarks.map(b => (b.id === updatedBookmark.id ? updatedBookmark : b)));
  };

  const deleteBookmark = (id: string) => {
    if (!isAuthenticated) return;
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const toggleFavorite = (id: string) => {
    if (!isAuthenticated) return;
    setBookmarks(bookmarks.map(b => (b.id === id ? { ...b, favorite: !b.favorite } : b)));
  };

  return {
    bookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
  };
}