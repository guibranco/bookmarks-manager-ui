import React from 'react';
import { Lock } from 'lucide-react';

interface AuthWarningProps {
  onOpenSettings: () => void;
}

const AuthWarning: React.FC<AuthWarningProps> = ({ onOpenSettings }) => {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="shrink-0">
          <Lock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Authentication Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
            <p>
              You are in read-only mode. To create, edit, or delete bookmarks and folders, please
              <button
                onClick={onOpenSettings}
                className="ml-1 text-yellow-800 dark:text-yellow-300 underline font-medium"
              >
                add your API key
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthWarning;
