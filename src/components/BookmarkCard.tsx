import React from 'react';
import { ExternalLink, Star, Lock } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick: () => void;
  onToggleFavorite: () => void;
  isAuthenticated: boolean;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onClick,
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
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
            className="text-secondary dark:text-secondary-light hover:text-secondary-dark dark:hover:text-secondary ml-2 shrink-0"
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
              className="inline-block bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light text-xs px-2 py-1 rounded-sm"
            >
              {tag}
            </span>
          ))}
          {bookmark.tags.length > 3 && (
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-sm">
              +{bookmark.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
