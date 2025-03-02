import React, { useState, useEffect } from 'react';
import { Search, Settings, Plus, Bookmark, Folder, Star, Tag, Grid, List, Moon, Sun } from 'lucide-react';
import BookmarkCard from './components/BookmarkCard';
import BookmarkList from './components/BookmarkList';
import Sidebar from './components/Sidebar';
import BookmarkDetails from './components/BookmarkDetails';
import { Bookmark as BookmarkType, Folder as FolderType } from './types';
import { sampleBookmarks, sampleFolders } from './data/sampleData';

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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

  const updateBookmark = (updatedBookmark: BookmarkType) => {
    setBookmarks(bookmarks.map(b => b.id === updatedBookmark.id ? updatedBookmark : b));
    setSelectedBookmark(updatedBookmark);
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
    if (selectedBookmark?.id === id) {
      setSelectedBookmark(null);
      setShowRightPanel(false);
    }
  };

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