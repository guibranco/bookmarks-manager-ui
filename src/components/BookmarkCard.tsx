import React from 'react';
import { ExternalLink, Star, Lock } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick: () => void;
  onToggleFavorite: () => void;
  isAuthenticated: boolean;
}

/**
 * A functional component that renders a bookmark card displaying the bookmark's details.
 *
 * @param {Object} props - The properties for the BookmarkCard component.
 * @param {Bookmark} props.bookmark - The bookmark object containing details such as title, url, thumbnail, description, and tags.
 * @param {Function} props.onClick - Callback function to handle click events on the card.
 * @param {Function} props.onToggleFavorite - Callback function to toggle the favorite status of the bookmark.
 * @param {boolean} props.isAuthenticated - Indicates whether the user is authenticated.
 *
 * @returns {JSX.Element} The rendered bookmark card component.
 *
 * @throws {Error} Throws an error if the URL provided for favicon extraction is invalid.
 */
const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onClick,
  onToggleFavorite,
  isAuthenticated,
}) => {
  // Extract domain for favicon
  /**
   * Retrieves the favicon URL for a given website URL.
   *
   * This function takes a URL as input, extracts the hostname, and constructs a URL to fetch the favicon
   * from Google's favicon service. If the input URL is invalid, it returns null.
   *
   * @param {string} url - The website URL from which to extract the favicon.
   * @returns {string | null} The URL of the favicon or null if the input URL is invalid.
   *
   * @throws {Error} Throws an error if the URL cannot be parsed.
   */
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 relative cursor-pointer" onClick={onClick}>
        {bookmark.thumbnail ? (
          <img
            src={bookmark.thumbnail}
            alt={bookmark.title}
            className="w-full h-full object-cover"
            onError={e => {
              const favicon = getFaviconUrl(bookmark.url);
              if (favicon) {
                (e.target as HTMLImageElement).src = favicon;
                (e.target as HTMLImageElement).className =
                  'w-full h-full object-contain p-8 bg-white dark:bg-gray-800';
              }
            }}
          />
        ) : (
          <img
            src={getFaviconUrl(bookmark.url) || ''}
            alt={bookmark.title}
            className="w-full h-full object-contain p-8 bg-white dark:bg-gray-800"
            onError={e => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"%3E%3C/path%3E%3C/svg%3E';
              (e.target as HTMLImageElement).className =
                'w-full h-full object-contain p-8 opacity-20';
            }}
          />
        )}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2 right-2 p-1 rounded-full ${
            isAuthenticated
              ? 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800'
              : 'bg-gray-200/80 dark:bg-gray-700/80 cursor-not-allowed'
          } transition-colors`}
          aria-label={bookmark.favorite ? 'Remove from favorites' : 'Add to favorites'}
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
      </div>

      <div className="p-4 flex-1 flex flex-col" onClick={onClick}>
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-lg truncate">{bookmark.title}</h3>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-2 flex-shrink-0"
            aria-label="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
          {bookmark.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {bookmark.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {bookmark.tags.length > 3 && (
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded">
              +{bookmark.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
