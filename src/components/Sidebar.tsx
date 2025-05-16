import React, { useState, useEffect } from 'react';
import { Folder, Star, Tag, ChevronDown, ChevronRight, Bookmark, Plus, Lock, Edit2, Check, X } from 'lucide-react';
import { Folder as FolderType, Bookmark as BookmarkType } from '../types';

interface SidebarProps {
  folders: FolderType[];
  selectedFolder: string | null;
  selectedTag: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  bookmarks: BookmarkType[];
  onAddFolder: (parentId: string | null) => void;
  onUpdateFolder: (folderId: string, newName: string) => void;
  isAuthenticated: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFolder,
  selectedTag,
  onSelectFolder,
  onSelectTag,
  bookmarks,
  onAddFolder,
  onUpdateFolder,
  isAuthenticated,
}) => {
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('bookmarkManagerExpandedSections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved expanded sections:', e);
        return { folders: true, favorites: true, tags: false };
      }
    }
    return { folders: true, favorites: true, tags: false };
  });

  const [expandedFolders, setExpandedFolders] = useState(() => {
    const saved = localStorage.getItem('bookmarkManagerExpandedFolders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved expanded folders:', e);
        return {};
      }
    }
    return {};
  });

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  useEffect(() => {
    localStorage.setItem('bookmarkManagerExpandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    localStorage.setItem('bookmarkManagerExpandedFolders', JSON.stringify(expandedFolders));
  }, [expandedFolders]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const startEditing = (folder: FolderType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const saveEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingFolderId && editingFolderName.trim()) {
      onUpdateFolder(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingFolderId && editingFolderName.trim()) {
        onUpdateFolder(editingFolderId, editingFolderName.trim());
        setEditingFolderId(null);
        setEditingFolderName('');
      }
    } else if (e.key === 'Escape') {
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  // Create a Set of unique tags and convert back to array
  const allTags = Array.from(new Set(bookmarks.flatMap(bookmark => bookmark.tags))).sort();
  const favoritesCount = bookmarks.filter(bookmark => bookmark.favorite).length;
  const rootFolders = folders.filter(folder => folder.parentId === null);

  const getSubfolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  const countFolderBookmarks = (folderId: string): number => {
    const directBookmarks = bookmarks.filter(b => b.folderId === folderId).length;
    const subfolderIds = folders.filter(f => f.parentId === folderId).map(f => f.id);
    const subfolderBookmarks = subfolderIds.reduce((count, subfolderId) => {
      return count + countFolderBookmarks(subfolderId);
    }, 0);

    return directBookmarks + subfolderBookmarks;
  };

  const renderFolder = (folder: FolderType, depth: number = 0) => {
    const subfolders = getSubfolders(folder.id);
    const hasSubfolders = subfolders.length > 0;
    const isExpanded = expandedFolders[folder.id] || false;
    const folderBookmarksCount = countFolderBookmarks(folder.id);
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id} className="mb-1">
        <div className="flex items-center">
          {hasSubfolders ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md mr-1 cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <div
            className={`group flex-1 flex items-center p-2 rounded-md cursor-pointer ${
              selectedFolder === folder.id
                ? 'bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => !isEditing && onSelectFolder(folder.id)}
          >
            <div className="flex-1 min-w-0 flex items-center">
              {isEditing ? (
                <div className="flex items-center w-full pr-1">
                  <input
                    type="text"
                    value={editingFolderName}
                    onChange={e => setEditingFolderName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-w-0 w-[calc(100%-4rem)] px-2 py-1 bg-white dark:bg-gray-700 border border-primary rounded-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex items-center ml-1 shrink-0">
                    <button
                      onClick={saveEditing}
                      className="p-1 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full cursor-pointer"
                    >
                      <Check className="h-4 w-4 text-primary dark:text-primary-light" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-full ml-1 cursor-pointer"
                    >
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{folder.name}</span>
                  <div className="flex items-center space-x-2 ml-2">
                    {isAuthenticated && (
                      <button
                        onClick={e => startEditing(folder, e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                    {folderBookmarksCount > 0 && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        {folderBookmarksCount}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {hasSubfolders && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {subfolders.map(subfolder => renderFolder(subfolder, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {!isAuthenticated && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-xs text-yellow-800 dark:text-yellow-300 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-yellow-500" />
            <span>Read-only mode</span>
          </div>
        )}

        <div className="mb-6">
          <button
            className={`w-full flex items-center justify-between p-2 rounded-md cursor-pointer ${
              selectedFolder === 'all' && !selectedTag
                ? 'bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => onSelectFolder('all')}
          >
            <div className="flex items-center">
              <Bookmark className="h-5 w-5 mr-2" />
              <span className="font-medium">All Bookmarks</span>
            </div>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
              {bookmarks.length}
            </span>
          </button>
        </div>

        <div className="mb-6">
          <div
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => toggleSection('favorites')}
          >
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              <span className="font-medium">Favorites</span>
            </div>
            {expandedSections.favorites ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>

          {expandedSections.favorites && (
            <div className="ml-4 mt-2">
              <button
                className={`w-full flex items-center justify-between p-2 rounded-md cursor-pointer ${
                  selectedFolder === 'favorites' && !selectedTag
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSelectFolder('favorites')}
              >
                <span>All Favorites</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                  {favoritesCount}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => toggleSection('folders')}
          >
            <div className="flex items-center">
              <Folder className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Folders</span>
            </div>
            <div className="flex items-center">
              {isAuthenticated && (
                <button
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-1 cursor-pointer"
                  aria-label="Add folder"
                  onClick={e => {
                    e.stopPropagation();
                    onAddFolder(null);
                  }}
                >
                  <Plus className="h-4 w-4 text-secondary" />
                </button>
              )}
              {expandedSections.folders ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>

          {expandedSections.folders && (
            <div className="ml-2 mt-2 space-y-1">
              {rootFolders.map(folder => renderFolder(folder))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => toggleSection('tags')}
          >
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Tags</span>
            </div>
            {expandedSections.tags ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>

          {expandedSections.tags && (
            <div className="ml-4 mt-2">
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const tagCount = bookmarks.filter(b => b.tags.includes(tag)).length;
                  return (
                    <button
                      key={`tag-${tag}`}
                      onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                      className={`flex items-center ${
                        selectedTag === tag
                          ? 'bg-primary text-white'
                          : 'bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light'
                      } px-2 py-1 rounded text-xs cursor-pointer hover:opacity-90`}
                    >
                      <span>{tag}</span>
                      <span
                        className={`ml-1 ${
                          selectedTag === tag
                            ? 'bg-primary-dark'
                            : 'bg-primary/20 dark:bg-primary/30'
                        } px-1.5 py-0.5 rounded-full text-xs`}
                      >
                        {tagCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;