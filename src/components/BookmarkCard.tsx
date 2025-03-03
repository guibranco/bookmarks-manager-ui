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
 * @param {Object} props.bookmark - The bookmark object containing details to display.
 * @param {string} props.bookmark.title - The title of the bookmark.
 * @param {string} props.bookmark.url - The URL of the bookmark.
 * @param {string} [props.bookmark.thumbnail] - The thumbnail image URL for the bookmark.
 * @param {string} [props.bookmark.description] - A brief description of the bookmark.
 * @param {Array<string>} props.bookmark.tags - An array of tags associated with the bookmark.
 * @param {boolean} props.bookmark.favorite - Indicates if the bookmark is marked as favorite.
 * @param {function} props.onClick - Callback function to handle click events on the card.
 * @param {function} props.onToggleFavorite - Callback function to toggle the favorite status of the bookmark.
 * @param {boolean} props.isAuthenticated - Indicates if the user is authenticated.
 *
 * @returns {JSX.Element} The rendered bookmark card component.
 *
 * @example
 * <BookmarkCard
 *   bookmark={{
 *     title: "Example Bookmark",
 *     url: "https://example.com",
 *     thumbnail: "https://example.com/image.jpg",
 *     description: "This is an example bookmark.",
 *     tags: ["example", "bookmark"],
 *     favorite: false
 *   }}
 *   onClick={() => console.log('Bookmark clicked')}
 *   onToggleFavorite={() => console.log('Toggle favorite')}
 *   isAuthenticated={true}
 * />
 */
const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onClick, onToggleFavorite, isAuthenticated }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
    >
      <div 
        className="h-32 bg-gray-200 dark:bg-gray-700 relative cursor-pointer"
        onClick={onClick}
      >
        {bookmark.thumbnail && (
          <img 
            src={bookmark.thumbnail} 
            alt={bookmark.title} 
            className="w-full h-full object-cover"
          />
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2 right-2 p-1 rounded-full ${
            isAuthenticated 
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
      </div>
      
      <div className="p-4 flex-1 flex flex-col" onClick={onClick}>
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-lg truncate">{bookmark.title}</h3>
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-2 flex-shrink-0"
            aria-label="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{bookmark.description}</p>
        
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