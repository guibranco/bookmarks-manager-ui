import { useState } from 'react';
import { Folder } from '../types';
import { sampleFolders } from '../data/sampleData';

export function useFolders(isAuthenticated: boolean) {
  const [folders, setFolders] = useState<Folder[]>(sampleFolders);

  const createFolder = (name: string, parentId: string | null) => {
    if (!isAuthenticated) return;

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
    };
    setFolders([...folders, newFolder]);
  };

  const updateFolder = (folderId: string, newName: string) => {
    if (!isAuthenticated) return;
    setFolders(folders.map(f => (f.id === folderId ? { ...f, name: newName } : f)));
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
    createFolder,
    updateFolder,
    getFolderPathName,
    getAllChildFolderIds,
  };
}
