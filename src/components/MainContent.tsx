import React, { useState } from 'react';
import { Grid, List, Bookmark as BookmarkIcon, FolderPlus, Edit2, Check, X, Share2 } from 'lucide-react';
import { Bookmark, AppConfig, Folder } from '../types.d.ts';
import BookmarkCard from './BookmarkCard';
import BookmarkList from './BookmarkList';
import AuthWarning from './AuthWarning';

interface MainContentProps {
  config: AppConfig;
  isAuthenticated: boolean;
  selectedFolder: string | null;
  selectedTag: string | null;
  folders: Folder[];
  filteredBookmarks: Bookmark[];
  folderPath: string;
  onToggleView: (view: 'grid' | 'list') => void;
  onBookmarkClick: (bookmark: Bookmark) => void;
  onToggleFavorite: (id: string) => void;
  onOpenSettings: () => void;
  onAddFolder: (parentId: string | null) => void;
  onSelectFolder: (folderId: string | null) => void;
  onUpdateFolder: (folderId: string, newName: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  config,
  isAuthenticated,
  selectedFolder,
  selectedTag,
  folders,
  filteredBookmarks,
  folderPath,
  onToggleView,
  onBookmarkClick,
  onToggleFavorite,
  onOpenSettings,
  onAddFolder,
  onSelectFolder,
  onUpdateFolder,
}) => {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const subfolders = folders.filter(folder => folder.parentId === selectedFolder);

  const startEditing = (folder: Folder, e: React.MouseEvent) => {
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

  const handleShare = async () => {
    const url = new URL(window.location.href);
    if (selectedTag) {
      url.searchParams.set('tag', selectedTag);
    } else if (selectedFolder) {
      url.searchParams.set('folder', selectedFolder);
    }
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Bookmarks - ${folderPath}`,
          url: url.toString(),
        });
      } else {
        await navigator.clipboard.writeText(url.toString());
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-semibold">{folderPath}</h2>
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Share folder"
              >
                <Share2 className="h-5 w-5" />
              </button>
              {showShareTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded shadow-lg whitespace-nowrap">
                  Link copied to clipboard!
                  <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedFolder !== 'all' && selectedFolder !== 'favorites' && !selectedTag && isAuthenticated && (
              <button
                onClick={() => onAddFolder(selectedFolder)}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                aria-label="Add subfolder"
              >
                <FolderPlus className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => onToggleView('grid')}
              className={`p-2 rounded cursor-pointer ${config.viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => onToggleView('list')}
              className={`p-2 rounded cursor-pointer ${config.viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated && <AuthWarning onOpenSettings={onOpenSettings} />}

        {!config.flattenSubfolders && subfolders.length > 0 && !selectedTag && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Subfolders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subfolders.map(folder => (
                <div
                  key={folder.id}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => !editingFolderId && onSelectFolder(folder.id)}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <FolderPlus className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                      {editingFolderId === folder.id ? (
                        <input
                          type="text"
                          value={editingFolderName}
                          onChange={e => setEditingFolderName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 px-2 py-1 bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <h4 className="font-medium truncate">{folder.name}</h4>
                      )}
                    </div>
                    <div className="flex items-center ml-2">
                      {editingFolderId === folder.id ? (
                        <>
                          <button
                            onClick={saveEditing}
                            className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full cursor-pointer"
                          >
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-full ml-1 cursor-pointer"
                          >
                            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </>
                      ) : (
                        isAuthenticated && (
                          <button
                            onClick={e => startEditing(folder, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4 text-gray-500" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredBookmarks.length === 0 && subfolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <BookmarkIcon className="h-12 w-12 mb-2" />
            <p className="text-lg">No bookmarks found</p>
          </div>
        ) : (
          <>
            {filteredBookmarks.length > 0 && (
              <div className={!config.flattenSubfolders && subfolders.length > 0 && !selectedTag ? 'mt-6' : ''}>
                {!config.flattenSubfolders && subfolders.length > 0 && !selectedTag && (
                  <h3 className="text-lg font-medium mb-3">Bookmarks</h3>
                )}
                {config.viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookmarks.map(bookmark => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        onClick={() => onBookmarkClick(bookmark)}
                        onToggleFavorite={() => onToggleFavorite(bookmark.id)}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                ) : (
                  <BookmarkList
                    bookmarks={filteredBookmarks}
                    onBookmarkClick={onBookmarkClick}
                    onToggleFavorite={onToggleFavorite}
                    isAuthenticated={isAuthenticated}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default MainContent;