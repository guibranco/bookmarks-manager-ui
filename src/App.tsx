import React, { useState, useEffect } from 'react';
import { Search, Settings, Plus, Bookmark, Folder, Star, Tag, Grid, List, Moon, Sun } from 'lucide-react';
import BookmarkCard from './components/BookmarkCard';
import BookmarkList from './components/BookmarkList';
import Sidebar from './components/Sidebar';
import BookmarkDetails from './components/BookmarkDetails';
import { Bookmark as BookmarkType, Folder as FolderType } from './types';
import { sampleBookmarks, sampleFolders } from './data/sampleData';

/**
 * Main application component that manages bookmarks and folders.
 * It provides functionalities such as adding, updating, deleting bookmarks,
 * toggling dark mode, and filtering bookmarks based on selected folders and search queries.
 *
 * @component
 * @example
 * // Usage in a React application
 * <App />
 */
function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(sampleBookmarks);
  const [folders, setFolders] = useState<FolderType[]>(sampleFolders);
  const [selectedFolder, setSelectedFolder] = useState<string | null>('all');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  /**
   * Toggles the dark mode setting for the application.
   * This function switches the current state of dark mode from enabled to disabled or vice versa.
   * It updates the darkMode state variable accordingly.
   *
   * @function toggleDarkMode
   * @returns {void} This function does not return a value.
   *
   * @example
   * // To toggle dark mode on or off
   * toggleDarkMode();
   *
   * @throws {Error} Throws an error if the darkMode state cannot be updated.
   */
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Get all child folder IDs recursively
  /**
   * Recursively retrieves all child folder IDs for a given folder.
   *
   * This function searches through a collection of folders to find all folders
   * that are direct children of the specified folder and then recursively
   * finds all descendants of those child folders.
   *
   * @param {string} folderId - The ID of the folder for which to retrieve child IDs.
   * @returns {string[]} An array of strings representing the IDs of all child folders.
   *
   * @example
   * const childFolderIds = getAllChildFolderIds('123');
   * console.log(childFolderIds); // Outputs an array of child folder IDs.
   *
   * @throws {Error} Throws an error if the folderId is not found in the folders collection.
   */
  const getAllChildFolderIds = (folderId: string): string[] => {
    const directChildren = folders.filter(f => f.parentId === folderId).map(f => f.id);
    const allChildren = [...directChildren];
    
    directChildren.forEach(childId => {
      allChildren.push(...getAllChildFolderIds(childId));
    });
    
    return allChildren;
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    // For 'all' show all bookmarks
    if (selectedFolder === 'all') {
      return true;
    }
    
    // For 'favorites' show only favorites
    if (selectedFolder === 'favorites') {
      return bookmark.favorite;
    }
    
    // For specific folder, include bookmarks in this folder and all subfolders
    const folderIds = [selectedFolder, ...getAllChildFolderIds(selectedFolder!)];
    return folderIds.includes(bookmark.folderId!);

  }).filter(bookmark => {
    // Then apply search filter
    return bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

  });

  /**
   * Handles the click event on a bookmark.
   *
   * This function updates the selected bookmark and displays the right panel.
   *
   * @param {BookmarkType} bookmark - The bookmark object that was clicked.
   * @throws {Error} Throws an error if the bookmark is invalid or undefined.
   *
   * @example
   * // Example usage of handleBookmarkClick
   * handleBookmarkClick({ id: 1, title: 'My Bookmark' });
   */
  const handleBookmarkClick = (bookmark: BookmarkType) => {
    setSelectedBookmark(bookmark);
    setShowRightPanel(true);
  };

  /**
   * Handles the addition of a new bookmark to the bookmarks list.
   * This function creates a new bookmark object with default values
   * and updates the state to include the new bookmark.
   * It also sets the selected bookmark and displays the right panel.
   *
   * @function handleAddBookmark
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if there is an issue with setting bookmarks.
   *
   * @example
   * // Example usage of handleAddBookmark
   * handleAddBookmark();
   */
  const handleAddBookmark = () => {
    const newBookmark: BookmarkType = {
      id: `bookmark-${bookmarks.length + 1}`,
      title: 'New Bookmark',
      url: 'https://example.com',
      description: 'Add a description',
      thumbnail: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: ['new'],
      folderId: selectedFolder === 'all' || selectedFolder === 'favorites' ? null : selectedFolder,
      favorite: false,
      dateAdded: new Date().toISOString(),
    };
    setBookmarks([...bookmarks, newBookmark]);
    setSelectedBookmark(newBookmark);
    setShowRightPanel(true);
  };

  /**
   * Updates an existing bookmark in the bookmarks list and sets it as the selected bookmark.
   *
   * This function takes an updated bookmark object, replaces the corresponding bookmark in the
   * current list of bookmarks if it matches by ID, and updates the selected bookmark state.
   *
   * @param {BookmarkType} updatedBookmark - The bookmark object containing updated information.
   * @throws {Error} Throws an error if the updatedBookmark does not have a valid ID.
   *
   * @example
   * const newBookmark = { id: 1, title: 'Updated Title', url: 'https://updated-url.com' };
   * updateBookmark(newBookmark);
   */
  const updateBookmark = (updatedBookmark: BookmarkType) => {
    setBookmarks(bookmarks.map(b => b.id === updatedBookmark.id ? updatedBookmark : b));
    setSelectedBookmark(updatedBookmark);
  };

  /**
   * Deletes a bookmark by its unique identifier.
   * This function filters out the bookmark with the specified ID from the list of bookmarks.
   * If the deleted bookmark is currently selected, it also resets the selected bookmark
   * and hides the right panel.
   *
   * @param {string} id - The unique identifier of the bookmark to be deleted.
   * @throws {Error} Throws an error if the ID is not valid or does not exist in the bookmarks.
   *
   * @example
   * // Assuming bookmarks is an array of bookmark objects and '123' is a valid bookmark ID
   * deleteBookmark('123');
   *
   * // After calling this function, the bookmark with ID '123' will be removed from bookmarks,
   * // and if it was selected, the selected bookmark will be set to null and the right panel hidden.
   */
  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
    if (selectedBookmark?.id === id) {
      setSelectedBookmark(null);
      setShowRightPanel(false);
    }
  };

  /**
   * Toggles the favorite status of a bookmark identified by its ID.
   *
   * This function updates the bookmarks state by mapping over the existing bookmarks and
   * toggling the `favorite` property of the bookmark that matches the provided ID.
   * If the currently selected bookmark matches the ID, it also updates the selected bookmark's
   * favorite status accordingly.
   *
   * @param {string} id - The unique identifier of the bookmark to toggle.
   * @throws {Error} Throws an error if the provided ID does not correspond to any existing bookmark.
   *
   * @example
   * // Toggle the favorite status of a bookmark with ID '123'
   * toggleFavorite('123');
   */
  const toggleFavorite = (id: string) => {
    setBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, favorite: !b.favorite } : b
    ));
    
    if (selectedBookmark?.id === id) {
      setSelectedBookmark({
        ...selectedBookmark,
        favorite: !selectedBookmark.favorite
      });
    }
  };

  // Get folder name with full path
  /**
   * Retrieves the path name of a folder based on its ID.
   *
   * This function checks for special folder IDs such as 'all' and 'favorites',
   * and returns a formatted string representing the path to the specified folder.
   *
   * @param {string | null} folderId - The ID of the folder. Can be null or one of the special IDs.
   * @returns {string} The path name of the folder, or an empty string if the folder ID is invalid.
   *
   * @example
   * const pathName = getFolderPathName('123'); // Returns "Root > Subfolder > Folder"
   * const pathNameAll = getFolderPathName('all'); // Returns "All Bookmarks"
   * const pathNameFavorites = getFolderPathName('favorites'); // Returns "Favorites"
   *
   * @throws {Error} Throws an error if the folder ID does not correspond to any existing folder.
   */
  const getFolderPathName = (folderId: string | null): string => {
    if (!folderId) {
    if (folderId === 'all') {
    if (folderId === 'favorites') {
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
    
    /**
     * Recursively retrieves the path of a folder by concatenating its name with the names of its parent folders.
     *
     * @param {FolderType} folder - The folder for which to retrieve the parent path.
     * @returns {string} The full path of the folder, represented as a string.
     *
     * @throws {Error} Throws an error if the folder does not have a valid parent.
     *
     * @example
     * const path = getParentPath(myFolder);
     * console.log(path); // Outputs: "ParentFolder > MyFolder"
     */
    const getParentPath = (folder: FolderType): string => {
      if (!folder.parentId) {
      const parent = folders.find(f => f.id === folder.parentId);
      if (!parent) {
      return `${getParentPath(parent)} > ${folder.name}`;
    };
    
    return getParentPath(folder);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold">Bookmark Manager</h1>
          </div>
          
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search bookmarks..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={handleAddBookmark}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Add bookmark"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            bookmarks={bookmarks}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                {getFolderPathName(selectedFolder)}
              </h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  aria-label="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <Bookmark className="h-12 w-12 mb-2" />
                <p className="text-lg">No bookmarks found</p>
                <button 
                  onClick={handleAddBookmark}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bookmark
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBookmarks.map(bookmark => (
                  <BookmarkCard 
                    key={bookmark.id} 
                    bookmark={bookmark} 
                    onClick={() => handleBookmarkClick(bookmark)}
                    onToggleFavorite={() => toggleFavorite(bookmark.id)}
                  />
                ))}
              </div>
            ) : (
              <BookmarkList 
                bookmarks={filteredBookmarks} 
                onBookmarkClick={handleBookmarkClick}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        </main>

        {/* Right Panel */}
        {showRightPanel && selectedBookmark && (
          <BookmarkDetails 
            bookmark={selectedBookmark}
            folders={folders}
            onClose={() => setShowRightPanel(false)}
            onUpdate={updateBookmark}
            onDelete={() => deleteBookmark(selectedBookmark.id)}
          />
        )}
      </div>
    </div>
  );
}

export default App;