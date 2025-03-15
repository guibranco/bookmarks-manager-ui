import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkType, Folder as FolderType, AppConfig, AuthState } from './types';
import { sampleBookmarks, sampleFolders } from './data/sampleData';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import BookmarkDetails from './components/BookmarkDetails';
import ConfigModal from './components/ConfigModal';
import FolderModal from './components/FolderModal';

const defaultConfig: AppConfig = {
  darkMode: false,
  showSidebar: window.innerWidth >= 768,
  viewMode: 'grid',
  apiKey: '',
};

function App() {
  const [config, setConfig] = useState<AppConfig>(loadConfig());
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    apiKey: '',
  });

  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(sampleBookmarks);
  const [folders, setFolders] = useState<FolderType[]>(sampleFolders);
  const [selectedFolder, setSelectedFolder] = useState<string | null>('all');
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  /**
   * Loads the application configuration from local storage.
   * If the configuration is found and successfully parsed, it is returned.
   * If parsing fails or no configuration is found, a default configuration is returned.
   *
   * @returns {AppConfig} The application configuration object.
   * @throws {Error} Throws an error if the saved configuration cannot be parsed.
   *
   * @example
   * const config = loadConfig();
   * console.log(config);
   */
  function loadConfig(): AppConfig {
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
  }

  useEffect(() => {
    /**
     * Handles the window resize event to determine if the current viewport
     * is mobile-sized. If the viewport width is less than 768 pixels and
     * the sidebar is currently shown, it updates the configuration to hide
     * the sidebar.
     *
     * This function checks the window's inner width and modifies the
     * configuration state accordingly.
     *
     * @function handleResize
     * @returns {void} This function does not return a value.
     *
     * @throws {Error} Throws an error if there is an issue with accessing
     * the window's inner width or updating the configuration state.
     */
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && config.showSidebar) {
        setConfig(prev => ({ ...prev, showSidebar: false }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.showSidebar]);

  useEffect(() => {
    localStorage.setItem('bookmarkManagerConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.darkMode]);

  useEffect(() => {
    const isValid = config.apiKey && config.apiKey.trim().length >= 8;
    setAuthState({
      isAuthenticated: isValid,
      apiKey: config.apiKey,
    });
  }, [config.apiKey]);

  /**
   * Recursively retrieves all child folder IDs for a given folder.
   *
   * This function takes a folder ID as input and returns an array of strings,
   * each representing the ID of a child folder. It first collects the direct
   * children of the specified folder and then recursively collects the children
   * of each direct child, effectively returning all descendant folder IDs.
   *
   * @param {string} folderId - The ID of the folder for which to retrieve child IDs.
   * @returns {string[]} An array of strings containing the IDs of all child folders.
   *
   * @throws {Error} Throws an error if the folderId is invalid or does not exist.
   */
  const getAllChildFolderIds = (folderId: string): string[] => {
    const directChildren = folders.filter(f => f.parentId === folderId).map(f => f.id);
    const allChildren = [...directChildren];
    directChildren.forEach(childId => {
      allChildren.push(...getAllChildFolderIds(childId));
    });
    return allChildren;
  };

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      if (selectedFolder === 'all') return true;
      if (selectedFolder === 'favorites') return bookmark.favorite;
      const folderIds = [selectedFolder, ...getAllChildFolderIds(selectedFolder!)];
      const matchesFolder = folderIds.includes(bookmark.folderId!);
      return matchesFolder;
    })
    .filter(bookmark => {
      const matchesSearch =
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

  /**
   * Handles the click event on a bookmark.
   *
   * This function updates the selected bookmark and manages the visibility of the right panel
   * and sidebar based on the current window width.
   *
   * @param {BookmarkType} bookmark - The bookmark object that was clicked.
   *
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if the bookmark is invalid or undefined.
   */
  const handleBookmarkClick = (bookmark: BookmarkType) => {
    setSelectedBookmark(bookmark);
    setShowRightPanel(true);
    if (window.innerWidth < 768) {
      setConfig(prev => ({ ...prev, showSidebar: false }));
    }
  };

  /**
   * Handles the addition of a new bookmark to the bookmarks list.
   * If the user is not authenticated, it triggers the display of a configuration modal.
   * Otherwise, it creates a new bookmark with default values and adds it to the bookmarks state.
   *
   * @function handleAddBookmark
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if there is an issue with adding the bookmark.
   *
   * @example
   * // Example usage:
   * handleAddBookmark();
   */
  const handleAddBookmark = () => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    const newBookmark: BookmarkType = {
      id: `bookmark-${Date.now()}`,
      title: 'New Bookmark',
      url: 'https://example.com',
      description: 'Add a description',
      thumbnail: '',
      tags: [],
      folderId: selectedFolder === 'all' || selectedFolder === 'favorites' ? null : selectedFolder,
      favorite: false,
      dateAdded: new Date().toISOString(),
    };

    setBookmarks([...bookmarks, newBookmark]);
    handleBookmarkClick(newBookmark);
  };

  /**
   * Updates an existing bookmark with new information.
   *
   * This function checks if the user is authenticated before proceeding to update the bookmark.
   * If the user is not authenticated, it triggers the display of a configuration modal.
   *
   * @param {BookmarkType} updatedBookmark - The bookmark object containing updated information.
   *
   * @throws {Error} Throws an error if the bookmark update fails due to invalid data.
   *
   * @returns {void} This function does not return a value.
   */
  const updateBookmark = (updatedBookmark: BookmarkType) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    setBookmarks(bookmarks.map(b => (b.id === updatedBookmark.id ? updatedBookmark : b)));
    setSelectedBookmark(updatedBookmark);
  };

  /**
   * Deletes a bookmark by its unique identifier.
   *
   * This function checks if the user is authenticated before proceeding to delete the bookmark.
   * If the user is not authenticated, it triggers the display of a configuration modal.
   * Upon successful deletion, it updates the bookmarks state and resets the selected bookmark if it matches the deleted bookmark.
   *
   * @param {string} id - The unique identifier of the bookmark to be deleted.
   * @throws {Error} Throws an error if the bookmark cannot be deleted due to authentication issues.
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
   * If the user is not authenticated, it triggers a modal to show configuration options.
   *
   * @param {string} id - The unique identifier of the bookmark to be toggled.
   * @throws {Error} Throws an error if the bookmark with the given ID does not exist in the bookmarks list.
   *
   * @returns {void} This function does not return a value.
   *
   * @example
   * // To toggle the favorite status of a bookmark with ID '123'
   * toggleFavorite('123');
   */
  const toggleFavorite = (id: string) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    setBookmarks(bookmarks.map(b => (b.id === id ? { ...b, favorite: !b.favorite } : b)));

    if (selectedBookmark?.id === id) {
      setSelectedBookmark({
        ...selectedBookmark,
        favorite: !selectedBookmark.favorite,
      });
    }
  };

  /**
   * Handles the addition of a new folder by displaying the appropriate modal.
   *
   * This function checks if the user is authenticated. If not, it triggers
   * the display of a configuration modal. If the user is authenticated, it sets
   * the parent ID for the new folder and displays the folder creation modal.
   *
   * @param {string | null} parentId - The ID of the parent folder. If null,
   *                                   indicates that the new folder will be created
   *                                   at the root level.
   *
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if there is an issue with authentication state.
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
   * Creates a new folder with the specified name and parent ID.
   *
   * This function checks if the user is authenticated before proceeding to create a folder.
   * If the user is not authenticated, it triggers a modal to show configuration options.
   *
   * @param {string} name - The name of the folder to be created.
   * @param {string | null} parentId - The ID of the parent folder. If null, the folder will be created at the root level.
   *
   * @throws {Error} Throws an error if the user is not authenticated.
   *
   * @returns {void} This function does not return a value.
   */
  const createFolder = (name: string, parentId: string | null) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    const newFolder: FolderType = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
    };
    setFolders([...folders, newFolder]);
  };

  /**
   * Retrieves the display name for a folder based on its ID.
   * If the folder ID is null or matches specific values, a default name is returned.
   * Otherwise, it searches for the folder in a predefined list and constructs
   * the full path name by traversing up to its parent folders.
   *
   * @param {string | null} folderId - The ID of the folder to retrieve the name for.
   *                                   Can be null, 'all', or 'favorites' for special cases.
   * @returns {string} The display name of the folder, which could be:
   *                  - 'All Bookmarks' if folderId is null or 'all'.
   *                  - 'Favorites' if folderId is 'favorites'.
   *                  - The constructed path name if the folder is found.
   *                  - 'Unknown Folder' if the folder ID does not match any existing folder.
   *
   * @throws {Error} Throws an error if an unexpected condition occurs during folder retrieval.
   */
  const getFolderPathName = (folderId: string | null): string => {
    if (!folderId) return 'All Bookmarks';
    if (folderId === 'all') return 'All Bookmarks';
    if (folderId === 'favorites') return 'Favorites';

    const folder = folders.find(f => f.id === folderId);
    if (!folder) return 'Unknown Folder';

    const getParentPath = (folder: FolderType): string => {
      if (!folder.parentId) return folder.name;
      const parent = folders.find(f => f.id === folder.parentId);
      if (!parent) return folder.name;
      return `${getParentPath(parent)} > ${folder.name}`;
    };

    return getParentPath(folder);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header
        config={config}
        authState={authState}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={() => setConfig(prev => ({ ...prev, showSidebar: !prev.showSidebar }))}
        onToggleDarkMode={() => setConfig(prev => ({ ...prev, darkMode: !prev.darkMode }))}
        onAddBookmark={handleAddBookmark}
        onOpenSettings={() => setShowConfigModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`
            fixed md:relative z-30 md:z-auto
            w-64 h-[calc(100vh-4rem)] md:h-auto
            transform transition-transform duration-300 ease-in-out
            ${config.showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={folderId => {
              setSelectedFolder(folderId);
              if (window.innerWidth < 768) {
                setConfig(prev => ({ ...prev, showSidebar: false }));
              }
            }}
            bookmarks={bookmarks}
            onAddFolder={handleAddFolder}
            isAuthenticated={authState.isAuthenticated}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {config.showSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setConfig(prev => ({ ...prev, showSidebar: false }))}
            aria-hidden="true"
          />
        )}

        <MainContent
          config={config}
          isAuthenticated={authState.isAuthenticated}
          selectedFolder={selectedFolder}
          filteredBookmarks={filteredBookmarks}
          folderPath={getFolderPathName(selectedFolder)}
          onToggleView={view => setConfig(prev => ({ ...prev, viewMode: view }))}
          onBookmarkClick={handleBookmarkClick}
          onToggleFavorite={toggleFavorite}
          onOpenSettings={() => setShowConfigModal(true)}
        />

        {/* Right Panel */}
        {showRightPanel && selectedBookmark && (
          <>
            {/* Desktop version */}
            <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
              <BookmarkDetails
                bookmark={selectedBookmark}
                folders={folders}
                onClose={() => setShowRightPanel(false)}
                onUpdate={updateBookmark}
                onDelete={() => deleteBookmark(selectedBookmark.id)}
                isAuthenticated={authState.isAuthenticated}
              />
            </div>

            {/* Mobile version */}
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
                <BookmarkDetails
                  bookmark={selectedBookmark}
                  folders={folders}
                  onClose={() => setShowRightPanel(false)}
                  onUpdate={updateBookmark}
                  onDelete={() => deleteBookmark(selectedBookmark.id)}
                  isAuthenticated={authState.isAuthenticated}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showConfigModal && (
        <ConfigModal config={config} onClose={() => setShowConfigModal(false)} onSave={setConfig} />
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
