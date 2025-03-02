import React, { useState } from 'react';
import { X, Moon, Sun, Sidebar, Layout } from 'lucide-react';
import { AppConfig } from '../types';

interface ConfigModalProps {
  config: AppConfig;
  onClose: () => void;
  onSave: (config: AppConfig) => void;
}

/**
 * A functional component that renders a modal for configuring application settings.
 *
 * @param {Object} props - The properties for the ConfigModal component.
 * @param {AppConfig} props.config - The initial configuration settings to be edited.
 * @param {Function} props.onClose - Callback function to be called when the modal is closed.
 * @param {Function} props.onSave - Callback function to be called when the settings are saved.
 *
 * @returns {JSX.Element} The rendered modal component.
 *
 * @example
 * <ConfigModal
 *   config={{ showSidebar: true, darkMode: false, viewMode: 'grid' }}
 *   onClose={() => console.log('Modal closed')}
 *   onSave={(newConfig) => console.log('New config saved:', newConfig)}
 * />
 */
const ConfigModal: React.FC<ConfigModalProps> = ({ config, onClose, onSave }) => {
  const [editedConfig, setEditedConfig] = useState<AppConfig>({ ...config });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Updates the configuration state by modifying a specific key with a new value.
   *
   * This function takes a key that corresponds to a property in the AppConfig type
   * and a value that will be assigned to that property. It creates a new configuration
   * object by merging the existing configuration with the updated key-value pair.
   *
   * @param {keyof AppConfig} key - The key of the configuration property to update.
   * @param {any} value - The new value to assign to the specified key.
   *
   * @returns {void} This function does not return a value.
   *
   * @example
   * // Assuming editedConfig is an object with properties defined in AppConfig
   * handleChange('theme', 'dark');
   * // This will update the theme property of editedConfig to 'dark'.
   */
  const handleChange = (key: keyof AppConfig, value: any) => {
    setEditedConfig({
      ...editedConfig,
      [key]: value
    });
  };

  /**
   * Handles the save operation by invoking the onSave callback with the edited configuration
   * and then closes the current context.
   *
   * This function is typically used in scenarios where user changes need to be saved
   * and the interface should be updated accordingly.
   *
   * @function handleSave
   * @returns {void} This function does not return a value.
   *
   * @throws {Error} Throws an error if the onSave callback fails during execution.
   *
   * @example
   * // Example usage of handleSave
   * handleSave();
   */
  const handleSave = () => {
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