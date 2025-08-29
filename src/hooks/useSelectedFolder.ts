import { useState, useEffect } from 'react';
import { Folder } from '../types';

export function useSelectedFolder(folders: Folder[]) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(getInitialFolder());

  function getInitialFolder(): string | null {
    const params = new URLSearchParams(window.location.search);
    const folderParam = params.get('folder');

    if (folderParam === 'favorites') {
      return 'favorites';
    }

    if (folderParam === 'all') {
      return 'all';
    }

    if (folderParam && folders.some(f => f.id === folderParam)) {
      return folderParam;
    }

    return 'all';
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const currentFolder = url.searchParams.get('folder');

    if (selectedFolder && selectedFolder !== currentFolder) {
      url.searchParams.set('folder', selectedFolder);
      url.searchParams.delete('tag'); // Clear tag when selecting folder
      window.history.pushState({ type: 'folder', id: selectedFolder }, '', url.toString());
    } else if (!selectedFolder && currentFolder) {
      url.searchParams.delete('folder');
      window.history.pushState({ type: 'folder', id: null }, '', url.toString());
    }
  }, [selectedFolder]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const folderParam = params.get('folder');

      if ((!event.state || event.state.type === 'folder') && folderParam !== selectedFolder) {
        setSelectedFolder(folderParam || 'all');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedFolder]);

  return {
    selectedFolder,
    setSelectedFolder,
  };
}
