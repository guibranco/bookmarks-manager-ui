import React from 'react';
import { Grid, List, Bookmark as BookmarkIcon } from 'lucide-react';
import { Bookmark, AppConfig } from '../types.d.ts';
import BookmarkCard from './BookmarkCard';
import BookmarkList from './BookmarkList';
import AuthWarning from './AuthWarning';

interface MainContentProps {
  config: AppConfig;
  isAuthenticated: boolean;
  selectedFolder: string | null;
  filteredBookmarks: Bookmark[];
  folderPath: string;
  onToggleView: (view: 'grid' | 'list') => void;
  onBookmarkClick: (bookmark: Bookmark) => void;
  onToggleFavorite: (id: string) => void;
  onOpenSettings: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  config,
  isAuthenticated,
  selectedFolder,
  filteredBookmarks,
  folderPath,
  onToggleView,
  onBookmarkClick,
  onToggleFavorite,
  onOpenSettings,
}) => {
  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{folderPath}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleView('grid')}
              className={`p-2 rounded ${config.viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => onToggleView('list')}
              className={`p-2 rounded ${config.viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated && <AuthWarning onOpenSettings={onOpenSettings} />}

        {filteredBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <BookmarkIcon className="h-12 w-12 mb-2" />
            <p className="text-lg">No bookmarks found</p>
            {isAuthenticated && (
              <button
                onClick={() =>
                  onBookmarkClick({
                    id: `bookmark-${Date.now()}`,
                    title: 'New Bookmark',
                    url: 'https://example.com',
                    description: 'Add a description',
                    thumbnail: '',
                    tags: [],
                    folderId:
                      selectedFolder === 'all' || selectedFolder === 'favorites'
                        ? null
                        : selectedFolder,
                    favorite: false,
                    dateAdded: new Date().toISOString(),
                  })
                }
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
              >
                Add Bookmark
              </button>
            )}
          </div>
        ) : config.viewMode === 'grid' ? (
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
    </main>
  );
};

export default MainContent;
