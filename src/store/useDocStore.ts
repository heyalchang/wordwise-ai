import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase, type Document } from '../lib/supabase';

interface DocumentState {
  // Current document state
  currentDocument: Document | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Document list for dashboard
  documents: Document[];

  // Actions
  loadDocument: (id: string) => Promise<void>;
  saveDocument: (id: string, content: string, title?: string) => Promise<void>;
  createDocument: (title?: string) => Promise<Document | null>;
  updateTitle: (id: string, title: string) => Promise<void>;
  loadDocuments: () => Promise<void>;
  clearError: () => void;
  setCurrentDocument: (doc: Document | null) => void;
}

export const useDocStore = create<DocumentState>()(
  immer((set) => ({
    currentDocument: null,
    isLoading: false,
    isSaving: false,
    error: null,
    documents: [],

    loadDocument: async (id: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
          return;
        }

        set((state) => {
          state.currentDocument = data;
          state.isLoading = false;
        });
      } catch {
        set((state) => {
          state.error = 'Failed to load document';
          state.isLoading = false;
        });
      }
    },

    saveDocument: async (id: string, content: string, title?: string) => {
      set((state) => {
        state.isSaving = true;
        state.error = null;
      });

      try {
        const updateData: Partial<Document> = {
          content,
          updated_at: new Date().toISOString(),
        };

        if (title !== undefined) {
          updateData.title = title;
        }

        const { data, error } = await supabase
          .from('documents')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          set((state) => {
            state.error = error.message;
            state.isSaving = false;
          });
          return;
        }

        set((state) => {
          state.currentDocument = data;
          state.isSaving = false;

          // Update in documents list if it exists
          const index = state.documents.findIndex((doc) => doc.id === id);
          if (index !== -1) {
            state.documents[index] = data;
          }
        });
      } catch {
        set((state) => {
          state.error = 'Failed to save document';
          state.isSaving = false;
        });
      }
    },

    createDocument: async (title = 'Untitled Document') => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { data: user } = await supabase.auth.getUser();

        if (!user.user) {
          set((state) => {
            state.error = 'User not authenticated';
            state.isLoading = false;
          });
          return null;
        }

        const { data, error } = await supabase
          .from('documents')
          .insert({
            title,
            content: '',
            owner: user.user.id,
          })
          .select()
          .single();

        if (error) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
          return null;
        }

        set((state) => {
          state.currentDocument = data;
          state.documents = [data, ...state.documents];
          state.isLoading = false;
        });

        return data;
      } catch {
        set((state) => {
          state.error = 'Failed to create document';
          state.isLoading = false;
        });
        return null;
      }
    },

    updateTitle: async (id: string, title: string) => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          set((state) => {
            state.error = error.message;
          });
          return;
        }

        set((state) => {
          if (state.currentDocument?.id === id) {
            state.currentDocument = data;
          }

          const index = state.documents.findIndex((doc) => doc.id === id);
          if (index !== -1) {
            state.documents[index] = data;
          }
        });
      } catch {
        set((state) => {
          state.error = 'Failed to update title';
        });
      }
    },

    loadDocuments: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
          return;
        }

        set((state) => {
          state.documents = data || [];
          state.isLoading = false;
        });
      } catch {
        set((state) => {
          state.error = 'Failed to load documents';
          state.isLoading = false;
        });
      }
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    setCurrentDocument: (doc: Document | null) => {
      set((state) => {
        state.currentDocument = doc;
      });
    },
  }))
);
