import { useState, useEffect } from 'react';
import { Search, Settings, Plus, Bookmark, Grid, List, Moon, Sun, Menu, Lock, Unlock } from 'lucide-react';
import BookmarkCard from './components/BookmarkCard';
import BookmarkList from './components/BookmarkList';
import Sidebar from './components/Sidebar';
import BookmarkDetails from './components/BookmarkDetails';
import ConfigModal from './components/ConfigModal';
import FolderModal from './components/FolderModal';
import { Bookmark as BookmarkType, Folder as FolderType, AppConfig, AuthState } from './types';
import { sampleBookmarks, sampleFolders } from './data/sampleData';

// Default configuration
const defaultConfig: AppConfig = {
  darkMode: false,
  showSidebar: true,
  viewMode: 'grid',
  apiKey: ''
};

/**
 * Main application component for the Bookmark Manager.
 * This component handles the loading of configuration, authentication state,
 * bookmark management, and rendering of the user interface.
 *
 * It utilizes React hooks for state management and side effects.
 *
 * @returns {JSX.Element} The rendered application component.
 */
function App() {
  // Load config from localStorage or use default
  /**
   * Loads the application configuration from local storage.
   * If a saved configuration is found, it attempts to parse it as JSON.
   * In case of a parsing error, it logs the error to the console and returns the default configuration.
   * If no saved configuration is found, it returns the default configuration.
   *
   * @returns {AppConfig} The application configuration object.
   *
   * @throws {Error} Throws an error if the JSON parsing fails.
   *
   * @example
   * const config = loadConfig();
   * console.log(config);
   */
  const loadConfig = (): AppConfig => {
    const savedConfig = localStorage.getItem('bookmarkManagerConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse saved config:', e);
        return defaultConfig;
      }
    }
    return defaultConfig;
  };
  
  // App configuration
  const [config, setConfig] = useState<AppConfig>(loadConfig());
  
  // Authentication state
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    apiKey: ''
  });
  
  // App state
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(sampleBookmarks);
  const [folders, setFolders] = useState<FolderType[]>(sampleFolders);
  const [selectedFolder, setSelectedFolder] = useState<string | null>('all');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  
  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bookmarkManagerConfig', JSON.stringify(config));
  }, [config]);

  // Apply dark mode
  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.darkMode]);

  // Check authentication when config changes
  useEffect(() => {
    // Simple validation - in a real app, you would validate against your backend
    const isValid = config.apiKey && config.apiKey.trim().length >= 8;
    
    setAuthState({
      isAuthenticated: isValid,
      apiKey: config.apiKey
    });
  }, [config.apiKey]);

  // Get all child folder IDs recursively
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
    const matchesFolder = folderIds.includes(bookmark.folderId!);
    
    return matchesFolder;
  }).filter(bookmark => {
    // Then apply search filter
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleBookmarkClick = (bookmark: BookmarkType) => {
    setSelectedBookmark(bookmark);
    setShowRightPanel(true);
  };

  /**
   * Handles the addition of a new bookmark to the bookmarks list.
   * If the user is not authenticated, it displays a configuration modal.
   * Otherwise, it creates a new bookmark with default values and adds it to the current bookmarks.
   *
   * @function handleAddBookmark
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if there is an issue with adding the bookmark.
   *
   * @example
   * // Example usage:
   * handleAddBookmark();
   *
   * // This will create a new bookmark and update the state accordingly.
   */
  const handleAddBookmark = () => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

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
   * Updates an existing bookmark with the provided details.
   *
   * This function checks if the user is authenticated before proceeding to update the bookmark.
   * If the user is not authenticated, it triggers a modal to show configuration options.
   *
   * @param {BookmarkType} updatedBookmark - The bookmark object containing updated details.
   *
   * @throws {Error} Throws an error if the bookmark update fails due to invalid data.
   *
   * @returns {void} This function does not return a value.
   *
   * @example
   * const newBookmark = { id: 1, title: 'Updated Bookmark', url: 'https://example.com' };
   * updateBookmark(newBookmark);
   */
  const updateBookmark = (updatedBookmark: BookmarkType) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    setBookmarks(bookmarks.map(b => b.id === updatedBookmark.id ? updatedBookmark : b));
    setSelectedBookmark(updatedBookmark);
  };

  /**
   * Deletes a bookmark by its identifier.
   *
   * This function checks if the user is authenticated before proceeding to delete the bookmark.
   * If the user is not authenticated, it triggers a modal to show configuration options.
   * Upon successful deletion, it updates the bookmarks state and clears the selected bookmark if it matches the deleted one.
   *
   * @param {string} id - The unique identifier of the bookmark to be deleted.
   * @throws {Error} Throws an error if the bookmark cannot be deleted due to authentication issues.
   *
   * @example
   * // Assuming '123' is the ID of the bookmark to delete
   * deleteBookmark('123');
   */
  const deleteBookmark = (id: string) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    setBookmarks(bookmarks.filter(b => b.id !== id));
    if (selectedBookmark?.id === id) {
      setSelectedBookmark(null);
      setShowRightPanel(false);
    }
  };

  /**
   * Toggles the favorite status of a bookmark identified by its ID.
   * If the user is not authenticated, it opens a configuration modal.
   *
   * @param {string} id - The unique identifier of the bookmark to toggle.
   * @throws {Error} Throws an error if the bookmark with the given ID does not exist.
   *
   * @example
   * // Assuming the user is authenticated and the bookmark with ID '123' exists
   * toggleFavorite('123');
   *
   * @example
   * // If the user is not authenticated
   * toggleFavorite('123'); // This will open the configuration modal.
   */
  const toggleFavorite = (id: string) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

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

  /**
   * Handles the addition of a new folder by managing the visibility of modals
   * and setting the parent folder ID.
   *
   * This function checks if the user is authenticated. If not, it triggers
   * the display of a configuration modal. If the user is authenticated, it
   * sets the parent ID for the new folder and shows the folder creation modal.
   *
   * @param {string | null} parentId - The ID of the parent folder where the new folder will be added.
   *                                   If null, it indicates that the new folder will be added at the root level.
   *
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if there is an issue with modal visibility or state management.
   *
   * @example
   * // Example usage when a user clicks on a button to add a folder under a specific parent
   * handleAddFolder('12345');
   *
   * // Example usage when adding a folder at the root level
   * handleAddFolder(null);
   */
  const handleAddFolder = (parentId: string | null) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    setNewFolderParentId(parentId);
    setShowFolderModal(true);
  };

  /**
   * Creates a new folder and adds it to the list of folders.
   *
   * This function checks if the user is authenticated before proceeding to create a folder.
   * If the user is not authenticated, it triggers a modal to show configuration options.
   *
   * @param {string} name - The name of the folder to be created.
   * @param {string | null} parentId - The ID of the parent folder. If null, the folder will be created at the root level.
   *
   * @throws {Error} Throws an error if the user is not authenticated.
   *
   * @example
   * // Creating a new folder under a specific parent
   * createFolder('New Folder', 'folder-1');
   *
   * @example
   * // Creating a root folder
   * createFolder('Root Folder', null);
   */
  const createFolder = (name: string, parentId: string | null) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    const newFolder: FolderType = {
      id: `folder-${folders.length + 1}`,
      name,
      parentId
    };
    setFolders([...folders, newFolder]);
  };

  /**
   * Toggles the visibility of the sidebar in the application.
   * This function updates the configuration state to either show or hide the sidebar,
   * based on its current visibility status.
   *
   * It utilizes the `setConfig` function to update the `showSidebar` property
   * in the configuration object. The new value is the opposite of the current value.
   *
   * @function toggleSidebar
   * @returns {void} This function does not return a value.
   *
   * @example
   * // To toggle the sidebar visibility
   * toggleSidebar();
   */
  const toggleSidebar = () => {
    setConfig({
      ...config,
      showSidebar: !config.showSidebar
    });
  };

  /**
   * Updates the application configuration with the provided new settings.
   *
   * This function takes a new configuration object and applies it to the current application settings.
   * It is essential to ensure that the new configuration adheres to the expected structure defined by
   * the `AppConfig` interface.
   *
   * @param {AppConfig} newConfig - The new configuration object to be set.
   * @throws {Error} Throws an error if the new configuration is invalid or cannot be applied.
   *
   * @example
   * const newSettings = {
   *   theme: 'dark',
   *   language: 'en',
   * };
   * updateConfig(newSettings);
   */
  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  // Get folder name with full path
  /**
   * Retrieves the display name for a folder based on its ID.
   * If the folder ID is null or matches specific values, a default name is returned.
   *
   * @param {string | null} folderId - The ID of the folder. Can be null or a specific string.
   * @returns {string} The name of the folder, or a default name if the folder ID is not recognized.
   *
   * @example
   * // Returns 'All Bookmarks'
   * getFolderPathName(null);
   *
   * @example
   * // Returns 'Favorites'
   * getFolderPathName('favorites');
   *
   * @example
   * // Assuming a folder with ID '123' exists and has a name 'Work'
   * // Returns 'Work'
   * getFolderPathName('123');
   *
   * @example
   * // Returns 'Unknown Folder' if no folder with the given ID exists
   * getFolderPathName('unknownId');
   */
  const getFolderPathName = (folderId: string | null): string => {
    if (!folderId) return 'All Bookmarks';
    if (folderId === 'all') return 'All Bookmarks';
    if (folderId === 'favorites') return 'Favorites';
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return 'Unknown Folder';
    
    /**
     * Recursively retrieves the full path of a folder by concatenating its name
     * with the names of its parent folders, separated by a ' > ' delimiter.
     *
     * @param {FolderType} folder - The folder object for which to retrieve the parent path.
     * @returns {string} The full path of the folder, including its parent folders.
     *
     * @example
     * const folder = { id: 2, name: 'Subfolder', parentId: 1 };
     * const path = getParentPath(folder);
     * console.log(path); // Outputs: 'ParentFolder > Subfolder'
     *
     * @throws {Error} Throws an error if the folder object is invalid or if there is
     *                 an issue retrieving the parent folder.
     */
    const getParentPath = (folder: FolderType): string => {
      if (!folder.parentId) return folder.name;
      const parent = folders.find(f => f.id === folder.parentId);
      if (!parent) return folder.name;
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
            {!config.showSidebar && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-1"
                aria-label="Show sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
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
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={authState.isAuthenticated ? "Authenticated" : "Not authenticated"}
              title={authState.isAuthenticated ? "Authenticated" : "Not authenticated"}
            >
              {authState.isAuthenticated ? 
                <Unlock className="h-5 w-5 text-green-500" /> : 
                <Lock className="h-5 w-5 text-red-500" />
              }
            </button>
            <button 
              onClick={() => setConfig({...config, darkMode: !config.darkMode})}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {config.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={handleAddBookmark}
              className={`p-2 rounded-full ${
                authState.isAuthenticated 
                  ? 'hover:bg-gray-200 dark:hover:bg-gray-700' 
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              } transition-colors`}
              aria-label="Add bookmark"
              title={authState.isAuthenticated ? "Add bookmark" : "Authentication required to add bookmarks"}
            >
              <Plus className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowConfigModal(true)}
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
        {config.showSidebar && (
          <Sidebar 
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            bookmarks={bookmarks}
            onAddFolder={handleAddFolder}
            isAuthenticated={authState.isAuthenticated}
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
                  onClick={() => setConfig({...config, viewMode: 'grid'})}
                  className={`p-2 rounded ${config.viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  aria-label="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setConfig({...config, viewMode: 'list'})}
                  className={`p-2 rounded ${config.viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!authState.isAuthenticated && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Lock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Authentication Required</h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                      <p>
                        You are in read-only mode. To create, edit, or delete bookmarks and folders, please 
                        <button 
                          onClick={() => setShowConfigModal(true)}
                          className="ml-1 text-yellow-800 dark:text-yellow-300 underline font-medium"
                        >
                          add your API key
                        </button>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <Bookmark className="h-12 w-12 mb-2" />
                <p className="text-lg">No bookmarks found</p>
                {authState.isAuthenticated && (
                  <button 
                    onClick={handleAddBookmark}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bookmark
                  </button>
                )}
              </div>
            ) : config.viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBookmarks.map(bookmark => (
                  <BookmarkCard 
                    key={bookmark.id} 
                    bookmark={bookmark} 
                    onClick={() => handleBookmarkClick(bookmark)}
                    onToggleFavorite={() => toggleFavorite(bookmark.id)}
                    isAuthenticated={authState.isAuthenticated}
                  />
                ))}
              </div>
            ) : (
              <BookmarkList 
                bookmarks={filteredBookmarks} 
                onBookmarkClick={handleBookmarkClick}
                onToggleFavorite={toggleFavorite}
                isAuthenticated={authState.isAuthenticated}
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
            isAuthenticated={authState.isAuthenticated}
          />
        )}
      </div>

      {/* Modals */}
      {showConfigModal && (
        <ConfigModal 
          config={config}
          onClose={() => setShowConfigModal(false)}
          onSave={updateConfig}
        />
      )}

      {showFolderModal && (
        <FolderModal 
          folders={folders}
          parentId={newFolderParentId}
          onClose={() => setShowFolderModal(false)}
          onSave={createFolder}
        />
      )}
    </div>
  );
}

export default App;