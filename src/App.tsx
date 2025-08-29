import React, { useState } from 'react';
import { Bookmark as BookmarkType } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import BookmarkDetails from './components/BookmarkDetails';
import ConfigModal from './components/ConfigModal';
import FolderModal from './components/FolderModal';
import { useBookmarks } from './hooks/useBookmarks';
import { useFolders } from './hooks/useFolders';
import { useConfig } from './hooks/useConfig';
import { useAuth } from './hooks/useAuth';
import { useSelectedFolder } from './hooks/useSelectedFolder';
import { useSelectedTag } from './hooks/useSelectedTag';

function App() {
  const { config, setConfig } = useConfig();
  const authState = useAuth(config.apiKey);
  const { bookmarks, addBookmark, updateBookmark, deleteBookmark, toggleFavorite } = useBookmarks(
    authState.isAuthenticated
  );
  const { folders, createFolder, updateFolder, getFolderPathName, getAllChildFolderIds } =
    useFolders(authState.isAuthenticated);
  const { selectedFolder, setSelectedFolder } = useSelectedFolder(folders);
  const { selectedTag, setSelectedTag } = useSelectedTag();

  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      if (selectedTag) {
        return bookmark.tags.includes(selectedTag);
      }

      if (selectedFolder === 'all') return true;
      if (selectedFolder === 'favorites') return bookmark.favorite;

      if (config.flattenSubfolders) {
        const folderIds = [selectedFolder, ...getAllChildFolderIds(selectedFolder!)];
        return folderIds.includes(bookmark.folderId!);
      } else {
        return bookmark.folderId === selectedFolder;
      }
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

    const newBookmark = addBookmark(selectedFolder);
    if (newBookmark) {
      handleBookmarkClick(newBookmark);
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

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setSelectedTag(null);
    if (window.innerWidth < 768) {
      setConfig(prev => ({ ...prev, showSidebar: false }));
    }
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setSelectedFolder(null);
    if (window.innerWidth < 768) {
      setConfig(prev => ({ ...prev, showSidebar: false }));
    }
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
        onToggleFlatten={() =>
          setConfig(prev => ({ ...prev, flattenSubfolders: !prev.flattenSubfolders }))
        }
        onAddBookmark={handleAddBookmark}
        onOpenSettings={() => setShowConfigModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
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
            selectedTag={selectedTag}
            onSelectFolder={handleFolderSelect}
            onSelectTag={handleTagSelect}
            bookmarks={bookmarks}
            onAddFolder={handleAddFolder}
            onUpdateFolder={updateFolder}
            isAuthenticated={authState.isAuthenticated}
          />
        </div>

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
          selectedTag={selectedTag}
          folders={folders}
          filteredBookmarks={filteredBookmarks}
          folderPath={selectedTag ? `Tag: ${selectedTag}` : getFolderPathName(selectedFolder)}
          onToggleView={view => setConfig(prev => ({ ...prev, viewMode: view }))}
          onBookmarkClick={handleBookmarkClick}
          onToggleFavorite={toggleFavorite}
          onOpenSettings={() => setShowConfigModal(true)}
          onAddFolder={handleAddFolder}
          onSelectFolder={handleFolderSelect}
          onUpdateFolder={updateFolder}
        />

        {showRightPanel && selectedBookmark && (
          <>
            <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
              <BookmarkDetails
                bookmark={selectedBookmark}
                folders={folders}
                onClose={() => setShowRightPanel(false)}
                onUpdate={updateBookmark}
                onDelete={() => {
                  deleteBookmark(selectedBookmark.id);
                  setSelectedBookmark(null);
                  setShowRightPanel(false);
                }}
                isAuthenticated={authState.isAuthenticated}
              />
            </div>

            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
                <BookmarkDetails
                  bookmark={selectedBookmark}
                  folders={folders}
                  onClose={() => setShowRightPanel(false)}
                  onUpdate={updateBookmark}
                  onDelete={() => {
                    deleteBookmark(selectedBookmark.id);
                    setSelectedBookmark(null);
                    setShowRightPanel(false);
                  }}
                  isAuthenticated={authState.isAuthenticated}
                />
              </div>
            </div>
          </>
        )}

        {showConfigModal && (
          <ConfigModal
            config={config}
            onClose={() => setShowConfigModal(false)}
            onSave={setConfig}
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
    </div>
  );
}

export default App;
