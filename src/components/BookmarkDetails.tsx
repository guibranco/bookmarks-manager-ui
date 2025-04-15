import React, { useState, useEffect } from 'react';
import { X, Save, Trash, ExternalLink, Lock } from 'lucide-react';
import { Bookmark, Folder } from '../types';

interface BookmarkDetailsProps {
  bookmark: Bookmark;
  folders: Folder[];
  onClose: () => void;
  onUpdate: (bookmark: Bookmark) => void;
  onDelete: () => void;
  isAuthenticated: boolean;
}

const BookmarkDetails: React.FC<BookmarkDetailsProps> = ({
  bookmark,
  folders,
  onClose,
  onUpdate,
  onDelete,
  isAuthenticated,
}) => {
  const [editedBookmark, setEditedBookmark] = useState<Bookmark>({ ...bookmark });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setEditedBookmark({ ...bookmark });
  }, [bookmark]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedBookmark({
      ...editedBookmark,
      [name]: value,
    });
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !editedBookmark.tags.includes(tagInput.trim())) {
      setEditedBookmark({
        ...editedBookmark,
        tags: [...editedBookmark.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditedBookmark({
      ...editedBookmark,
      tags: editedBookmark.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSave = () => {
    onUpdate(editedBookmark);
  };

  // Organize folders into a hierarchical structure for the dropdown
  const getFolderOptions = () => {
    const rootFolders = folders.filter(folder => folder.parentId === null);

    const renderOptions = (folderList: Folder[], depth: number = 0) => {
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

        {!isAuthenticated && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-300 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-yellow-500" />
            <span>You are in read-only mode</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={editedBookmark.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${!isAuthenticated ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={!isAuthenticated}
            />
          </div>

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              URL
            </label>
            <div className="flex">
              <input
                type="url"
                id="url"
                name="url"
                value={editedBookmark.url}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${!isAuthenticated ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={!isAuthenticated}
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={editedBookmark.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${!isAuthenticated ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={!isAuthenticated}
            />
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Thumbnail URL
            </label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={editedBookmark.thumbnail}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${!isAuthenticated ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={!isAuthenticated}
            />
            {editedBookmark.thumbnail && (
              <div className="mt-2 h-32 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <img
                  src={editedBookmark.thumbnail}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1481487196290-c152efe083f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="folderId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Folder
            </label>
            <select
              id="folderId"
              name="folderId"
              value={editedBookmark.folderId || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${!isAuthenticated ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={!isAuthenticated}
            >
              <option value="">No Folder</option>
              {getFolderOptions()}
            </select>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tags
            </label>
            <div className="flex">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag"
                className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${!isAuthenticated ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={!isAuthenticated}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className={`px-3 py-2 ${
                  isAuthenticated
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-400 text-white cursor-not-allowed'
                } rounded-r-md`}
                disabled={!isAuthenticated}
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
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkDetails;
