import React, { useState, useEffect } from 'react';
import { X, Save, Trash, ExternalLink } from 'lucide-react';
import { Bookmark, Folder } from '../types';

interface BookmarkDetailsProps {
  bookmark: Bookmark;
  folders: Folder[];
  onClose: () => void;
  onUpdate: (bookmark: Bookmark) => void;
  onDelete: () => void;
}

/**
 * A functional component that displays and manages the details of a bookmark.
 * It allows users to edit bookmark properties, add/remove tags, select folders,
 * and save or delete the bookmark.
 *
 * @param {Object} props - The properties for the component.
 * @param {Bookmark} props.bookmark - The bookmark object to be edited.
 * @param {Folder[]} props.folders - An array of folder objects for organizing bookmarks.
 * @param {Function} props.onClose - Callback function to close the bookmark details.
 * @param {Function} props.onUpdate - Callback function to update the bookmark with new details.
 * @param {Function} props.onDelete - Callback function to delete the bookmark.
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <BookmarkDetails
 *   bookmark={bookmark}
 *   folders={folders}
 *   onClose={handleClose}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 * />
 */
const BookmarkDetails: React.FC<BookmarkDetailsProps> = ({ 
  bookmark, 
  folders,
  onClose, 
  onUpdate,
  onDelete
}) => {
  const [editedBookmark, setEditedBookmark] = useState<Bookmark>({...bookmark});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setEditedBookmark({...bookmark});
  }, [bookmark]);

  /**
   * Handles the change event for input elements such as text fields, text areas, and select boxes.
   * Updates the state of the edited bookmark based on the input's name and value.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event object
   *        containing information about the target element that triggered the event.
   *
   * @returns {void} This function does not return a value.
   *
   * @example
   * // Example usage within a React component
   * <input type="text" name="title" onChange={handleChange} />
   *
   * @throws {Error} Throws an error if the event target is not a valid input element.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedBookmark({
      ...editedBookmark,
      [name]: value
    });
  };

  /**
   * Handles the addition of a new tag to the edited bookmark.
   * This function checks if the tag input is not empty and if the tag
   * is not already included in the existing tags of the edited bookmark.
   * If both conditions are met, it updates the edited bookmark by adding
   * the new tag and resets the tag input field.
   *
   * @function handleTagAdd
   * @returns {void} This function does not return a value.
   *
   * @example
   * // Assuming tagInput is "newTag" and editedBookmark.tags is ["existingTag"]
   * handleTagAdd();
   * // editedBookmark.tags will now be ["existingTag", "newTag"]
   *
   * @throws {Error} Throws an error if there is an issue updating the bookmark.
   */
  const handleTagAdd = () => {
    if (tagInput.trim() && !editedBookmark.tags.includes(tagInput.trim())) {
      setEditedBookmark({
        ...editedBookmark,
        tags: [...editedBookmark.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  /**
   * Removes a specified tag from the edited bookmark's tags.
   *
   * This function updates the state of the edited bookmark by filtering out
   * the tag that is to be removed. It ensures that the tags array in the
   * edited bookmark does not contain the specified tag.
   *
   * @param {string} tagToRemove - The tag that needs to be removed from the bookmark.
   * @throws {Error} Throws an error if the tagToRemove is not a string.
   *
   * @example
   * // Assuming editedBookmark has a tags array of ['tag1', 'tag2', 'tag3']
   * handleTagRemove('tag2');
   * // editedBookmark.tags will now be ['tag1', 'tag3']
   */
  const handleTagRemove = (tagToRemove: string) => {
    setEditedBookmark({
      ...editedBookmark,
      tags: editedBookmark.tags.filter(tag => tag !== tagToRemove)
    });
  };

  /**
   * Handles the key down event for tag input. Specifically, it listens for the 'Enter' key press
   * and triggers the addition of a new tag when pressed.
   *
   * @param {React.KeyboardEvent} e - The keyboard event triggered by the user.
   * @throws {Error} Throws an error if the event does not contain a valid key.
   *
   * @example
   * // Example usage within a React component
   * <input type="text" onKeyDown={handleTagKeyDown} />
   */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  /**
   * Handles the save operation for the edited bookmark.
   * This function is called when the user initiates a save action.
   * It triggers the onUpdate callback with the current state of the edited bookmark.
   *
   * @function handleSave
   * @returns {void} This function does not return a value.
   *
   * @example
   * // Example usage:
   * handleSave();
   *
   * @throws {Error} Throws an error if the onUpdate function is not defined.
   */
  const handleSave = () => {
    onUpdate(editedBookmark);
  };

  // Organize folders into a hierarchical structure for the dropdown
  /**
   * Retrieves a list of folder options for selection, rendering them in a hierarchical format.
   * The function filters the root folders (those without a parent) and generates options
   * for each folder, including its subfolders, with indentation to indicate depth.
   *
   * @returns {JSX.Element[]} An array of JSX elements representing folder options,
   *                          each wrapped in an <option> tag with a unique key and value.
   *
   * @example
   * const options = getFolderOptions();
   * // options will contain <option> elements for each root folder and its subfolders.
   */
  const getFolderOptions = () => {
    const rootFolders = folders.filter(folder => folder.parentId === null);
    
    /**
     * Recursively generates a list of option elements for a dropdown menu
     * based on a hierarchical structure of folders.
     *
     * Each folder is represented as an option, and subfolders are indented
     * according to their depth in the hierarchy.
     *
     * @param {Folder[]} folderList - An array of Folder objects representing
     * the top-level folders to be rendered.
     * @param {number} [depth=0] - The current depth in the folder hierarchy,
     * used for indentation. Defaults to 0 for top-level folders.
     *
     * @returns {JSX.Element[]} An array of JSX option elements representing
     * the folders and their subfolders.
     *
     * @example
     * const folders = [
     *   { id: 1, name: 'Folder 1', parentId: null },
     *   { id: 2, name: 'Subfolder 1-1', parentId: 1 },
     *   { id: 3, name: 'Subfolder 1-2', parentId: 1 },
     * ];
     * const options = renderOptions(folders);
     *
     * @throws {Error} Throws an error if folderList is not an array of Folder objects.
     */
    const renderOptions = (folderList: Folder[], depth: number = 0) => {
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
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Bookmark Details</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={editedBookmark.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <div className="flex">
              <input
                type="url"
                id="url"
                name="url"
                value={editedBookmark.url}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              />
              <a 
                href={editedBookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </a>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={editedBookmark.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={editedBookmark.thumbnail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            />
            {editedBookmark.thumbnail && (
              <div className="mt-2 h-32 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <img 
                  src={editedBookmark.thumbnail} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folder
            </label>
            <select
              id="folderId"
              name="folderId"
              value={editedBookmark.folderId || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            >
              <option value="">No Folder</option>
              {getFolderOptions()}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {editedBookmark.tags.map(tag => (
                <div 
                  key={tag}
                  className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this bookmark?')) {
                  onDelete();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkDetails;