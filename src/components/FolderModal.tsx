import React, { useState } from 'react';
import { X, Folder } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface FolderModalProps {
  folders: FolderType[];
  parentId: string | null;
  onClose: () => void;
  onSave: (name: string, parentId: string | null) => void;
}

/**
 * A modal component for creating a new folder within a hierarchical folder structure.
 *
 * @component
 * @param {Object} props - The properties for the FolderModal component.
 * @param {Array<FolderType>} props.folders - An array of folder objects to display in the dropdown.
 * @param {string | null} props.parentId - The ID of the parent folder, if any.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {Function} props.onSave - Callback function to save the new folder with its name and parent ID.
 *
 * @example
 * <FolderModal
 *   folders={folderList}
 *   parentId={null}
 *   onClose={() => setShowModal(false)}
 *   onSave={(name, parentId) => createFolder(name, parentId)}
 * />
 */
const FolderModal: React.FC<FolderModalProps> = ({ folders, parentId, onClose, onSave }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentId);

  /**
   * Handles the save action for a folder.
   * This function checks if the folder name is not empty,
   * then calls the onSave function with the trimmed folder name
   * and the selected parent ID. After saving, it triggers
   * the onClose function to close the current dialog or interface.
   *
   * @function handleSave
   * @returns {void}
   *
   * @throws {Error} Throws an error if the onSave function fails.
   *
   * @example
   * // Example usage of handleSave
   * handleSave();
   */
  const handleSave = () => {
    if (folderName.trim()) {
      onSave(folderName.trim(), selectedParentId);
      onClose();
    }
  };

  // Organize folders into a hierarchical structure for the dropdown
  /**
   * Retrieves a list of folder options for selection, structured hierarchically based on their parent-child relationships.
   * The function starts by filtering the root folders (those without a parent) and then recursively renders options
   * for each folder and its subfolders.
   *
   * @returns {JSX.Element[]} An array of JSX elements representing the folder options, each wrapped in an <option> tag.
   *
   * @example
   * const options = getFolderOptions();
   * // options will contain a list of <option> elements for all root folders and their subfolders.
   */
  const getFolderOptions = () => {
    const rootFolders = folders.filter(folder => folder.parentId === null);
    
    /**
     * Recursively generates a list of option elements for a folder structure.
     *
     * This function takes an array of folders and a depth level, and returns a flat array of option elements
     * representing the folder hierarchy. Each option displays the folder name, prefixed by a visual indicator
     * based on its depth in the hierarchy.
     *
     * @param {FolderType[]} folderList - An array of folders to be rendered as options.
     * @param {number} [depth=0] - The current depth in the folder hierarchy, used for prefixing the folder names.
     * @returns {JSX.Element[]} An array of JSX option elements representing the folders.
     *
     * @example
     * const folders = [
     *   { id: 1, name: 'Folder 1', parentId: null },
     *   { id: 2, name: 'Folder 2', parentId: 1 },
     *   { id: 3, name: 'Folder 3', parentId: 1 }
     * ];
     * const options = renderOptions(folders);
     *
     * @throws {Error} Throws an error if folderList is not an array.
     */
    const renderOptions = (folderList: FolderType[], depth: number = 0) => {
      return folderList.flatMap(folder => {
        const subfolders = folders.filter(f => f.parentId === folder.id);
        const prefix = depth > 0 ? '—'.repeat(depth) + ' ' : '';
        
        return [
          <option key={folder.id} value={folder.id}>
            {prefix + folder.name}
          </option>,
          ...renderOptions(subfolders, depth + 1)
        ];
      });
    };
    
    return renderOptions(rootFolders);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Create New Folder</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              placeholder="My New Folder"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="parentFolder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Folder (Optional)
            </label>
            <select
              id="parentFolder"
              value={selectedParentId || ''}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            >
              <option value="">No Parent (Root Folder)</option>
              {getFolderOptions()}
            </select>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={!folderName.trim()}
          >
            <Folder className="h-4 w-4 mr-1" />
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderModal;