import React, { useState } from 'react';
import { X, Moon, Sun, Sidebar, Layout, Key } from 'lucide-react';
import { AppConfig } from '../types';

interface ConfigModalProps {
  config: AppConfig;
  onClose: () => void;
  onSave: (config: AppConfig) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ config, onClose, onSave }) => {
  const [editedConfig, setEditedConfig] = useState<AppConfig>({ ...config });
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: keyof AppConfig, value: any) => {
    setEditedConfig({
      ...editedConfig,
      [key]: value
    });

    // Clear API key error when user starts typing
    if (key === 'apiKey') {
      setApiKeyError(null);
    }
  };

  const validateApiKey = (apiKey: string): boolean => {
    // This is a simple validation - in a real app, you would validate against your backend
    // For demo purposes, we'll accept any key that's at least 8 characters
    return apiKey.trim().length >= 8;
  };

  const handleSave = () => {
    // If API key is provided but invalid, show error
    if (editedConfig.apiKey && !validateApiKey(editedConfig.apiKey)) {
      setApiKeyError("API key must be at least 8 characters");
      return;
    }

    onSave(editedConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sidebar className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              <span>Show Sidebar</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={editedConfig.showSidebar}
                onChange={(e) => handleChange('showSidebar', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {editedConfig.darkMode ? 
                <Sun className="h-5 w-5 mr-2 text-yellow-500" /> : 
                <Moon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              }
              <span>Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={editedConfig.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Layout className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              <span>Default View</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleChange('viewMode', 'grid')}
                className={`px-3 py-1 rounded ${
                  editedConfig.viewMode === 'grid' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => handleChange('viewMode', 'list')}
                className={`px-3 py-1 rounded ${
                  editedConfig.viewMode === 'list' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center mb-2">
              <Key className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Authentication</span>
            </div>
            <div className="mt-2">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={editedConfig.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              />
              {apiKeyError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{apiKeyError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                API key is required to create, edit, or delete bookmarks and folders.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;