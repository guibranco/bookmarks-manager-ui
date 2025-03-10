import React from 'react';
import { ExternalLink, Star, Lock } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onBookmarkClick: (bookmark: Bookmark) => void;
  onToggleFavorite: (id: string) => void;
  isAuthenticated: boolean;
}

/**
 * A functional component that renders a list of bookmarks in a table format.
 * Each bookmark displays its title, URL, tags, date added, and provides actions
 * Each bookmark can be clicked to trigger a callback, and users can toggle favorites if authenticated.
 *
 * @param {Object} props - The properties for the component.
 * @param {Array} props.bookmarks - An array of bookmark objects to display.
 * @param {Function} props.onBookmarkClick - Callback function triggered when a bookmark is clicked.
 * @param {Function} props.onToggleFavorite - Callback function triggered when the favorite status of a bookmark is toggled.
 * @param {boolean} props.isAuthenticated - Indicates if the user is authenticated, affecting the ability to toggle favorites.
 *
 * @returns {JSX.Element} The rendered bookmark list component.
 *
 * @example
 * <BookmarkList
 *   bookmarks={bookmarksArray}
 *   onBookmarkClick={handleBookmarkClick}
 *   onToggleFavorite={handleToggleFavorite}
 *   isAuthenticated={true}
 * />
 *
 * @throws {Error} Throws an error if the bookmarks array is not provided or is not an array.
 */
const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onBookmarkClick, onToggleFavorite, isAuthenticated }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
              URL
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              Tags
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
              Date Added
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {bookmarks.map((bookmark) => (
            <tr 
              key={bookmark.id} 
              className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
              onClick={() => onBookmarkClick(bookmark)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                    {bookmark.thumbnail ? (
                      <img className="h-10 w-10 rounded object-cover" src={bookmark.thumbnail} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{bookmark.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {bookmark.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 md:hidden">
                      {bookmark.url.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {bookmark.url.replace(/^https?:\/\//, '')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.slice(0, 2).map(tag => (
                    <span 
                      key={tag} 
                      className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tag}
                    </span>
                  ))}
                  {bookmark.tags.length > 2 && (
                    <span 
                      className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      +{bookmark.tags.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                {new Date(bookmark.dateAdded).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(bookmark.id);
                    }}
                    className={`p-1 rounded-full ${isAuthenticated
                        ? 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800'
                        : 'bg-gray-200/80 dark:bg-gray-700/80 cursor-not-allowed'
                      } transition-colors`}
                    aria-label={bookmark.favorite ? "Remove from favorites" : "Add to favorites"}
                    disabled={!isAuthenticated}
                  >
                    {isAuthenticated ? (
                      <Star
                        className={`h-5 w-5 ${bookmark.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                      />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
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
  );
};

export default BookmarkList;