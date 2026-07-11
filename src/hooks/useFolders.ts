import { useState, useEffect } from 'react';
import { Folder } from '../types';
import { apiClient } from '../services/apiClient';

export function useFolders(isAuthenticated: boolean, apiKey: string) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiClient
      .getFolders(apiKey)
      .then(data => {
        if (!cancelled) setFolders(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load folders');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, apiKey]);

  const createFolder = async (name: string, parentId: string | null) => {
    if (!isAuthenticated) return;

    try {
      const newFolder = await apiClient.createFolder(apiKey, name, parentId);
      setFolders(prev => [...prev, newFolder]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    }
  };

  const updateFolder = async (folderId: string, newName: string) => {
    if (!isAuthenticated) return;

    try {
      const updated = await apiClient.updateFolder(apiKey, folderId, newName);
      setFolders(prev => prev.map(f => (f.id === folderId ? updated : f)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder');
    }
  };

  const getFolderPathName = (folderId: string | null): string => {
    if (!folderId) return 'All Bookmarks';
    if (folderId === 'all') return 'All Bookmarks';
    if (folderId === 'favorites') return 'Favorites';

    const folder = folders.find(f => f.id === folderId);
    if (!folder) return 'Unknown Folder';

    const getParentPath = (folder: Folder): string => {
      if (!folder.parentId) return folder.name;
      const parent = folders.find(f => f.id === folder.parentId);
      if (!parent) return folder.name;
      return `${getParentPath(parent)} > ${folder.name}`;
    };

    return getParentPath(folder);
  };

  const getAllChildFolderIds = (folderId: string): string[] => {
    const directChildren = folders.filter(f => f.parentId === folderId).map(f => f.id);
    const allChildren = [...directChildren];
    directChildren.forEach(childId => {
      allChildren.push(...getAllChildFolderIds(childId));
    });
    return allChildren;
  };

  return {
    folders,
    isLoading,
    error,
    createFolder,
    updateFolder,
    getFolderPathName,
    getAllChildFolderIds,
  };
}
