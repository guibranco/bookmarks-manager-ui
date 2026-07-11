import { useState } from 'react';
import { Folder } from '../types';

export function useFolderEditing(
  isAuthenticated: boolean,
  onUpdateFolder: (folderId: string, newName: string) => void
) {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const startEditing = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const commitEdit = () => {
    if (editingFolderId && editingFolderName.trim()) {
      onUpdateFolder(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const saveEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    commitEdit();
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  return {
    editingFolderId,
    editingFolderName,
    setEditingFolderName,
    startEditing,
    saveEditing,
    cancelEditing,
    handleKeyDown,
  };
}
