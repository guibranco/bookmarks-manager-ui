import React from 'react';
import { Menu, Bookmark, Search, Lock, Unlock, Sun, Moon, Plus, Settings, FolderTree, Folder } from 'lucide-react';
import { AppConfig, AuthState } from '../types';

interface HeaderProps {
  config: AppConfig;
  authState: AuthState;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  onToggleDarkMode: () => void;
  onToggleFlatten: () => void;
  onAddBookmark: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({
  config,
  authState,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onToggleDarkMode,
  onToggleFlatten,
  onAddBookmark,
  onOpenSettings,
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-xs border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
            aria-label={config.showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Bookmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold hidden sm:block">Bookmark Manager</h1>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleFlatten}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={config.flattenSubfolders ? 'Switch to hierarchical view' : 'Switch to flat view'}
            title={config.flattenSubfolders ? 'Switch to hierarchical view' : 'Switch to flat view'}
          >
            {config.flattenSubfolders ? (
              <FolderTree className="h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={authState.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
            title={authState.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          >
            {authState.isAuthenticated ? (
              <Unlock className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-red-500" />
            )}
          </button>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {config.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={onAddBookmark}
            className={`p-2 rounded-full ${
              authState.isAuthenticated
                ? 'hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            } transition-colors`}
            aria-label="Add bookmark"
            title={
              authState.isAuthenticated
                ? 'Add bookmark'
                : 'Authentication required to add bookmarks'
            }
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;