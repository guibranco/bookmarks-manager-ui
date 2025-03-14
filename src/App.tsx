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

  const handleBookmarkClick = (bookmark: BookmarkType) => {
    setSelectedBookmark(bookmark);
    setShowRightPanel(true);
    if (window.innerWidth < 768) {
      setConfig(prev => ({ ...prev, showSidebar: false }));
    }
  };

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

  const updateBookmark = (updatedBookmark: BookmarkType) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    setBookmarks(bookmarks.map(b => (b.id === updatedBookmark.id ? updatedBookmark : b)));
    setSelectedBookmark(updatedBookmark);
  };

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

  const handleAddFolder = (parentId: string | null) => {
    if (!authState.isAuthenticated) {
      setShowConfigModal(true);
      return;
    }

    setNewFolderParentId(parentId);
    setShowFolderModal(true);
  };

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
