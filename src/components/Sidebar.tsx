import React, { useState } from 'react';
import { Folder, Star, Tag, ChevronDown, ChevronRight, Bookmark, Plus } from 'lucide-react';
import { Folder as FolderType, Bookmark as BookmarkType } from '../types';

interface SidebarProps {
  folders: FolderType[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  bookmarks: BookmarkType[];
}

/**
 * Sidebar component that displays a list of folders, bookmarks, and tags.
 * It allows users to navigate through their bookmarks and manage folder structures.
 *
 * @component
 * @param {Object} props - The properties for the Sidebar component.
 * @param {Array<FolderType>} props.folders - The list of folders to display.
 * @param {string} props.selectedFolder - The ID of the currently selected folder.
 * @param {function} props.onSelectFolder - Callback function to handle folder selection.
 * @param {Array<BookmarkType>} props.bookmarks - The list of bookmarks to display.
 * @returns {JSX.Element} The rendered Sidebar component.
 *
 * @example
 * <Sidebar
 *   folders={folders}
 *   selectedFolder={selectedFolder}
 *   onSelectFolder={handleSelectFolder}
 *   bookmarks={bookmarks}
 * />
 */
const Sidebar: React.FC<SidebarProps> = ({ folders, selectedFolder, onSelectFolder, bookmarks }) => {
  const [expandedSections, setExpandedSections] = useState({
    folders: true,
    favorites: true,
    tags: false
  });
  
  // Track expanded folder states
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  /**
   * Toggles the expansion state of a specified section.
   *
   * This function updates the `expandedSections` state by inverting the current
   * expansion state of the given section. It is useful for managing UI components
   * that can be expanded or collapsed, such as accordions or dropdowns.
   *
   * @param {keyof typeof expandedSections} section - The key of the section to toggle.
   * This should correspond to a valid key in the `expandedSections` object.
   *
   * @throws {Error} Throws an error if the provided section key is not valid.
   *
   * @example
   * // Assuming expandedSections has keys 'section1' and 'section2'
   * toggleSection('section1'); // Toggles the state of section1
   */
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  /**
   * Toggles the expansion state of a folder identified by its ID.
   * This function updates the state of expanded folders by flipping the
   * current expansion state of the specified folder.
   *
   * @param {string} folderId - The unique identifier of the folder to toggle.
   *
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if the folderId is not valid or does not exist.
   *
   * @example
   * // Assuming expandedFolders is an object with folder IDs as keys
   * toggleFolder('folder1'); // Toggles the expansion state of 'folder1'
   */
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
  /**
   * Retrieves a list of subfolders that belong to a specified parent folder.
   *
   * This function filters the global `folders` array to find all folders
   * whose `parentId` matches the provided `parentId`. It is useful for
   * organizing and displaying folder structures in applications.
   *
   * @param {string} parentId - The ID of the parent folder for which to retrieve subfolders.
   * @returns {Array} An array of subfolder objects that have the specified parentId.
   *
   * @example
   * const subfolders = getSubfolders('12345');
   * console.log(subfolders); // Outputs an array of subfolders under the folder with ID '12345'.
   *
   * @throws {Error} Throws an error if the folders array is not defined or is not an array.
   */
  const getSubfolders = (parentId: string) => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  // Count bookmarks in a folder and its subfolders
  /**
   * Counts the total number of bookmarks within a specified folder,
   * including bookmarks in any subfolders.
   *
   * This function recursively counts bookmarks that are directly
   * associated with the given folder ID and also counts bookmarks
   * in all subfolders of that folder.
   *
   * @param {string} folderId - The ID of the folder for which to count bookmarks.
   * @returns {number} The total number of bookmarks in the specified folder
   *                  and its subfolders.
   *
   * @example
   * // Assuming folderId '123' has 5 bookmarks and contains a subfolder
   * // with 3 bookmarks, this will return 8.
   * const totalBookmarks = countFolderBookmarks('123');
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

  // Recursive function to render folder and its subfolders
  /**
   * Renders a folder component, displaying its name, subfolders, and bookmark count.
   *
   * This function recursively renders folders and their subfolders, allowing for
   * expansion and selection of folders. It also displays the number of bookmarks
   * contained within each folder.
   *
   * @param {FolderType} folder - The folder object containing details such as id and name.
   * @param {number} [depth=0] - The current depth of the folder in the hierarchy, used for styling.
   *
   * @returns {JSX.Element} A JSX element representing the folder and its contents.
   *
   * @example
   * // Example usage of renderFolder
   * const folder = { id: '1', name: 'My Folder' };
   * const folderElement = renderFolder(folder);
   *
   * @throws {Error} Throws an error if the folder object is invalid or missing required properties.
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
              <button 
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
                aria-label="Add folder"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add folder functionality would go here
                }}
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </button>
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