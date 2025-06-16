import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDocStore } from '../store/useDocStore';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const {
    documents,
    isLoading,
    error,
    loadDocuments,
    createDocument,
    clearError,
  } = useDocStore();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  const handleCreateDocument = async () => {
    const newDoc = await createDocument();
    if (newDoc) {
      navigate(`/editor/${newDoc.id}`);
    }
  };

  const handleOpenDocument = (id: string) => {
    navigate(`/editor/${id}`);
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
          <p className="mt-4 text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                WordWise AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.email}
              </span>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
            <button
              onClick={handleCreateDocument}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              New Document
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6 flex justify-between items-center">
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
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No documents
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first document.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateDocument}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Document
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <div
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenDocument(doc.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {doc.title || 'Untitled Document'}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Last updated:{' '}
                            {new Date(doc.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
