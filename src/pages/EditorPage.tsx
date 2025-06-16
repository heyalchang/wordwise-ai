import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDocStore } from '../store/useDocStore';
import { useAutosave } from '../hooks/useDebounce';
import { Editor } from '../editor/Editor';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const {
    currentDocument,
    isLoading,
    isSaving,
    error,
    loadDocument,
    saveDocument,
    updateTitle,
    clearError,
  } = useDocStore();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Load document when component mounts
  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id, loadDocument]);

  // Update local state when document loads
  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content || '');
      setTitle(currentDocument.title || 'Untitled Document');
    }
  }, [currentDocument]);

  // Autosave content changes
  useAutosave(id || null, content, saveDocument, 1000);

  const handleTitleSave = async () => {
    if (id && title !== currentDocument?.title) {
      await updateTitle(id, title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(currentDocument?.title || 'Untitled Document');
      setIsEditingTitle(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Document not found
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {title}
                  </h1>
                )}
                {isSaving && (
                  <span className="ml-3 text-sm text-gray-500">Saving...</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Error message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex justify-between items-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <Editor
            content={content}
            onUpdate={setContent}
            placeholder="Start writing your essay... WordWise AI will help you improve your grammar and style as you write."
          />
        </div>
      </main>

      {/* Footer with stats */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              Words:{' '}
              {
                content
                  .replace(/<[^>]*>/g, '')
                  .split(/\s+/)
                  .filter(Boolean).length
              }
            </div>
            <div>Characters: {content.replace(/<[^>]*>/g, '').length}</div>
            <div>
              Last saved:{' '}
              {currentDocument.updated_at
                ? new Date(currentDocument.updated_at).toLocaleTimeString()
                : 'Never'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
