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
 * Sidebar component for managing and displaying bookmarks, folders, and tags.
 *
 * This component allows users to navigate through their bookmarks organized in folders,
 * view favorites, and manage tags. It supports expanding and collapsing sections for better
 * organization and user experience.
 *
 * @param {Object} props - The properties for the Sidebar component.
 * @param {Array<FolderType>} props.folders - The list of folders to display.
 * @param {string} props.selectedFolder - The ID of the currently selected folder.
 * @param {function} props.onSelectFolder - Callback function to handle folder selection.
 * @param {Array<BookmarkType>} props.bookmarks - The list of bookmarks to display.
 * @param {function} props.onAddFolder - Callback function to handle adding a new folder.
 * @param {boolean} props.isAuthenticated - Indicates if the user is authenticated.
 */
const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFolder,
  onSelectFolder,
  bookmarks,
  onAddFolder,
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

  useEffect(() => {
    localStorage.setItem('bookmarkManagerExpandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    localStorage.setItem('bookmarkManagerExpandedFolders', JSON.stringify(expandedFolders));
  }, [expandedFolders]);

  /**
   * Toggles the expanded state of a specified section.
   *
   * This function updates the state of expanded sections by inverting the current
   * value of the specified section. It is typically used in UI components to show
   * or hide content based on user interaction.
   *
   * @param {keyof typeof expandedSections} section - The key representing the section
   * to be toggled. This should match one of the keys defined in the expandedSections object.
   *
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if the provided section key does not exist in
   * expandedSections.
   */
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /**
   * Toggles the expanded state of a folder identified by its ID.
   *
   * This function updates the state of expanded folders by inverting the current
   * expanded state for the specified folder. If the folder is currently expanded,
   * it will be collapsed, and vice versa.
   *
   * @param {string} folderId - The unique identifier of the folder to toggle.
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if the folderId is not a valid string.
   */
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const allTags = Array.from(new Set(bookmarks.flatMap(bookmark => bookmark.tags)));
  const favoritesCount = bookmarks.filter(bookmark => bookmark.favorite).length;
  const rootFolders = folders.filter(folder => folder.parentId === null);

  const getSubfolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  /**
   * Counts the total number of bookmarks within a specified folder, including bookmarks in its subfolders.
   *
   * This function first counts the direct bookmarks that belong to the specified folder.
   * It then retrieves all subfolder IDs that are children of the specified folder and recursively counts
   * the bookmarks in each of those subfolders.
   *
   * @param {string} folderId - The unique identifier of the folder for which to count bookmarks.
   * @returns {number} The total number of bookmarks found in the specified folder and its subfolders.
   *
   * @throws {Error} Throws an error if the folderId is invalid or does not exist.
   */
  const countFolderBookmarks = (folderId: string): number => {
    const directBookmarks = bookmarks.filter(b => b.folderId === folderId).length;
    const subfolderIds = folders.filter(f => f.parentId === folderId).map(f => f.id);
    const subfolderBookmarks = subfolderIds.reduce((count, subfolderId) => {
      return count + countFolderBookmarks(subfolderId);
    }, 0);

    return directBookmarks + subfolderBookmarks;
  };

  /**
   * Renders a folder and its subfolders recursively.
   *
   * This function generates a visual representation of a folder, including its name,
   * a button to toggle the visibility of its subfolders, and a count of bookmarks within
   * the folder. If the folder contains subfolders, it will render them based on the current
   * expansion state.
   *
   * @param {FolderType} folder - The folder object to render.
   * @param {number} [depth=0] - The current depth of the folder in the hierarchy, used for indentation.
   * @returns {JSX.Element} A JSX element representing the folder and its contents.
   *
   * @throws {Error} Throws an error if the folder is invalid or cannot be rendered.
   */
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
            <div className="w-5" />
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
                  onClick={e => {
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
                      className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-sm text-xs"
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
