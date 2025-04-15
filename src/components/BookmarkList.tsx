import React from 'react';
import { ExternalLink, Star, Lock } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onBookmarkClick: (bookmark: Bookmark) => void;
  onToggleFavorite: (id: string) => void;
  isAuthenticated: boolean;
}

const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  onBookmarkClick,
  onToggleFavorite,
  isAuthenticated,
}) => {
  // Extract domain for favicon
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Large screens - Table view */}
      <div className="hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell"
              >
                URL
              </th>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell"
              >
                Tags
              </th>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell"
              >
                Date Added
              </th>
              <th scope="col" className="relative px-4 sm:px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bookmarks.map(bookmark => (
              <tr
                key={bookmark.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                onClick={() => onBookmarkClick(bookmark)}
              >
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 shrink-0 mr-3">
                      {bookmark.thumbnail ? (
                        <img
                          className="h-10 w-10 rounded-sm object-cover"
                          src={bookmark.thumbnail}
                          alt=""
                          onError={e => {
                            const favicon = getFaviconUrl(bookmark.url);
                            if (favicon) {
                              (e.target as HTMLImageElement).src = favicon;
                              (e.target as HTMLImageElement).className =
                                'h-10 w-10 rounded-sm object-contain p-1 bg-white dark:bg-gray-700';
                            }
                          }}
                        />
                      ) : (
                        <img
                          src={getFaviconUrl(bookmark.url) || ''}
                          alt=""
                          className="h-10 w-10 rounded-sm object-contain p-1 bg-white dark:bg-gray-700"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"%3E%3C/path%3E%3C/svg%3E';
                            (e.target as HTMLImageElement).className =
                              'h-10 w-10 rounded-sm object-contain p-2 opacity-20';
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {bookmark.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {bookmark.url.replace(/^https?:\/\//, '')}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        {tag}
                      </span>
                    ))}
                    {bookmark.tags.length > 2 && (
                      <span
                        className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        +{bookmark.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  {new Date(bookmark.dateAdded).toLocaleDateString()}
                </td>
                <td className="px-4 sm:px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggleFavorite(bookmark.id);
                      }}
                      className={`${
                        isAuthenticated
                          ? 'text-gray-400 hover:text-yellow-500'
                          : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      }`}
                      aria-label={bookmark.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      disabled={!isAuthenticated}
                    >
                      {isAuthenticated ? (
                        <Star
                          className={`h-5 w-5 ${bookmark.favorite ? 'text-yellow-400 fill-yellow-400' : ''}`}
                        />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </button>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      aria-label="Open link"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Card layout */}
      <div className="sm:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {bookmarks.map(bookmark => (
            <div
              key={bookmark.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
              onClick={() => onBookmarkClick(bookmark)}
            >
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 shrink-0">
                  {bookmark.thumbnail ? (
                    <img
                      className="h-12 w-12 rounded-sm object-cover"
                      src={bookmark.thumbnail}
                      alt=""
                      onError={e => {
                        const favicon = getFaviconUrl(bookmark.url);
                        if (favicon) {
                          (e.target as HTMLImageElement).src = favicon;
                          (e.target as HTMLImageElement).className =
                            'h-12 w-12 rounded-sm object-contain p-2 bg-white dark:bg-gray-700';
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={getFaviconUrl(bookmark.url) || ''}
                      alt=""
                      className="h-12 w-12 rounded-sm object-contain p-2 bg-white dark:bg-gray-700"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"%3E%3C/path%3E%3C/svg%3E';
                        (e.target as HTMLImageElement).className =
                          'h-12 w-12 rounded-sm object-contain p-3 opacity-20';
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {bookmark.title}
                    </h3>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleFavorite(bookmark.id);
                        }}
                        className={`${
                          isAuthenticated
                            ? 'text-gray-400 hover:text-yellow-500'
                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                        aria-label={
                          bookmark.favorite ? 'Remove from favorites' : 'Add to favorites'
                        }
                        disabled={!isAuthenticated}
                      >
                        {isAuthenticated ? (
                          <Star
                            className={`h-4 w-4 ${bookmark.favorite ? 'text-yellow-400 fill-yellow-400' : ''}`}
                          />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        aria-label="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                    {bookmark.url.replace(/^https?:\/\//, '')}
                  </p>
                  {bookmark.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-sm"
                          onClick={e => e.stopPropagation()}
                        >
                          {tag}
                        </span>
                      ))}
                      {bookmark.tags.length > 2 && (
                        <span
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-0.5 rounded-sm"
                          onClick={e => e.stopPropagation()}
                        >
                          +{bookmark.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(bookmark.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookmarkList;
