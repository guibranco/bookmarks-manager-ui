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
 * A React functional component that renders a modal for creating a new folder.
 * It allows users to input a folder name and optionally select a parent folder from a dropdown.
 *
 * @param {Object} props - The properties for the component.
 * @param {Array<FolderType>} props.folders - The list of available folders to choose from.
 * @param {string | null} props.parentId - The ID of the parent folder, if any.
 * @param {Function} props.onClose - Callback function to be called when the modal is closed.
 * @param {Function} props.onSave - Callback function to be called when the folder is saved.
 *
 * @returns {JSX.Element} The rendered modal component.
 *
 * @throws {Error} Throws an error if the folder name is empty when attempting to save.
 */
const FolderModal: React.FC<FolderModalProps> = ({ folders, parentId, onClose, onSave }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentId);

  /**
   * Handles the save operation by validating the folder name and invoking the save callback.
   * If the folder name is valid (non-empty after trimming), it calls the `onSave` function
   * with the trimmed folder name and the selected parent ID, then closes the operation.
   *
   * @function handleSave
   * @returns {void}
   * @throws {Error} Throws an error if the folder name is invalid.
   */
  const handleSave = () => {
    if (folderName.trim()) {
      onSave(folderName.trim(), selectedParentId);
      onClose();
    }
  };

  // Organize folders into a hierarchical structure for the dropdown
  /**
   * Retrieves a list of folder options for rendering in a dropdown.
   * The options are generated from a hierarchical structure of folders,
   * starting from the root folders (those with no parent).
   *
   * @returns {JSX.Element[]} An array of JSX elements representing the folder options.
   * Each option includes a prefix indicating the depth of the folder in the hierarchy.
   *
   * @throws {Error} Throws an error if the folder structure is invalid or cannot be processed.
   */
  const getFolderOptions = () => {
    const rootFolders = folders.filter(folder => folder.parentId === null);

    /**
     * Recursively generates a list of option elements for a dropdown menu
     * based on a hierarchical structure of folders.
     *
     * @param {FolderType[]} folderList - An array of folder objects to be rendered.
     * Each folder object should contain an `id` and `name` property.
     * @param {number} [depth=0] - The current depth in the folder hierarchy,
     * used to format the display of folder names with prefixes.
     *
     * @returns {JSX.Element[]} An array of JSX option elements representing
     * the folders and their subfolders, formatted according to their depth.
     *
     * @throws {Error} Throws an error if the folderList is not an array or
     * if any folder object is missing required properties.
     */
    const renderOptions = (folderList: FolderType[], depth: number = 0) => {
      return folderList.flatMap(folder => {
        const subfolders = folders.filter(f => f.parentId === folder.id);
        const prefix = depth > 0 ? '—'.repeat(depth) + ' ' : '';

        return [
          <option key={folder.id} value={folder.id}>
            {prefix + folder.name}
          </option>,
          ...renderOptions(subfolders, depth + 1),
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
            <label
              htmlFor="folderName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              placeholder="My New Folder"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="parentFolder"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Parent Folder (Optional)
            </label>
            <select
              id="parentFolder"
              value={selectedParentId || ''}
              onChange={e => setSelectedParentId(e.target.value || null)}
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
