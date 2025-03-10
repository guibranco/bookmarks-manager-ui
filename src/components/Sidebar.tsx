import React, { useState, useEffect } from 'react';
import { Folder, Star, Tag, ChevronDown, ChevronRight, Bookmark, Plus, Lock } from 'lucide-react';
import { Folder as FolderType, Bookmark as BookmarkType } from '../types';

interface SidebarProps {
  folders: FolderType[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  bookmarks: BookmarkType[];
  onAddFolder: (parentId: string | null) => void;
  isAuthenticated: boolean;
}

/**
 * Sidebar component that displays folders, bookmarks, and tags.
 * It allows users to navigate through their bookmarks and manage folders.
 *
 * @param {Object} props - The properties for the Sidebar component.
 * @param {Array<FolderType>} props.folders - The list of folders to display.
 * @param {string} props.selectedFolder - The ID of the currently selected folder.
 * @param {function} props.onSelectFolder - Callback function to handle folder selection.
 * @param {Array<BookmarkType>} props.bookmarks - The list of bookmarks to display.
 * @param {function} props.onAddFolder - Callback function to handle adding a new folder.
 * @param {boolean} props.isAuthenticated - Indicates if the user is authenticated.
 *
 * @returns {JSX.Element} The rendered Sidebar component.
 */
const Sidebar: React.FC<SidebarProps> = ({ 
  folders, 
  selectedFolder, 
  onSelectFolder, 
  bookmarks,
  onAddFolder,
  isAuthenticated
}) => {
  // Load expanded sections from localStorage or use defaults
  /**
   * Loads the expanded sections configuration from local storage.
   *
   * This function attempts to retrieve a JSON string from local storage under the key
   * 'bookmarkManagerExpandedSections'. If the string is found, it attempts to parse it
   * into an object. If parsing fails, it logs an error to the console and returns a default
   * configuration.
   *
   * The default configuration returned is:
   * - folders: true
   * - favorites: true
   * - tags: false
   *
   * @returns {Object} An object representing the expanded sections configuration.
   * @returns {boolean} return.folders Indicates if folders are expanded.
   * @returns {boolean} return.favorites Indicates if favorites are expanded.
   * @returns {boolean} return.tags Indicates if tags are expanded.
   *
   * @throws {Error} Throws an error if JSON parsing fails, which is caught and logged.
   *
   * @example
   * const config = loadExpandedSections();
   * console.log(config); // { folders: true, favorites: true, tags: false }
   */
  const loadExpandedSections = () => {
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
  };

  // Load expanded folders from localStorage or use empty object
  /**
   * Loads expanded folders from the local storage.
   *
   * This function retrieves the 'bookmarkManagerExpandedFolders' item from local storage,
   * attempts to parse it as JSON, and returns the resulting object. If the item does not exist
   * or if parsing fails, it returns an empty object.
   *
   * @returns {Object} An object representing the expanded folders. If no data is found or an error
   * occurs during parsing, an empty object is returned.
   *
   * @throws {SyntaxError} Throws a SyntaxError if the stored data is not valid JSON.
   *
   * @example
   * const expandedFolders = loadExpandedFolders();
   * console.log(expandedFolders); // Outputs the expanded folders or an empty object.
   */
  const loadExpandedFolders = () => {
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
  };

  const [expandedSections, setExpandedSections] = useState(loadExpandedSections());
  
  // Track expanded folder states
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(loadExpandedFolders());

  // Save expanded sections to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bookmarkManagerExpandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Save expanded folders to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bookmarkManagerExpandedFolders', JSON.stringify(expandedFolders));
  }, [expandedFolders]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId]
    });
  };

  // Get unique tags from all bookmarks
  const allTags = Array.from(new Set(bookmarks.flatMap(bookmark => bookmark.tags)));
  
  // Count favorites
  const favoritesCount = bookmarks.filter(bookmark => bookmark.favorite).length;

  // Organize folders into a hierarchical structure
  const rootFolders = folders.filter(folder => folder.parentId === null);
  
  // Get subfolders for a given parent folder
  const getSubfolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  // Count bookmarks in a folder and its subfolders
  const countFolderBookmarks = (folderId: string): number => {
    const directBookmarks = bookmarks.filter(b => b.folderId === folderId).length;
    const subfolderIds = folders.filter(f => f.parentId === folderId).map(f => f.id);
    const subfolderBookmarks = subfolderIds.reduce((count, subfolderId) => {
      return count + countFolderBookmarks(subfolderId);
    }, 0);
    
    return directBookmarks + subfolderBookmarks;
  };

  // Recursive function to render folder and its subfolders
  const renderFolder = (folder: FolderType, depth: number = 0) => {
    const subfolders = getSubfolders(folder.id);
    const hasSubfolders = subfolders.length > 0;
    const isExpanded = expandedFolders[folder.id] || false;
    const folderBookmarksCount = countFolderBookmarks(folder.id);
    
    return (
      <div key={folder.id} className="mb-1">
        <div className="flex items-center">
          {hasSubfolders ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-5"></div>
          )}
          
          <button
            className={`flex-1 flex items-center justify-between p-2 rounded-md ${
              selectedFolder === folder.id 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <span className="truncate">{folder.name}</span>
            {folderBookmarksCount > 0 && (
              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                {folderBookmarksCount}
              </span>
            )}
          </button>
        </div>
        
        {hasSubfolders && isExpanded && (
          <div className={`ml-4 mt-1 space-y-1`}>
            {subfolders.map(subfolder => renderFolder(subfolder, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto flex-shrink-0">
      <div className="p-4">
        {!isAuthenticated && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-xs text-yellow-800 dark:text-yellow-300 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-yellow-500" />
            <span>Read-only mode</span>
          </div>
        )}

        <div className="mb-6">
          <button
            className={`w-full flex items-center justify-between p-2 rounded-md ${
              selectedFolder === 'all' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
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

        {/* Favorites Section */}
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
                className={`w-full flex items-center justify-between p-2 rounded-md ${
                  selectedFolder === 'favorites' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
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

        {/* Folders Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => toggleSection('folders')}
          >
            <div className="flex items-center">
              <Folder className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">Folders</span>
            </div>
            <div className="flex items-center">
              {isAuthenticated && (
                <button 
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
                  aria-label="Add folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFolder(null);
                  }}
                >
                  <Plus className="h-4 w-4 text-gray-500" />
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

        {/* Tags Section */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between p-2 cursor-pointer"
            onClick={() => toggleSection('tags')}
          >
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-green-500" />
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
                    <div 
                      key={tag}
                      className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs"
                    >
                      <span>{tag}</span>
                      <span className="ml-1 bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded-full text-xs">
                        {tagCount}
                      </span>
                    </div>
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