import { useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useDebounce } from './useDebounce';

interface Suggestion {
  id: number;
  doc_id: string;
  start_pos: number;
  end_pos: number;
  type: string;
  message: string;
  replacements: string[];
}

interface GrammarCheckHookProps {
  documentId: string;
  onSuggestionsUpdate?: (suggestions: Suggestion[]) => void;
}

export function useGrammarCheck({
  documentId,
  onSuggestionsUpdate,
}: GrammarCheckHookProps) {
  const checkGrammar = useCallback(
    async (text: string) => {
      if (!text || text.length < 10) return; // Skip very short text

      try {
        const { data, error } = await supabase.functions.invoke(
          'grammar_check',
          {
            body: {
              docId: documentId,
              text: text.replace(/<[^>]*>/g, ''), // Strip HTML tags for LanguageTool
            },
          }
        );

        if (error) {
          console.error('Grammar check error:', error);
          return;
        }

        if (onSuggestionsUpdate && data?.suggestions) {
          onSuggestionsUpdate(data.suggestions);
        }
      } catch (error) {
        console.error('Grammar check failed:', error);
      }
    },
    [documentId, onSuggestionsUpdate]
  );

  // Subscribe to realtime suggestions updates
  useEffect(() => {
    if (!documentId) return;

    // Load existing suggestions
    const loadSuggestions = async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('doc_id', documentId)
        .order('start_pos', { ascending: true });

      if (!error && data && onSuggestionsUpdate) {
        onSuggestionsUpdate(data);
      }
    };

    loadSuggestions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`suggestions:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suggestions',
          filter: `doc_id=eq.${documentId}`,
        },
        () => {
          // Reload suggestions when there's any change
          loadSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, onSuggestionsUpdate]);

  // Debounce grammar checking to avoid excessive API calls
  const debouncedGrammarCheck = useDebounce(checkGrammar, 2000);

  return {
    checkGrammar: debouncedGrammarCheck,
  };
}
